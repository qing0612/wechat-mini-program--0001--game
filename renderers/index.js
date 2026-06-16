// renderers/index.js
// 渲染层统一入口：页面只需要 require 本文件即可拿到所需的渲染器

const campusRenderer = require('./campusRenderer.js');
const sportsRenderer = require('./sportsRenderer.js');

module.exports = {
  campusRenderer,
  sportsRenderer
};