App({
  globalData: {},
  onLaunch() {
    const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.globalData.windowWidth = sys.windowWidth;
    this.globalData.windowHeight = sys.windowHeight;
    this.globalData.pixelRatio = sys.pixelRatio || 2;
  }
});