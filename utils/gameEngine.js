// 游戏引擎 mixin：把 map.js / sports.js 中重复的 Canvas、摇杆、游戏循环
// 抽离成一个可复用的"工厂函数"。调用方只需提供：
//   page     - 当前 Page 实例（用于 setData / createSelectorQuery）
//   config   - { canvasId, playerConfig, mapSize, mapImage, joystickRadius }
//   hooks    - { onUpdate(dt), onRender(ctx, cam), onTouchStart / End, onExit }
//
// 设计：
//   - 采用"工厂模式 + mixin"返回一个 engine 对象
//   - 调用方的 update / render 钩子里只要写"该页面特有的渲染/业务逻辑"即可
//   - 生命周期：init() → onShow() → onHide() → destroy()
//   - 对 window resize 防抖，避免连续 layout 引起性能抖动
//
// 使用示例（见 pages/map/map.js / pages/sports/sports.js）：
//   const engine = createGameEngine(this, {
//     canvasId: '#gameCanvas',
//     mapSize: { width: 1893, height: 1093 },
//     mapImage: '/images/map-bg.png'
//   }, {
//     onUpdate: (dt) => { /* 页面特有更新 */ },
//     onRender: (ctx, cam) => { /* 页面特有绘制 */ }
//   });

const Joystick = require('./joystick.js');
const { SpriteAnimator, dirFromVector, drawPlayer } = require('./sprite.js');
const { computeCamera, worldToScreen } = require('./camera.js');
const logger = require('./logger.js');

