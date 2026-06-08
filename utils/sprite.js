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

const SPRITE_COLORS = {
  o: '#3D2200', O: '#3D2200', M: '#C07820', b: '#D4A030',
  v: '#F5E6C8', e: '#1A1A1A', h: '#FFFFFF', n: '#2D1800',
  E: '#C07820', I: '#F0A0A0'
};

const SPRITE_GRIDS = {
  down: [
    '....EE..EE....', '...EEOOEEOE...', '..MMMMMMMMMM..',
    '..MbbMMbbMbM..', '..MbMebeMeMb..', '..MbbbMMbbbM..',
    '..MMbbnnbbMM..', '...MMbbbbMM...', '...MbbvvbbM...',
    '...MbbvvbbM...', '....MbvvbM....', '....MMvvMM....',
  ],
  up: [
    '....EE..EE....', '...EEOOEEOE...', '..MMMMMMMMMM..',
    '..MbMMMMbMbM..', '..MbMMMMbMbM..', '..MbbbbbbbbbM..',
    '..MMbbbbbbMM..', '...MMbbbbMM...', '...MbbvvbbM...',
    '...MbbvvbbM...', '....MbvvbM....', '....MMvvMM....',
  ],
  left: [
    '...EE.........', '..EIOE........', '.MMMMMMM......',
    '.MMMMbbM......', '.MMMebbM......', '.MMbbbMM......',
    '.MMnnbbM......', '..MbbbbM......', '..MbbvvbM.....',
    '..MbbvvbM.....', '...MbvvbM.....', '...MMvvMM.....',
  ],
  right: [
    '.........EE...', '........EOIE..', '.......MMMMMMM',
    '.......bbMMMMM', '.......bbeMMM.', '.......bbbMM..',
    '.......bbnnMM.', '.......bbbbM..', '....bvvbbM....',
    '....bvvbbM....', '....MbvvbM....', '.....MMvvMM...',
  ]
};

function drawPlayer(ctx, x, y, moving, frameIndex, dir) {
  const s = 48;
  const bounce = moving && frameIndex === 1 ? -4 : 0;
  const p = 4;
  const ox = x - s / 2;
  const oy = y - s / 2 + bounce;
  const grid = SPRITE_GRIDS[dir] || SPRITE_GRIDS.down;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const ch = grid[r][c];
      if (ch !== '.' && SPRITE_COLORS[ch]) {
        ctx.fillStyle = SPRITE_COLORS[ch];
        ctx.fillRect(ox + c * p, oy + r * p, p, p);
      }
    }
  }
}

module.exports = { SpriteAnimator, dirFromVector, drawPlayer };