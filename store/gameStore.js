// c:\Users\yibohe\Desktop\小程序-代码\store\gameStore.js
const gameConfig = require('../config/gameConfig.js');
const cloudSync = require('../utils/cloudSync.js');
const logger = require('../utils/logger.js');

class GameStore {
  constructor() {
    try {
      const { PLAYER } = gameConfig;
      this.listeners = [];

      // 先读取保存设置，决定是否恢复数据
      let saveOnQuit = true;
      try {
        const raw = wx.getStorageSync('game_state');
        if (raw) {
          const d = JSON.parse(raw);
          if (typeof d.saveOnQuit === 'boolean') {
            saveOnQuit = d.saveOnQuit;
          }
        }
      } catch (e) {
        saveOnQuit = true;
      }

      const defaultStats = { totalSteps: 0, buildingsVisited: 0, badgesCollected: 0, firstLaunchAt: null };

      if (saveOnQuit) {
        this.state = {
          player: { x: PLAYER.SPAWN_X, y: PLAYER.SPAWN_Y, direction: 'down', inTriggerZone: false },
          isRunning: false,
          currentBuilding: null,
          isDay: true,
          season: 'spring',
          backpack: [],
          sportsPlayer: { x: 0, y: 0, direction: 'down' },
          saveOnQuit: true,
          stats: { ...defaultStats }
        };
        this._restore();
      } else {
        this.state = {
          player: { x: PLAYER.SPAWN_X, y: PLAYER.SPAWN_Y, direction: 'down', inTriggerZone: false },
          isRunning: false,
          currentBuilding: null,
          isDay: true,
          season: 'spring',
          backpack: [],
          sportsPlayer: { x: 0, y: 0, direction: 'down' },
          saveOnQuit: false,
          stats: { ...defaultStats }
        };
      }

      if (!this.state.stats.firstLaunchAt) {
        this.state.stats.firstLaunchAt = Date.now();
        this._save();
      }

      // 尝试从云端拉取存档（仅当云开发已初始化，失败不影响本地）
      if (cloudSync.available() && saveOnQuit) {
        cloudSync.loadFromCloud().then((cloudState) => {
          try {
            if (cloudState) {
              const cloudBadges = (cloudState.backpack || []).length;
              const localBadges = (this.state.backpack || []).length;
              if (cloudBadges >= localBadges) {
                if (cloudState.player) this.state.player = { ...this.state.player, ...cloudState.player };
                if (typeof cloudState.isDay === 'boolean') this.state.isDay = cloudState.isDay;
                if (['spring', 'summer', 'autumn', 'winter'].includes(cloudState.season)) this.state.season = cloudState.season;
                if (Array.isArray(cloudState.backpack)) this.state.backpack = cloudState.backpack;
                if (cloudState.sportsPlayer) this.state.sportsPlayer = { ...this.state.sportsPlayer, ...cloudState.sportsPlayer };
                this.notify();
              }
            }
          } catch (e) {
            console.warn('[GameStore] cloud merge failed:', e && e.message);
          }
        });
      }
    } catch (e) {
      // 最后的防线：构造函数任何异常都不会让小程序挂掉
      console.error('[GameStore] constructor failed, using minimal state:', e && e.message);
      const { PLAYER } = gameConfig;
      this.listeners = [];
      this.state = {
        player: { x: PLAYER.SPAWN_X, y: PLAYER.SPAWN_Y, direction: 'down', inTriggerZone: false },
        isRunning: false,
        currentBuilding: null,
        isDay: true,
        season: 'spring',
        backpack: [],
        sportsPlayer: { x: 0, y: 0, direction: 'down' },
        saveOnQuit: true,
        stats: { totalSteps: 0, buildingsVisited: 0, badgesCollected: 0, firstLaunchAt: Date.now() }
      };
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
    this._save();
  }

  _save() {
    // 无痕模式下不保存数据
    if (!this.state.saveOnQuit) {
      return;
    }
    // 每次保存前同步：建筑数 = 徽章数 = 背包长度
    this.state.stats.buildingsVisited = this.state.backpack.length;
    this.state.stats.badgesCollected = this.state.backpack.length;
    try {
      wx.setStorageSync('game_state', JSON.stringify({
        player: this.state.player,
        isDay: this.state.isDay,
        season: this.state.season,
        backpack: this.state.backpack,
        sportsPlayer: this.state.sportsPlayer,
        saveOnQuit: this.state.saveOnQuit,
        stats: this.state.stats
      }));
    } catch (e) {
      logger.warn('gameStore', '_save failed', e && e.message);
    }

    // 同步到云端（异步、防抖，失败不影响本地）
    if (cloudSync.available()) {
      cloudSync.syncToCloud({
        player: this.state.player,
        isDay: this.state.isDay,
        season: this.state.season,
        backpack: this.state.backpack,
        sportsPlayer: this.state.sportsPlayer,
        saveOnQuit: this.state.saveOnQuit,
        stats: this.state.stats
      });
    }
  }

  _restore() {
    try {
      const raw = wx.getStorageSync('game_state');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.player) this.state.player = { ...this.state.player, ...d.player };
      if (typeof d.isDay === 'boolean') this.state.isDay = d.isDay;
      if (['spring', 'summer', 'autumn', 'winter'].includes(d.season)) this.state.season = d.season;
      if (Array.isArray(d.backpack)) this.state.backpack = d.backpack;
      if (d.sportsPlayer) this.state.sportsPlayer = { ...this.state.sportsPlayer, ...d.sportsPlayer };
      if (typeof d.saveOnQuit === 'boolean') this.state.saveOnQuit = d.saveOnQuit;
      // 兼容老存档：如果老存档没有 stats，保持默认值
      if (d.stats) this.state.stats = { ...this.state.stats, ...d.stats };
      // 统一修正：建筑数、徽章数 = 背包长度
      this.state.stats.buildingsVisited = this.state.backpack.length;
      this.state.stats.badgesCollected = this.state.backpack.length;
    } catch (e) {
      // 读取失败时不报错，直接使用默认状态
      console.warn('[GameStore] _restore failed, using defaults:', e && e.message);
    }
  }

