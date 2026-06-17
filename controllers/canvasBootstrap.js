// controllers/canvasBootstrap.js
// Canvas 初始化：createSelectorQuery 查询、重试机制、DPR 缩放、窗口 resize 防抖
//
// 设计：
//   - 不感知具体页面内容，只负责 Canvas 生命周期管理
//   - 通过回调暴露 canvas/ctx/viewW/viewH，让调用方决定下一步做什么
//   - 统一处理横屏检查 (cssW < cssH 视为"尚未完成布局")

class CanvasBootstrap {
  constructor(page, options = {}) {
    this.page = page;
    this.canvasId = options.canvasId || '#gameCanvas';
    this.maxRetries = options.maxRetries || 50;
    this.retryDelay = options.retryDelay || 200;
    this.onReady = options.onReady || (() => {});
    this.onResize = options.onResize || null;
    this.initialJoystickRadius = options.initialJoystickRadius || 45;

    this.canvas = null;
    this.ctx = null;
    this.viewW = 0;
    this.viewH = 0;
    this.dpr = 2;
    this.sysInfo = null;
    this._resizeTimer = null;
    this._resizeHandler = null;
    this._ready = false;
  }

  init() {
    this._queryCanvas(0);
  }

  _queryCanvas(retry) {
    const query = this.page.createSelectorQuery();
    query.select(this.canvasId).fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        if (retry < this.maxRetries) {
          setTimeout(() => this._queryCanvas(retry + 1), this.retryDelay);
        } else {
          console.warn('[CanvasBootstrap] 初始化失败，已达最大重试次数');
          wx.showToast({ title: '画布加载失败', icon: 'none' });
        }
        return;
      }

      const cssW = res[0].width;
      const cssH = res[0].height;

      // 仅在尺寸为 0 时重试（布局尚未完成）
      if (cssW === 0 || cssH === 0) {
        if (retry < this.maxRetries) {
          setTimeout(() => this._queryCanvas(retry + 1), this.retryDelay);
          return;
        }
      }

      const canvas = res[0].node;
      const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : { pixelRatio: 2 };
      this.dpr = sysInfo.pixelRatio || 2;
      canvas.width = cssW * this.dpr;
      canvas.height = cssH * this.dpr;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.sysInfo = sysInfo;
      this.viewW = cssW;
      this.viewH = cssH;
      this._ready = true;

      // 自适应摇杆半径
      const jRadius = Math.min(cssH * 0.15, 50);
      this.page.setData({ joystickBaseR: Math.round(jRadius) });

      this.onReady({
        canvas: this.canvas,
        ctx: this.ctx,
        viewW: this.viewW,
        viewH: this.viewH,
        dpr: this.dpr,
        sysInfo: this.sysInfo,
        joystickRadius: jRadius
      });
    });
  }

  bindResize() {
    if (this._resizeHandler) return;
    this._resizeHandler = () => this._handleResize();
    wx.onWindowResize(this._resizeHandler);
  }

  _handleResize() {
    if (!this.canvas) return;
    if (this._resizeTimer) clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      const query = this.page.createSelectorQuery();
      query.select(this.canvasId).fields({ node: true, size: true }).exec((r) => {
        if (!r || !r[0]) return;
        const cssW = r[0].width;
        const cssH = r[0].height;
        if (cssW <= 0 || cssH <= 0) return;
        if (Math.abs(cssW - this.viewW) < 1 && Math.abs(cssH - this.viewH) < 1) return;

        this.canvas.width = cssW * this.dpr;
        this.canvas.height = cssH * this.dpr;
        this.viewW = cssW;
        this.viewH = cssH;

        const jRadius = Math.min(cssH * 0.15, 50);
        this.page.setData({ joystickBaseR: Math.round(jRadius) });

        if (this.onResize) {
          this.onResize({ viewW: cssW, viewH: cssH, joystickRadius: jRadius });
        }
      });
    }, 100);
  }

  destroy() {
    if (this._resizeTimer) {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = null;
    }
    if (this._resizeHandler) {
      wx.offWindowResize(this._resizeHandler);
      this._resizeHandler = null;
    }
  }

  isReady() {
    return this._ready;
  }
}

module.exports = CanvasBootstrap;