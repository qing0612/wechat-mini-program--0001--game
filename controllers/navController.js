// controllers/navController.js
// 页面层级导航控制器（智能方向判断）
//
// 设计目标：
//   1) 页面层级由 config/navLevels.js 集中配置（0=start, 1=map, 2=building/sports）
//   2) 在 forward() 内部先判断方向，再决定是否显示过渡：
//        - 低 → 高：显示像素风进度条过渡 → navigateTo
//        - 高 → 低 / 同级：直接 navigateTo，跳过过渡
//   3) back() 始终直接 navigateBack（零延迟）
//   4) 控制器不耦合具体页面；只操作 Page 实例的 setData + wx API
//
// 核心逻辑（forward 方法内部）：
//   if (destroyed) return;
//   解析目标页面名 → 获取目标层级;
//   if (目标层级 <= 当前层级) {
//     直接 wx.navigateTo();          // 高→低或同级，不显示过渡
//     return;
//   }
//   // 低→高：执行过渡动画
//   setData({ navVisible: true, navProgress: 0, navTitle: title });
//   setInterval(() => {
//     progress += step;
//     if (progress >= 100) { clearInterval; wx.navigateTo(); }
//   }, interval);
//
// 使用方法（在页面 JS 中）：
//   const { NavController } = require('../../controllers/index.js');
//   Page({
//     data: { navVisible: false, navProgress: 0, navTitle: '' },
//     onLoad() {
//       this.nav = new NavController(this, 'start'); // 当前页面名
//     },
//     goSomewhere() {
//       // 内部自动判断方向：低→高才显示过渡，高→低直接跳转
//       this.nav.forward('/pages/map/map', { title: '正在进入校园' });
//     },
//     goBack() {
//       this.nav.back({ fallbackUrl: '/pages/start/start' });
//     },
//     onShow() { if (this.nav) this.nav.hideOverlay(); },
//     onUnload() { if (this.nav) this.nav.destroy(); }
//   });
//
// 在页面 WXML 中（固定结构，可复用）：
//   <view class="nav-transition" wx:if="{{navVisible}}">
//     <view class="nav-title">{{navTitle}}</view>
//     <view class="nav-bar-outer"><view class="nav-bar-inner" style="width:{{navProgress}}%;"></view></view>
//     <view class="nav-percent">{{navProgress}}%</view>
//   </view>
//
// 在页面 WXSS 中（@import 一次，像素风样式）：
//   @import '../../styles/nav-transition.wxss';

const { PAGE_LEVELS, getLevel } = require('../config/navLevels.js');

class NavController {
  constructor(page, pageName, options = {}) {
    this.page = page;                    // Page 实例（用于 setData）
    this.pageName = pageName;            // 例如 'start' / 'map' / 'building'
    // 当前层级：优先使用显式 level，其次从配置表解析，默认为 1
    this.level = options.level != null
      ? options.level
      : (getLevel(pageName) !== -1 ? getLevel(pageName) : 1);
    this._timer = null;
    // 默认动画参数：step=10, interval=20ms → 10 帧 × 20ms = 0.2 秒快速过渡
    // 总耗时 ≈ 0.2s(动画) + 0.1s(hold) + 页面加载 ≈ 0.3-0.5 秒，几乎无等待感
    this._animStep = options.animStep || 10;
    this._animInterval = options.animInterval || 20;
    this._holdMs = options.holdMs || 100;
    this._destroyed = false;
  }

  // === 统一入口：智能方向判断 ===
  // forward 内部会先判断目标层级：
  //   高 → 低 / 同级：直接跳转（break 跳过过渡）
  //   低 → 高：执行像素过渡动画
  forward(targetUrl, options = {}) {
    if (this._destroyed) return;

    // ---------- 第 1 步：解析目标层级 ----------
    const targetName = this._extractPageName(targetUrl);
    const targetLevel = getLevel(targetName); // -1 表示未在配置中
    const title = options.title || this._defaultTitle(targetName);

    // ---------- 第 2 步：方向判断（核心逻辑） ----------
    // 高→低 或 同级：break 跳过过渡，直接跳转
    if (targetLevel !== -1 && targetLevel <= this.level) {
      this._doNavigate(targetUrl);
      return; // 等价于 break：直接结束函数，不执行过渡动画代码
    }

    // ---------- 第 3 步：低→高：执行像素过渡动画 ----------
    const step = options.step || this._animStep;
    const interval = options.interval || this._animInterval;

    this.page.setData({
      navVisible: true,
      navProgress: 0,
      navTitle: title
    });

    let p = 0;
    this._timer = setInterval(() => {
      p += step;
      if (p >= 100) {
        p = 100;
        this.page.setData({ navProgress: 100 });
        clearInterval(this._timer);
        this._timer = null;
        // 关键修复：先清理遮罩，再 navigateTo
        // （navigateTo 会把当前页面压入后台，若先跳转后再 setData，后台页面的 setData 可能不生效
        // 导致 navigateBack 返回时，页面的 navVisible 可能还是 true，造成"高→低也有过渡"的bug
        setTimeout(() => {
          this.page.setData({ navVisible: false, navProgress: 0 });
          // 清理完成后再跳转，确保页面在进入后台前是干净的
          setTimeout(() => {
            this._doNavigate(targetUrl);
          }, 30);
        }, this._holdMs);
      } else {
        this.page.setData({ navProgress: p });
      }
    }, interval);
  }

  // === 返回导航（高 → 低：直接 navigateBack，无过渡） ===
  // 注意：back() 不依赖 _destroyed 检查——因为调用 back() 后页面会卸载，
  // 不应该因为 nav 实例被提前销毁而导致导航失败（修复"从 map 无法跳转到 start"的 bug）
  back(options = {}) {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    wx.navigateBack({
      fail: () => {
        if (options.fallbackUrl) {
          // fallbackUrl 使用 redirectTo 作为兜底（关闭当前页，跳转到目标页）
          wx.redirectTo({ url: options.fallbackUrl });
        }
      }
    });
  }

  // === 直接关闭遮罩（从下一级页面返回时调用） ===
  hideOverlay() {
    if (this._destroyed) return;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this.page.setData({ navVisible: false, navProgress: 0 });
  }

  destroy() {
    this._destroyed = true;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this.page = null;
  }

  // ---------- 内部辅助 ----------

  _extractPageName(url) {
    // 从 '/pages/map/map' 中解析出 'map'
    const match = url && url.match(/pages\/([^/]+)\//);
    return match ? match[1] : '';
  }

  _doNavigate(targetUrl) {
    wx.navigateTo({
      url: targetUrl,
      fail: () => {
        wx.redirectTo({
          url: targetUrl,
          fail: () => {
            try { wx.reLaunch({ url: targetUrl }); } catch (e) {}
          }
        });
      }
    });
  }

  _defaultTitle(pageName) {
    if (pageName === 'map') return '正在进入校园';
    if (pageName === 'building') return '正在进入建筑';
    if (pageName === 'sports') return '正在进入运动场';
    if (pageName === 'settings') return '正在加载设置';
    if (pageName === 'backpack') return '正在打开背包';
    return '加载中...';
  }
}

module.exports = NavController;