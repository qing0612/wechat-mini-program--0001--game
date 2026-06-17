// pages/sports/sports.js - 运动场子地图页面（模块化组装版）
//
// 游戏运行逻辑（Canvas / 主循环 / 渲染 / 控制器）已抽离到 controllers/sportsController.js
// 本文件只负责：
//   - 页面生命周期
//   - WXML 数据绑定
//   - 导航（返回地图）

const { gameStore } = require('../../store/index.js');
const { audioManager } = require('../../utils/index.js');
const { NavController, SportsController } = require('../../controllers/index.js');

Page({
  data: {
    gameTime: '00:00',
    stickX: 0,
    stickY: 0,
    joystickBaseR: 45,
    joystickBaseX: 0,
    joystickBaseY: 0,
    joystickVisible: false,
    loadProgress: 0,
    loadVisible: true,
    loadStageText: '资源加载中...',
    // NavController：预留字段
    navVisible: false,
    navProgress: 0,
    navTitle: ''
  },

  onLoad() {
    // 导航控制器：当前页面为 sports，层级 2
    this.nav = new NavController(this, 'sports');

    this.sportsCtrl = new SportsController(this, {
      canvasId: '#playerCanvas',
      gameStore,
      onUiUpdate: (data) => {
        this.setData(data);
      }
    });
    this.sportsCtrl.onLoad();
  },

  onReady() {
    if (this.sportsCtrl) this.sportsCtrl.init();
  },

  onShow() {
    // 高→低返回准备：确保没有过渡遮罩残留
    if (this.nav) this.nav.hideOverlay();
    this.setData({ loadVisible: false });

    // 播放地图背景音乐（sports 是 map 的子场景，共用 map 音乐）
    audioManager.playWithMuteCheck('map');

    if (this.sportsCtrl) this.sportsCtrl.onShow();
  },

  onHide() {
    // 仅暂停游戏循环，不销毁资源（用户可能还会回来）
    if (this.sportsCtrl) this.sportsCtrl.onHide();
    // 停止音频
    audioManager.stop();
  },

  onUnload() {
    if (this.sportsCtrl) this.sportsCtrl.destroy();
    if (this.nav) this.nav.destroy();
  },

  // === 触摸事件（转发给 SportsController） ===
  onTouchStart(e) { if (this.sportsCtrl) this.sportsCtrl.onTouchStart(e); },
  onTouchMove(e) { if (this.sportsCtrl) this.sportsCtrl.onTouchMove(e); },
  onTouchEnd(e) { if (this.sportsCtrl) this.sportsCtrl.onTouchEnd(e); },

  // === 导航：高→低，直接返回，无过渡 ===
  goBack() {
    // 保存运动场玩家位置
    if (this.sportsCtrl && this.sportsCtrl.playerCtrl && gameStore) {
      const p = this.sportsCtrl.playerCtrl.getPlayerPos();
      const d = this.sportsCtrl.playerCtrl.getPlayerDir();
      if (p) gameStore.updateSportsPlayer(p.x, p.y, d);
    }
    // 使用 NavController.back：高→低直接 navigateBack，无过渡
    this.nav.back({ fallbackUrl: '/pages/map/map' });
  }
});