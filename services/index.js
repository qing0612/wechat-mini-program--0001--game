// services/index.js
// 业务服务统一入口：任何页面只 require 这一个文件即可拿到所有业务服务
//
// 用法：
//   const { buildingService } = require('../../services/index.js');
//   const building = buildingService.getById('library');

const buildingService = require('./buildingService.js');

module.exports = {
  buildingService
};