Page({
  data: {
    // 当前显示的标签页：privacy / terms
    activeTab: 'privacy'
  },

  onLoad(options) {
    if (options && options.tab) {
      this.setData({ activeTab: options.tab });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/settings/settings' });
      }
    });
  }
});