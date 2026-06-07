// c:\Users\yibohe\Desktop\小程序-代码\pages\building\building.js
const buildingService = require('../../services/buildingService.js');

Page({
  data: {
    building: { name: '', nameEn: '', interiorImage: '', historyText: '' },
    imgError: false
  },

  onLoad(options) {
    const id = options.id || 'library';
    const building = buildingService.getBuildingById(id) || buildingService.getAllBuildings()[0];
    this.setData({ building, imgError: false });
  },

  onImgError() {
    this.setData({ imgError: true });
  },

  onBack() {
    wx.navigateBack();
  },

  onImgTap() {
    wx.navigateBack();
  }
});