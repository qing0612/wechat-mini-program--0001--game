// controllers/weatherManager.js
// 天气效果管理：根据季节切换 "雨 / 雪 / 无"，负责启动/停止 WeatherEffect 实例
//
// 使用：
//   const wm = new WeatherManager({ canvas: this.canvas, width: w, height: h });
//   wm.setSeason('summer');  // 下雨
//   wm.render();             // 每帧调用

class WeatherManager {
  constructor(options = {}) {
    this._canvas = null;
    this._weatherEffect = null;
    this._type = 'none';
    this._inited = false;

    if (options.canvas) {
      this.attachCanvas(options.canvas, options.width, options.height);
    }
  }

  attachCanvas(canvas, width, height) {
    if (!canvas) return;
    this._canvas = canvas;
    // 延迟加载 weatherEffect（避免 require 时 wx 不可用导致的问题）
    const WeatherEffect = require('../utils/weatherEffect.js');
    this._weatherEffect = new WeatherEffect(canvas);
    if (width && height) {
      this._weatherEffect.init(width, height);
      this._inited = true;
    }
  }

  init(width, height) {
    if (this._weatherEffect) {
      this._weatherEffect.init(width, height);
      this._inited = true;
    }
  }

  setSeason(season) {
    if (!this._weatherEffect) return;
    const type = season === 'summer' ? 'rain' : season === 'winter' ? 'snow' : 'none';
    this._setType(type);
  }

  setDayNight(isDay) {
    // 目前天气与日夜独立，预留扩展点
    this._dayMode = !!isDay;
  }

  _setType(type) {
    if (this._type === type) return;
    this._weatherEffect.setType(type);
    if (type !== 'none' && !this._weatherEffect.running) {
      this._weatherEffect.start();
    } else if (type === 'none' && this._weatherEffect.running) {
      this._weatherEffect.stop();
    }
    this._type = type;
  }

  tick() {
    if (!this._weatherEffect || this._type === 'none') return;
    this._weatherEffect.update();
    this._weatherEffect.render();
  }

  stop() {
    if (this._weatherEffect && this._weatherEffect.running) {
      this._weatherEffect.stop();
    }
    this._type = 'none';
  }

  destroy() {
    this.stop();
    this._weatherEffect = null;
    this._canvas = null;
  }

  getType() {
    return this._type;
  }
}

module.exports = WeatherManager;