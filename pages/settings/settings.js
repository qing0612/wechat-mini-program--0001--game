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
    isDay: true,
    // 季节设置
    season: 'spring',
    seasonValues: ['spring', 'summer', 'autumn', 'winter'],
    seasonLabels: ['春季', '夏季', '秋季', '冬季'],
    seasonIndex: 0,
    // 弹窗状态
    showSeasonModal: false
  },

  onLoad() {
    // 初始化音频管理器
    audioManager.init();
    // 从音频管理器获取当前静音设置和音量（转换为0-100范围）
    const state = gameStore.getState();
    const season = state.season || 'spring';
    const seasonIndex = ['spring', 'summer', 'autumn', 'winter'].indexOf(season);
    this.setData({
      startMusicEnabled: audioManager.getMute('start'),
      mapMusicEnabled: audioManager.getMute('map'),
      volume: audioManager.volume * 100,
      isDay: state.isDay,
      season: season,
      seasonIndex: seasonIndex
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

  // 显示季节选择弹窗
  showSeasonPicker() {
    this.setData({ showSeasonModal: true });
  },

  // 隐藏季节选择弹窗
  hideSeasonPicker() {
    this.setData({ showSeasonModal: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 选择季节
  selectSeason(e) {
    const season = e.currentTarget.dataset.season;
    const seasonValues = ['spring', 'summer', 'autumn', 'winter'];
    const seasonIndex = seasonValues.indexOf(season);
    
    this.setData({ 
      season: season,
      seasonIndex: seasonIndex,
      showSeasonModal: false
    });
    gameStore.setSeason(season);
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