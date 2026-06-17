// 校园地图渲染器（HTML版）
window.CampusRenderer = (function() {
  function CampusRenderer() {
    this.mapImg = null;
    this.mapLoaded = false;
    this.isDay = true;
    this.season = 'spring';
    this.dpr = 1;
  }

  CampusRenderer.prototype.loadMapImage = function(src, onReady, onError) {
    var img = new Image();
    var self = this;
    img.onload = function() {
      self.mapImg = img;
      self.mapLoaded = true;
      if (onReady) onReady();
    };
    img.onerror = function() {
      self.mapImg = null;
      self.mapLoaded = true; // 降级渲染
      if (onError) onError();
    };
    img.src = src;
  };

  CampusRenderer.prototype.render = function(ctx, options) {
    var cam = options.cam;
    var viewW = options.viewW;
    var viewH = options.viewH;
    var mapW = options.mapW;
    var mapH = options.mapH;
    var dpr = options.dpr || 1;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 先画背景底色（防止图片缺失时黑屏）
    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(0, 0, viewW, viewH);

    // 绘制地图图像
    if (this.mapImg) {
      ctx.drawImage(
        this.mapImg,
        cam.x, cam.y, viewW, viewH,  // 源裁剪（世界坐标）
        0, 0, viewW, viewH            // 目标
      );
    } else {
      // 占位：简单的像素地图
      this._drawPlaceholderMap(ctx, cam, viewW, viewH, mapW, mapH);
    }

    // 日夜遮罩
    if (!this.isDay) {
      ctx.fillStyle = 'rgba(10, 15, 40, 0.45)';
      ctx.fillRect(0, 0, viewW, viewH);

      // 简易的星星
      var starCount = 30;
      ctx.fillStyle = 'rgba(255, 255, 220, 0.8)';
      for (var i = 0; i < starCount; i++) {
        var sx = ((i * 137) % viewW);
        var sy = ((i * 59) % (viewH * 0.5));
        ctx.fillRect(sx, sy, 2, 2);
      }
    } else if (this.season === 'summer') {
      ctx.fillStyle = 'rgba(255, 210, 80, 0.1)';
      ctx.fillRect(0, 0, viewW, viewH);
    } else if (this.season === 'autumn') {
      ctx.fillStyle = 'rgba(220, 130, 60, 0.18)';
      ctx.fillRect(0, 0, viewW, viewH);
    } else if (this.season === 'winter') {
      // 冷蓝色调 + 轻微的白色薄雾
      ctx.fillStyle = 'rgba(180, 210, 255, 0.2)';
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(0, 0, viewW, viewH);
    }

    ctx.restore();
  };

  // 绘制建筑触发区（调试/提示）
  CampusRenderer.prototype.renderBuildingZones = function(ctx, options) {
    var cam = options.cam;
    var buildings = options.buildings || window.BUILDINGS;
    var dpr = options.dpr || 1;
    var currentBuilding = options.currentBuilding;

    ctx.save();
    ctx.scale(dpr, dpr);

    for (var i = 0; i < buildings.length; i++) {
      var b = buildings[i];
      var tz = b.triggerZone;
      var sx = tz.x - cam.x;
      var sy = tz.y - cam.y;

      // 超出视口不绘制
      if (sx + tz.w < 0 || sx > options.viewW || sy + tz.h < 0 || sy > options.viewH) continue;

      var isActive = currentBuilding && currentBuilding.id === b.id;
      ctx.fillStyle = isActive
        ? 'rgba(244, 162, 97, 0.2)'
        : 'rgba(244, 162, 97, 0.08)';
      ctx.fillRect(sx, sy, tz.w, tz.h);

      // 边框
      ctx.strokeStyle = isActive
        ? 'rgba(244, 162, 97, 0.8)'
        : 'rgba(244, 162, 97, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(sx, sy, tz.w, tz.h);
      ctx.setLineDash([]);

      // 建筑名
      if (isActive) {
        ctx.fillStyle = '#f4a261';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(b.name, sx + tz.w / 2, sy - 6);
      }
    }

    ctx.restore();
  };

  // 占位地图
  CampusRenderer.prototype._drawPlaceholderMap = function(ctx, cam, viewW, viewH, mapW, mapH) {
    // 草地底色
    ctx.fillStyle = '#4a7a3a';
    ctx.fillRect(0, 0, viewW, viewH);

    // 格子纹理
    ctx.fillStyle = 'rgba(60, 100, 50, 0.3)';
    var gridSize = 60;
    var startX = Math.floor(cam.x / gridSize) * gridSize - cam.x;
    var startY = Math.floor(cam.y / gridSize) * gridSize - cam.y;
    for (var gx = startX; gx < viewW; gx += gridSize) {
      for (var gy = startY; gy < viewH; gy += gridSize) {
        if ((Math.floor((gx + cam.x) / gridSize) + Math.floor((gy + cam.y) / gridSize)) % 2 === 0) {
          ctx.fillRect(gx, gy, gridSize, gridSize);
        }
      }
    }

    // 画建筑占位块
    var buildings = window.BUILDINGS;
    for (var i = 0; i < buildings.length; i++) {
      var b = buildings[i];
      var tz = b.triggerZone;
      var sx = tz.x - cam.x;
      var sy = tz.y - cam.y;
      if (sx + tz.w < 0 || sx > viewW || sy + tz.h < 0 || sy > viewH) continue;

      ctx.fillStyle = b.isSportsField ? '#8b7355' : '#8866aa';
      ctx.fillRect(sx, sy, tz.w, tz.h);
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, tz.w, tz.h);

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.name, sx + tz.w / 2, sy + tz.h / 2);
    }

    // 小路
    ctx.fillStyle = '#8b7355';
    var roadY = cam.y < 600 ? (600 - cam.y) : -20;
    if (roadY > -20 && roadY < viewH) {
      ctx.fillRect(0, roadY, viewW, 30);
    }
  };

  return CampusRenderer;
})();