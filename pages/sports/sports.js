// pages/sports/sports.js - 运动场子地图（模块化组装版）
// 原代码约 297 行，现在约 140 行。具体工作分解到：
//   renderers/sportsRenderer.js - 运动场背景 / 网格占位
//   controllers/CanvasBootstrap  - Canvas 初始化 / 缩放
//   controllers/PlayerController - 玩家移动 / 方向 / 边界
//   controllers/ProgressLoader   - 加载进度条
//   controllers/GameTimer        - 游戏计时器
//   controllers/TouchDispatcher  - 触摸 → 摇杆
//
// 本文件只负责：组装各模块，提供导航与分享

const { gameStore } = require('../../store/index.js');
const { BUILDINGS } = require('../../data/buildings.js');
const {
  CanvasBootstrap,
  PlayerController,
  ProgressLoader,
  GameTimer,
  TouchDispatcher
} = require('../../controllers/index.js');
const { sportsRenderer } = require('../../renderers/index.js');
const { audioManager } = require('../../utils/index.js');
const { computeCamera, worldToScreen } = require('../../utils/camera.js');
const { SpriteAnimator, dirFromVector, drawPlayer } = require('../../utils/sprite.js');
const { PLAYER, SPORTS_MAP, ANIMATION } = require('../../config/index.js');

const sportsBuilding = BUILDINGS.find(b => b.id === 'sports');

Page({
  data: {
    gameTime: '00:00',
    stickX: 0,
    stickY: 0,
    joystickBaseR: 45,
    joystickBaseX: 0,
    joystickBaseY: 0,
    joystickVisible: false,
    loadProgress: 0,
    loadVisible: true,
    loadStageText: '资源加载中...'
  },

  onLoad() {
    const Joystick = require('../../utils/joystick.js');
    this.joystick = new Joystick({ radius: 45 });
    this._savedState = gameStore.getState();
  },

  onReady() {
    this._bootstrap = new CanvasBootstrap(this, {
      canvasId: '#playerCanvas',
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
    this.touch = new TouchDispatcher(this, this.joystick);

    // 进度条 + 背景
    this.progress = new ProgressLoader(this, {
      stageText2: '加载运动场...'
    });
    this.progress.start();
    this._tryLoadMap();

    // 计时器
    this.timer = new GameTimer(this);

    // 启动循环
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
      this.mapLoaded = true; // 降级到占位渲染
      if (this.progress) this.progress.setMapLoaded(true);
    };
    img.src = sportsBuilding ? sportsBuilding.interiorImage : '/images/map/sports-bg.png';
  },

  onShow() {
    this.setData({ loadProgress: 0, loadVisible: true, loadStageText: '资源加载中...' });
    setTimeout(() => { if (this.progress) this.progress.start(); }, 50);

    // 播放地图背景音乐（sports 是 map 的子场景，共用 map 音乐）
    audioManager.playWithMuteCheck('map');

    if (this.canvas && !this.running) {
      this.running = true;
      this.lastTime = 0;
      this.canvas.requestAnimationFrame((t) => this._gameLoop(t));
    }
    if (this.timer) this.timer.start();
  },

  onHide() {
    // 仅暂停游戏循环，不销毁资源（用户可能还会回来）
    this.running = false;
    if (this.timer) this.timer.stop();
    // 停止音频（sports 页用 map 音乐）
    audioManager.stop();
    if (this.playerCtrl && gameStore) {
      const p = this.playerCtrl.getPlayerPos();
      const d = this.playerCtrl.getPlayerDir();
      if (p) gameStore.updateSportsPlayer(p.x, p.y, d);
    }
  },

  onUnload() { this._cleanup(); },

  _cleanup() {
    this.running = false;
    if (this.progress) this.progress.destroy();
    if (this.timer) this.timer.destroy();
    if (this.playerCtrl) {
      const p = this.playerCtrl.getPlayerPos();
      const d = this.playerCtrl.getPlayerDir();
      gameStore.updateSportsPlayer(p.x, p.y, d);
      this.playerCtrl.destroy();
    }
    if (this._bootstrap) this._bootstrap.destroy();
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
    if (this.playerCtrl) this.playerCtrl.update(dt);
    this.anim.tick(dt * 1000, this.playerCtrl ? this.playerCtrl.isMoving() : false);
  },

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

    // 玩家
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
  },

  // ====== 触摸 ======
  onTouchStart(e) { if (this.touch) this.touch.onStart(e); },
  onTouchMove(e) { if (this.touch) this.touch.onMove(e); },
  onTouchEnd(e) { if (this.touch) this.touch.onEnd(e); },

  // ====== 导航 ======
  goBack() {
    if (this.playerCtrl) {
      const p = this.playerCtrl.getPlayerPos();
      const d = this.playerCtrl.getPlayerDir();
      gameStore.updateSportsPlayer(p.x, p.y, d);
    }
    wx.navigateBack();
  }
});