// 页面层级配置（HTML版·与原小程序 navLevels.js 对齐）
//
// 层级说明：
//   0 = 入口页（start）
//   1 = 主场景（map 校园地图 / settings / backpack）
//   2 = 子场景（building 建筑详情 / sports 运动场）
//
// 规则：
//   低层级 → 高层级：显示像素进度条过渡 + 切换页面
//   高层级 → 低层级 / 同级：直接切换，无过渡

(function() {
  var PAGE_LEVELS = {
    start: 0,
    map: 1,
    sports: 2,
    building: 2,
    settings: 1,
    backpack: 1
  };

  var PAGE_TITLES = {
    start: '河北师范大学',
    map: '像素校园',
    sports: '进入运动场',
    building: '进入建筑',
    settings: '加载设置',
    backpack: '打开背包'
  };

  function getLevel(pageName) {
    return typeof PAGE_LEVELS[pageName] === 'number' ? PAGE_LEVELS[pageName] : -1;
  }

  function getTitle(pageName) {
    return PAGE_TITLES[pageName] || '加载中';
  }

  // 暴露给全局（供 app.js 读取）
  window.NAV_LEVELS = PAGE_LEVELS;
  window.NAV_TITLES = PAGE_TITLES;
  window.getNavLevel = getLevel;
  window.getNavTitle = getTitle;

  // 合并到 CONFIG 保持风格一致
  if (!window.CONFIG) window.CONFIG = {};
  window.CONFIG.NAV = {
    LEVELS: PAGE_LEVELS,
    TITLES: PAGE_TITLES,
    getLevel: getLevel,
    getTitle: getTitle,
    LEVEL_START: 0,
    LEVEL_MAP: 1,
    LEVEL_SUB: 2
  };
})();