const gameStore = require('../../store/gameStore.js');
const { NavController } = require('../../controllers/index.js');

Page({
  data: {
    items: [],
    selectedItem: null,
    imgErrors: {},
    // NavController：预留字段
    navVisible: false,
    navProgress: 0,
    navTitle: ''
  },

  onLoad() {
    // NavController：当前页面为 backpack，层级 1（与 map 同级）
    this.nav = new NavController(this, 'backpack');
    this.loadBackpack();
  },

  onShow() {
    if (this.nav) this.nav.hideOverlay();
    this.loadBackpack();
  },

  onUnload() {
    if (this.nav) this.nav.destroy();
  },

  // 加载背包数据
  loadBackpack() {
    const backpack = gameStore.getBackpack();
    const items = [];
    for (let i = 0; i < 16; i++) {
      const item = backpack[i] || null;
      items.push({
        _key: 'slot_' + i,
        item: item
      });
    }
    this.setData({ items, imgErrors: {} });
  },

  // 物品图片加载失败处理
  onItemImgError(e) {
    const itemIndex = e.currentTarget.dataset.itemIndex;
    const slot = this.data.items[itemIndex];
    if (!slot || !slot.item) return;
    const imgErrors = { ...this.data.imgErrors };
    imgErrors[slot.item.id] = true;
    this.setData({ imgErrors });
  },

  selectItem(e) {
    const itemId = e.currentTarget.dataset.itemId;
    if (!itemId) {
      this.setData({ selectedItem: null });
      return;
    }
    const slot = this.data.items.find(s => s.item && s.item.id === itemId);
    this.setData({ selectedItem: slot ? slot.item : null });
  },

  useItem() {
    if (!this.data.selectedItem) return;
    
    const item = this.data.selectedItem;
    
    // 徽章不能被使用
    if (item.id && item.id.startsWith('badge_')) {
      wx.showToast({
        title: '徽章不能使用',
        icon: 'none'
      });
      return;
    }
    
    wx.showToast({
      title: `使用了${item.name}`,
      icon: 'success'
    });

    // 通过 gameStore 减少数量（自动持久化）
    const result = gameStore.decrementFromBackpack(item.id);
    const stillHas = result && !result.removed;
    
    // 重新从 gameStore 加载背包数据
    this.loadBackpack();
    
    // 如果物品还在（仍有剩余数量），保持选中
    if (stillHas) {
      const slot = this.data.items.find(s => s.item && s.item.id === item.id);
      this.setData({ selectedItem: slot ? slot.item : null });
    } else {
      this.setData({ selectedItem: null });
    }
  },

  dropItem() {
    if (!this.data.selectedItem) return;
    
    const item = this.data.selectedItem;
    
    // 徽章不能被丢弃
    if (item.id && item.id.startsWith('badge_')) {
      wx.showToast({
        title: '徽章不能丢弃',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认丢弃',
      content: `确定要丢弃${item.name}吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从 gameStore 移除（自动持久化）
          gameStore.removeFromBackpack(item.id);
          // 重新加载显示
          this.loadBackpack();
          this.setData({ selectedItem: null });
          wx.showToast({
            title: '已丢弃',
            icon: 'none'
          });
        }
      }
    });
  },

  // 返回上一页：backpack(1) → map(1)，同级，直接返回
  goBack() {
    this.nav.back({ fallbackUrl: '/pages/map/map' });
  }
});