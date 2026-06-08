const Joystick = require('../../utils/joystick.js');
const { SpriteAnimator, dirFromVector } = require('../../utils/sprite.js');
const gameConfig = require('../../config/gameConfig.js');

const { PLAYER, MAP, UI } = gameConfig;

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
    console.log('Sports page loaded');
    this.joystick = new Joystick({ radius: UI.JOYSTICK_RADIUS });
    this.anim = new SpriteAnimator({ 
      frameCount: gameConfig.ANIMATION.FRAME_COUNT, 
      frameDuration: gameConfig.ANIMATION.FRAME_DURATION 
    });
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.canvasReady = false;
    
    // 玩家状态
    this.player = { x: MAP.WIDTH / 2, y: MAP.HEIGHT / 2 };
    this.playerDir = 'down';
    this.moving = false;
    
    // 游戏计时器
    this.gameSeconds = 0;
    setInterval(() => {
      this.gameSeconds++;
      const minutes = Math.floor(this.gameSeconds / 60);
      const seconds = this.gameSeconds % 60;
      this.setData({
        gameTime: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      });
    }, 1000);
  },

  onReady() {
    console.log('Page onReady');
    if (!this.canvasReady) {
      this.initCanvas(0);
    }
  },

  initCanvas(retry) {
    console.log('initCanvas 重试次数:', retry);
    const query = this.createSelectorQuery();
    query.select('#playerCanvas').fields({ node: true, size: true }).exec((res) => {
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

      // 检查尺寸是否合理
      if (cssW <= 0 || cssH <= 0) {
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

      this.canvasReady = true;
      this.running = true;
      this.lastTime = 0;
      
      console.log('Canvas 初始化成功');
      // 使用 canvas.requestAnimationFrame 启动游戏循环
      this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
    });
  },

  gameLoop(t) {
    if (!this.running || !this.canvas) return;
    
    const dt = Math.min(t - this.lastTime, 50);
    this.lastTime = t;
    
    this.update(dt / 1000);
    this.render();
    
    this.canvas.requestAnimationFrame((t) => this.gameLoop(t));
  },

  update(dt) {
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
    } else {
      this.moving = false;
    }
    this.anim.tick(dt * 1000, this.moving);
  },

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const dpr = this.sysInfo.pixelRatio;
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // 计算缩放
    const scaleX = this.viewW / MAP.WIDTH;
    const scaleY = this.viewH / MAP.HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (this.viewW - MAP.WIDTH * scale) / 2;
    const offsetY = (this.viewH - MAP.HEIGHT * scale) / 2;
    
    // 绘制玩家
    const screenX = this.player.x * scale + offsetX;
    const screenY = this.player.y * scale + offsetY;
    
    console.log('render - player:', this.player.x, this.player.y, 'screen:', screenX, screenY, 'scale:', scale);
    
    this.drawPlayer(ctx, screenX, screenY, scale);
    
    ctx.restore();
  },

  drawPlayer(ctx, x, y, scale) {
    const s = PLAYER.SIZE * scale;
    const bounce = this.moving && this.anim.frameIndex === 1 ? -4 * scale : 0;
    const p = 4 * scale;
    const ox = x - s / 2;
    const oy = y - s / 2 + bounce;

    const C = {
      o: '#3D2200',
      O: '#3D2200',
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
    if (!this.joystick.active || touch.identifier !== this.joystick.touchId) return;
    this.joystick.update(touch);
    const offset = this.joystick.getStickOffset();
    this.setData({ stickX: offset.x, stickY: offset.y });
  },

  onTouchEnd(e) {
    this.joystick.end();
    this.setData({ joystickVisible: false, stickX: 0, stickY: 0 });
  },

  goBack() {
    wx.navigateBack();
  },

  onUnload() {
    this.running = false;
  }
});