  // 手动触发云端同步（供设置页面"同步到云端"按钮使用
  forceSyncToCloud() {
    if (!cloudSync.available()) {
      wx.showToast({ title: '云开发未启用', icon: 'none' });
      return Promise.resolve(false);
    }
    // 同步前统一修正
    this.state.stats.buildingsVisited = this.state.backpack.length;
    this.state.stats.badgesCollected = this.state.backpack.length;
    wx.showLoading({ title: '同步中...' });
    return cloudSync
      .forceSync({
        player: this.state.player,
        isDay: this.state.isDay,
        season: this.state.season,
        backpack: this.state.backpack,
        sportsPlayer: this.state.sportsPlayer,
        saveOnQuit: this.state.saveOnQuit,
        stats: this.state.stats
      })
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '已同步', icon: 'success' });
        logger.info('gameStore', 'forceSyncToCloud done');
        return true;
      })
      .catch((err) => {
        wx.hideLoading();
        wx.showToast({ title: '同步失败', icon: 'none' });
        logger.error('gameStore', 'forceSyncToCloud failed', err && err.message);
        return false;
      });
  }

  setSaveOnQuit(value) {
    // 当切换到"不保存进度"（新建游戏）时，重置总步数
    if (value === false) {
      this.state.stats.totalSteps = 0;
    }
    this.setState({ saveOnQuit: value });
  }

  updatePlayerPos(x, y) {
    this.state.stats.totalSteps = (this.state.stats.totalSteps || 0) + 1;
    this.setState({ player: { ...this.state.player, x, y } });
  }

  updatePlayerDirection(direction) {
    this.setState({ player: { ...this.state.player, direction } });
  }

  setInTriggerZone(inTriggerZone) {
    this.setState({ player: { ...this.state.player, inTriggerZone } });
  }

  setCurrentBuilding(building) {
    // 建筑数 = 徽章数（背包长度），两者始终保持一致
    this.state.stats.buildingsVisited = this.state.backpack.length;
    this.state.stats.badgesCollected = this.state.backpack.length;
    this.setState({ currentBuilding: building });
  }

  clearCurrentBuilding() {
    this.setState({ currentBuilding: null });
  }

  startGame() {
    this.setState({ isRunning: true });
  }

  // 重置为全新游戏状态（新建游戏时调用）
  resetGame() {
    const { PLAYER } = gameConfig;
    this.setState({
      player: {
        x: PLAYER.SPAWN_X,
        y: PLAYER.SPAWN_Y,
        direction: 'down',
        inTriggerZone: false
      },
      isRunning: false,
      currentBuilding: null,
      isDay: true,
      season: 'spring',
      backpack: [],
      sportsPlayer: { x: 0, y: 0, direction: 'down' },
      stats: {
        totalSteps: 0,
        buildingsVisited: 0,
        badgesCollected: 0,
        firstLaunchAt: Date.now()
      }
    });
  }

  stopGame() {
    this.setState({ isRunning: false });
  }

  setIsDay(isDay) {
    this.setState({ isDay });
  }

  // 设置季节
  setSeason(season) {
    this.setState({ season });
  }

  // 更新运动场玩家位置
  updateSportsPlayer(x, y, direction) {
    this.setState({ sportsPlayer: { x, y, direction } });
  }

  addToBackpack(item) {
    // 检查是否已存在相同物品
    const existingItem = this.state.backpack.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.count = (existingItem.count || 1) + 1;
    } else {
      this.state.backpack.push({ ...item, count: 1 });
      // 新徽章：徽章数+1
      this.state.stats.badgesCollected = this.state.backpack.length;
      logger.info('gameStore', 'new badge collected', { id: item.id });
    }
    this.notify();
  }

  // 从背包移除物品
  removeFromBackpack(itemId) {
    const index = this.state.backpack.findIndex(i => i.id === itemId);
    if (index !== -1) {
      this.state.backpack.splice(index, 1);
      this.notify();
    }
  }

  // 获取背包
  getBackpack() {
    return [...this.state.backpack];
  }

  // 检查是否已获得徽章
  hasBadge(badgeId) {
    return this.state.backpack.some(item => item.id === badgeId);
  }
}

module.exports = new GameStore();