function computeCamera(playerX, playerY, viewW, viewH, mapW, mapH) {
  let x = playerX - viewW / 2;
  let y = playerY - viewH / 2;
  // 地图比视口小时居中
  if (mapW <= viewW) {
    x = (mapW - viewW) / 2;
  } else {
    x = Math.max(0, Math.min(x, mapW - viewW));
  }
  if (mapH <= viewH) {
    y = (mapH - viewH) / 2;
  } else {
    y = Math.max(0, Math.min(y, mapH - viewH));
  }
  return { x, y };
}

function worldToScreen(wx, wy, cam) {
  return { x: wx - cam.x, y: wy - cam.y };
}

module.exports = { computeCamera, worldToScreen };