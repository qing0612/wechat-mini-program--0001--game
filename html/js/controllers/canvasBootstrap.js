// Canvas 初始化引导（HTML版·模块化）
// 设计：封装 canvas 元素的创建/缩放/DPR 处理，暴露统一的 resize 接口
(function() {
  function CanvasBootstrap(options) {
    options = options || {};
    this.canvas = options.canvas || null;
    this.ctx = null;
    this.viewW = 0;
    this.viewH = 0;
    this.dpr = 1;
  }

  CanvasBootstrap.prototype.init = function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    return this.ctx;
  };

  CanvasBootstrap.prototype.resize = function() {
    if (!this.canvas) return;
    var rect = this.canvas.getBoundingClientRect();
    this.viewW = rect.width;
    this.viewH = rect.height;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.viewW * this.dpr);
    this.canvas.height = Math.floor(this.viewH * this.dpr);
  };

  CanvasBootstrap.prototype.needsResize = function() {
    if (!this.canvas) return false;
    var rect = this.canvas.getBoundingClientRect();
    return Math.abs(rect.width - this.viewW) > 1 || Math.abs(rect.height - this.viewH) > 1;
  };

  window.CanvasBootstrap = CanvasBootstrap;
})();