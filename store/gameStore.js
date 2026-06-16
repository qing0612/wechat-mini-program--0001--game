// store/gameStore.js
// 游戏状态总入口：协调 player / backpack / stats / persistence
//
// 设计原则：
//   - gameStore 不再直接操作底层数据，统一走子模块
//   - 对外 API 保持稳定：getState / setState / subscribe / notify
//   - subscribe + notify 模式保留，便于页面响应式更新

const gameConfig = require('../config/gameConfig.js');
const Backpack = require('./backpack.js');
const Stats = require('./stats.js');
const Persistence = require('./persistence.js');
const cloudSync = require('../utils/cloudSync.js');
const logger = require('../utils/logger.js');

const { PLAYER } = gameConfig;

function defaultPlayer() {
  return {
    x: PLAYER.SPAWN_X,
    y: PLAYER.SPAWN_Y,
    direction: 'down',
    inTriggerZone: false
  };
}

function defaultSportsPlayer() {
  return { x: 0, y: 0, direction: 'down' };
}

class GameStore {
  constructor() {
    this.listeners = [];
    this.backpack = new Backpack();
    this.stats = new Stats();
    this.persistence = new Persistence();
    this.persistence.setCloudProvider(cloudSync);

    this.player = defaultPlayer();
    this.sportsPlayer = defaultSportsPlayer();
    this.isRunning = false;
    this.currentBuilding = null;
    this.isDay = true;
    this.season = 'spring';
    this.saveOnQuit = true;

    // 先看本地：是否已有存档
    const local = this.persistence.loadLocal();
    if (local) {
      this._applySnapshot(local);
    }

    // 如果 saveOnQuit=false，则从默认状态开始（不恢复）
    if (!this.saveOnQuit) {
      this.player = defaultPlayer();
      this.sportsPlayer = defaultSportsPlayer();
      this.stats.reset();
      this.backpack = new Backpack();
    }

    if (!this.stats.firstLaunchAt) {
      this.stats.load({ firstLaunchAt: Date.now() });
      this._persist();
    }

    // 云端合并（异步、失败忽略）
    if (this.persistence.cloudAvailable() && this.saveOnQuit) {
      this.persistence.loadFromCloud().then((cloud) => {
        if (!cloud) return;
        const backpackCount = this.backpack.count();
        const cloudBackpackCount = Array.isArray(cloud.backpack) ? cloud.backpack.length : 0;
        if (cloudBackpackCount >= backpackCount) {
          if (cloud.player) this.player = { ...this.player, ...cloud.player };
          if (typeof cloud.isDay === 'boolean') this.isDay = cloud.isDay;
          if (['spring', 'summer', 'autumn', 'winter'].includes(cloud.season)) this.season = cloud.season;
          if (Array.isArray(cloud.backpack)) this.backpack.load(cloud.backpack);
          if (cloud.sportsPlayer) this.sportsPlayer = { ...this.sportsPlayer, ...cloud.sportsPlayer };
          this.notify();
        }
      });
    }
  }

  // === 对外：读 ===
  getState() {
    return {
      player: { ...this.player },
      sportsPlayer: { ...this.sportsPlayer },
      isRunning: this.isRunning,
      currentBuilding: this.currentBuilding,
      isDay: this.isDay,
      season: this.season,
      saveOnQuit: this.saveOnQuit,
      backpack: this.backpack.snapshot(),
      stats: {
        totalSteps: this.stats.totalSteps,
        buildingsVisited: this.stats.buildingsVisited,
        badgesCollected: this.stats.badgesCollected,
        firstLaunchAt: this.stats.firstLaunchAt
      }
    };
  }

  // === 对外：写（局部） ===
  setState(partial) {
    if (!partial) return;
    if (partial.player) this.player = { ...this.player, ...partial.player };
    if (partial.sportsPlayer) this.sportsPlayer = { ...this.sportsPlayer, ...partial.sportsPlayer };
    if (typeof partial.isRunning === 'boolean') this.isRunning = partial.isRunning;
    if (partial.currentBuilding !== undefined) this.currentBuilding = partial.currentBuilding;
    if (typeof partial.isDay === 'boolean') this.isDay = partial.isDay;
    if (typeof partial.season === 'string') this.season = partial.season;
    if (typeof partial.saveOnQuit === 'boolean') this.saveOnQuit = partial.saveOnQuit;
    if (Array.isArray(partial.backpack)) this.backpack.load(partial.backpack);
    if (partial.stats) this.stats.load(partial.stats);
    this.notify();
  }

