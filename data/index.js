// data/index.js
// 静态数据统一入口
//
// 用法：
//   const { BUILDINGS, HISTORY_TEXTS } = require('../../data/index.js');

const { BUILDINGS } = require('./buildings.js');
const HISTORY_TEXTS = require('./buildingHistory.js');

module.exports = {
  BUILDINGS,
  HISTORY_TEXTS
};