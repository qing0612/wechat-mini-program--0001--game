// 地图页面控制器（HTML版·模块化）
// 设计：
//   - 只做组装：调用 PlayerController 处理输入/移动
//   - 调用 WeatherManager 处理天气
//   - 调用 CanvasBootstrap 处理画布缩放
//   - 渲染层委托给 CampusRenderer / SportsRenderer
//   - 不持有业务状态，状态由 gameStore 管理
window.MapController = (function() {
  function MapController(options) {
    options = options || {};
    this.canvas = null;
    this.ctx = null;
    this.viewW = 0;
    this.viewH = 0;
    this.dpr = 1;
    this._isSportsMode = false;
    this._rafId = null;
    this._lastTime = 0;
    this._tickCount = 0;
    this._currentBuilding = null;
    this._inTriggerZone = false;

    // 子模块（依赖注入，便于单测）
    this.playerCtrl = options.playerController || new window.PlayerController();
    this.weatherMgr = options.weatherManager || new window.WeatherManager();
    this.canvasBootstrap = options.canvasBootstrap || new window.CanvasBootstrap();
    this.touchDispatcher = options.touchDispatcher || new window.TouchDispatcher();
    this.campusRenderer = options.campusRenderer || new window.CampusRenderer();
    this.sportsRenderer = options.sportsRenderer || new window.SportsRenderer();
    this.buildingService = options.buildingService || new window.BuildingService();
  }

  MapController.prototype.setSportsMode = function(flag) {
    this._isSportsMode = !!flag;
    this.playerCtrl.setSportsMode(!!flag);
  };

  MapController.prototype.init = function(canvas) {
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = this.canvasBootstrap.init(canvas);
    this.viewW = this.canvasBootstrap.viewW;
    this.viewH = this.canvasBootstrap.viewH;
    this.dpr = this.canvasBootstrap.dpr;
    this.weatherMgr.init(this.viewW, this.viewH, this.dpr);
    this.campusRenderer.loadMapImage(window.ASSETS.MAP_BG);
    this.sportsRenderer.loadMapImage(window.ASSETS.SPORTS_BG);

    // 输入事件 → TouchDispatcher 统一处理
    var self = this;
    this.touchDispatcher.bind(canvas, this.playerCtrl);
  };

  MapController.prototype.start = function() {
    if (this._rafId) return;
    this._lastTime = performance.now();
    var self = this;
    this._rafId = requestAnimationFrame(function(ts) { self._loop(ts); });
  };

  MapController.prototype.stop = function() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  };

  MapController.prototype._loop = function(timestamp) {
    var dt = timestamp - this._lastTime;
    if (dt > 100) dt = 100; // 防止切换标签后大跳
    this._lastTime = timestamp;
    var dtSec = dt / 1000;

    this._update(dt, dtSec);
    this._render();

    var self = this;
    this._rafId = requestAnimationFrame(function(ts) { self._loop(ts); });
  };

  MapController.prototype._update = function(dt, dtSec) {
    // 动态尺寸同步
    if (this.canvasBootstrap.needsResize()) {
      this.canvasBootstrap.resize();
      this.viewW = this.canvasBootstrap.viewW;
      this.viewH = this.canvasBootstrap.viewH;
      this.dpr = this.canvasBootstrap.dpr;
      this.weatherMgr.init(this.viewW, this.viewH, this.dpr);
    }

    var store = window.gameStore;
    var state = store.getState();

    // 同步天气/日夜参数（由 gameStore 驱动）
    this.weatherMgr.setSeason(state.season);
    this.weatherMgr.setIsDay(state.isDay);
    this.campusRenderer.isDay = state.isDay;
    this.campusRenderer.season = state.season;
    this.sportsRenderer.isDay = state.isDay;
    this.sportsRenderer.season = state.season;

    // 天气粒子前进
    this.weatherMgr.update(dtSec);

    // 玩家移动（纯计算，返回 null 代表未移动）
    var next = this.playerCtrl.tick(dt, dtSec, state);
    if (!next) return;

    // 每若干帧落盘一次（节流持久化）
    this._tickCount++;
    var shouldPersist = this._tickCount % window.CONFIG.UI.UPDATE_INTERVAL === 0;

    if (next.sportsMode) {
      if (shouldPersist) {
        store.updateSportsPlayer(next.x, next.y, next.direction);
      } else {
        store.sportsPlayer.x = next.x;
        store.sportsPlayer.y = next.y;
        store.sportsPlayer.direction = next.direction;
      }
    } else {
      // 校园模式：同步到 gameStore，并检测建筑触发
      if (shouldPersist) {
        store.updatePlayerPos(next.x, next.y);
        store.player.direction = next.direction;
        store.notify();
      } else {
        store.player.x = next.x;
        store.player.y = next.y;
        store.player.direction = next.direction;
      }
      this._checkBuildingTrigger(next.x, next.y);
    }
  };

  // 建筑触发检测（抽成独立方法，不与渲染耦合）
  MapController.prototype._checkBuildingTrigger = function(x, y) {
    var store = window.gameStore;
    var triggered = this.buildingService.checkTrigger(x, y);
    if (triggered) {
      if (!this._currentBuilding || this._currentBuilding.id !== triggered.id) {
        this._currentBuilding = triggered;
        store.setInTriggerZone(true);
        store.setCurrentBuilding(triggered);
      }
    } else if (this._currentBuilding) {
      this._currentBuilding = null;
      store.setInTriggerZone(false);
      store.setCurrentBuilding(null);
    }
  };

  MapController.prototype._render = function() {
    if (!this.ctx) return;
    var store = window.gameStore;
    var state = store.getState();
    var cfg = this._isSportsMode ? window.CONFIG.SPORTS_MAP : window.CONFIG.MAP;
    var playerPos = this._isSportsMode ? state.sportsPlayer : state.player;
    var cam = window.Camera.compute(playerPos.x, playerPos.y, this.viewW, this.viewH, cfg.WIDTH, cfg.HEIGHT);

    // 背景 + 地图 + 日夜/季节遮罩
    var renderOpts = {
      cam: cam, viewW: this.viewW, viewH: this.viewH,
      mapW: cfg.WIDTH, mapH: cfg.HEIGHT, dpr: this.dpr,
      buildings: this.buildingService.getAll(),
      currentBuilding: state.currentBuilding
    };

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this._isSportsMode) {
      this.sportsRenderer.render(this.ctx, renderOpts);
    } else {
      this.campusRenderer.render(this.ctx, renderOpts);
      this.campusRenderer.renderBuildingZones(this.ctx, renderOpts);
    }

    // 玩家绘制（像素角色）
    var screenPos = window.Camera.worldToScreen(playerPos.x, playerPos.y, cam);
    var dir = this.playerCtrl.getDirection();
    var isMoving = dir.magnitude > 0.1;
    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    window.drawPlayer(this.ctx, screenPos.x, screenPos.y, isMoving, this.playerCtrl.spriteAnimator.frameIndex, playerPos.direction);
    this.ctx.restore();

    // 天气粒子
    this.weatherMgr.render(this.ctx);
  };

  MapController.prototype.resetPlayerPosition = function() {
    var store = window.gameStore;
    if (this._isSportsMode) {
      store.sportsPlayer.x = window.CONFIG.SPORTS_MAP.SPAWN_X;
      store.sportsPlayer.y = window.CONFIG.SPORTS_MAP.SPAWN_Y;
    } else {
      store.player.x = window.CONFIG.PLAYER.SPAWN_X;
      store.player.y = window.CONFIG.PLAYER.SPAWN_Y;
    }
    store.notify();
  };

  MapController.prototype.getJoystickUIState = function() {
    var j = this.playerCtrl.joystick;
    if (!j || !j.active || !this.canvas) return null;
    var rect = this.canvas.getBoundingClientRect();
    return {
      baseX: j.baseX - rect.left,
      baseY: j.baseY - rect.top,
      offset: j.getStickOffset()
    };
  };

  return MapController;
})();