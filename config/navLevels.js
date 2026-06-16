// config/navLevels.js
// 页面层级配置：数字小的页面 → 数字大的页面 = 前进（带过渡）
//
// 层级说明：
//   0 = 入口页（start）
//   1 = 主场景（map 校园地图）
//   2 = 子场景（building 建筑详情 / sports 运动场）
//
// 规则：
//   低层级 → 高层级：显示像素进度条过渡 + navigateTo
//   高层级 → 低层级：直接 navigateBack（无过渡）

const PAGE_LEVELS = {
  start: 0,
  map: 1,
  sports: 2,
  building: 2,
  settings: 1,
  backpack: 1,
  privacy: 1
};

const PAGE_TITLES = {
  start: '河北师范大学',
  map: '像素校园',
  sports: '运动场',
  building: '建筑详情',
  settings: '设置',
  backpack: '背包',
  privacy: '用户协议'
};

function getLevel(pageName) {
  return typeof PAGE_LEVELS[pageName] === 'number' ? PAGE_LEVELS[pageName] : -1;
}

function getTitle(pageName) {
  return PAGE_TITLES[pageName] || '加载中';
}

module.exports = {
  PAGE_LEVELS,
  PAGE_TITLES,
  getLevel,
  getTitle,
  LEVEL_START: 0,
  LEVEL_MAP: 1,
  LEVEL_SUB: 2
};