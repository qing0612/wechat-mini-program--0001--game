// store/index.js
// 状态层统一入口：页面只 require 这一个文件即可拿到所有状态模块
//
// 用法：
//   const { gameStore, backpack } = require('../../store/index.js');
//   const state = gameStore.getState();
//
// 模块说明：
//   gameStore   - 总入口（协调 player / backpack / stats / 持久化）
//   Backpack    - 背包类（按需 new 一个独立实例）
//   Stats       - 统计类（按需 new 一个独立实例）
//   Persistence - 持久化类（底层依赖可替换）

const gameStore = require('./gameStore.js');
const Backpack = require('./backpack.js');
const Stats = require('./stats.js');
const Persistence = require('./persistence.js');

module.exports = {
  gameStore,
  Backpack,
  Stats,
  Persistence
};