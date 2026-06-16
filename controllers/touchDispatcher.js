// controllers/touchDispatcher.js
// 触摸事件分发：统一处理 onTouchStart/Move/End，转发到 Joystick
//
// 设计：
//   - 接收 Page 实例上的原生事件 (e.touches[0])
//   - 调用 page.setData 更新摇杆 UI 状态
//   - 支持 setBlocked(true) 在弹窗期间禁用移动
//
// 使用：
//   const disp = new TouchDispatcher(page, joystick);
//   Page({
//     onTouchStart: (e) => disp.onStart(e),
//     onTouchMove: (e) => disp.onMove(e),
//     onTouchEnd: (e) => disp.onEnd(e)
//   })

class TouchDispatcher {
  constructor(page, joystick) {
    this.page = page;
    this.joystick = joystick;
    this._blocked = false;
  }

  setBlocked(blocked) {
    this._blocked = !!blocked;
    if (this._blocked) {
      this.joystick.end();
      this.page.setData({ joystickVisible: false, stickX: 0, stickY: 0 });
    }
  }

  onStart(e) {
    if (this._blocked) return;
    const touch = e.touches[0];
    this.joystick.start(touch);
    this.page.setData({
      joystickVisible: true,
      joystickBaseX: touch.clientX,
      joystickBaseY: touch.clientY,
      stickX: 0,
      stickY: 0
    });
  }

  onMove(e) {
    if (this._blocked) return;
    const touch = e.touches[0];
    if (!this.joystick.active) return;
    if (touch.identifier !== this.joystick.touchId) return;
    this.joystick.update(touch);
    const offset = this.joystick.getStickOffset();
    this.page.setData({ stickX: offset.x, stickY: offset.y });
  }

  onEnd() {
    this.joystick.end();
    this.page.setData({ joystickVisible: false, stickX: 0, stickY: 0 });
  }
}

module.exports = TouchDispatcher;