// c:\Users\yibohe\Desktop\小程序-代码\utils\joystick.js
class Joystick {
  constructor(opts = {}) {
    this.baseX = 0;
    this.baseY = 0;
    this.radius = opts.radius || 45;
    this.active = false;
    this.touchId = null;
    this.dx = 0;
    this.dy = 0;
    this.visible = false;
  }

  start(touch) {
    this.active = true;
    this.visible = true;
    this.touchId = touch.identifier;
    this.baseX = touch.clientX;
    this.baseY = touch.clientY;
    this.dx = 0;
    this.dy = 0;
  }

  update(touch) {
    if (!this.active) return;
    let dx = touch.clientX - this.baseX;
    let dy = touch.clientY - this.baseY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > this.radius) {
      dx = (dx / len) * this.radius;
      dy = (dy / len) * this.radius;
    }
    this.dx = dx;
    this.dy = dy;
  }

  end() {
    this.active = false;
    this.visible = false;
    this.touchId = null;
    this.dx = 0;
    this.dy = 0;
  }

  getDirection() {
    const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (len < 6) return { x: 0, y: 0, magnitude: 0 };
    const magnitude = len / this.radius;
    return {
      x: this.dx / this.radius,
      y: this.dy / this.radius,
      magnitude: magnitude
    };
  }

  getStickOffset() {
    return { x: this.dx, y: this.dy };
  }
}

module.exports = Joystick;