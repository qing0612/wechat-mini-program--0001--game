const audioManager = require('../../utils/audioManager.js');
const gameStore = require('../../store/gameStore.js');

Page({
  data: {
    // 音效开关状态
    startMusicEnabled: true,
    mapMusicEnabled: true,
    // 音量值 (0-1)
    volume: 1,
    // 日夜状态
    isDay: true
  },

  onLoad() {
    // 初始化音频管理器
    audioManager.init();
    // 从音频管理器获取当前静音设置和音量（转换为0-100范围）
    const state = gameStore.getState();
    this.setData({
      startMusicEnabled: audioManager.getMute('start'),
      mapMusicEnabled: audioManager.getMute('map'),
      volume: audioManager.volume * 100,
      isDay: state.isDay
    });
  },

  // 切换开始页面音乐开关
  toggleStartMusic(e) {
    const enabled = e.detail.value;
    this.setData({ startMusicEnabled: enabled });
    audioManager.setMute('start', enabled);
  },

  // 切换地图页面音乐开关
  toggleMapMusic(e) {
    const enabled = e.detail.value;
    this.setData({ mapMusicEnabled: enabled });
    audioManager.setMute('map', enabled);
  },

  // 音量变化处理
  onVolumeChange(e) {
    // slider 返回 0-100，保存到 data 中
    const sliderValue = e.detail.value;
    this.setData({ volume: sliderValue });
    // 转换为 0-1 范围后设置给音频管理器
    audioManager.setVolume(sliderValue / 100);
  },

  // 日夜切换
  toggleDayNight(e) {
    const isDay = e.detail.value;
    this.setData({ isDay });
    gameStore.setIsDay(isDay);
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/start/start' });
      }
    });
  }
});