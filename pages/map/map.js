// c:\Users\yibohe\Desktop\小程序-代码\pages\map\map.js
const Joystick = require('../../utils/joystick.js');
const { computeCamera, worldToScreen } = require('../../utils/camera.js');
const { SpriteAnimator, dirFromVector } = require('../../utils/sprite.js');
const gameStore = require('../../store/gameStore.js');
const gameConfig = require('../../config/gameConfig.js');
const buildingService = require('../../services/buildingService.js');
const audioManager = require('../../utils/audioManager.js');

const { PLAYER, MAP, UI } = gameConfig;

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
    coordY: 0
  },

  onLoad() {
    this.joystick = new Joystick({ radius: UI.JOYSTICK_RADIUS });
    this.anim = new SpriteAnimator({ 
      frameCount: gameConfig.ANIMATION.FRAME_COUNT, 
      frameDuration: gameConfig.ANIMATION.FRAME_DURATION 
    });
    this.canvas = null;
    this.ctx = null;
    this.mapImg = null;
    this.running = false;
    this.lastTime = 0;
    this.frameCount = 0;
    this.canvasReady = false;
    this.resizeTimer = null;
    this._resizeHandler = null;
    // 重置模态框状态
    this.modalShowing = false;
    this.modalDismissed = false;
    // 设置冷却期，防止立即触发建筑对话框
    this.buildingCooldown = true;
    setTimeout(() => {
      this.buildingCooldown = false;
    }, 2000); // 2秒冷却期

    // 从状态管理中恢复之前保存的位置和状态
    const state = gameStore.getState();
    this.player = { x: state.player.x || PLAYER.SPAWN_X, y: state.player.y || PLAYER.SPAWN_Y };
    this.playerDir = state.player.direction || 'down';
    // 恢复之前是否在触发区域的状态
    this.isInTriggerZone = state.player.inTriggerZone || false;
    // 恢复日夜状态
    this.isDay = state.isDay;

    this.unsubscribe = gameStore.subscribe(this.handleStateChange.bind(this));
  },

  handleStateChange(state) {
    this.player = { x: state.player.x, y: state.player.y };
    this.playerDir = state.player.direction;
    this.isDay = state.isDay;
  },

  onReady() {
    if (!this.canvasReady) {
      this.initCanvas(0);
    }
  },

  initCanvas(retry) {
    const query = this.createSelectorQuery();
    query.select('#gameCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        if (retry < 50) {
          setTimeout(() => this.initCanvas(retry + 1), 200);
        } else {
          console.warn('Canvas 初始化失败,已重试50次');
          wx.showToast({ title: '画布加载失败', icon: 'none' });
        }
        return;
      }

      const cssW = res[0].width;
      const cssH = res[0].height;

      if (cssW > 0 && cssH > 0 && cssW < cssH) {
        if (retry < 50) {
          setTimeout(() => this.initCanvas(retry + 1), 200);
          return;
        }
      }

      const canvas = res[0].node;
      this.canvas = canvas;
      const sys = wx.getSystemInfoSync();
      const dpr = sys.pixelRatio || 2;

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      this.ctx = canvas.getContext('2d');
      this.sysInfo = sys;
      this.viewW = cssW;
      this.viewH = cssH;

      const jRadius = Math.min(sys.windowHeight * 0.15, 50);
      this.joystick = new Joystick({ radius: jRadius });
      this.setData({ joystickBaseR: Math.round(jRadius) });

      this.tryLoadMap();
      this.canvasReady = true;

      // 启动游戏循环
      this.running = true;
      gameStore.startGame();
      this.lastTime = 0;
      this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
    });
  },

  tryLoadMap() {
    if (!this.canvas) return;
    this.mapImg = this.canvas.createImage();
    this.mapImg.onload = () => { this.mapLoaded = true; };
    this.mapImg.onerror = () => {
      this.mapLoaded = false;
      console.warn('地图图片加载失败: /images/map-bg.png');
    };
    this.mapImg.src = '/images/map-bg.png';
  },

  onShow() {
    console.log('Map page onShow');

    // 重置模态框状态（从其他页面返回时）
    this.modalShowing = false;
    this.modalDismissed = false;
    // 标记刚从其他页面返回，避免立即触发建筑对话框
    this.justReturned = true;
    // 设置冷却期，防止立即重新触发建筑进入提示
    this.buildingCooldown = true;
    setTimeout(() => {
      this.buildingCooldown = false;
      this.justReturned = false;
    }, 2000); // 2秒冷却期

    // 从状态管理中恢复是否在触发区域的状态，这样返回时不会因为"进入"建筑区域而触发弹窗
    const state = gameStore.getState();
    this.isInTriggerZone = state.player.inTriggerZone || false;

    // 确保游戏循环运行
    if (this.canvas && !this.running) {
      this.running = true;
      this.lastTime = 0;
      this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
    }

    // 延迟播放音乐，避免影响游戏初始化
    setTimeout(() => {
      audioManager.playWithMuteCheck('map');
    }, 100);

    if (!this._resizeHandler) {
      this._resizeHandler = (res) => this._onResize(res);
    }
    wx.onWindowResize(this._resizeHandler);
  },

  _onResize(res) {
    if (!this.canvas) return;
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      const query = this.createSelectorQuery();
      query.select('#gameCanvas').fields({ node: true, size: true }).exec((r) => {
        if (!r || !r[0]) return;
        const cssW = r[0].width;
        const cssH = r[0].height;
        if (cssW <= 0 || cssH <= 0) return;
        if (Math.abs(cssW - this.viewW) < 1 && Math.abs(cssH - this.viewH) < 1) return;

        const sys = wx.getSystemInfoSync();
        const dpr = sys.pixelRatio || 2;
        this.canvas.width = cssW * dpr;
        this.canvas.height = cssH * dpr;
        this.sysInfo = sys;
        this.viewW = cssW;
        this.viewH = cssH;

        const jRadius = Math.min(cssH * 0.15, 50);
        this.joystick = new Joystick({ radius: jRadius });
        this.setData({ joystickBaseR: Math.round(jRadius) });

        if (!this.running) {
          this.running = true;
          this.lastTime = 0;
          this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
        }
      });
    }, 100);
  },

  onHide() {
    this.cleanup();
  },

  onUnload() {
    this.cleanup();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },

  cleanup() {
    this.running = false;
    gameStore.stopGame();
    gameStore.updatePlayerPos(this.player.x, this.player.y);
    gameStore.updatePlayerDirection(this.playerDir);
    // 保存当前是否在触发区域的状态
    gameStore.setInTriggerZone(this.isInTriggerZone || false);

    if (this._resizeHandler) {
      wx.offWindowResize(this._resizeHandler);
    }
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
  },

  gameLoop(ts) {
    if (!this.running || !this.canvas) return;
    const dt = this.lastTime ? Math.min(ts - this.lastTime, 50) : 16;
    this.lastTime = ts;
    this.update(dt / 1000);
    this.render();
    this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
  },

  update(dt) {
    this.frameCount++;

    if (this.modalShowing) {
      this.joystick.end();
      this.moving = false;
      this.setData({ joystickVisible: false, stickX: 0, stickY: 0 });
    } else {
      const dir = this.joystick.getDirection();
      if (dir.magnitude > 0) {
        let newX = this.player.x + dir.x * PLAYER.SPEED * dt;
        let newY = this.player.y + dir.y * PLAYER.SPEED * dt;

        const halfSize = PLAYER.SIZE / 2;
        newX = Math.max(halfSize, Math.min(MAP.WIDTH - halfSize, newX));
        newY = Math.max(halfSize, Math.min(MAP.HEIGHT - halfSize, newY));

        this.player.x = newX;
        this.player.y = newY;
        this.moving = true;
        this.playerDir = dirFromVector(dir.x, dir.y) || this.playerDir;
        // 实时更新状态管理，确保离开页面时保存的是最新位置
        gameStore.updatePlayerPos(this.player.x, this.player.y);
        gameStore.updatePlayerDirection(this.playerDir);
      } else {
        this.moving = false;
      }
    }

    this.anim.tick(dt * 1000, this.moving);

    const bld = buildingService.checkBuildingTrigger(this.player.x, this.player.y);

    if (bld) {
      // 只有从外部进入时才触发（isInTriggerZone 从 false 变为 true）
      // 并且不是刚从其他页面返回，以及不在冷却期内
      if (!this.isInTriggerZone && !this.modalShowing && !this.modalDismissed && !this.buildingCooldown) {
        this.isInTriggerZone = true;
        this.modalShowing = true;
        this.moving = false;
        
        wx.showModal({
          title: bld.name,
          content: '是否想要进入这个建筑并了解它的历史？',
          confirmText: '是',
          cancelText: '否',
          success: (res) => {
            this.modalShowing = false;
            this.modalDismissed = true;
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/building/building?id=' + bld.id
              });
            }
          }
        });
      } else {
        // 在触发区域内，更新标志
        this.isInTriggerZone = true;
      }
    } else {
      // 离开触发区域，重置标志
      this.isInTriggerZone = false;
      this.modalDismissed = false;
    }

    if (this.frameCount % UI.UPDATE_INTERVAL === 0) {
      this.setData({
        minimapPlayerX: (this.player.x / MAP.WIDTH) * 100,
        minimapPlayerY: (this.player.y / MAP.HEIGHT) * 100,
        coordX: Math.round(this.player.x),
        coordY: Math.round(this.player.y)
      });
    }
  },

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const dpr = this.sysInfo.pixelRatio;

    // 根据日夜状态设置背景颜色
    ctx.fillStyle = this.isDay ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.save();
    ctx.scale(dpr, dpr);

    const cam = computeCamera(this.player.x, this.player.y, this.viewW, this.viewH, MAP.WIDTH, MAP.HEIGHT);

    if (this.mapLoaded && this.mapImg) {
      ctx.drawImage(this.mapImg, cam.x, cam.y, this.viewW, this.viewH, 0, 0, this.viewW, this.viewH);
    } else {
      this.drawPlaceholderMap(ctx, cam);
    }

    this.drawBuildingZones(ctx, cam);

    const sp = worldToScreen(this.player.x, this.player.y, cam);
    this.drawPlayer(ctx, sp.x, sp.y);

    ctx.restore();
  },

  drawPlaceholderMap(ctx, cam) {
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

    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.strokeRect(-cam.x, -cam.y, MAP.WIDTH, MAP.HEIGHT);

    ctx.strokeStyle = '#A0A070';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(1000 - cam.x, 0); ctx.lineTo(1000 - cam.x, MAP.HEIGHT - cam.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 600 - cam.y); ctx.lineTo(MAP.WIDTH - cam.x, 600 - cam.y);
    ctx.stroke();

    ctx.fillStyle = '#4A8A2E';
    ctx.fillRect(200 - cam.x, 200 - cam.y, 300, 200);
    ctx.fillRect(1400 - cam.x, 300 - cam.y, 250, 180);
    ctx.fillRect(300 - cam.x, 700 - cam.y, 200, 150);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('触摸任意位置开始移动', this.viewW / 2, this.viewH / 2);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#ccc';
    ctx.fillText('将像素化图一保存为 images/map-bg.png', this.viewW / 2, this.viewH / 2 + 20);
  },

  drawBuildingZones(ctx, cam) {
    ctx.globalAlpha = 0;
    const colors = ['#FF6B35', '#4ECDC4', '#FFE66D', '#A8D8EA'];
    const buildings = buildingService.getAllBuildings();
    
    buildings.forEach((b, i) => {
      const zone = b.triggerZone;
      const sp = worldToScreen(zone.x, zone.y, cam);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(sp.x, sp.y, zone.w, zone.h);
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 2;
      ctx.strokeRect(sp.x, sp.y, zone.w, zone.h);
      ctx.globalAlpha = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, sp.x + zone.w / 2, sp.y + zone.h / 2 + 5);
    });
    ctx.globalAlpha = 1;
  },

  drawPlayer(ctx, x, y) {
    const s = PLAYER.SIZE;
    const bounce = this.moving && this.anim.frameIndex === 1 ? -4 : 0;
    const p = 4;
    const ox = x - s / 2;
    const oy = y - s / 2 + bounce;

    const C = {
      o: '#3D2200',
      M: '#C07820',
      b: '#D4A030',
      v: '#F5E6C8',
      e: '#1A1A1A',
      h: '#FFFFFF',
      n: '#2D1800',
      E: '#C07820',
      I: '#F0A0A0',
    };

    const grids = {
      down: [
        '....EE..EE....',
        '...EEOOEEOE...',
        '..MMMMMMMMMM..',
        '..MbbMMbbMbM..',
        '..MbMebeMeMb..',
        '..MbbbMMbbbM..',
        '..MMbbnnbbMM..',
        '...MMbbbbMM...',
        '...MbbvvbbM...',
        '...MbbvvbbM...',
        '....MbvvbM....',
        '....MMvvMM....',
      ],
      up: [
        '....EE..EE....',
        '...EEOOEEOE...',
        '..MMMMMMMMMM..',
        '..MbMMMMbMbM..',
        '..MbMMMMbMbM..',
        '..MbbbbbbbbbM..',
        '..MMbbbbbbMM..',
        '...MMbbbbMM...',
        '...MbbvvbbM...',
        '...MbbvvbbM...',
        '....MbvvbM....',
        '....MMvvMM....',
      ],
      left: [
        '...EE.........',
        '..EIOE........',
        '.MMMMMMM......',
        '.MMMMbbM......',
        '.MMMebbM......',
        '.MMbbbMM......',
        '.MMnnbbM......',
        '..MbbbbM......',
        '..MbbvvbM.....',
        '..MbbvvbM.....',
        '...MbvvbM.....',
        '...MMvvMM.....',
      ],
      right: [
        '.........EE...',
        '........EOIE..',
        '.......MMMMMMM',
        '.......bbMMMMM',
        '.......bbeMMM.',
        '.......bbbMM..',
        '.......bbnnMM.',
        '.......bbbbM..',
        '....bvvbbM....',
        '....bvvbbM....',
        '....MbvvbM....',
        '.....MMvvMM...',
      ]
    };

    const grid = grids[this.playerDir] || grids.down;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const ch = grid[r][c];
        if (ch !== '.' && C[ch]) {
          ctx.fillStyle = C[ch];
          ctx.fillRect(ox + c * p, oy + r * p, p, p);
        }
      }
    }
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
    if (!this.joystick.active) return;
    if (touch.identifier !== this.joystick.touchId) return;
    this.joystick.update(touch);
    const offset = this.joystick.getStickOffset();
    this.setData({
      stickX: offset.x,
      stickY: offset.y
    });
  },

  onTouchEnd(e) {
    this.joystick.end();
    this.setData({
      joystickVisible: false,
      stickX: 0,
      stickY: 0
    });
  },

  onBack() {
    wx.showModal({
      title: '退出游戏',
      content: '你是否要退出游戏？',
      confirmText: '是',
      cancelText: '否',
      success: (res) => {
        if (res.confirm) {
          this.running = false;
          gameStore.updatePlayerPos(this.player.x, this.player.y);
          wx.navigateBack({
            fail: () => {
              wx.redirectTo({ url: '/pages/start/start' });
            }
          });
        }
      }
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
});