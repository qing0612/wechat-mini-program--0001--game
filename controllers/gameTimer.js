// controllers/gameTimer.js
// 游戏计时器：每秒累加，格式化为 MM:SS，通过 setData 同步到页面
//
// 使用：
//   const timer = new GameTimer(page);
//   timer.start();   // onShow 中调用
//   timer.stop();    // onHide / onUnload 中调用

class GameTimer {
  constructor(page) {
    this.page = page;
    this.seconds = 0;
    this._interval = null;
  }

  start() {
    if (this._interval) return;
    this._interval = setInterval(() => {
      this.seconds++;
      const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
      const s = (this.seconds % 60).toString().padStart(2, '0');
      this.page.setData({ gameTime: `${m}:${s}` });
    }, 1000);
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  reset() {
    this.stop();
    this.seconds = 0;
    this.page.setData({ gameTime: '00:00' });
  }

  destroy() {
    this.stop();
  }

  getSeconds() {
    return this.seconds;
  }
}

module.exports = GameTimer;