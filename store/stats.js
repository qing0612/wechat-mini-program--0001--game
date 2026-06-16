// store/stats.js
// 玩家统计模块：累计步数、已访问建筑数、徽章数、首次启动时间等
//
// 设计：
//   - 与 gameStore 解耦：仅暴露增量 / 查询 API
//   - 每次 incrementXxx 不做持久化；由 gameStore.notify() 统一写入
//   - buildingsVisited / badgesCollected 与 backpack.count 保持一致
//     （因为"访问一个建筑 = 获得一枚徽章"，简化统计口径）

class Stats {
  constructor() {
    this._state = {
      totalSteps: 0,
      buildingsVisited: 0,
      badgesCollected: 0,
      firstLaunchAt: null
    };
  }

  load(raw) {
    if (!raw) return;
    this._state.totalSteps = typeof raw.totalSteps === 'number' ? raw.totalSteps : 0;
    this._state.buildingsVisited = typeof raw.buildingsVisited === 'number' ? raw.buildingsVisited : 0;
    this._state.badgesCollected = typeof raw.badgesCollected === 'number' ? raw.badgesCollected : 0;
    this._state.firstLaunchAt = raw.firstLaunchAt || Date.now();
  }

  snapshot() {
    return { ...this._state };
  }

  // 每次玩家位置被更新时调用，代表"一步"
  stepOnce() {
    this._state.totalSteps = (this._state.totalSteps || 0) + 1;
  }

  reset() {
    this._state = {
      totalSteps: 0,
      buildingsVisited: 0,
      badgesCollected: 0,
      firstLaunchAt: Date.now()
    };
  }

  syncFromBackpack(backpackCount) {
    this._state.buildingsVisited = backpackCount;
    this._state.badgesCollected = backpackCount;
  }

  get totalSteps() { return this._state.totalSteps || 0; }
  get buildingsVisited() { return this._state.buildingsVisited || 0; }
  get badgesCollected() { return this._state.badgesCollected || 0; }
  get firstLaunchAt() { return this._state.firstLaunchAt; }
}

module.exports = Stats;