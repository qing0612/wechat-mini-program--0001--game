// pages/start/start.js
// 开始页面：新游戏 / 继续上一次的入口
//
// 模块化写法：统一从目录 index.js 引入，避免大量零散 require

const { gameStore } = require('../../store/index.js');
const { audioManager } = require('../../utils/index.js');

Page({
  data: {
    imgLoaded: false,
    imgError: false,
    entering: false,
    enterProgress: 0
  },

  onLoad() {
    audioManager.init();
  },

  onShow() {
    audioManager.playWithMuteCheck('start');
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
    this.setData({ entering: true, enterProgress: 0 });
    let p = 0;
    const timer = setInterval(() => {
      p += 2;
      if (p >= 100) {
        p = 100;
        this.setData({ enterProgress: 100 });
        clearInterval(timer);
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/map/map',
            fail: () => wx.redirectTo({ url: '/pages/map/map' })
          });
        }, 300);
      } else {
        this.setData({ enterProgress: p });
      }
    }, 60);
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