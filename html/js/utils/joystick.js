// 摇杆（HTML版）
window.Joystick = (function() {
  function Joystick(opts) {
    opts = opts || {};
    this.baseX = 0;
    this.baseY = 0;
    this.radius = opts.radius || 45;
    this.active = false;
    this.dx = 0;
    this.dy = 0;
    this.visible = false;
    this.activeElement = null;
  }

  Joystick.prototype.start = function(clientX, clientY) {
    this.active = true;
    this.visible = true;
    this.baseX = clientX;
    this.baseY = clientY;
    this.dx = 0;
    this.dy = 0;
  };

  Joystick.prototype.update = function(clientX, clientY) {
    if (!this.active) return;
    var dx = clientX - this.baseX;
    var dy = clientY - this.baseY;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > this.radius) {
      dx = (dx / len) * this.radius;
      dy = (dy / len) * this.radius;
    }
    this.dx = dx;
    this.dy = dy;
  };

  Joystick.prototype.end = function() {
    this.active = false;
    this.visible = false;
    this.dx = 0;
    this.dy = 0;
  };

  Joystick.prototype.getDirection = function() {
    var len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (len < 6) return { x: 0, y: 0, magnitude: 0 };
    return {
      x: this.dx / this.radius,
      y: this.dy / this.radius,
      magnitude: len / this.radius
    };
  };

  Joystick.prototype.getStickOffset = function() {
    return { x: this.dx, y: this.dy };
  };

  return Joystick;
})();