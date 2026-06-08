// c:\Users\yibohe\Desktop\小程序-代码\store\gameStore.js
const gameConfig = require('../config/gameConfig.js');

class GameStore {
  constructor() {
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
    } catch (e) {}
    
    if (saveOnQuit) {
      // 正常模式：初始化默认状态后恢复数据
      this.state = {
        player: {
          x: PLAYER.SPAWN_X,
          y: PLAYER.SPAWN_Y,
          direction: 'down',
          inTriggerZone: false
        },
        isRunning: false,
        currentBuilding: null,
        isDay: true,
        season: 'spring', // 季节设置：spring, summer, autumn, winter
        backpack: [],
        sportsPlayer: { x: 0, y: 0, direction: 'down' },
        saveOnQuit: true
      };
      this._restore();
    } else {
      // 无痕模式：直接使用默认状态，不读取历史数据
      this.state = {
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
        saveOnQuit: false
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
    try {
      wx.setStorageSync('game_state', JSON.stringify({
        player: this.state.player,
        isDay: this.state.isDay,
        season: this.state.season,
        backpack: this.state.backpack,
        sportsPlayer: this.state.sportsPlayer,
        saveOnQuit: this.state.saveOnQuit
      }));
    } catch (e) {}
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
    } catch (e) {}
  }

  setSaveOnQuit(value) {
    this.setState({ saveOnQuit: value });
  }

  updatePlayerPos(x, y) {
    this.setState({ player: { ...this.state.player, x, y } });
  }

  updatePlayerDirection(direction) {
    this.setState({ player: { ...this.state.player, direction } });
  }

  setInTriggerZone(inTriggerZone) {
    this.setState({ player: { ...this.state.player, inTriggerZone } });
  }

  setCurrentBuilding(building) {
    this.setState({ currentBuilding: building });
  }

  clearCurrentBuilding() {
    this.setState({ currentBuilding: null });
  }

  startGame() {
    this.setState({ isRunning: true });
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