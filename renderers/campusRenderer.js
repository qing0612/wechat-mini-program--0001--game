// renderers/campusRenderer.js
// 校园地图渲染：背景图 / 占位网格 / 建筑触发区 / 日夜遮罩
// 设计：不持有状态，每次 render 接收 ctx + cam + options
const { worldToScreen } = require('../utils/camera.js');

const TRIGGER_COLORS = ['#FF6B35', '#4ECDC4', '#FFE66D', '#A8D8EA'];

function renderCampus(ctx, options) {
  const { cam, mapImg, mapLoaded, isDay, viewW, viewH, dpr } = options;

  // 背景清屏（根据日夜模式选择底色）
  ctx.fillStyle = isDay ? '#ffffff' : '#000000';
  ctx.fillRect(0, 0, viewW * dpr, viewH * dpr);

  ctx.save();
  ctx.scale(dpr, dpr);

  if (mapLoaded && mapImg) {
    ctx.drawImage(mapImg, cam.x, cam.y, viewW, viewH, 0, 0, viewW, viewH);
    if (!isDay) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, viewW, viewH);
    }
  } else {
    _drawPlaceholder(ctx, cam, viewW, viewH, options.mapW, options.mapH);
  }
  ctx.restore();
}

function renderBuildingZones(ctx, options) {
  const { cam, buildings, dpr, viewW, viewH } = options;
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.globalAlpha = 0;
  buildings.forEach((b, i) => {
    const zone = b.triggerZone;
    if (!zone) return;
    const sp = worldToScreen(zone.x, zone.y, cam);
    const color = TRIGGER_COLORS[i % TRIGGER_COLORS.length];
    ctx.fillStyle = color;
    ctx.fillRect(sp.x, sp.y, zone.w, zone.h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(sp.x, sp.y, zone.w, zone.h);
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(b.name, sp.x + zone.w / 2, sp.y + zone.h / 2 + 5);
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

function _drawPlaceholder(ctx, cam, viewW, viewH, mapW, mapH) {
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(0, 0, viewW, viewH);

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

  // 地图边界
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 4;
  ctx.strokeRect(-cam.x, -cam.y, mapW, mapH);

  // 交叉道路
  ctx.strokeStyle = '#A0A070';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(1000 - cam.x, 0);
  ctx.lineTo(1000 - cam.x, mapH - cam.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 600 - cam.y);
  ctx.lineTo(mapW - cam.x, 600 - cam.y);
  ctx.stroke();

  // 建筑占位
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(200 - cam.x, 200 - cam.y, 300, 200);
  ctx.fillRect(1400 - cam.x, 300 - cam.y, 250, 180);
  ctx.fillRect(300 - cam.x, 700 - cam.y, 200, 150);

  ctx.fillStyle = '#5a5a6e';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('地图加载中...', viewW / 2, viewH / 2);
}

module.exports = { renderCampus, renderBuildingZones };