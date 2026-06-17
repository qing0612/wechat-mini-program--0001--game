// 数据层·统一入口（HTML版·模块化）
// 设计：暴露 window.DATA 命名空间，合并建筑数据与历史文案
(function() {
  window.DATA = {
    BUILDINGS: window.BUILDINGS,
    BUILDING_HISTORY: window.BUILDING_HISTORY
  };
})();