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
      isDay: true // 白天/晚上状态，默认白天
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
}

module.exports = new GameStore();