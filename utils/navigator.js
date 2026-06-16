// 页面导航工具：统一管理页面跳转、回退、防重复点击
//
// 设计原则：
//   - 所有"页面 → 页面"跳转统一经过这里，便于日志 / 埋点 / 未来路由守卫
//   - 对 navigateTo 失败给出合理兜底（如 navigateBack 或 redirectTo）
//   - _lastNavigateAt 时间戳防抖动（避免用户在触发动画前连点两次）
//
// 使用示例：
//   const navigator = require('../../utils/navigator.js');
//   navigator.goBuilding('library');
//   navigator.back();
//   navigator.redirectStart();

const ROUTES = {
  start: '/pages/start/start',
  map: '/pages/map/map',
  building: '/pages/building/building',
  sports: '/pages/sports/sports',
  backpack: '/pages/backpack/backpack',
  settings: '/pages/settings/settings',
  privacy: '/pages/privacy/privacy'
};

class Navigator {
  constructor() {
    this._lastNavigateAt = 0;
    this._debounceMs = 300;
  }

  _shouldDebounce() {
    const now = Date.now();
    if (now - this._lastNavigateAt < this._debounceMs) return true;
    this._lastNavigateAt = now;
    return false;
  }

  _navigateTo(url, opts = {}) {
    if (this._shouldDebounce()) return;
    wx.navigateTo({
      url,
      fail: (err) => {
        if (opts.redirectOnFail !== false) {
          wx.redirectTo({ url, fail: () => {} });
        } else if (typeof opts.onFail === 'function') {
          opts.onFail(err);
        }
      }
    });
  }

  _redirectTo(url) {
    if (this._shouldDebounce()) return;
    wx.redirectTo({ url, fail: () => {} });
  }

  goStart() { this._redirectTo(ROUTES.start); }

  goMap() { this._navigateTo(ROUTES.map); }

  goBuilding(id) {
    if (!id) return;
    this._navigateTo(ROUTES.building + '?id=' + id);
  }

  goSports() { this._navigateTo(ROUTES.sports); }

  goBackpack() { this._navigateTo(ROUTES.backpack); }

  goSettings() { this._navigateTo(ROUTES.settings); }

  goPrivacy(tab) {
    const url = tab ? ROUTES.privacy + '?tab=' + tab : ROUTES.privacy;
    this._navigateTo(url, { redirectOnFail: false });
  }

  back(opts = {}) {
    if (this._shouldDebounce()) return;
    wx.navigateBack({
      fail: () => {
        if (opts.fallbackRoute) {
          this._redirectTo(opts.fallbackRoute);
        }
      }
    });
  }
}

module.exports = new Navigator();
module.exports.ROUTES = ROUTES;