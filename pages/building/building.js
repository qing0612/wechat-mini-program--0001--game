const buildingService = require('../../services/buildingService.js');
const gameStore = require('../../store/gameStore.js');

Page({
  data: {
    building: { name: '', nameEn: '', interiorImage: '', historyText: '', badge: null },
    imgError: false,
    badgeImgError: false,
    badgeEarned: false,
    showBadgePopup: false
  },

  onLoad(options) {
    const id = options.id || 'library';
    const building = buildingService.getBuildingById(id) || buildingService.getAllBuildings()[0];
    this.setData({ building, imgError: false });

    // 检查是否已获得该徽章
    if (building.badge && !gameStore.hasBadge(building.badge.id)) {
      // 获得徽章
      gameStore.addToBackpack(building.badge);
      this.setData({ badgeEarned: true, showBadgePopup: true });
    }
  },

  onImgError() {
    this.setData({ imgError: true });
  },

  onBadgeImgError() {
    this.setData({ badgeImgError: true });
  },

  onBack() {
    wx.navigateBack();
  },

  onImgTap() {
    wx.navigateBack();
  },

  closeBadgePopup() {
    this.setData({ showBadgePopup: false });
  }
});