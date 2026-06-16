// config/index.js
// 配置统一入口：页面统一 require 本文件，避免多处散落 require 单文件
//
// 设计：
//   - 每个分类仍在独立文件中维护（单一职责）
//   - index.js 只做命名空间聚合，不改动配置值
//   - gameConfig.js 保留以兼容遗留代码（旧写法仍可用）
//
// 推荐用法：
//   const { PLAYER, MAP, UI, ANIMATION } = require('../../config/index.js');

const PLAYER = require('./player.js');
const MAP = require('./map.js');
const SPORTS_MAP = require('./sportsMap.js');
const UI = require('./ui.js');
const ANIMATION = require('./animation.js');
const navLevels = require('./navLevels.js');
const legacy = require('./gameConfig.js');

module.exports = {
  PLAYER,
  MAP,
  SPORTS_MAP,
  UI,
  ANIMATION,
  // 页面层级配置（0=start, 1=map, 2=building/sports）
  PAGE_LEVELS: navLevels.PAGE_LEVELS,
  LEVEL_START: navLevels.LEVEL_START,
  LEVEL_MAP: navLevels.LEVEL_MAP,
  LEVEL_SUB: navLevels.LEVEL_SUB,
  // 与 gameConfig.js 结构对齐，便于搜索 "BUILDINGS" 关键词的代码继续工作
  BUILDINGS: (legacy && legacy.BUILDINGS) || { COLLISION_ENABLED: false },
  UPDATE_INTERVAL: (legacy && legacy.UI && legacy.UI.UPDATE_INTERVAL) || 3
};