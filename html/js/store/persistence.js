// 持久化模块（HTML版·模块化）
// 设计：封装本地存储（localStorage），提供 save/load/clear 三个操作
(function() {
  var STORAGE_KEY = 'campus_game_state_v1';

  function Persistence() {
    this.enabled = true;
  }

  Persistence.prototype.save = function(snapshot) {
    if (!this.enabled) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('[persistence] save error:', e);
    }
  };

  Persistence.prototype.load = function() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[persistence] load error:', e);
      return null;
    }
  };

  Persistence.prototype.clear = function() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  Persistence.prototype.hasSaved = function() {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return false;
    }
  };

  window.Persistence = Persistence;
})();