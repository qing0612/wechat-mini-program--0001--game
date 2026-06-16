// store/backpack.js
// 背包模块：徽章与物品的增删查、本地存储同步、hasBadge 语义化检查
//
// 设计：
//   - 与 gameStore 解耦：只暴露清晰的 API，调用方从 gameStore 调用
//   - 每个物品：{ id, name, image, description, count }
//   - 物品持久化由 gameStore 负责（gameStore._save 时把 _items 写入 game_state）
//   - 背包也可独立使用：const backpack = require('./store/backpack.js');

class Backpack {
  constructor() {
    this._items = [];
  }

  load(items) {
    this._items = Array.isArray(items) ? items.filter(Boolean) : [];
  }

  snapshot() {
    return this._items.map((it) => ({ ...it }));
  }

  all() {
    return this.snapshot();
  }

  add(item) {
    if (!item || !item.id) return false;
    const existing = this._items.find((it) => it.id === item.id);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      return { item: { ...existing }, isNew: false };
    }
    const entry = { ...item, count: 1 };
    this._items.push(entry);
    return { item: entry, isNew: true };
  }

  remove(id) {
    const idx = this._items.findIndex((it) => it.id === id);
    if (idx === -1) return false;
    this._items.splice(idx, 1);
    return true;
  }

  decrement(id) {
    const it = this._items.find((x) => x.id === id);
    if (!it) return false;
    it.count = (it.count || 1) - 1;
    if (it.count <= 0) {
      this.remove(id);
      return { removed: true };
    }
    return { removed: false, remaining: it.count };
  }

  find(id) {
    const it = this._items.find((x) => x.id === id);
    return it ? { ...it } : null;
  }

  has(id) {
    return this._items.some((x) => x.id === id);
  }

  count() {
    return this._items.length;
  }

  totalItems() {
    return this._items.reduce((sum, it) => sum + (it.count || 1), 0);
  }
}

module.exports = Backpack;