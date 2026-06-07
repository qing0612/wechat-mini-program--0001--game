const gameStore = require('../../store/gameStore.js');
const audioManager = require('../../utils/audioManager.js');

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
    
    wx.navigateTo({
      url: '/pages/map/map',
      fail: () => {
        wx.redirectTo({ url: '/pages/map/map' });
      }
    });
  },

});