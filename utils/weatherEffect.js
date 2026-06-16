// utils/weatherEffect.js
class WeatherEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.type = 'none'; // none, rain, snow
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.particles = [];
  }

  setType(type) {
    this.type = type;
    this.particles = [];
    
    if (type === 'rain') {
      this._createRain();
    } else if (type === 'snow') {
      this._createSnow();
    }
  }

  _createRain() {
    const count = Math.floor(this.width * this.height * 0.0003);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 5,
        opacity: Math.random() * 0.5 + 0.3,
        drift: Math.random() * 2 - 1
      });
    }
  }

  _createSnow() {
    const count = Math.floor(this.width * this.height * 0.00015);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.4,
        drift: Math.sin(Math.random() * Math.PI * 2) * 0.5
      });
    }
  }

  update() {
    if (this.type === 'rain') {
      this.particles.forEach(p => {
        p.y += p.speed;
        p.x += p.drift + 1;
        
        if (p.y > this.height) {
          p.y = -p.length;
          p.x = Math.random() * this.width;
        }
        if (p.x > this.width) p.x = 0;
      });
    } else if (this.type === 'snow') {
      this.particles.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.01) * p.drift;
        
        if (p.y > this.height) {
          p.y = -p.size;
          p.x = Math.random() * this.width;
        }
      });
    }
  }

  render() {
    if (this.type === 'none') return;

    this.ctx.save();

    if (this.type === 'rain') {
      this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.4)';
      this.ctx.lineWidth = 1;
      this.particles.forEach(p => {
        this.ctx.globalAlpha = p.opacity;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + 3, p.y + p.length);
        this.ctx.stroke();
      });
    } else if (this.type === 'snow') {
      this.particles.forEach(p => {
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    this.ctx.restore();
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }
}

module.exports = WeatherEffect;