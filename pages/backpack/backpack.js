const gameStore = require('../../store/gameStore.js');

Page({
  data: {
    items: [],
    selectedItem: null
  },

  onLoad() {
    // 初始化背包物品
    this.initItems();
  },

  initItems() {
    // 模拟背包物品数据
    const items = [
      { id: 1, name: '钥匙', color: '#f4a261', count: 3, description: '可以打开某些门', canUse: true },
      { id: 2, name: '药水', color: '#e91e63', count: 2, description: '恢复生命值', canUse: true },
      { id: 3, name: '金币', color: '#ffeb3b', count: 50, description: '闪闪发光的金币', canUse: false },
      { id: 4, name: '地图', color: '#2196f3', count: 1, description: '显示区域地图', canUse: true },
      null, // 空槽位
      null, // 空槽位
      { id: 5, name: '食物', color: '#4caf50', count: 5, description: '恢复体力', canUse: true },
      null, // 空槽位
      null, // 空槽位
      { id: 6, name: '宝石', color: '#9c27b0', count: 2, description: '珍贵的宝石', canUse: false },
      null, // 空槽位
      null, // 空槽位
      null, // 空槽位
      null, // 空槽位
      null, // 空槽位
      null // 空槽位
    ];
    this.setData({ items });
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

    // 如果数量为0，设为空
    const newItems = items.map(i => i && i.count <= 0 ? null : i);
    
    this.setData({ 
      items: newItems,
      selectedItem: newItems.find(i => i && i.id === item.id) || null
    });
  },

  dropItem() {
    if (!this.data.selectedItem) return;
    
    const item = this.data.selectedItem;
    wx.showModal({
      title: '确认丢弃',
      content: `确定要丢弃${item.name}吗？`,
      success: (res) => {
        if (res.confirm) {
          const items = this.data.items.map(i => i && i.id === item.id ? null : i);
          this.setData({ 
            items,
            selectedItem: null
          });
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