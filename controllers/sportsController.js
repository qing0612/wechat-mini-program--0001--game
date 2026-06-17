// controllers/sportsController.js
// 运动场页面游戏控制器：封装 canvas 初始化 / 游戏循环 / 渲染 / 状态同步
//
// 设计目标：
//   - 将 pages/sports/sports.js 中的游戏逻辑抽离到此
//   - sports.js 只负责：页面生命周期 + WXML 绑定 + 导航 + 分享
//
// 使用方法（在 pages/sports/sports.js 中）：
//   this.sportsCtrl = new SportsController(this, {
//     canvasId: '#playerCanvas',
//     gameStore,
//     onUiUpdate: (data) => this.setData(data)
//   });
//   this.sportsCtrl.init();

const { gameStore } = require('../store/index.js');
const { BUILDINGS } = require('../data/buildings.js');
// 直接 require 子模块，避免循环依赖（controllers/index.js 会反过来 require 本文件）
const CanvasBootstrap = require('./canvasBootstrap.js');
const PlayerController = require('./playerController.js');
const ProgressLoader = require('./progressLoader.js');
const GameTimer = require('./gameTimer.js');
const TouchDispatcher = require('./touchDispatcher.js');
const { sportsRenderer } = require('../renderers/index.js');
const { audioManager } = require('../utils/index.js');
const { computeCamera, worldToScreen } = require('../utils/camera.js');
const { SpriteAnimator, dirFromVector, drawPlayer } = require('../utils/sprite.js');
const { PLAYER, SPORTS_MAP, ANIMATION } = require('../config/index.js');

const sportsBuilding = BUILDINGS.find(b => b.id === 'sports');

class SportsController {
  constructor(page, options = {}) {
    this.page = page;
    this.canvasId = options.canvasId || '#playerCanvas';
    this.gameStore = options.gameStore || gameStore;
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
    this._savedState = null;

    // 子控制器
    this.playerCtrl = null;
    this.anim = null;
    this.touch = null;
    this.progress = null;
    this.timer = null;
    this._bootstrap = null;
    this.joystick = null;
    this.mapImg = null;
    this.mapLoaded = false;

    this._rafId = null;
  }

  onLoad() {
    const Joystick = require('../utils/joystick.js');
    this.joystick = new Joystick({ radius: 45 });
    this._savedState = this.gameStore.getState();
  }

  init() {
    this._bootstrap = new CanvasBootstrap(this.page, {
      canvasId: this.canvasId,
      onReady: (env) => this._onCanvasReady(env)
    });
    this._bootstrap.init();
  }

  onShow() {
    // 轻微的资源加载反馈
    this.onUiUpdate({
      loadProgress: 0,
      loadVisible: true,
      loadStageText: '资源加载中...'
    });
    setTimeout(() => {
      if (this.progress) this.progress.start();
    }, 50);

    if (this.canvas && !this.running) {
      this.running = true;
      this.lastTime = 0;
      this._rafId = this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
    }
    if (this.timer) this.timer.start();
  }

  onHide() {
    this.running = false;
    if (this.timer) this.timer.stop();
    if (this.playerCtrl && this.gameStore) {
      const p = this.playerCtrl.getPlayerPos();
      const d = this.playerCtrl.getPlayerDir();
      if (p) this.gameStore.updateSportsPlayer(p.x, p.y, d);
    }
  }

  destroy() {
    this.running = false;
    if (this._rafId && this.canvas) {
      try { this.canvas.cancelAnimationFrame(this._rafId); } catch (e) {}
    }
    if (this.progress) this.progress.destroy();
    if (this.timer) this.timer.destroy();
    if (this.playerCtrl) {
      const p = this.playerCtrl.getPlayerPos();
      const d = this.playerCtrl.getPlayerDir();
      this.gameStore.updateSportsPlayer(p.x, p.y, d);
      this.playerCtrl.destroy();
    }
    if (this._bootstrap) this._bootstrap.destroy();
    this.canvas = null;
    this.ctx = null;
  }

  onTouchStart(e) { if (this.touch) this.touch.onStart(e); }
  onTouchMove(e) { if (this.touch) this.touch.onMove(e); }
  onTouchEnd(e) { if (this.touch) this.touch.onEnd(e); }

  _onCanvasReady(env) {
    this.canvas = env.canvas;
    this.ctx = env.ctx;
    this.viewW = env.viewW;
    this.viewH = env.viewH;
    this.dpr = env.dpr;
    this.sysInfo = env.sysInfo;
    this.frameCount = 0;

    this.anim = new SpriteAnimator({
      frameCount: ANIMATION.FRAME_COUNT,
      frameDuration: ANIMATION.FRAME_DURATION
    });

    // 玩家控制器（独立地图尺寸 + 独立出生点）
    const state = this._savedState;
    const hasSaved = state.sportsPlayer && typeof state.sportsPlayer.x === 'number';
    this.playerCtrl = new PlayerController({
      joystick: this.joystick,
      mapSize: { width: SPORTS_MAP.WIDTH, height: SPORTS_MAP.HEIGHT },
      playerSize: PLAYER.SIZE,
      speed: PLAYER.SPEED,
      spawnX: hasSaved ? state.sportsPlayer.x : SPORTS_MAP.SPAWN_X,
      spawnY: hasSaved ? state.sportsPlayer.y : SPORTS_MAP.SPAWN_Y,
      spawnDir: state.sportsPlayer.direction || 'up',
      dirFromVector: dirFromVector
    });

    // 触摸
    this.touch = new TouchDispatcher(this.page, this.joystick);

    // 进度条 + 背景
    this.progress = new ProgressLoader(this.page, {
      stageText2: '加载运动场...'
    });
    this.progress.start();
    this._tryLoadMap();

    // 计时器
    this.timer = new GameTimer(this.page);

    // 启动循环
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
    img.src = sportsBuilding ? sportsBuilding.interiorImage : '/images/map/sports-bg.png';
  }

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
    if (this.playerCtrl) this.playerCtrl.update(dt);
    this.anim.tick(dt * 1000, this.playerCtrl ? this.playerCtrl.isMoving() : false);
  }

  _render() {
    if (!this.ctx || !this.playerCtrl) return;
    const cam = computeCamera(
      this.playerCtrl.x, this.playerCtrl.y,
      this.viewW, this.viewH, SPORTS_MAP.WIDTH, SPORTS_MAP.HEIGHT
    );

    sportsRenderer.renderSports(this.ctx, {
      cam,
      mapImg: this.mapImg,
      mapLoaded: this.mapLoaded,
      dpr: this.dpr,
      viewW: this.viewW,
      viewH: this.viewH,
      mapW: SPORTS_MAP.WIDTH,
      mapH: SPORTS_MAP.HEIGHT
    });

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
  }
}

module.exports = SportsController;