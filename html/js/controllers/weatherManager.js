// 天气管理器（HTML版·模块化）
// 设计：根据日夜/季节切换效果，暴露 update/render 接口供主循环调用
(function() {
  function WeatherManager(options) {
    options = options || {};
    this.weatherEffect = options.weatherEffect || new window.WeatherEffect();
    this.season = 'spring';
    this.isDay = true;
    this.dpr = 1;
    this._cachedType = 'none';
  }

  WeatherManager.prototype.setSeason = function(season) {
    this.season = season;
    // 实际触发天气效果切换（不依赖 _cachedType 与 update 的对比）
    var newType = this._resolveType();
    if (newType !== this._cachedType) {
      this._cachedType = newType;
      this.weatherEffect.setType(newType);
    }
  };

  WeatherManager.prototype.setIsDay = function(isDay) {
    this.isDay = !!isDay;
  };

  WeatherManager.prototype.init = function(w, h, dpr) {
    this.dpr = dpr || 1;
    this.weatherEffect.init(w, h);
  };

  WeatherManager.prototype._resolveType = function() {
    if (this.season === 'summer') return 'rain';
    if (this.season === 'winter') return 'snow';
    return 'none';
  };

  WeatherManager.prototype.update = function(dtSec) {
    var type = this._resolveType();
    if (type !== this._cachedType) {
      this._cachedType = type;
      this.weatherEffect.setType(type);
    }
    this.weatherEffect.update(dtSec);
  };

  WeatherManager.prototype.render = function(ctx) {
    // 用 dpr 缩放，让 CSS 像素的粒子坐标映射到设备像素画布
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    this.weatherEffect.render(ctx);
    ctx.restore();
  };

  window.WeatherManager = WeatherManager;
})();