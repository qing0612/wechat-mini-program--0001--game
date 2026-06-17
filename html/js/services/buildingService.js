// 建筑服务（HTML版·模块化）
// 设计：建筑查询 + 触发检测，不持有状态，每次接收坐标返回结果
(function() {
  function BuildingService() {
    this._buildings = window.BUILDINGS || [];
  }

  BuildingService.prototype.getAll = function() {
    return this._buildings;
  };

  BuildingService.prototype.getById = function(id) {
    return this._buildings.find(function(b) { return b.id === id; });
  };

  // AABB 检测某坐标是否在建筑触发区
  BuildingService.prototype.checkTrigger = function(x, y) {
    var list = this._buildings;
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var tz = b.triggerZone;
      if (!tz) continue;
      if (x >= tz.x && x <= tz.x + tz.w && y >= tz.y && y <= tz.y + tz.h) {
        return b;
      }
    }
    return null;
  };

  window.BuildingService = BuildingService;
  // 提供一个单例便于直接调用（兼容旧代码中的 window.BuildingService.checkTrigger）
  window.buildingService = new BuildingService();
})();