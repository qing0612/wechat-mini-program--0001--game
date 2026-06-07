// c:\Users\yibohe\Desktop\小程序-代码\store\gameStore.js
class GameStore {
  constructor() {
    this.state = {
      player: {
        x: 0,
        y: 0,
        direction: 'down'
      },
      isRunning: false,
      currentBuilding: null
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

  resetPlayer() {
    this.setState({ player: { x: 0, y: 0, direction: 'down' } });
  }
}

module.exports = new GameStore();