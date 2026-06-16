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
    this.intervalMs = options.intervalMs || 50;

    this._timer = null;
    this._isMapLoaded = false;
    this._onComplete = null;
  }

  setMapLoaded(loaded = true) {
    this._isMapLoaded = loaded;
  }

  start(onComplete) {
    this.stop();
    this._onComplete = onComplete || null;
    this._timer = setInterval(() => this._tick(), this.intervalMs);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _tick() {
    let current = this.page.data.loadProgress || 0;
    let next = current;

    if (current < 30) {
      next = current + 2;
      if (next >= 30) this.page.setData({ loadStageText: this.stageText1 });
    } else if (current < 70) {
      next = current + 1.5;
      if (next >= 50) this.page.setData({ loadStageText: this.stageText2 });
      if (this._isMapLoaded && next > 70) next = 70;
    } else if (current < 100 && this._isMapLoaded) {
      next = current + 3;
      if (next >= 85) this.page.setData({ loadStageText: this.stageText3 });
    } else if (current < 100 && !this._isMapLoaded && current < 90) {
      next = current + 0.5;
    }

    if (next >= 100) {
      next = 100;
      this.stop();
      setTimeout(() => {
        this.page.setData({ loadVisible: false });
        if (this._onComplete) this._onComplete();
      }, 300);
    }

    if (next !== current) {
      this.page.setData({ loadProgress: Math.round(next) });
    }
  }

  destroy() {
    this.stop();
    this._onComplete = null;
  }
}

module.exports = ProgressLoader;