// controllers/mapController.js
// 地图页面游戏控制器：封装 canvas 初始化 / 游戏循环 / 渲染 / 状态同步
//
// 设计目标：
//   - 将 pages/map/map.js 中的游戏逻辑（Canvas 准备、主循环、渲染、清理）抽离到此
//   - map.js 只负责：页面生命周期（onLoad/onShow/onUnload）+ WXML 绑定 + 导航 + 分享
//   - 本文件暴露标准接口：init / start / pause / destroy / getCurrentBuilding
//
// 使用方法（在 pages/map/map.js 中）：
//   this.mapCtrl = new MapController(this, {
//     canvasId: '#gameCanvas',
//     gameStore,
//     buildingService,
//     onBuildingUpdate: (bld) => {
//       // 由控制器通知页面：当前建筑变化，页面负责 setData 更新浮动按钮
//       this.setData({
//         showEnterBuildingBtn: !!bld,
//         currentBuildingName: bld ? bld.name : ''
//       });
//     },
//     onUiUpdate: (data) => {
//       // 每 N 帧的 UI 刷新：坐标、时间等
//       this.setData(data);
//     }
//   });
//   this.mapCtrl.init();
//
//   // 页面层事件：
//   this.mapCtrl.onShow();
//   this.mapCtrl.onHide();
//   this.mapCtrl.destroy();
//
//   // 读取当前建筑（用于导航）：
//   const bld = this.mapCtrl.getCurrentBuilding();

const { gameStore } = require('../store/index.js');
const { buildingService } = require('../services/index.js');
// 直接 require 子模块，避免循环依赖（controllers/index.js 会反过来 require 本文件）
const CanvasBootstrap = require('./canvasBootstrap.js');
const PlayerController = require('./playerController.js');
const BuildingController = require('./buildingController.js');
const ProgressLoader = require('./progressLoader.js');
const GameTimer = require('./gameTimer.js');
const WeatherManager = require('./weatherManager.js');
const TouchDispatcher = require('./touchDispatcher.js');
const { campusRenderer } = require('../renderers/index.js');
const { audioManager } = require('../utils/index.js');
const { computeCamera, worldToScreen } = require('../utils/camera.js');
const { SpriteAnimator, dirFromVector, drawPlayer } = require('../utils/sprite.js');
const { PLAYER, MAP, UI, ANIMATION } = require('../config/index.js');

class MapController {
  constructor(page, options = {}) {
    this.page = page;                          // Page 实例（用于 setData）
    this.canvasId = options.canvasId || '#gameCanvas';
    this.gameStore = options.gameStore || gameStore;
    this.buildingService = options.buildingService || buildingService;
    this.onBuildingUpdate = options.onBuildingUpdate || (() => {});
    this.onUiUpdate = options.onUiUpdate || (() => {});

    // 运行时状态
    this.canvas = null;
    this.ctx = null;
    this.viewW = 0;
    this.viewH = 0;
    this.dpr = 1;
    this.frameCount = 0;
    this.running = false;
    this.lastTime = 0;
    this._season = 'spring';
    this._isDay = true;
    this._savedState = null;
    this._initialized = false;
    this._firstShowDone = false;

    // 子控制器
    this.playerCtrl = null;
    this.buildingCtrl = null;
    this.anim = null;
    this._weather = null;
    this.touch = null;
    this.progress = null;
    this.timer = null;
    this._bootstrap = null;
    this.joystick = null;
    this.mapImg = null;
    this.mapLoaded = false;

    // 上一次建筑状态（用于去重通知）
    this._lastBuildingId = null;
    // 触摸事件回调绑定（保持引用，便于 onShow/onHide 时注册/解绑）
    this._boundTouchStart = null;
    this._boundTouchMove = null;
    this._boundTouchEnd = null;
    // rAF id
    this._rafId = null;
  }

  // === 页面生命周期 ===

  // onLoad 阶段：恢复状态 + 创建 Joystick（不依赖 Canvas）
  onLoad() {
    const state = this.gameStore.getState();
    this._savedState = state;
    this._season = state.season || 'spring';
    this._isDay = state.isDay;
    const Joystick = require('../utils/joystick.js');
    this.joystick = new Joystick({ radius: UI.JOYSTICK_RADIUS });
  }

  // onReady 阶段：初始化 Canvas
  init() {
    this._bootstrap = new CanvasBootstrap(this.page, {
      canvasId: this.canvasId,
      onReady: (env) => this._onCanvasReady(env)
    });
    this._bootstrap.init();
  }

