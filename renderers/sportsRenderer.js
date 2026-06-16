// renderers/sportsRenderer.js
// 运动场地图渲染：背景图 / 网格占位
// 设计：与 campusRenderer 保持一致的 API，便于 controller 替换

function renderSports(ctx, options) {
  const { cam, mapImg, mapLoaded, dpr, viewW, viewH } = options;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(0, 0, viewW, viewH);

  if (mapLoaded && mapImg) {
    ctx.drawImage(mapImg, cam.x, cam.y, viewW, viewH, 0, 0, viewW, viewH);
  } else {
    _drawGridPlaceholder(ctx, cam, viewW, viewH);
  }
  ctx.restore();
}

function _drawGridPlaceholder(ctx, cam, viewW, viewH) {
  ctx.strokeStyle = '#1e1e2a';
  ctx.lineWidth = 1;
  const step = 80;
  for (let x = -(cam.x % step); x < viewW; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewH);
    ctx.stroke();
  }
  for (let y = -(cam.y % step); y < viewH; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewW, y);
    ctx.stroke();
  }
}

module.exports = { renderSports };