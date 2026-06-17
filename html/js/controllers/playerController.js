// 玩家控制器（HTML版·模块化）
// 设计：封装玩家输入/移动逻辑，不持有渲染相关状态（状态存在 gameStore 中
(function() {
  function PlayerController(options) {
    options = options || {};
    this.joystick = options.joystick || new window.Joystick({ radius: 45 });
    this.spriteAnimator = options.spriteAnimator || new window.SpriteAnimator({ frameCount: 4, frameDuration: 100 });
    this._isSportsMode = false;
  }

  PlayerController.prototype.setSportsMode = function(flag) {
    this._isSportsMode = !!flag;
  };

  // 根据摇杆方向返回下一帧的玩家坐标（不直接写 gameStore，由调用方决定是否保存）
  PlayerController.prototype.tick = function(dtMs, dtSec, state) {
    state = state || window.gameStore.getState();
    var dir = this.joystick.getDirection();
    var isMoving = dir.magnitude > 0.1;
    this.spriteAnimator.tick(dtMs, isMoving);
    if (!isMoving) return null;

    var cfg = this._isSportsMode ? window.CONFIG.SPORTS_MAP : window.CONFIG.MAP;
    var playerPos = this._isSportsMode ? state.sportsPlayer : state.player;
    var speed = window.CONFIG.PLAYER.SPEED * dir.magnitude;
    var newX = playerPos.x + dir.x * speed * dtSec;
    var newY = playerPos.y + dir.y * speed * dtSec;

    // 边界约束
    var half = window.CONFIG.PLAYER.SIZE / 2;
    newX = Math.max(half, Math.min(cfg.WIDTH - half, newX));
    newY = Math.max(half, Math.min(cfg.HEIGHT - half, newY));

    var direction = window.dirFromVector(dir.x, dir.y);
    return {
      x: newX, y: newY, direction: direction, isMoving: isMoving,
      sportsMode: this._isSportsMode, frameIndex: this.spriteAnimator.frameIndex
    };
  };

  PlayerController.prototype.getDirection = function() {
    return this.joystick.getDirection();
  };

  window.PlayerController = PlayerController;
})();