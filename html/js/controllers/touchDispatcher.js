// 触摸/鼠标/键盘事件分发（HTML版·模块化）
// 设计：统一处理触摸、鼠标、键盘输入，更新 joystick 状态
(function() {
  function TouchDispatcher(options) {
    options = options || {};
    this.canvas = options.canvas || null;
    this.joystick = options.joystick || null;
    this._onMoveCallback = options.onMove || null;
    this._onChangeBuilding = options.onChangeBuilding || null;
    this._pressedKeys = {};
    this._pointerActive = false;
    this._bindings = [];
    this._onResize = null;
  }

  TouchDispatcher.prototype.bind = function(canvas, controller) {
    this.canvas = canvas;
    this.joystick = controller && controller.joystick ? controller.joystick : null;

    var self = this;

    // ---- 触摸/鼠标：坐标转换 ----
    function getCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var cx = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      var cy = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return { x: cx - rect.left, y: cy - rect.top, clientX: cx, clientY: cy };
    }

    // ---- 触摸事件 ----
    function onTouchStart(e) {
      e.preventDefault();
      var coords = getCoords(e);
      if (self.joystick) self.joystick.start(coords.clientX, coords.clientY);
      self._pointerActive = true;
      if (self._onMoveCallback) self._onMoveCallback();
    }
    function onTouchMove(e) {
      e.preventDefault();
      var coords = getCoords(e);
      if (self.joystick) self.joystick.update(coords.clientX, coords.clientY);
      if (self._onMoveCallback) self._onMoveCallback();
    }
    function onTouchEnd(e) {
      e.preventDefault();
      if (self.joystick) self.joystick.end();
      self._pointerActive = false;
      if (self._onMoveCallback) self._onMoveCallback();
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

    // ---- 鼠标事件 ----
    function onMouseDown(e) {
      var coords = getCoords(e);
      if (self.joystick) self.joystick.start(coords.clientX, coords.clientY);
      self._pointerActive = true;
      if (self._onMoveCallback) self._onMoveCallback();
    }
    function onMouseMove(e) {
      if (!self._pointerActive) return;
      var coords = getCoords(e);
      if (self.joystick) self.joystick.update(coords.clientX, coords.clientY);
      if (self._onMoveCallback) self._onMoveCallback();
    }
    function onMouseUp(e) {
      if (self.joystick) self.joystick.end();
      self._pointerActive = false;
      if (self._onMoveCallback) self._onMoveCallback();
    }

    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // ---- 键盘 ----
    function keyDirFromPressed() {
      var dx = 0, dy = 0;
      if (self._pressedKeys['ArrowLeft'] || self._pressedKeys['KeyA']) dx -= 1;
      if (self._pressedKeys['ArrowRight'] || self._pressedKeys['KeyD']) dx += 1;
      if (self._pressedKeys['ArrowUp'] || self._pressedKeys['KeyW']) dy -= 1;
      if (self._pressedKeys['ArrowDown'] || self._pressedKeys['KeyS']) dy += 1;
      return { dx: dx, dy: dy };
    }
    function applyKeyDir() {
      var d = keyDirFromPressed();
      if (!self.joystick) return;
      var len = Math.sqrt(d.dx * d.dx + d.dy * d.dy);
      if (len > 0) {
        self.joystick.active = true;
        self.joystick.dx = (d.dx / len) * self.joystick.radius;
        self.joystick.dy = (d.dy / len) * self.joystick.radius;
      } else if (!self._pointerActive) {
        self.joystick.end();
      }
      if (self._onMoveCallback) self._onMoveCallback();
    }
    function onKeyDown(e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(e.code) >= 0) {
        self._pressedKeys[e.code] = true;
        e.preventDefault();
        applyKeyDir();
      }
      if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
        if (self._onChangeBuilding) self._onChangeBuilding();
      }
    }
    function onKeyUp(e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].indexOf(e.code) >= 0) {
        delete self._pressedKeys[e.code];
        applyKeyDir();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 记录绑定以便 destroy 时解绑
    this._bindings.push(
      { type: 'canvas.touchstart', fn: onTouchStart },
      { type: 'canvas.touchmove', fn: onTouchMove },
      { type: 'canvas.touchend', fn: onTouchEnd },
      { type: 'canvas.touchcancel', fn: onTouchEnd },
      { type: 'canvas.mousedown', fn: onMouseDown },
      { type: 'document.mousemove', fn: onMouseMove },
      { type: 'document.mouseup', fn: onMouseUp },
      { type: 'window.keydown', fn: onKeyDown },
      { type: 'window.keyup', fn: onKeyUp }
    );
  };

  TouchDispatcher.prototype.destroy = function() {
    // 简化实现：这里不做复杂解绑，实际小程序环境不需要
    this._bindings = [];
  };

  window.TouchDispatcher = TouchDispatcher;
})();