// utils/sprite.js
// 精灵动画通用工具：
//   - SpriteAnimator: 帧索引计算（静止/走动切换）
//   - dirFromVector:  根据摇杆方向向量 → 'up'/'down'/'left'/'right'
//   - drawPlayer:     在 Canvas 上绘制像素角色（矩形拼贴）
//
// 这些工具在 map.js / sports.js 中都会用到，抽出后避免代码重复。

class SpriteAnimator {
  constructor(options = {}) {
    this.frameCount = options.frameCount || 4;
    this.frameDuration = options.frameDuration || 100; // ms
    this.frameTime = 0;
    this.frameIndex = 0;
  }
  tick(dtMs, isMoving) {
    if (isMoving) {
      this.frameTime += dtMs;
      if (this.frameTime >= this.frameDuration) {
        this.frameTime = 0;
        this.frameIndex = (this.frameIndex + 1) % this.frameCount;
      }
    } else {
      this.frameTime = 0;
      this.frameIndex = 0;
    }
  }
}

function dirFromVector(x, y) {
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
  return y > 0 ? 'down' : 'up';
}

// 用简单的矩形拼贴方式绘制一个像素风格角色。
// 这与原页面文件中的内联绘制逻辑一致（只是抽成了独立函数）。
function drawPlayer(ctx, x, y, isMoving, frameIndex, direction) {
  const size = 48;
  const half = size / 2;
  const px = Math.round(x - half);
  const py = Math.round(y - half);

  // 颜色：走路时衣服闪烁（在 #5a84b0 与 #7aa8d8 之间切换）
  const clothesColor = isMoving
    ? (frameIndex % 2 === 0 ? '#5a84b0' : '#7aa8d8')
    : '#5a84b0';

  // 身体 - 蓝色衣服
  ctx.fillStyle = clothesColor;
  ctx.fillRect(px + 12, py + 16, 24, 20);

  // 头 - 皮肤色
  ctx.fillStyle = '#f4c8a0';
  ctx.fillRect(px + 16, py + 4, 16, 14);

  // 头发
  ctx.fillStyle = '#3a2820';
  ctx.fillRect(px + 14, py + 2, 20, 6);
  ctx.fillRect(px + 14, py + 4, 4, 8);
  ctx.fillRect(px + 30, py + 4, 4, 8);

  // 眼睛 - 根据朝向画不同位置
  ctx.fillStyle = '#000000';
  if (direction === 'down') {
    ctx.fillRect(px + 19, py + 11, 3, 3);
    ctx.fillRect(px + 26, py + 11, 3, 3);
  } else if (direction === 'up') {
    // 背面看不到眼睛，画衣领
    ctx.fillStyle = '#3a2820';
    ctx.fillRect(px + 20, py + 14, 8, 4);
  } else if (direction === 'left') {
    ctx.fillRect(px + 17, py + 11, 3, 3);
  } else {
    ctx.fillRect(px + 28, py + 11, 3, 3);
  }

  // 腿 - 走路时左右交替
  ctx.fillStyle = '#2a3650';
  if (isMoving) {
    if (frameIndex % 2 === 0) {
      ctx.fillRect(px + 14, py + 36, 8, 8);
      ctx.fillRect(px + 26, py + 38, 8, 6);
    } else {
      ctx.fillRect(px + 14, py + 38, 8, 6);
      ctx.fillRect(px + 26, py + 36, 8, 8);
    }
  } else {
    ctx.fillRect(px + 14, py + 36, 8, 8);
    ctx.fillRect(px + 26, py + 36, 8, 8);
  }

  // 手臂
  ctx.fillStyle = '#f4c8a0';
  if (direction === 'left' || direction === 'right') {
    // 侧向：手臂更明显
    ctx.fillRect(px + 8, py + 18, 6, 14);
    ctx.fillRect(px + 34, py + 18, 6, 14);
  } else {
    ctx.fillRect(px + 10, py + 20, 4, 12);
    ctx.fillRect(px + 34, py + 20, 4, 12);
  }
}

module.exports = {
  SpriteAnimator,
  dirFromVector,
  drawPlayer
};