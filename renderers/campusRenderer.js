// renderers/campusRenderer.js
// 校园地图渲染：背景图 / 占位网格 / 建筑触发区 / 日夜遮罩
// 设计：不持有状态，每次 render 接收 ctx + cam + options
const { worldToScreen } = require('../utils/camera.js');

const TRIGGER_COLORS = ['#FF6B35', '#4ECDC4', '#FFE66D', '#A8D8EA'];

function _seasonTint(season, isDay) {
  // 每个季节的底色 + 覆盖遮罩颜色
  const tints = {
    spring: { bg: '#f5faf0', overlay: 'rgba(144, 238, 144, 0.12)' },
    summer: { bg: '#e8f4fc', overlay: 'rgba(135, 206, 235, 0.15)' },
    autumn: { bg: '#fdf5e6', overlay: 'rgba(222, 184, 135, 0.18)' },
    winter: { bg: '#f0f4f8', overlay: 'rgba(200, 220, 240, 0.20)' }
  };
  const base = tints[season] || tints.spring;
  if (!isDay) {
    return { bg: '#000000', overlay: 'rgba(0, 0, 0, 0.6)' };
  }
  return base;
}

function renderCampus(ctx, options) {
  const { cam, mapImg, mapLoaded, isDay, viewW, viewH, dpr, season } = options;
  const tint = _seasonTint(season || 'spring', isDay);

  ctx.fillStyle = tint.bg;
  ctx.fillRect(0, 0, viewW * dpr, viewH * dpr);

  ctx.save();
  ctx.scale(dpr, dpr);

  if (mapLoaded && mapImg) {
    ctx.drawImage(mapImg, cam.x, cam.y, viewW, viewH, 0, 0, viewW, viewH);
    if (tint.overlay) {
      ctx.fillStyle = tint.overlay;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  } else {
    _drawPlaceholder(ctx, cam, viewW, viewH, options.mapW, options.mapH, season || 'spring');
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

function _drawPlaceholder(ctx, cam, viewW, viewH, mapW, mapH, season) {
  const seasonColors = {
    spring: { grid: '#2d3a2a', border: '#8B4513', road: '#c8b896', building: '#3d4a35' },
    summer: { grid: '#1e3a4a', border: '#4682B4', road: '#9db8d0', building: '#2d4a5a' },
    autumn: { grid: '#3a2e1a', border: '#8B4513', road: '#d4b896', building: '#4a3a2a' },
    winter: { grid: '#2a3040', border: '#708090', road: '#e8e8f0', building: '#3a4050' }
  };
  const c = seasonColors[season] || seasonColors.spring;

  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.strokeStyle = c.grid;
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

  ctx.strokeStyle = c.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(-cam.x, -cam.y, mapW, mapH);

  ctx.strokeStyle = c.road;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(1000 - cam.x, 0);
  ctx.lineTo(1000 - cam.x, mapH - cam.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 600 - cam.y);
  ctx.lineTo(mapW - cam.x, 600 - cam.y);
  ctx.stroke();

  ctx.fillStyle = c.building;
  ctx.fillRect(200 - cam.x, 200 - cam.y, 300, 200);
  ctx.fillRect(1400 - cam.x, 300 - cam.y, 250, 180);
  ctx.fillRect(300 - cam.x, 700 - cam.y, 200, 150);

  ctx.fillStyle = '#888';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('地图加载中...', viewW / 2, viewH / 2);
}

module.exports = { renderCampus, renderBuildingZones };