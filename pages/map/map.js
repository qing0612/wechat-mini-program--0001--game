// pages/map/map.js - 校园地图页面（level 1）
//
// 页面层级：map(1)。导航规则：
//   map(1) → building/sports(2)：使用 NavController.forward 带像素过渡
//   map(1) → start(0)：直接退出（无过渡，返回上一层）
//
// 游戏运行逻辑（Canvas / 主循环 / 渲染 / 控制器）已抽离到 controllers/mapController.js
// 本文件只负责：
//   - 页面生命周期（onLoad/onReady/onShow/onHide/onUnload）
//   - WXML 数据绑定（通过 setData 更新 UI）
//   - 导航（进入建筑 / 返回首页）
//   - 分享

const { gameStore } = require('../../store/index.js');
const { audioManager } = require('../../utils/index.js');
const { NavController, MapController } = require('../../controllers/index.js');

Page({
  data: {
    stickX: 0,
    stickY: 0,
    joystickBaseR: 45,
    joystickBaseX: 0,
    joystickBaseY: 0,
    joystickVisible: false,
    minimapPlayerX: 50,
    minimapPlayerY: 50,
    coordX: 0,
    coordY: 0,
    gameTime: '00:00',
    loadProgress: 0,
    loadVisible: true,
    loadStageText: '资源加载中...',
    // NavController：进入建筑/运动场时的低→高过渡
    navVisible: false,
    navProgress: 0,
    navTitle: '',
    // 建筑进入浮动按钮（与 HTML 版一致）
    showEnterBuildingBtn: false,
    currentBuildingName: ''
  },

  // === 页面生命周期 ===

  onLoad() {
    const state = gameStore.getState();
    this._season = state.season || 'spring';
    this._isDay = state.isDay;
    // 导航控制器：当前页面为 map，层级 1
    this.nav = new NavController(this, 'map');
    this.unsubscribe = gameStore.subscribe((newState) => {
      this._season = newState.season || this._season;
      this._isDay = newState.isDay;
    });
  },

  onReady() {
    // 将所有游戏逻辑委托给 MapController
    this.mapCtrl = new MapController(this, {
      canvasId: '#gameCanvas',
      gameStore,
      // 建筑状态变化：更新浮动按钮
      onBuildingUpdate: (bld) => {
        if (bld) {
          this.setData({
            showEnterBuildingBtn: true,
            currentBuildingName: bld.name || ''
          });
        } else {
          this.setData({
            showEnterBuildingBtn: false,
            currentBuildingName: ''
          });
        }
      },
      // 每 N 帧的 UI 刷新（坐标、小地图位置等）
      onUiUpdate: (data) => {
        this.setData(data);
      }
    });
    this.mapCtrl.onLoad();
    this.mapCtrl.init();
  },

  onShow() {
    // 从 gameStore 刷新最新状态（用户可能在其他页面改了季节/日夜）
    const state = gameStore.getState();
    this._season = state.season || this._season;
    this._isDay = state.isDay;

    // 从 building/sports 页面返回：清除过渡遮罩（高→低，无过渡）
    if (this.nav) this.nav.hideOverlay();

    // 播放地图背景音乐
    audioManager.playWithMuteCheck('map');

    // 恢复游戏循环
    if (this.mapCtrl) this.mapCtrl.onShow();
  },

  onHide() {
    // 仅暂停游戏循环，不销毁资源（用户可能还会回来）
    if (this.mapCtrl) this.mapCtrl.onHide();
    // 停止地图音乐
    audioManager.stop();
  },

  onUnload() {
    if (this.mapCtrl) this.mapCtrl.destroy();
    if (this.nav) this.nav.destroy();
    if (this.unsubscribe) this.unsubscribe();
  },

  // === 触摸事件（转发给 MapController） ===

  onTouchStart(e) { if (this.mapCtrl) this.mapCtrl.onTouchStart(e); },
  onTouchMove(e) { if (this.mapCtrl) this.mapCtrl.onTouchMove(e); },
  onTouchEnd(e) { if (this.mapCtrl) this.mapCtrl.onTouchEnd(e); },

  // === 导航按钮 ===

  // map(1) → start(0) 是高→低，直接返回，无过渡
  onBack() {
    wx.showModal({
      title: '退出游戏',
      content: '你是否要退出游戏？',
      confirmText: '是',
      cancelText: '否',
      success: (res) => {
        if (res.confirm) {
          this.nav.back({ fallbackUrl: '/pages/start/start' });
        }
      }
    });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  goToBackpack() {
    wx.navigateTo({ url: '/pages/backpack/backpack' });
  },

  // === 建筑进入浮动按钮：点击后触发低→高导航（与 HTML 版一致） ===

  onEnterBuilding() {
    const bld = this.mapCtrl ? this.mapCtrl.getCurrentBuilding() : null;
    if (!bld) return;
    if (bld.isSportsField) {
      this.nav.forward('/pages/sports/sports', { title: '正在进入运动场' });
    } else {
      this.nav.forward('/pages/building/building?id=' + bld.id, { title: '正在进入建筑' });
    }
  },

  // === 分享 ===

  onShareAppMessage() {
    return {
      title: '河北师范大学像素校园',
      desc: '用像素风探索美丽校园！',
      path: '/pages/start/start',
      imageUrl: '/images/start-bg.png'
    };
  },

  onShareTimeline() {
    return {
      title: '河北师范大学像素校园 - 用像素风探索美丽校园！',
      imageUrl: '/images/start-bg.png'
    };
  }
});