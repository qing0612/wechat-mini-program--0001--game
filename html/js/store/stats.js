// 统计模块（HTML版·模块化）
// 设计：封装步数/建筑/徽章统计，提供只读 getter
(function() {
  function Stats(initial) {
    initial = initial || {};
    this.totalSteps = initial.totalSteps || 0;
    this.buildingsVisited = initial.buildingsVisited || 0;
    this.badgesCollected = initial.badgesCollected || 0;
    this.firstLaunchAt = initial.firstLaunchAt || Date.now();
  }

  Stats.prototype.stepOnce = function() {
    this.totalSteps = (this.totalSteps || 0) + 1;
  };

  Stats.prototype.syncFromBackpack = function(backpackCount) {
    var n = Number(backpackCount) || 0;
    this.buildingsVisited = n;
    this.badgesCollected = n;
  };

  Stats.prototype.reset = function() {
    this.totalSteps = 0;
    this.buildingsVisited = 0;
    this.badgesCollected = 0;
    this.firstLaunchAt = Date.now();
  };

  Stats.prototype.snapshot = function() {
    return {
      totalSteps: this.totalSteps,
      buildingsVisited: this.buildingsVisited,
      badgesCollected: this.badgesCollected,
      firstLaunchAt: this.firstLaunchAt
    };
  };

  window.Stats = Stats;
})();