// c:\Users\yibohe\Desktop\小程序-代码\utils\collision.js
function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

function findActiveBuilding(playerX, playerY, buildings) {
  for (let i = 0; i < buildings.length; i++) {
    if (pointInRect(playerX, playerY, buildings[i].triggerZone)) {
      return buildings[i];
    }
  }
  return null;
}

function rectCollides(x, y, w, h, obstacles) {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y) {
      return true;
    }
  }
  return false;
}

function resolveCollision(curX, curY, newX, newY, pw, ph, obstacles) {
  const halfW = pw / 2;
  const halfH = ph / 2;
  const curLeft = curX - halfW;
  const curTop = curY - halfH;
  const newLeft = newX - halfW;
  const newTop = newY - halfH;

  let resolvedX = newX;
  if (rectCollides(newLeft, curTop, pw, ph, obstacles)) {
    resolvedX = curX;
  }

  let resolvedY = newY;
  const resolvedLeft = resolvedX - halfW;
  if (rectCollides(resolvedLeft, newTop, pw, ph, obstacles)) {
    resolvedY = curY;
  }

  return { x: resolvedX, y: resolvedY };
}

module.exports = { pointInRect, findActiveBuilding, rectCollides, resolveCollision };