  // === 对外：订阅 ===
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
    this._persist();
  }

  // === Player 操作 ===
  updatePlayerPos(x, y) {
    this.stats.stepOnce();
    this.player.x = x;
    this.player.y = y;
    this.notify();
  }

  updatePlayerDirection(direction) {
    this.player.direction = direction;
    this.notify();
  }

  // 运动场子地图的独立玩家位置与朝向
  updateSportsPlayer(x, y, direction) {
    this.sportsPlayer.x = x;
    this.sportsPlayer.y = y;
    if (direction) this.sportsPlayer.direction = direction;
    this.notify();
  }

  setInTriggerZone(inTriggerZone) {
    this.player.inTriggerZone = !!inTriggerZone;
    this.notify();
  }

  setCurrentBuilding(building) {
    // badge / building 计数 = 背包长度（访问过的建筑 = 获得过徽章）
    this.stats.syncFromBackpack(this.backpack.count());
    this.currentBuilding = building;
    this.notify();
  }

  clearCurrentBuilding() {
    this.currentBuilding = null;
    this.notify();
  }

  startGame() {
    this.isRunning = true;
    this.notify();
  }

  stopGame() {
    this.isRunning = false;
    this.notify();
  }

  setIsDay(isDay) {
    this.isDay = !!isDay;
    this.notify();
  }

  setSeason(season) {
    this.season = season;
    this.notify();
  }

  updateSportsPlayer(x, y, direction) {
    this.sportsPlayer.x = x;
    this.sportsPlayer.y = y;
    if (direction) this.sportsPlayer.direction = direction;
    this.notify();
  }

  // === 背包 / 徽章 ===
  addToBackpack(item) {
    const result = this.backpack.add(item);
    if (result && result.isNew) {
      logger.info('gameStore', 'new badge collected', { id: item && item.id });
    }
    this.stats.syncFromBackpack(this.backpack.count());
    this.notify();
  }

  removeFromBackpack(itemId) {
    this.backpack.remove(itemId);
    this.stats.syncFromBackpack(this.backpack.count());
    this.notify();
  }

  getBackpack() {
    return this.backpack.snapshot();
  }

  hasBadge(badgeId) {
    return this.backpack.has(badgeId);
  }

  // === 存档控制 ===
  setSaveOnQuit(value) {
    if (value === false) {
      this.stats.reset();
    }
    this.saveOnQuit = !!value;
    this.notify();
  }

  resetGame() {
    this.player = defaultPlayer();
    this.sportsPlayer = defaultSportsPlayer();
    this.isRunning = false;
    this.currentBuilding = null;
    this.isDay = true;
    this.season = 'spring';
    this.backpack = new Backpack();
    this.stats.reset();
    this.stats.load({ firstLaunchAt: Date.now() });
    this.persistence.clearLocal();
    this.notify();
  }

  forceSyncToCloud() {
    if (!this.persistence.cloudAvailable()) {
      wx.showToast({ title: '云开发未启用', icon: 'none' });
      return Promise.resolve(false);
    }
    this.stats.syncFromBackpack(this.backpack.count());
    wx.showLoading({ title: '同步中...' });
    return this.persistence
      .forceSyncToCloud(this._snapshot())
      .then((ok) => {
        wx.hideLoading();
        if (ok) {
          wx.showToast({ title: '已同步', icon: 'success' });
          logger.info('gameStore', 'forceSyncToCloud done');
        } else {
          wx.showToast({ title: '同步失败', icon: 'none' });
        }
        return ok;
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '同步失败', icon: 'none' });
        return false;
      });
  }

  hasSavedGame() {
    return this.persistence.hasLocal();
  }

  // === 内部工具 ===
  _snapshot() {
    const s = this.getState();
    return {
      player: s.player,
      isDay: s.isDay,
      season: s.season,
      backpack: s.backpack,
      sportsPlayer: s.sportsPlayer,
      saveOnQuit: s.saveOnQuit,
      stats: s.stats
    };
  }

  _applySnapshot(data) {
    if (!data) return;
    if (data.player) this.player = { ...defaultPlayer(), ...data.player };
    if (data.sportsPlayer) this.sportsPlayer = { ...defaultSportsPlayer(), ...data.sportsPlayer };
    if (typeof data.isDay === 'boolean') this.isDay = data.isDay;
    if (typeof data.season === 'string') this.season = data.season;
    if (Array.isArray(data.backpack)) this.backpack.load(data.backpack);
    if (typeof data.saveOnQuit === 'boolean') this.saveOnQuit = data.saveOnQuit;
    if (data.stats) this.stats.load(data.stats);
    this.stats.syncFromBackpack(this.backpack.count());
  }

  _persist() {
    if (!this.saveOnQuit) return;
    this.persistence.save(this._snapshot());
  }
}

module.exports = new GameStore();