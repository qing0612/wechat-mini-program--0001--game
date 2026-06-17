// 背包/徽章模块（HTML版·模块化）
// 设计：封装徽章/物品增删查，不直接读写存储，由 persistence 负责持久化
(function() {
  function Backpack(items) {
    this._items = Array.isArray(items) ? items.slice() : [];
  }

  Backpack.prototype.add = function(item) {
    if (!item || !item.id) return { isNew: false };
    if (this.has(item.id)) return { isNew: false };
    this._items.push({
      id: item.id,
      name: item.name,
      image: item.image,
      description: item.description,
      count: 1
    });
    return { isNew: true };
  };

  Backpack.prototype.remove = function(id) {
    this._items = this._items.filter(function(it) { return it.id !== id; });
  };

  Backpack.prototype.has = function(id) {
    for (var i = 0; i < this._items.length; i++) {
      if (this._items[i].id === id) return true;
    }
    return false;
  };

  Backpack.prototype.count = function() {
    return this._items.length;
  };

  Backpack.prototype.snapshot = function() {
    return this._items.slice();
  };

  Backpack.prototype.load = function(items) {
    this._items = Array.isArray(items) ? items.slice() : [];
  };

  Backpack.prototype.reset = function() {
    this._items = [];
  };

  window.Backpack = Backpack;
})();