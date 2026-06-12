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
    // 下拉选择器状态
    showSeasonSelector: false,
    // 成就统计
    buildingsVisited: 0,
    badgesCollected: 0,
    totalSteps: 0
  },

  onLoad() {
    audioManager.init();
    const state = gameStore.getState();
    const season = state.season || 'spring';
    const seasonIndex = ['spring', 'summer', 'autumn', 'winter'].indexOf(season);
    this.setData({
      startMusicEnabled: audioManager.getMute('start'),
      mapMusicEnabled: audioManager.getMute('map'),
      volume: audioManager.volume * 100,
      isDay: state.isDay,
      season: season,
      seasonIndex: seasonIndex,
      buildingsVisited: (state.stats && state.stats.buildingsVisited) || (state.visitedBuildingIds ? state.visitedBuildingIds.length : 0),
      badgesCollected: (state.stats && state.stats.badgesCollected) || (state.backpack ? state.backpack.length : 0),
      totalSteps: (state.stats && state.stats.totalSteps) || 0
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

  // 切换季节选择器显示/隐藏
  toggleSeasonSelector() {
    this.setData({ 
      showSeasonSelector: !this.data.showSeasonSelector 
    });
  },

  // 设置季节
  setSeason(e) {
    const season = e.currentTarget.dataset.season;
    const seasonValues = ['spring', 'summer', 'autumn', 'winter'];
    const seasonIndex = seasonValues.indexOf(season);
    
    this.setData({ 
      season: season,
      seasonIndex: seasonIndex,
      showSeasonSelector: false
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
  },

  // 打开隐私政策：优先跳转到小程序内置隐私政策页面
  // 同时提供调起微信"用户隐私保护指引"协议页的能力（需在开发者后台配置）
  openPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy?tab=privacy',
      fail: () => {
        // 兜底：调起微信官方隐私协议页
        if (wx.openPrivacyContract) {
          wx.openPrivacyContract({
            fail: () => {
              wx.showToast({ title: '暂未配置隐私协议', icon: 'none' });
            }
          });
        } else {
          wx.showToast({ title: '微信版本不支持', icon: 'none' });
        }
      }
    });
  },

  // 打开用户协议：跳转到内置隐私政策页面的"用户协议"标签
  openTerms() {
    wx.navigateTo({
      url: '/pages/privacy/privacy?tab=terms'
    });
  },

  // 手动同步进度到云端
  syncToCloud() {
    gameStore.forceSyncToCloud();
  }
});