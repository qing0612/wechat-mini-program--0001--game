// 配置层·统一入口（HTML版·模块化）
// 设计：暴露 window.CONFIG 命名空间，其他模块通过 window.CONFIG 引用
(function() {
  // 合并各细分配置为一个统一命名空间，既兼容旧版也支持新增
  window.CONFIG = {
    PLAYER: window.CFG_PLAYER,
    MAP: window.CFG_MAP,
    SPORTS_MAP: window.CFG_SPORTS_MAP,
    UI: window.CFG_UI,
    ANIMATION: window.CFG_ANIMATION
  };

  // 兼容旧版 window.GAME_CONFIG（以便无需改动的代码仍可运行）
  window.GAME_CONFIG = window.GAME_CONFIG || window.CONFIG;
})();