function createGameEngine(page, config, hooks) {
  const engine = {
    canvas: null,
    ctx: null,
    dpr: 1,
    viewW: 0,
    viewH: 0,
    mapImg: null,
    mapLoaded: false,
    running: false,
    _lastFrameTs: 0,
    _resizeTimer: null,
    _progressTimer: null,
    _onResizeHandler: null,
    joystick: new Joystick({ radius: config.joystickRadius || 45 }),
    anim: new SpriteAnimator({
      frameCount: (config.animation && config.animation.frameCount) || 2,
      frameDuration: (config.animation && config.animation.frameDuration) || 200
    }),
    player: {
      x: (config.player && config.player.spawnX) || 0,
      y: (config.player && config.player.spawnY) || 0,
      dir: (config.player && config.player.direction) || 'down'
    },
    moving: false,
    speed: (config.player && config.player.speed) || 160,
    playerSize: (config.player && config.player.size) || 48,
    mapSize: config.mapSize || { width: 0, height: 0 },
    background: config.background || null,
    showGrid: config.showGrid !== false,
    gameSeconds: 0,
    _gameTimer: null,
    _customData: {}
  };

  function setData(partial) {
    try { page.setData(partial); } catch (e) {
      logger.warn('gameEngine', 'setData failed', e && e.message);
    }
  }

  function startProgress(initialText) {
    stopProgress();
    let progress = 0;
    engine._progressTimer = setInterval(() => {
      if (progress < 30) {
        progress += 2;
        if (progress >= 30) setData({ loadStageText: '初始化画布...' });
      } else if (progress < 70) {
        progress += 1.5;
        if (progress >= 50) setData({ loadStageText: initialText || '加载地图...' });
        if (engine.mapLoaded && progress > 70) progress = 70;
      } else if (progress < 100 && engine.mapLoaded) {
        progress += 3;
        if (progress >= 85) setData({ loadStageText: '准备就绪...' });
      } else if (progress < 100 && !engine.mapLoaded && progress < 90) {
        progress += 0.5;
      }
      if (progress >= 100) {
        progress = 100;
        stopProgress();
        setTimeout(() => setData({ loadVisible: false }), 300);
      }
      setData({ loadProgress: Math.round(progress) });
    }, 50);
  }

  function stopProgress() {
    if (engine._progressTimer) {
      clearInterval(engine._progressTimer);
      engine._progressTimer = null;
    }
  }

  function initCanvas(callback) {
    const query = page.createSelectorQuery();
    query.select(config.canvasId).fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        if (typeof callback === 'function') callback(new Error('canvas not ready'));
        return;
      }
      let cssW = res[0].width;
      let cssH = res[0].height;

      if (cssW <= 0 || cssH <= 0) {
        const sys = wx.getWindowInfo ? wx.getWindowInfo() : {};
        cssW = sys.windowWidth || 375;
        cssH = sys.windowHeight || 600;
      }

      const canvas = res[0].node;
      engine.canvas = canvas;
      engine.ctx = canvas.getContext('2d');
      engine.dpr = (wx.getWindowInfo && wx.getWindowInfo().pixelRatio) || 2;
      engine.viewW = cssW;
      engine.viewH = cssH;
      canvas.width = cssW * engine.dpr;
      canvas.height = cssH * engine.dpr;

      if (config.mapImage && engine.canvas.createImage) {
        engine.mapImg = engine.canvas.createImage();
        engine.mapImg.onload = () => { engine.mapLoaded = true; };
        engine.mapImg.onerror = () => {
          engine.mapLoaded = false;
          logger.warn('gameEngine', 'map image load failed', config.mapImage);
          engine.mapLoaded = true;
        };
        engine.mapImg.src = config.mapImage;
      } else {
        engine.mapLoaded = true;
      }

      if (engine._pendingStart) {
        engine._pendingStart = false;
        if (engine.canvas && engine.canvas.requestAnimationFrame) {
          engine.canvas.requestAnimationFrame(gameLoop);
        }
      }

      if (typeof callback === 'function') callback(null);
    });
  }

  function resize() {
    if (!engine.canvas) return;
    const query = page.createSelectorQuery();
    query.select(config.canvasId).fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0]) return;
      const cssW = res[0].width;
      const cssH = res[0].height;
      if (cssW <= 0 || cssH <= 0) return;
      if (Math.abs(cssW - engine.viewW) < 1 && Math.abs(cssH - engine.viewH) < 1) return;
      engine.canvas.width = cssW * engine.dpr;
      engine.canvas.height = cssH * engine.dpr;
      engine.viewW = cssW;
      engine.viewH = cssH;
    });
  }

  function update(dt) {
    if (hooks && hooks.onUpdate) {
      const result = hooks.onUpdate({
        player: engine.player,
        joystick: engine.joystick,
        moving: engine.moving,
        speed: engine.speed,
        playerSize: engine.playerSize,
        mapSize: engine.mapSize
      }, dt);
      // 允许钩子覆盖玩家状态
      if (result && typeof result === 'object') {
        if (result.player) {
          if (typeof result.player.x === 'number') engine.player.x = result.player.x;
          if (typeof result.player.y === 'number') engine.player.y = result.player.y;
          if (result.player.dir) engine.player.dir = result.player.dir;
        }
        if (typeof result.moving === 'boolean') engine.moving = result.moving;
      }
    } else {
      // 默认：根据摇杆移动玩家并做地图边界夹取
      const dir = engine.joystick.getDirection();
      if (dir.magnitude > 0) {
        let nx = engine.player.x + dir.x * engine.speed * dt;
        let ny = engine.player.y + dir.y * engine.speed * dt;
        const half = engine.playerSize / 2;
        nx = Math.max(half, Math.min(engine.mapSize.width - half, nx));
        ny = Math.max(half, Math.min(engine.mapSize.height - half, ny));
        engine.player.x = nx;
        engine.player.y = ny;
        engine.moving = true;
        engine.player.dir = dirFromVector(dir.x, dir.y) || engine.player.dir;
      } else {
        engine.moving = false;
      }
    }
    engine.anim.tick(dt * 1000, engine.moving);
  }

  function render() {
    const ctx = engine.ctx;
    if (!ctx) return;
    if (engine.viewW <= 0 || engine.viewH <= 0) return;
    const cam = computeCamera(
      engine.player.x, engine.player.y,
      engine.viewW, engine.viewH,
      engine.mapSize.width, engine.mapSize.height
    );

    ctx.save();
    ctx.fillStyle = engine.background || '#1a1a2e';
    ctx.fillRect(0, 0, engine.canvas.width, engine.canvas.height);
    ctx.scale(engine.dpr, engine.dpr);

    // 先让页面特有的渲染（地图图片、建筑、日夜遮罩等）
    if (hooks && hooks.onRender) {
      hooks.onRender(ctx, cam, {
        canvas: engine.canvas,
        viewW: engine.viewW,
        viewH: engine.viewH,
        mapLoaded: engine.mapLoaded,
        mapImg: engine.mapImg
      });
    } else if (engine.mapLoaded && engine.mapImg) {
      ctx.drawImage(
        engine.mapImg,
        cam.x, cam.y, engine.viewW, engine.viewH,
        0, 0, engine.viewW, engine.viewH
      );
    }

    // 绘制玩家（所有页面通用）
    const sp = worldToScreen(engine.player.x, engine.player.y, cam);
    drawPlayer(ctx, sp.x, sp.y, engine.moving, engine.anim.frameIndex, engine.player.dir);

    ctx.restore();
  }

  function gameLoop(ts) {
    if (!engine.running || !engine.canvas || engine.viewW <= 0) return;
    const dt = engine._lastFrameTs ? Math.min((ts - engine._lastFrameTs) / 1000, 0.05) : 0.016;
    engine._lastFrameTs = ts;
    update(dt);
    render();
    engine.canvas.requestAnimationFrame(gameLoop);
  }

  function start() {
    engine.running = true;
    engine._lastFrameTs = 0;
    if (engine.canvas && engine.canvas.requestAnimationFrame) {
      engine.canvas.requestAnimationFrame(gameLoop);
    } else {
      engine._pendingStart = true;
    }
    if (!engine._gameTimer) {
      engine._gameTimer = setInterval(() => {
        engine.gameSeconds++;
        const m = Math.floor(engine.gameSeconds / 60).toString().padStart(2, '0');
        const s = (engine.gameSeconds % 60).toString().padStart(2, '0');
        setData({ gameTime: m + ':' + s });
      }, 1000);
    }
  }

  function stop() {
    engine.running = false;
    engine._pendingStart = false;
    stopProgress();
    if (engine._gameTimer) {
      clearInterval(engine._gameTimer);
      engine._gameTimer = null;
    }
    if (engine._resizeTimer) {
      clearTimeout(engine._resizeTimer);
      engine._resizeTimer = null;
    }
    if (engine._onResizeHandler) {
      wx.offWindowResize(engine._onResizeHandler);
      engine._onResizeHandler = null;
    }
    engine.joystick.end();
  }

  // 触摸事件处理：调用方在 Page 的 onTouchStart/Move/End 中转发
  function onTouchStart(e) {
    const touch = e.touches[0];
    engine.joystick.start(touch);
    setData({
      joystickVisible: true,
      joystickBaseX: touch.clientX,
      joystickBaseY: touch.clientY,
      stickX: 0,
      stickY: 0
    });
    if (hooks && hooks.onTouchStart) hooks.onTouchStart(e);
  }

  function onTouchMove(e) {
    const touch = e.touches[0];
    if (!engine.joystick.active || touch.identifier !== engine.joystick.touchId) return;
    engine.joystick.update(touch);
    const offset = engine.joystick.getStickOffset();
    setData({ stickX: offset.x, stickY: offset.y });
    if (hooks && hooks.onTouchMove) hooks.onTouchMove(e);
  }

  function onTouchEnd(e) {
    engine.joystick.end();
    setData({ joystickVisible: false, stickX: 0, stickY: 0 });
    if (hooks && hooks.onTouchEnd) hooks.onTouchEnd(e);
  }

  function bindWindowResize() {
    engine._onResizeHandler = () => {
      if (engine._resizeTimer) clearTimeout(engine._resizeTimer);
      engine._resizeTimer = setTimeout(resize, 150);
    };
    wx.onWindowResize(engine._onResizeHandler);
  }

  function setPlayer(x, y, dir) {
    if (typeof x === 'number') engine.player.x = x;
    if (typeof y === 'number') engine.player.y = y;
    if (dir) engine.player.dir = dir;
  }

  function getPlayer() {
    return { x: engine.player.x, y: engine.player.y, dir: engine.player.dir, moving: engine.moving };
  }

  // 生命周期：
  //   init()    - 页面 onReady 中调用，初始化 Canvas
  //   onShow()  - 页面 onShow 中调用，启动循环
  //   onHide()  - 页面 onHide / onUnload 中调用，释放资源
  return {
    init(options, onReady) {
      setData({
        loadProgress: 0,
        loadVisible: true,
        loadStageText: (options && options.loadStageText) || '资源加载中...',
        joystickBaseR: config.joystickRadius || 45
      });
      initCanvas((err) => {
        if (err) {
          logger.warn('gameEngine', 'canvas init failed, retrying');
          setTimeout(() => initCanvas(onReady), 250);
          return;
        }
        startProgress(options && options.loadStageText);
        bindWindowResize();
        if (typeof onReady === 'function') onReady();
      });
    },
    start,
    stop,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    setPlayer,
    getPlayer,
    getCanvas: () => engine.canvas,
    getCtx: () => engine.ctx,
    getMapSize: () => ({ ...engine.mapSize }),
    _internal: engine
  };
}

module.exports = { createGameEngine };