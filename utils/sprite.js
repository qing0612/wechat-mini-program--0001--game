class SpriteAnimator {
  constructor(opts = {}) {
    this.frameDuration = opts.frameDuration || 180;
    this.elapsed = 0;
    this.frameIndex = 0;
    this.frameCount = opts.frameCount || 2;
  }

  tick(dt, isMoving) {
    if (!isMoving) {
      this.frameIndex = 0;
      this.elapsed = 0;
      return;
    }
    this.elapsed += dt;
    if (this.elapsed >= this.frameDuration) {
      this.elapsed -= this.frameDuration;
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
    }
  }
}

function dirFromVector(dx, dy) {
  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

module.exports = { SpriteAnimator, dirFromVector };
