Page({
  data: {
    imgError: false
  },

  onLoad() {
    console.log('Sports page loaded');
  },

  onImgError() {
    console.error('图片加载失败');
    this.setData({ imgError: true });
  },

  goBack() {
    wx.navigateBack();
  }
});