  // onShow 阶段：从其他页面返回
  onShow() {
    const state = this.gameStore.getState();
    this._season = state.season || this._season;
    this._isDay = state.isDay;

    // 重置建筑触发区（避免从建筑页返回时立即再次触发）
    if (this.buildingCtrl) {
      this.buildingCtrl.onShowReturn();
      this._lastBuildingId = null;
      this.onBuildingUpdate(null);
    }
    if (this._weather) {
      this._weather.setSeason(this._season);
    }

    // 仅从子页面返回（building/sports → map）时隐藏加载遮罩
    // 首次加载（start → map）不干预进度条
    if (this._firstShowDone) {
      this.onUiUpdate({
        loadVisible: false,
        navVisible: false,
        navProgress: 0,
        loadProgress: 100
      });
    }
    this._firstShowDone = true;

    // 恢复游戏循环
    if (this.canvas && !this.running) {
      this.running = true;
      this.lastTime = 0;
      this._rafId = this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
    }
    if (this.timer) this.timer.start();
  }

  // onHide 阶段：页面隐藏，仅暂停游戏循环，不销毁资源
  onHide() {
    this.running = false;
    if (this.timer) this.timer.stop();
    // 保存玩家位置
    if (this.playerCtrl && this.gameStore) {
      const p = this.playerCtrl.getPlayerPos();
      const pd = this.playerCtrl.getPlayerDir();
      if (p) this.gameStore.updatePlayerPos(p.x, p.y);
      if (pd) this.gameStore.updatePlayerDirection(pd);
    }
  }

  // onUnload 阶段：彻底销毁
  destroy() {
    this.running = false;
    if (this._rafId && this.canvas) {
      try { this.canvas.cancelAnimationFrame(this._rafId); } catch (e) {}
    }
    if (this.progress) this.progress.destroy();
    if (this.timer) this.timer.destroy();
    if (this._weather) this._weather.destroy();
    if (this.playerCtrl) {
      this.playerCtrl.forceSave();
      this.playerCtrl.destroy();
    }
    if (this.buildingCtrl) this.buildingCtrl.destroy();
    if (this._bootstrap) this._bootstrap.destroy();
    // 通知 gameStore 保存最终状态
    if (this.gameStore) {
      this.gameStore.stopGame();
      const p = this.playerCtrl ? this.playerCtrl.getPlayerPos() : null;
      const pd = this.playerCtrl ? this.playerCtrl.getPlayerDir() : null;
      if (p) {
        this.gameStore.updatePlayerPos(p.x, p.y);
        if (pd) this.gameStore.updatePlayerDirection(pd);
      }
      this.gameStore.setInTriggerZone(this.buildingCtrl && this.buildingCtrl.currentBuilding ? true : false);
    }
    this.canvas = null;
    this.ctx = null;
  }

  // === 对外读取接口 ===

  // 当前触发区内的建筑（用于 onEnterBuilding 导航）
  getCurrentBuilding() {
    return this.buildingCtrl ? this.buildingCtrl.currentBuilding : null;
  }

  // === 触摸事件（页面层转发） ===
  onTouchStart(e) { if (this.touch) this.touch.onStart(e); }
  onTouchMove(e) { if (this.touch) this.touch.onMove(e); }
  onTouchEnd(e) { if (this.touch) this.touch.onEnd(e); }

  // === 内部实现 ===

  _onCanvasReady(env) {
    this.canvas = env.canvas;
    this.ctx = env.ctx;
    this.viewW = env.viewW;
    this.viewH = env.viewH;
    this.dpr = env.dpr;
    this.sysInfo = env.sysInfo;
    this.frameCount = 0;

    // 动画帧控制器
    this.anim = new SpriteAnimator({
      frameCount: ANIMATION.FRAME_COUNT,
      frameDuration: ANIMATION.FRAME_DURATION
    });

    // 天气效果
    this._weather = new WeatherManager({
      canvas: this.canvas,
      width: this.canvas.width,
      height: this.canvas.height
    });
    this._weather.setSeason(this._season);

    // 玩家控制器
    const state = this._savedState || this.gameStore.getState();
    this.playerCtrl = new PlayerController({
      joystick: this.joystick,
      mapSize: { width: MAP.WIDTH, height: MAP.HEIGHT },
      playerSize: PLAYER.SIZE,
      speed: PLAYER.SPEED,
      spawnX: state.player.x || PLAYER.SPAWN_X,
      spawnY: state.player.y || PLAYER.SPAWN_Y,
      spawnDir: state.player.direction || 'down',
      dirFromVector: dirFromVector,
      onSave: (x, y, dir) => {
        this.gameStore.updatePlayerPos(x, y);
        this.gameStore.updatePlayerDirection(dir);
      }
    });

    // 建筑触发：只更新 currentBuilding 状态
    this.buildingCtrl = new BuildingController({
      buildingService: this.buildingService,
      gameStore: this.gameStore
    });

    // 触摸分发
    this.touch = new TouchDispatcher(this.page, this.joystick);

    // 进度条 + 背景图
    this.progress = new ProgressLoader(this.page, {
      stageText2: '加载地图资源...'
    });
    this.progress.start();
    this._tryLoadMap();

    // 计时器
    this.timer = new GameTimer(this.page);

    // resize 绑定
    this._bootstrap.bindResize();

    // 启动主循环
    this.running = true;
    this.lastTime = 0;
    this._rafId = this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
  }

