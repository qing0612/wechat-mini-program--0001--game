// 天气效果（HTML版）
window.WeatherEffect = (function() {
  function WeatherEffect() {
    this.particles = [];
    this.type = 'none';
    this.width = 0;
    this.height = 0;
  }

  WeatherEffect.prototype.init = function(w, h) {
    this.width = w;
    this.height = h;
    this.particles = [];
  };

  WeatherEffect.prototype.setType = function(type) {
    this.type = type;
    this.particles = [];
    if (type === 'rain') this._createRain();
    else if (type === 'snow') this._createSnow();
  };

  WeatherEffect.prototype._createRain = function() {
    var count = Math.max(20, Math.floor(this.width * this.height * 0.00015));
    for (var i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: Math.random() * 14 + 8,
        speed: Math.random() * 8 + 4,
        opacity: Math.random() * 0.4 + 0.3,
        drift: Math.random() * 2 - 1
      });
    }
  };

  WeatherEffect.prototype._createSnow = function() {
    var count = Math.max(40, Math.floor(this.width * this.height * 0.00025));
    for (var i = 0; i < count; i++) {
      var size = Math.random() < 0.7 ? Math.random() * 2 + 1.5 : Math.random() * 3 + 3;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: size,
        speed: size * (Math.random() * 0.5 + 0.7),
        opacity: Math.random() * 0.4 + 0.5,
        drift: (Math.random() - 0.5) * 1.2,
        phase: Math.random() * Math.PI * 2
      });
    }
  };

  WeatherEffect.prototype.update = function(dtSec) {
    if (this.type === 'rain') {
      for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        p.y += p.speed;
        p.x += p.drift + 1;
        if (p.y > this.height) { p.y = -p.length; p.x = Math.random() * this.width; }
        if (p.x > this.width) p.x = 0;
      }
    } else if (this.type === 'snow') {
      for (var j = 0; j < this.particles.length; j++) {
        var p2 = this.particles[j];
        p2.y += p2.speed;
        p2.phase += dtSec * 2;
        p2.x += Math.sin(p2.phase) * p2.drift;
        if (p2.y > this.height) { p2.y = -p2.size; p2.x = Math.random() * this.width; }
        if (p2.x > this.width) p2.x = 0;
        if (p2.x < 0) p2.x = this.width;
      }
    }
  };

  WeatherEffect.prototype.render = function(ctx) {
    if (this.type === 'none') return;

    ctx.save();

    if (this.type === 'rain') {
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
      ctx.lineWidth = 1;
      for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 2, p.y + p.length);
        ctx.stroke();
      }
    } else if (this.type === 'snow') {
      for (var j = 0; j < this.particles.length; j++) {
        var p2 = this.particles[j];
        ctx.globalAlpha = p2.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, p2.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  return WeatherEffect;
})();