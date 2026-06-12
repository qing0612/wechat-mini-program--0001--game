// utils/logger.js
// 统一日志工具：
//   - debug / info / warn / error 四个级别
//   - 本地 console 输出
//   - 线上接入微信实时日志管理器（wx.getRealtimeLogManager）
//   - 提供 reportError 快捷方法：捕获 uncaught errors
//
// 使用示例：
//   const logger = require('../../utils/logger.js');
//   logger.info('map', 'player entered', { x: 100, y: 200 });
//   logger.warn('map', 'unknown building', { id: 'xxx' });
//   logger.error('app', 'init failed', e);

class Logger {
  constructor() {
    try {
      this.realtimeLog = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;
    } catch (e) {
      this.realtimeLog = null;
    }
  }

  _format(tag, message, extra) {
    const parts = [tag, message];
    if (extra !== undefined) {
      if (typeof extra === 'object') {
        try {
          parts.push(JSON.stringify(extra));
        } catch (e) {
          parts.push(String(extra));
        }
      } else {
        parts.push(String(extra));
      }
    }
    return parts.join(' | ');
  }

  debug(tag, message, extra) {
    const text = this._format(tag, message, extra);
    console.debug('[DEBUG] ' + text);
    if (this.realtimeLog && this.realtimeLog.debug) {
      this.realtimeLog.debug(text);
    }
  }

  info(tag, message, extra) {
    const text = this._format(tag, message, extra);
    console.log('[INFO] ' + text);
    if (this.realtimeLog && this.realtimeLog.info) {
      this.realtimeLog.info(text);
    }
  }

  warn(tag, message, extra) {
    const text = this._format(tag, message, extra);
    console.warn('[WARN] ' + text);
    if (this.realtimeLog && this.realtimeLog.warn) {
      this.realtimeLog.warn(text);
    }
  }

  error(tag, message, extra) {
    const text = this._format(tag, message, extra);
    console.error('[ERROR] ' + text);
    if (this.realtimeLog && this.realtimeLog.error) {
      this.realtimeLog.error(text);
    }
  }

  // 通用 try-catch 包装器：把可能失败的函数包一层，失败时自动上报
  wrap(fn, tag, message) {
    try {
      return fn();
    } catch (e) {
      this.error(tag, message, e && e.message ? e.message : e);
      return undefined;
    }
  }
}

module.exports = new Logger();