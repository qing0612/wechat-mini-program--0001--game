const buildingService = require('../../services/buildingService.js');
const gameStore = require('../../store/gameStore.js');
const { NavController } = require('../../controllers/index.js');

Page({
  data: {
    building: { name: '', nameEn: '', interiorImage: '', historyText: '', badge: null },
    imgError: false,
    badgeImgError: false,
    badgeEarned: false,
    showBadgePopup: false,
    loadVisible: true,
    // NavController：预留字段
    navVisible: false,
    navProgress: 0,
    navTitle: ''
  },

  onLoad(options) {
    // NavController：当前页面为 building，层级 2
    this.nav = new NavController(this, 'building');

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

  onShow() {
    // 高→低：立即隐藏所有遮罩
    if (this.nav) this.nav.hideOverlay();
    this.setData({ loadVisible: false });
  },

  onUnload() {
    if (this.nav) this.nav.destroy();
  },

  onBack() {
    this.nav.back({ fallbackUrl: '/pages/map/map' });
  },

  onImgTap() {
    this.nav.back({ fallbackUrl: '/pages/map/map' });
  },

  closeBadgePopup() {
    this.setData({ showBadgePopup: false });
  }
});