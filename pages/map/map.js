// pages/map/map.js - 校园地图（模块化组装版）
// 原代码约 634 行，现在约 190 行。具体工作分解到：
//   renderers/campusRenderer.js  - 地图背景 / 建筑触发区 / 日夜遮罩
//   controllers/CanvasBootstrap   - Canvas 初始化 / 重试 / 缩放
//   controllers/PlayerController  - 玩家移动 / 方向 / 边界 / 防抖保存
//   controllers/BuildingController - 建筑触发检测 / 弹窗 / 冷却期
//   controllers/ProgressLoader    - 加载进度条
//   controllers/GameTimer         - 游戏计时器（00:00）
//   controllers/WeatherManager    - 季节 → 天气（雨/雪/无）
//   controllers/TouchDispatcher   - 触摸 → 摇杆
//
// 本文件只负责：初始化各模块、组装生命周期、绑定页面按钮与分享

const { gameStore } = require('../../store/index.js');
const { buildingService } = require('../../services/index.js');
const {
  CanvasBootstrap,
  PlayerController,
  BuildingController,
  ProgressLoader,
  GameTimer,
  WeatherManager,
  TouchDispatcher
} = require('../../controllers/index.js');
const { campusRenderer } = require('../../renderers/index.js');
const { computeCamera, worldToScreen } = require('../../utils/camera.js');
const { SpriteAnimator, dirFromVector, drawPlayer } = require('../../utils/sprite.js');
const { PLAYER, MAP, UI, ANIMATION } = require('../../config/index.js');

