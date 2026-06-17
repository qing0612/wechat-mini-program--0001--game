// 运动场地图渲染器（HTML版）
window.SportsRenderer = (function() {
  function SportsRenderer() {
    this.mapImg = null;
    this.mapLoaded = false;
    this.isDay = true;
    this.season = 'spring';
  }

  SportsRenderer.prototype.loadMapImage = function(src, onReady, onError) {
    var img = new Image();
    var self = this;
    img.onload = function() {
      self.mapImg = img;
      self.mapLoaded = true;
      if (onReady) onReady();
    };
    img.onerror = function() {
      self.mapImg = null;
      self.mapLoaded = true;
      if (onError) onError();
    };
    img.src = src;
  };

  SportsRenderer.prototype.render = function(ctx, options) {
    var cam = options.cam;
    var viewW = options.viewW;
    var viewH = options.viewH;
    var dpr = options.dpr || 1;

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#4a5a3a';
    ctx.fillRect(0, 0, viewW, viewH);

    if (this.mapImg) {
      ctx.drawImage(
        this.mapImg,
        cam.x, cam.y, viewW, viewH,
        0, 0, viewW, viewH
      );
    } else {
      this._drawPlaceholder(ctx, cam, viewW, viewH, options.mapW, options.mapH);
    }

    // 日夜遮罩（与 CampusRenderer 保持一致）
    if (!this.isDay) {
      ctx.fillStyle = 'rgba(10, 15, 40, 0.45)';
      ctx.fillRect(0, 0, viewW, viewH);
    } else if (this.season === 'summer') {
      ctx.fillStyle = 'rgba(255, 210, 80, 0.1)';
      ctx.fillRect(0, 0, viewW, viewH);
    } else if (this.season === 'autumn') {
      ctx.fillStyle = 'rgba(220, 130, 60, 0.18)';
      ctx.fillRect(0, 0, viewW, viewH);
    } else if (this.season === 'winter') {
      ctx.fillStyle = 'rgba(180, 210, 255, 0.2)';
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(0, 0, viewW, viewH);
    }

    ctx.restore();
  };

  SportsRenderer.prototype._drawPlaceholder = function(ctx, cam, viewW, viewH, mapW, mapH) {
    ctx.fillStyle = '#4a5a3a';
    ctx.fillRect(0, 0, viewW, viewH);

    // 跑道（椭圆形）
    var cx = mapW / 2 - cam.x;
    var cy = mapH / 2 - cam.y;
    var rx = 280;
    var ry = 140;

    ctx.fillStyle = '#d9632a';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // 内场草地
    ctx.fillStyle = '#6b9950';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 50, ry - 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // 篮球场地块（在草地四周画几个）
    var courts = [
      { x: 200, y: 300, w: 160, h: 100 },
      { x: mapW - 360, y: 300, w: 160, h: 100 },
      { x: 200, y: mapH - 400, w: 160, h: 100 },
      { x: mapW - 360, y: mapH - 400, w: 160, h: 100 }
    ];
    for (var i = 0; i < courts.length; i++) {
      var c = courts[i];
      var sx = c.x - cam.x;
      var sy = c.y - cam.y;
      if (sx + c.w < 0 || sx > viewW || sy + c.h < 0 || sy > viewH) continue;
      ctx.fillStyle = '#e8d69a';
      ctx.fillRect(sx, sy, c.w, c.h);
      ctx.strokeStyle = '#3a2820';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, c.w, c.h);
    }
  };

  return SportsRenderer;
})();