const gameStore = require('../../store/gameStore.js');
const audioManager = require('../../utils/audioManager.js');
const gameConfig = require('../../config/gameConfig.js');

Page({
  data: { 
    imgLoaded: false, 
    imgError: false
  },

  onLoad() {
    // 初始化音频管理器
    audioManager.init();
  },

  onShow() {
    // 页面显示时根据静音设置播放开始页面音乐
    audioManager.playWithMuteCheck('start');
  },

  onImgLoad() {
    this.setData({ imgLoaded: true });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  onImgError() {
    this.setData({ imgError: true });
  },

  onEnter() {
    // 进入游戏时暂停背景音乐
    audioManager.pause();
    
    // 检查是否有历史游戏数据
    this._checkGameDataAndShowModal();
  },

  // 检查是否有历史游戏数据并显示相应弹窗
  _checkGameDataAndShowModal() {
    try {
      const raw = wx.getStorageSync('game_state');
      if (!raw) {
        // 没有历史数据，显示弹窗1：新建游戏
        this._showNewGameModal();
      } else {
        // 有历史数据，显示弹窗2：新建游戏或继续
        this._showContinueModal();
      }
    } catch (e) {
      // 读取失败，默认显示新建游戏弹窗
      this._showNewGameModal();
    }
  },

  // 弹窗1：新建游戏（无历史数据）
  _showNewGameModal() {
    wx.showModal({
      title: '开始游戏',
      content: '准备开始新的冒险之旅吗？',
      confirmText: '新建游戏',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this._startNewGame();
        }
      }
    });
  },

  // 弹窗2：新建游戏或继续上一次（有历史数据）
  _showContinueModal() {
    wx.showActionSheet({
      itemList: ['继续上一次游戏', '新建游戏'],
      itemColor: '#f4a261',
      success: (res) => {
        if (res.tapIndex === 0) {
          // 继续上一次游戏
          this._continueGame();
        } else if (res.tapIndex === 1) {
          // 新建游戏
          this._startNewGame();
        }
      },
      fail: () => {
        // 用户取消
      }
    });
  },

  // 开始新游戏
  _startNewGame() {
    // 清除历史数据
    try {
      wx.removeStorageSync('game_state');
    } catch (e) {}

    // 调用 gameStore 的 resetGame：一次性重置玩家位置、背包、步数、徽章等所有状态
    gameStore.resetGame();

    // 跳转到游戏地图
    wx.navigateTo({
      url: '/pages/map/map',
      fail: () => {
        wx.redirectTo({ url: '/pages/map/map' });
      }
    });
  },

  // 继续上一次游戏
  _continueGame() {
    // 使用 gameStore 中已恢复的历史数据，直接跳转
    wx.navigateTo({
      url: '/pages/map/map',
      fail: () => {
        wx.redirectTo({ url: '/pages/map/map' });
      }
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '河北师范大学像素校园',
      desc: '用像素风探索美丽校园！',
      path: '/pages/start/start',
      imageUrl: '/images/start-bg.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '河北师范大学像素校园 - 用像素风探索美丽校园！',
      imageUrl: '/images/start-bg.png'
    };
  }
});