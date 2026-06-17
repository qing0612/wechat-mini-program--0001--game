// AABB 碰撞检测工具（HTML版·模块化）
// 设计：纯工具函数，不耦合项目数据
window.Collision = {
  // 点是否在矩形内
  pointInRect: function(px, py, rect) {
    return rect && px >= rect.x && px <= rect.x + rect.w &&
           py >= rect.y && py <= rect.y + rect.h;
  },

  // 矩形与矩形相交
  rectIntersect: function(a, b) {
    return a && b &&
      a.x < b.x + b.w && a.x + a.w > b.x &&
      a.y < b.y + b.h && a.y + a.h > b.y;
  },

  // 圆与矩形碰撞（用于玩家圆形碰撞区域）
  circleIntersectRect: function(cx, cy, radius, rect) {
    if (!rect) return false;
    var dx = Math.max(rect.x - cx, 0, cx - (rect.x + rect.w));
    var dy = Math.max(rect.y - cy, 0, cy - (rect.y + rect.h));
    return (dx * dx + dy * dy) <= radius * radius;
  }
};