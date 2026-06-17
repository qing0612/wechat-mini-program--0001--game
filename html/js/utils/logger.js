// 统一日志工具（HTML版·模块化）
// 设计：封装 console 调用，提供 info/warn/error 三层接口，便于将来接入第三方
(function() {
  function Logger() {
    this._enabled = true;
  }

  Logger.prototype.info = function(tag, action, detail) {
    if (!this._enabled) return;
    try {
      console.log('[info][' + tag + '] ' + action, detail === undefined ? '' : detail);
    } catch (e) {}
  };

  Logger.prototype.warn = function(tag, action, detail) {
    if (!this._enabled) return;
    try {
      console.warn('[warn][' + tag + '] ' + action, detail === undefined ? '' : detail);
    } catch (e) {}
  };

  Logger.prototype.error = function(tag, action, detail) {
    if (!this._enabled) return;
    try {
      console.error('[error][' + tag + '] ' + action, detail === undefined ? '' : detail);
    } catch (e) {}
  };

  Logger.prototype.setEnabled = function(enabled) {
    this._enabled = !!enabled;
  };

  window.logger = new Logger();
  window.Logger = Logger;
})();