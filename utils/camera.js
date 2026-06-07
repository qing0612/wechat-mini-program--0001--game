function computeCamera(playerX, playerY, viewW, viewH, mapW, mapH) {
  let x = playerX - viewW / 2;
  let y = playerY - viewH / 2;
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x > mapW - viewW) x = Math.max(0, mapW - viewW);
  if (y > mapH - viewH) y = Math.max(0, mapH - viewH);
  return { x, y };
}

function worldToScreen(wx, wy, cam) {
  return { x: wx - cam.x, y: wy - cam.y };
}

module.exports = { computeCamera, worldToScreen };
