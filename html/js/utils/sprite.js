// 精灵动画 & 玩家绘制（HTML版）
window.SpriteAnimator = (function() {
  function SpriteAnimator(options) {
    options = options || {};
    this.frameCount = options.frameCount || 4;
    this.frameDuration = options.frameDuration || 100;
    this.frameTime = 0;
    this.frameIndex = 0;
  }
  SpriteAnimator.prototype.tick = function(dtMs, isMoving) {
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
  };
  return SpriteAnimator;
})();

window.dirFromVector = function(x, y) {
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
  return y > 0 ? 'down' : 'up';
};

// 用矩形拼贴的方式绘制像素风格角色
window.drawPlayer = function(ctx, x, y, isMoving, frameIndex, direction) {
  var size = 48;
  var half = size / 2;
  var px = Math.round(x - half);
  var py = Math.round(y - half);

  // 颜色
  var clothesColor = isMoving
    ? (frameIndex % 2 === 0 ? '#5a84b0' : '#7aa8d8')
    : '#5a84b0';

  // 身体（衣服）
  ctx.fillStyle = clothesColor;
  ctx.fillRect(px + 12, py + 16, 24, 20);

  // 头
  ctx.fillStyle = '#f4c8a0';
  ctx.fillRect(px + 16, py + 4, 16, 14);

  // 头发
  ctx.fillStyle = '#3a2820';
  ctx.fillRect(px + 14, py + 2, 20, 6);
  ctx.fillRect(px + 14, py + 4, 4, 8);
  ctx.fillRect(px + 30, py + 4, 4, 8);

  // 眼睛
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

  // 腿
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
    ctx.fillRect(px + 8, py + 18, 6, 14);
    ctx.fillRect(px + 34, py + 18, 6, 14);
  } else {
    ctx.fillRect(px + 10, py + 20, 4, 12);
    ctx.fillRect(px + 34, py + 20, 4, 12);
  }
};