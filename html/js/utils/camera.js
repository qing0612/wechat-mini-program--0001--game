// 相机工具（HTML版）
window.Camera = {
  compute: function(worldX, worldY, viewW, viewH, mapW, mapH) {
    var scaleX = viewW / mapW;
    var scaleY = viewH / mapH;
    var fitScale = Math.min(scaleX, scaleY, 1);

    var camX = worldX - viewW / 2;
    var camY = worldY - viewH / 2;

    var minCamX = (mapW < viewW) ? (mapW - viewW) / 2 : 0;
    var minCamY = (mapH < viewH) ? (mapH - viewH) / 2 : 0;
    var maxCamX = Math.max(minCamX, mapW - viewW);
    var maxCamY = Math.max(minCamY, mapH - viewH);

    return {
      x: Math.max(minCamX, Math.min(maxCamX, camX)),
      y: Math.max(minCamY, Math.min(maxCamY, camY)),
      scale: fitScale
    };
  },

  worldToScreen: function(wx, wy, cam) {
    return { x: wx - cam.x, y: wy - cam.y };
  },

  screenToWorld: function(sx, sy, cam) {
    return { x: sx + cam.x, y: sy + cam.y };
  }
};