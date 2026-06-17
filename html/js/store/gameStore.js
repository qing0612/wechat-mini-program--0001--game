// 游戏状态管理（HTML版·模块化重构）
// 设计：使用 Backpack/Stats/Persistence 三个子模块，实现单一真相来源
(function() {
  // ===== 工具函数：默认玩家/运动场玩家 =====
  function defaultPlayer() {
    return {
      x: window.CONFIG.PLAYER.SPAWN_X,
      y: window.CONFIG.PLAYER.SPAWN_Y,
      direction: 'down',
      inTriggerZone: false
    };
  }

  function defaultSportsPlayer() {
    return {
      x: window.CONFIG.SPORTS_MAP.SPAWN_X,
      y: window.CONFIG.SPORTS_MAP.SPAWN_Y,
      direction: 'up'
    };
  }

  // ===== GameStore 主类 =====
  function GameStore() {
    this.listeners = [];
    this.backpack = new window.Backpack();
    this.stats = new window.Stats();
    this.persistence = new window.Persistence();

    this.player = defaultPlayer();
    this.sportsPlayer = defaultSportsPlayer();
    this.currentBuilding = null;
    this.isDay = true;
    this.season = 'spring';

    // 本地存档加载
    var saved = this.persistence.load();
    if (saved) {
      if (saved.player) this.player = saved.player;
      if (saved.sportsPlayer) this.sportsPlayer = saved.sportsPlayer;
      if (typeof saved.isDay === 'boolean') this.isDay = saved.isDay;
      if (typeof saved.season === 'string' &&
          (saved.season === 'spring' || saved.season === 'summer' ||
           saved.season === 'autumn' || saved.season === 'winter')) {
        this.season = saved.season;
      }
      if (Array.isArray(saved.backpack)) this.backpack.load(saved.backpack);
      if (saved.stats) this.stats = new window.Stats(saved.stats);
    }
    // 保持徽章数与背包数一致（单一真相来源）
    this.stats.syncFromBackpack(this.backpack.count());
  }

  // ===== 订阅/通知 =====
  GameStore.prototype.subscribe = function(listener) {
    var self = this;
    this.listeners.push(listener);
    return function() {
      self.listeners = self.listeners.filter(function(l) { return l !== listener; });
    };
  };

  GameStore.prototype.notify = function() {
    var state = this.getState();
    var list = this.listeners.slice();
    for (var i = 0; i < list.length; i++) {
      try { list[i](state); } catch (e) { /* ignore */ }
    }
    // 通知后立即持久化
    this.persistence.save(this._snapshot());
  };

  // ===== 状态读取 =====
  GameStore.prototype.getState = function() {
    return {
      player: Object.assign({}, this.player),
      sportsPlayer: Object.assign({}, this.sportsPlayer),
      currentBuilding: this.currentBuilding,
      isDay: this.isDay,
      season: this.season,
      backpack: this.backpack.snapshot(),
      stats: this.stats.snapshot()
    };
  };

  // ===== 玩家 =====
  GameStore.prototype.updatePlayerPos = function(x, y) {
    this.stats.stepOnce();
    this.player.x = x;
    this.player.y = y;
    this.notify();
  };

  GameStore.prototype.updatePlayerDirection = function(dir) {
    this.player.direction = dir;
    this.notify();
  };

  GameStore.prototype.updateSportsPlayer = function(x, y, dir) {
    this.sportsPlayer.x = x;
    this.sportsPlayer.y = y;
    if (dir) this.sportsPlayer.direction = dir;
    this.notify();
  };

  GameStore.prototype.setInTriggerZone = function(val) {
    this.player.inTriggerZone = !!val;
    this.notify();
  };

  GameStore.prototype.setCurrentBuilding = function(building) {
    this.currentBuilding = building;
    // 保持徽章数与建筑数一致（单一真相来源：backpack）
    this.stats.syncFromBackpack(this.backpack.count());
    this.notify();
  };

  // ===== 日夜/季节 =====
  GameStore.prototype.setIsDay = function(isDay) {
    this.isDay = !!isDay;
    this.notify();
  };

  GameStore.prototype.setSeason = function(season) {
    var VALID = { spring: 1, summer: 1, autumn: 1, winter: 1 };
    if (VALID[season]) {
      this.season = season;
      this.notify();
    }
  };

  // ===== 背包/徽章 =====
  GameStore.prototype.addToBackpack = function(item) {
    var result = this.backpack.add(item);
    if (result.isNew) {
      this.stats.syncFromBackpack(this.backpack.count());
      this.notify();
    }
    return result;
  };

  GameStore.prototype.hasBadge = function(id) {
    return this.backpack.has(id);
  };

  GameStore.prototype.getBackpack = function() {
    return this.backpack.snapshot();
  };

  GameStore.prototype.removeFromBackpack = function(id) {
    this.backpack.remove(id);
    this.stats.syncFromBackpack(this.backpack.count());
    this.notify();
  };

  // ===== 重置 =====
  GameStore.prototype.resetGame = function() {
    this.player = defaultPlayer();
    this.sportsPlayer = defaultSportsPlayer();
    this.currentBuilding = null;
    this.isDay = true;
    this.season = 'spring';
    this.backpack.reset();
    this.stats.reset();
    this.persistence.clear();
    this.notify();
  };

  GameStore.prototype.hasSavedGame = function() {
    return this.persistence.hasSaved();
  };

  // ===== 内部：快照（持久化用） =====
  GameStore.prototype._snapshot = function() {
    return {
      player: this.player,
      sportsPlayer: this.sportsPlayer,
      isDay: this.isDay,
      season: this.season,
      backpack: this.backpack.snapshot(),
      stats: this.stats.snapshot()
    };
  };

  // 暴露到全局
  window.GameStore = GameStore;
  window.gameStore = new GameStore();
})();