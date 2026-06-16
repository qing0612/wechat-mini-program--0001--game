// utils/index.js
// 工具层统一入口：页面只 require 本文件即可拿到常用工具
//
// 推荐用法：
//   const { logger, audioManager, joystick } = require('../../utils/index.js');
//
// 注意：camera / sprite / joystick 这些纯函数/类直接挂在命名空间下，
//       与原先的 require 行为一致，方便逐步迁移。

const logger = require('./logger.js');
const audioManager = require('./audioManager.js');
const cloudSync = require('./cloudSync.js');
const joystick = require('./joystick.js');
const { computeCamera, worldToScreen } = require('./camera.js');
const sprite = require('./sprite.js');
const weatherEffect = require('./weatherEffect.js');

module.exports = {
  logger,
  audioManager,
  cloudSync,
  Joystick: joystick,
  joystick,
  camera: { computeCamera, worldToScreen },
  computeCamera,
  worldToScreen,
  sprite,
  weatherEffect
};