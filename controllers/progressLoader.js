// controllers/progressLoader.js
// 加载进度条：按阶段推进百分比到 100%
//
// 设计：
//   - 阶段1 (0-30%): 快速推进，显示 "初始化画布..."
//   - 阶段2 (30-70%): 中速推进，显示自定义文案（如"加载地图资源..."）
//   - 阶段3 (70-100%): 依赖 isMapLoaded 标志，一旦加载完成则快速到100%
//   - isMapLoaded 由外部（页面）通过 setMapLoaded() 设置

class ProgressLoader {
  constructor(page, options = {}) {
    this.page = page;
    this.stageText1 = options.stageText1 || '初始化画布...';
    this.stageText2 = options.stageText2 || '加载地图资源...';
    this.stageText3 = options.stageText3 || '准备就绪...';
    this.intervalMs = options.intervalMs || 120;
    this.completeDelayMs = options.completeDelayMs || 1500;

    this._timer = null;
    this._isMapLoaded = false;
    this._onComplete = null;
    this._progress = 0;       // 内部维护进度，不依赖 setData 异步
    this._stage = 0;           // 当前阶段（0=初始, 1=阶段1文案, 2=阶段2文案, 3=阶段3文案）
  }

  setMapLoaded(loaded = true) {
    this._isMapLoaded = loaded;
  }

  start(onComplete) {
    this.stop();
    this._onComplete = onComplete || null;
    this._progress = 0;
    this._stage = 0;
    this._timer = setInterval(() => this._tick(), this.intervalMs);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _tick() {
    let current = this._progress;
    let next = current;

    if (current < 30) {
      // 0-30%：轻柔推进，让用户看到"初始化画布..."
      next = current + 1;
      if (next >= 30 && this._stage < 1) {
        this._stage = 1;
        this.page.setData({ loadStageText: this.stageText1 });
      }
    } else if (current < 70) {
      // 30-70%：中速推进，展示"加载地图资源..."
      next = current + 0.8;
      if (next >= 50 && this._stage < 2) {
        this._stage = 2;
        this.page.setData({ loadStageText: this.stageText2 });
      }
      if (this._isMapLoaded && next > 70) next = 70;
    } else if (current < 100 && this._isMapLoaded) {
      // 70-100%（已加载完成）：匀速推进到 100%
      next = current + 1.5;
      if (next >= 85 && this._stage < 3) {
        this._stage = 3;
        this.page.setData({ loadStageText: this.stageText3 });
      }
    } else if (current < 100 && !this._isMapLoaded && current < 90) {
      // 70-90%（尚未加载完成）：缓慢增长，等待资源就绪
      next = current + 0.3;
    }

    if (next >= 100) {
      next = 100;
      this.stop();
      setTimeout(() => {
        this.page.setData({ loadVisible: false });
        if (this._onComplete) this._onComplete();
      }, this.completeDelayMs);
    }

    if (Math.round(next) !== Math.round(current)) {
      this._progress = next;
      this.page.setData({ loadProgress: Math.round(next) });
    } else {
      this._progress = next;
    }
  }

  destroy() {
    this.stop();
    this._onComplete = null;
  }
}

module.exports = ProgressLoader;