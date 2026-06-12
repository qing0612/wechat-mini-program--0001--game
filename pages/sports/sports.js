const Joystick = require('../../utils/joystick.js');
const { computeCamera, worldToScreen } = require('../../utils/camera.js');
const { SpriteAnimator, dirFromVector, drawPlayer } = require('../../utils/sprite.js');
const gameStore = require('../../store/gameStore.js');
const gameConfig = require('../../config/gameConfig.js');
const { BUILDINGS } = require('../../data/buildings.js');

const { PLAYER, SPORTS_MAP, UI } = gameConfig;

// 获取运动场建筑的数据
const sportsBuilding = BUILDINGS.find(b => b.id === 'sports');

Page({
  data: {
    gameTime: '00:00',
    stickX: 0,
    stickY: 0,
    joystickBaseR: UI.JOYSTICK_RADIUS,
    joystickBaseX: 0,
    joystickBaseY: 0,
    joystickVisible: false
  },

  onLoad() {
    this.joystick = new Joystick({ radius: UI.JOYSTICK_RADIUS });
    this.anim = new SpriteAnimator({
      frameCount: gameConfig.ANIMATION.FRAME_COUNT,
      frameDuration: gameConfig.ANIMATION.FRAME_DURATION
    });
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.canvasReady = false;
    this.lastTime = 0;

    // 运动场专属地图尺寸
    this.mapW = SPORTS_MAP.WIDTH;
    this.mapH = SPORTS_MAP.HEIGHT;

    // 从状态管理恢复运动场玩家位置，没有则使用默认出生点
    const state = gameStore.getState();
    this.player = state.sportsPlayer.x ?
      { x: state.sportsPlayer.x, y: state.sportsPlayer.y } :
      { x: SPORTS_MAP.SPAWN_X, y: SPORTS_MAP.SPAWN_Y };
    this.playerDir = state.sportsPlayer.direction || 'up';
    this.moving = false;

    // 游戏计时器
    this.gameSeconds = 0;
    this.timerInterval = null;
  },

  onReady() {
    if (!this.canvasReady) {
      this.initCanvas(0);
    }
  },

  initCanvas(retry) {
    const query = this.createSelectorQuery();
    query.select('#playerCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        if (retry < 50) {
          setTimeout(() => this.initCanvas(retry + 1), 200);
        }
        return;
      }

      const cssW = res[0].width;
      const cssH = res[0].height;

      // 横屏检查
      if (cssW > 0 && cssH > 0 && cssW < cssH) {
        if (retry < 50) {
          setTimeout(() => this.initCanvas(retry + 1), 200);
          return;
        }
      }

      const canvas = res[0].node;
      this.canvas = canvas;
      
      // 使用新 API 获取系统信息，兼容旧版
      const winInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      const dpr = winInfo.pixelRatio || 2;

      // 设置 Canvas 2D 宽高
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      this.ctx = canvas.getContext('2d');
      this.ctx.scale(dpr, dpr);
      this.sysInfo = winInfo;
      this.viewW = cssW;
      this.viewH = cssH;

      const jRadius = Math.min(winInfo.windowHeight * 0.15, 50);
      this.joystick = new Joystick({ radius: jRadius });
      this.setData({ joystickBaseR: Math.round(jRadius) });

      // 加载背景图
      this.tryLoadMap();

      this.canvasReady = true;
      this.running = true;
      this.lastTime = 0;
      this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
    });
  },

  tryLoadMap() {
    if (!this.canvas) return;
    this.mapImg = this.canvas.createImage();
    this.mapImg.onload = () => { this.mapLoaded = true; };
    this.mapImg.onerror = () => { this.mapLoaded = false; };
    // 使用建筑数据中的 interiorImage 属性，避免硬编码路径
    this.mapImg.src = sportsBuilding ? sportsBuilding.interiorImage : '/images/map/sports-bg.png';
  },

  onShow() {
    // 恢复游戏循环
    if (this.canvas && !this.running) {
      this.running = true;
      this.lastTime = 0;
      this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
    }
    // 计时器
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        this.gameSeconds++;
        const minutes = Math.floor(this.gameSeconds / 60);
        const seconds = this.gameSeconds % 60;
        this.setData({
          gameTime: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        });
      }, 1000);
    }
  },

  gameLoop(t) {
    if (!this.running || !this.canvas) return;
    const dt = this.lastTime ? Math.min(t - this.lastTime, 50) : 16;
    this.lastTime = t;
    this.update(dt / 1000);
    this.render();
    this.canvas.requestAnimationFrame((t2) => this.gameLoop(t2));
  },

  update(dt) {
    const dir = this.joystick.getDirection();
    if (dir.magnitude > 0) {
      let newX = this.player.x + dir.x * PLAYER.SPEED * dt;
      let newY = this.player.y + dir.y * PLAYER.SPEED * dt;
      const halfSize = PLAYER.SIZE / 2;
      newX = Math.max(halfSize, Math.min(this.mapW - halfSize, newX));
      newY = Math.max(halfSize, Math.min(this.mapH - halfSize, newY));
      this.player.x = newX;
      this.player.y = newY;
      this.moving = true;
      this.playerDir = dirFromVector(dir.x, dir.y) || this.playerDir;
    } else {
      this.moving = false;
    }
    this.anim.tick(dt * 1000, this.moving);
  },

  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    // Canvas 2D 已在初始化时设置了 scale，直接使用 CSS 尺寸
    ctx.fillStyle = '#2d5a1e';
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    ctx.save();

    // 使用统一的相机计算函数
    const cam = computeCamera(this.player.x, this.player.y, this.viewW, this.viewH, this.mapW, this.mapH);

    // 绘制背景
    if (this.mapLoaded && this.mapImg) {
      ctx.drawImage(this.mapImg, cam.x, cam.y, this.viewW, this.viewH, 0, 0, this.viewW, this.viewH);
    } else {
      // 占位：绿色草地 + 网格
      ctx.fillStyle = '#3D6B24';
      ctx.fillRect(0, 0, this.viewW, this.viewH);
      ctx.strokeStyle = '#2E5518';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = -(cam.x % step); x < this.viewW; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.viewH); ctx.stroke();
      }
      for (let y = -(cam.y % step); y < this.viewH; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.viewW, y); ctx.stroke();
      }
    }

    // 绘制玩家
    const sp = worldToScreen(this.player.x, this.player.y, cam);
    drawPlayer(ctx, sp.x, sp.y, this.moving, this.anim.frameIndex, this.playerDir);

    ctx.restore();
  },

  onTouchStart(e) {
    const touch = e.touches[0];
    this.joystick.start(touch);
    this.setData({
      joystickVisible: true,
      joystickBaseX: touch.clientX,
      joystickBaseY: touch.clientY,
      stickX: 0,
      stickY: 0
    });
  },

  onTouchMove(e) {
    const touch = e.touches[0];
    if (!this.joystick.active || touch.identifier !== this.joystick.touchId) return;
    
    // 直接更新摇杆（摇杆内部会计算相对于基点的偏移）
    this.joystick.update(touch);
    
    const offset = this.joystick.getStickOffset();
    this.setData({ stickX: offset.x, stickY: offset.y });
  },

  onTouchEnd() {
    this.joystick.end();
    this.setData({ joystickVisible: false, stickX: 0, stickY: 0 });
  },

  goBack() {
    gameStore.updateSportsPlayer(this.player.x, this.player.y, this.playerDir);
    wx.navigateBack();
  },

  onHide() {
    this._stop();
  },

  onUnload() {
    this._stop();
  },

  _stop() {
    this.running = false;
    gameStore.updateSportsPlayer(this.player.x, this.player.y, this.playerDir);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
});