// pages/start/start.js
// 开始页面（level 0）：新游戏 / 继续上一次的入口
//
// 设计：
//   使用 NavController 统一处理页面导航逻辑
//   - start(0) → map(1)：像素进度条过渡后 navigateTo

const { gameStore } = require('../../store/index.js');
const { audioManager } = require('../../utils/index.js');
const { NavController } = require('../../controllers/index.js');

Page({
  data: {
    imgLoaded: false,
    imgError: false,
    // NavController 使用的三个字段（低→高过渡使用）
    navVisible: false,
    navProgress: 0,
    navTitle: ''
  },

  onLoad(options) {
    audioManager.init();
    // 初始化导航控制器：当前页面为 start，层级 0
    this.nav = new NavController(this, 'start');

    // 从高层级页面跳转过来：无加载遮罩
    if (options && options.skipLoad === '1') {
      // start 页面没有加载遮罩，仅预留扩展
    }
  },

  onShow() {
    // 从 map 页面返回时，清除过渡遮罩
    if (this.nav) this.nav.hideOverlay();
    audioManager.playWithMuteCheck('start');
  },

  onUnload() {
    if (this.nav) this.nav.destroy();
  },

  onImgLoad() {
    this.setData({ imgLoaded: true });
  },

  onImgError() {
    this.setData({ imgError: true });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  onEnter() {
    audioManager.pause();
    this._checkGameDataAndShowModal();
  },

  // === 游戏启动逻辑 ===
  _checkGameDataAndShowModal() {
    if (gameStore.hasSavedGame()) {
      this._showContinueModal();
    } else {
      this._showNewGameModal();
    }
  },

  _showNewGameModal() {
    wx.showModal({
      title: '开始游戏',
      content: '准备开始新的冒险之旅吗？',
      confirmText: '新建游戏',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) this._startNewGame();
      }
    });
  },

  _showContinueModal() {
    wx.showActionSheet({
      itemList: ['继续上一次游戏', '新建游戏'],
      itemColor: '#f4a261',
      success: (res) => {
        if (res.tapIndex === 0) this._continueGame();
        else if (res.tapIndex === 1) this._startNewGame();
      }
    });
  },

  _startNewGame() {
    // gameStore.resetGame 内部会清本地存档，外部无需再手动 wx.removeStorageSync
    gameStore.resetGame();
    this._navigateToMap();
  },

  _continueGame() {
    this._navigateToMap();
  },

  _navigateToMap() {
    // 使用 NavController.forward 处理低→高过渡
    // 自动显示像素进度条，完成后 navigateTo map 页面
    this.nav.forward('/pages/map/map', { title: '正在进入校园' });
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