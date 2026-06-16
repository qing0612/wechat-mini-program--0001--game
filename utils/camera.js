// utils/camera.js
// 相机工具函数：
//   - computeCamera:  根据玩家坐标 + 视口尺寸 + 地图尺寸 → 相机参数 {x,y,scale}
//   - worldToScreen:  世界坐标 → 屏幕坐标
//   - screenToWorld:  屏幕坐标 → 世界坐标（预留）
//
// 与精灵动画工具一起，这些是 map.js / sports.js 中 "内联绘制" 部分的基础。

function computeCamera(worldX, worldY, viewW, viewH, mapW, mapH) {
  const camX = worldX - viewW / 2;
  const camY = worldY - viewH / 2;

  const scaleX = viewW / mapW;
  const scaleY = viewH / mapH;
  const fitScale = Math.min(scaleX, scaleY, 1);

  let minCamX = 0;
  let minCamY = 0;
  let maxCamX = Math.max(0, mapW - viewW);
  let maxCamY = Math.max(0, mapH - viewH);

  if (mapW < viewW) {
    minCamX = (mapW - viewW) / 2;
    maxCamX = minCamX;
  }
  if (mapH < viewH) {
    minCamY = (mapH - viewH) / 2;
    maxCamY = minCamY;
  }

  return {
    x: Math.max(minCamX, Math.min(maxCamX, camX)),
    y: Math.max(minCamY, Math.min(maxCamY, camY)),
    scale: fitScale
  };
}

function worldToScreen(wx, wy, cam) {
  return { x: wx - cam.x, y: wy - cam.y };
}

function screenToWorld(sx, sy, cam) {
  return { x: sx + cam.x, y: sy + cam.y };
}

module.exports = {
  computeCamera,
  worldToScreen,
  screenToWorld
};