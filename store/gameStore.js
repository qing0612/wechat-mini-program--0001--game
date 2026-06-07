// c:\Users\yibohe\Desktop\小程序-代码\store\gameStore.js
const gameConfig = require('../config/gameConfig.js');

class GameStore {
  constructor() {
    const { PLAYER } = gameConfig;
    this.state = {
      player: {
        x: PLAYER.SPAWN_X,
        y: PLAYER.SPAWN_Y,
        direction: 'down',
        inTriggerZone: false
      },
      isRunning: false,
      currentBuilding: null,
      isDay: true, // 白天/晚上状态，默认白天
      backpack: []
    };
    this.listeners = [];
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

  resetPlayer() {
    this.setState({ player: { x: 0, y: 0, direction: 'down' } });
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