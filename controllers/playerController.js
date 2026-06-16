// controllers/playerController.js
// 玩家控制：摇杆 → 移动 → 边界限制 → 方向判定 → 防抖保存到 gameStore
//
// 设计：
//   - 只关注"玩家如何移动"，不关心渲染
//   - 调用方通过 getPlayerPos() / getPlayerDir() / isMoving() 读取状态
//   - setPosition() 用于从 gameStore 恢复或外部强制设置

class PlayerController {
  constructor(options = {}) {
    this.joystick = options.joystick;             // Joystick 实例
    this.mapSize = options.mapSize || { width: 1893, height: 1093 };
    this.playerSize = options.playerSize || 48;
    this.speed = options.speed || 160;             // 像素/秒
    this.dirFromVector = options.dirFromVector || (() => null);

    this.x = options.spawnX != null ? options.spawnX : this.mapSize.width / 2;
    this.y = options.spawnY != null ? options.spawnY : this.mapSize.height / 2;
    this.dir = options.spawnDir || 'down';
    this.moving = false;

    // 防抖保存
    this._saveTimer = null;
    this._saveDelay = options.saveDelay != null ? options.saveDelay : 200;
    this._onSave = options.onSave || null;        // (x, y, dir) => void
  }

  update(dt) {
    if (!this.joystick) {
      this.moving = false;
      return;
    }
    const dir = this.joystick.getDirection();
    if (dir.magnitude > 0) {
      let nx = this.x + dir.x * this.speed * dt;
      let ny = this.y + dir.y * this.speed * dt;
      const half = this.playerSize / 2;
      nx = Math.max(half, Math.min(this.mapSize.width - half, nx));
      ny = Math.max(half, Math.min(this.mapSize.height - half, ny));
      this.x = nx;
      this.y = ny;
      this.moving = true;
      const newDir = this.dirFromVector(dir.x, dir.y);
      if (newDir) this.dir = newDir;
      this._scheduleSave();
    } else {
      this.moving = false;
    }
  }

  setPosition(x, y, dir) {
    if (typeof x === 'number') this.x = x;
    if (typeof y === 'number') this.y = y;
    if (dir) this.dir = dir;
  }

  setMapSize(width, height) {
    this.mapSize = { width, height };
  }

  getPlayerPos() {
    return { x: this.x, y: this.y };
  }

  getPlayerDir() {
    return this.dir;
  }

  isMoving() {
    return this.moving;
  }

  forceSave() {
    this._clearSaveTimer();
    if (this._onSave) this._onSave(this.x, this.y, this.dir);
  }

  destroy() {
    this._clearSaveTimer();
  }

  _scheduleSave() {
    if (!this._onSave) return;
    this._clearSaveTimer();
    this._saveTimer = setTimeout(() => {
      this._onSave(this.x, this.y, this.dir);
    }, this._saveDelay);
  }

  _clearSaveTimer() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
  }
}

module.exports = PlayerController;