Page({
  data: {
    stickX: 0,
    stickY: 0,
    joystickBaseR: UI.JOYSTICK_RADIUS,
    joystickBaseX: 0,
    joystickBaseY: 0,
    joystickVisible: false,
    minimapPlayerX: 50,
    minimapPlayerY: 50,
    coordX: 0,
    coordY: 0,
    gameTime: '00:00',
    loadProgress: 0,
    loadVisible: true,
    loadStageText: '资源加载中...'
  },

  // ====== 初始化：恢复位置 + 订阅 state 变更 ======
  onLoad() {
    const state = gameStore.getState();
    this._savedState = state;
    this._season = state.season || 'spring';
    this._isDay = state.isDay;
    // Joystick 不依赖 Canvas，可立即创建（触摸事件早于 Canvas ready）
    const Joystick = require('../../utils/joystick.js');
    this.joystick = new Joystick({ radius: UI.JOYSTICK_RADIUS });
    this.unsubscribe = gameStore.subscribe((newState) => {
      this._season = newState.season || this._season;
      this._isDay = newState.isDay;
      if (this._weather) this._weather.setSeason(this._season);
    });
  },

  onReady() {
    this._bootstrap = new CanvasBootstrap(this, {
      canvasId: '#gameCanvas',
      onReady: (env) => this._onCanvasReady(env)
    });
    this._bootstrap.init();
  },

  _onCanvasReady(env) {
    this.canvas = env.canvas;
    this.ctx = env.ctx;
    this.viewW = env.viewW;
    this.viewH = env.viewH;
    this.dpr = env.dpr;
    this.sysInfo = env.sysInfo;
    this.frameCount = 0;

    // 动画
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
    const state = this._savedState || gameStore.getState();
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
        gameStore.updatePlayerPos(x, y);
        gameStore.updatePlayerDirection(dir);
      }
    });

    // 建筑触发
    this.buildingCtrl = new BuildingController({
      buildingService,
      onEnter: (bld) => {
        if (bld.isSportsField) {
          wx.navigateTo({ url: '/pages/sports/sports' });
        } else {
          wx.navigateTo({ url: '/pages/building/building?id=' + bld.id });
        }
      }
    });
    this.buildingCtrl.enableCooldown(2000);
    this.buildingCtrl.isInTriggerZone = state.player.inTriggerZone || false;

    // 触摸分发
    this.touch = new TouchDispatcher(this, this.joystick);

    // 加载进度条 + 背景图
    this.progress = new ProgressLoader(this, {
      stageText2: '加载地图资源...'
    });
    this.progress.start();
    this._tryLoadMap();

    // 计时器
    this.timer = new GameTimer(this);

    // 窗口 resize
    this._bootstrap.bindResize();

    // 启动主循环
    this.running = true;
    this.lastTime = 0;
    this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
  },

  _tryLoadMap() {
    if (!this.canvas) return;
    const img = this.canvas.createImage();
    img.onload = () => {
      this.mapImg = img;
      this.mapLoaded = true;
      if (this.progress) this.progress.setMapLoaded(true);
    };
    img.onerror = () => {
      this.mapLoaded = true; // 降级：使用占位渲染
      if (this.progress) this.progress.setMapLoaded(true);
    };
    img.src = '/images/map-bg.png';
  },

  onShow() {
    this.setData({ loadProgress: 0, loadVisible: true, loadStageText: '资源加载中...' });
    setTimeout(() => {
      if (this.progress) this.progress.start();
    }, 50);

    // 从其他页面返回时重置建筑冷却期
    if (this.buildingCtrl) {
      this.buildingCtrl.onShowReturn();
    }
    if (this._weather) this._weather.setSeason(this._season);

    // 恢复游戏循环
    if (this.canvas && !this.running) {
      this.running = true;
      this.lastTime = 0;
      this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
    }
    if (this.timer) this.timer.start();
  },

  onHide() {
    this._cleanup();
  },

  onUnload() {
    this._cleanup();
    if (this.unsubscribe) this.unsubscribe();
  },

  _cleanup() {
    this.running = false;
    if (this.progress) this.progress.destroy();
    if (this.timer) this.timer.destroy();
    if (this._weather) this._weather.destroy();
    if (this.playerCtrl) {
      this.playerCtrl.forceSave();
      this.playerCtrl.destroy();
    }
    if (this.buildingCtrl) this.buildingCtrl.destroy();
    if (this._bootstrap) this._bootstrap.destroy();
    if (gameStore) {
      gameStore.stopGame();
      const p = this.playerCtrl ? this.playerCtrl.getPlayerPos() : null;
      const pd = this.playerCtrl ? this.playerCtrl.getPlayerDir() : null;
      if (p) {
        gameStore.updatePlayerPos(p.x, p.y);
        if (pd) gameStore.updatePlayerDirection(pd);
      }
      gameStore.setInTriggerZone(this.buildingCtrl ? this.buildingCtrl.isInTriggerZone : false);
    }
  },

  // ====== 主循环 ======
  _gameLoop(ts) {
    if (!this.running || !this.canvas) return;
    const dt = this.lastTime ? Math.min((ts - this.lastTime) / 1000, 0.05) : 0.016;
    this.lastTime = ts;
    this._update(dt);
    this._render();
    this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
  },

  _update(dt) {
    this.frameCount++;

    // 弹窗期间禁用玩家移动
    if (this.buildingCtrl && this.buildingCtrl.modalShowing) {
      if (this.touch) this.touch.setBlocked(true);
    } else if (this.touch) {
      this.touch.setBlocked(false);
    }

    // 玩家移动
    if (this.playerCtrl) this.playerCtrl.update(dt);
    this.anim.tick(dt * 1000, this.playerCtrl ? this.playerCtrl.isMoving() : false);

    // 建筑触发检测
    if (this.buildingCtrl && this.playerCtrl) {
      const pos = this.playerCtrl.getPlayerPos();
      this.buildingCtrl.update(pos.x, pos.y);
    }

    // 每 N 帧刷新一次小地图 + 坐标 UI（避免每帧 setData）
    if (this.frameCount % UI.UPDATE_INTERVAL === 0 && this.playerCtrl) {
      const pos = this.playerCtrl.getPlayerPos();
      this.setData({
        minimapPlayerX: (pos.x / MAP.WIDTH) * 100,
        minimapPlayerY: (pos.y / MAP.HEIGHT) * 100,
        coordX: Math.round(pos.x),
        coordY: Math.round(pos.y)
      });
    }
  },

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
      viewW: this.viewW,
      viewH: this.viewH,
      dpr: this.dpr,
      mapW: MAP.WIDTH,
      mapH: MAP.HEIGHT
    });
    campusRenderer.renderBuildingZones(this.ctx, {
      cam,
      buildings: buildingService.getAllBuildings(),
      dpr: this.dpr,
      viewW: this.viewW,
      viewH: this.viewH
    });

    // 2. 玩家（在 Canvas 2D 坐标系，已按 dpr 缩放）
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
  },

  // ====== 触摸事件 ======
  onTouchStart(e) { if (this.touch) this.touch.onStart(e); },
  onTouchMove(e) { if (this.touch) this.touch.onMove(e); },
  onTouchEnd(e) { if (this.touch) this.touch.onEnd(e); },

  // ====== 导航按钮 ======
  onBack() {
    wx.showModal({
      title: '退出游戏',
      content: '你是否要退出游戏？',
      confirmText: '是',
      cancelText: '否',
      success: (res) => {
        if (res.confirm) {
          this._cleanup();
          wx.navigateBack({
            fail: () => wx.redirectTo({ url: '/pages/start/start' })
          });
        }
      }
    });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  goToBackpack() {
    wx.navigateTo({ url: '/pages/backpack/backpack' });
  },

  // ====== 分享 ======
  onShareAppMessage() {
    return {
      title: '河北师范大学像素校园',
      desc: '用像素风探索美丽校园！',
      path: '/pages/start/start',
      imageUrl: '/images/start-bg.png'
    };
  },

  onShareTimeline() {
    return {
      title: '河北师范大学像素校园 - 用像素风探索美丽校园！',
      imageUrl: '/images/start-bg.png'
    };
  }
});