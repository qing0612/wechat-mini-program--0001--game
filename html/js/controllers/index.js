// 控制器层·统一入口（HTML版·模块化）
// 设计：暴露 window.CONTROLLERS 命名空间，页面层从这里组装控制器
(function() {
  window.CONTROLLERS = {
    MapController: window.MapController,
    PlayerController: window.PlayerController,
    BuildingController: window.BuildingController,
    BackpackController: window.BackpackController,
    SettingsController: window.SettingsController,
    TouchDispatcher: window.TouchDispatcher,
    WeatherManager: window.WeatherManager,
    CanvasBootstrap: window.CanvasBootstrap
  };
})();