  _tryLoadMap() {
    if (!this.canvas) return;
    const img = this.canvas.createImage();
    img.onload = () => {
      this.mapImg = img;
      this.mapLoaded = true;
      if (this.progress) this.progress.setMapLoaded(true);
    };
    img.onerror = () => {
      this.mapLoaded = true;
      if (this.progress) this.progress.setMapLoaded(true);
    };
    img.src = '/images/map-bg.png';
  }

  // === 主循环 ===

  _gameLoop(ts) {
    if (!this.running || !this.canvas) return;
    const dt = this.lastTime ? Math.min((ts - this.lastTime) / 1000, 0.05) : 0.016;
    this.lastTime = ts;
    this._update(dt);
    this._render();
    this._rafId = this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
  }

  _update(dt) {
    this.frameCount++;

    // 玩家移动
    if (this.playerCtrl) this.playerCtrl.update(dt);
    this.anim.tick(dt * 1000, this.playerCtrl ? this.playerCtrl.isMoving() : false);

    // 建筑触发检测
    if (this.buildingCtrl && this.playerCtrl) {
      const pos = this.playerCtrl.getPlayerPos();
      this.buildingCtrl.update(pos.x, pos.y);
    }

    // 每 N 帧刷新 UI（建筑按钮状态 + 坐标 + 小地图）
    if (this.frameCount % UI.UPDATE_INTERVAL === 0) {
      const data = {};
      if (this.playerCtrl) {
        const pos = this.playerCtrl.getPlayerPos();
        data.minimapPlayerX = (pos.x / MAP.WIDTH) * 100;
        data.minimapPlayerY = (pos.y / MAP.HEIGHT) * 100;
        data.coordX = Math.round(pos.x);
        data.coordY = Math.round(pos.y);
      }
      const bld = this.getCurrentBuilding();
      const bldId = bld ? bld.id : null;
      if (bldId !== this._lastBuildingId) {
        this._lastBuildingId = bldId;
        this.onBuildingUpdate(bld);
      }
      if (Object.keys(data).length > 0) {
        this.onUiUpdate(data);
      }
    }
  }

  _render() {
    if (!this.ctx || !this.playerCtrl) return;

    // 1. 地图（含日夜遮罩 + 建筑触发区）
    const cam = computeCamera(
      this.playerCtrl.x, this.playerCtrl.y,
      this.viewW, this.viewH, MAP.WIDTH, MAP.HEIGHT
    );
    campusRenderer.renderCampus(this.ctx, {
      cam,
      mapImg: this.mapImg,
      mapLoaded: this.mapLoaded,
      isDay: this._isDay,
      season: this._season,
      viewW: this.viewW,
      viewH: this.viewH,
      dpr: this.dpr,
      mapW: MAP.WIDTH,
      mapH: MAP.HEIGHT
    });
    campusRenderer.renderBuildingZones(this.ctx, {
      cam,
      buildings: this.buildingService.getAllBuildings(),
      currentBuilding: this.buildingCtrl ? this.buildingCtrl.currentBuilding : null,
      dpr: this.dpr,
      viewW: this.viewW,
      viewH: this.viewH
    });

    // 2. 玩家
    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    const sp = worldToScreen(this.playerCtrl.x, this.playerCtrl.y, cam);
    drawPlayer(
      this.ctx, sp.x, sp.y,
      this.playerCtrl.isMoving(),
      this.anim.frameIndex,
      this.playerCtrl.getPlayerDir()
    );
    this.ctx.restore();

    // 3. 天气粒子
    if (this._weather) this._weather.tick();
  }
}

module.exports = MapController;