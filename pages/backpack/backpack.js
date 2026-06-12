const gameStore = require('../../store/gameStore.js');

Page({
  data: {
    items: [],
    selectedItem: null,
    imgErrors: {}
  },

  onLoad() {
    this.loadBackpack();
  },

  onShow() {
    this.loadBackpack();
  },

  // 加载背包数据
  loadBackpack() {
    const backpack = gameStore.getBackpack();
    // 填充到16个槽位
    const items = [...backpack];
    while (items.length < 16) {
      items.push(null);
    }
    this.setData({ items, imgErrors: {} });
  },

  // 物品图片加载失败处理
  onItemImgError(e) {
    const itemIndex = e.currentTarget.dataset.itemIndex;
    const item = this.data.items[itemIndex];
    if (!item) return;
    const imgErrors = { ...this.data.imgErrors };
    imgErrors[item.id] = true;
    this.setData({ imgErrors });
  },

  selectItem(e) {
    const itemId = e.currentTarget.dataset.itemId;
    if (!itemId) {
      this.setData({ selectedItem: null });
      return;
    }
    const item = this.data.items.find(i => i && i.id === itemId);
    this.setData({ selectedItem: item });
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

    // 更新物品数量
    const items = this.data.items.map(i => {
      if (i && i.id === item.id) {
        return { ...i, count: i.count - 1 };
      }
      return i;
    });

    // 如果数量为0，设为空并从 gameStore 移除
    const newItems = items.map(i => {
      if (i && i.count <= 0) {
        gameStore.removeFromBackpack(i.id);
        return null;
      }
      return i;
    });
    
    this.setData({ 
      items: newItems,
      selectedItem: newItems.find(i => i && i.id === item.id) || null
    });
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
          // 从 gameStore 移除
          gameStore.removeFromBackpack(item.id);
          // 更新本地显示
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

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/map/map' });
      }
    });
  }
});