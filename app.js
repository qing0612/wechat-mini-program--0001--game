App({
  globalData: {},
  onLaunch() {
    const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.globalData.windowWidth = sys.windowWidth;
    this.globalData.windowHeight = sys.windowHeight;
    this.globalData.pixelRatio = sys.pixelRatio || 2;

    // 初始化实时日志管理器（线上排查问题用）
    try {
      this.globalData.logManager = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;
    } catch (e) {}

    // 隐私协议检查：用户未同意时弹窗
    this._checkPrivacy();
  },

  // 全局 JS 错误捕获
  onError(msg) {
    console.error('[App.onError]', msg);
    if (this.globalData.logManager && this.globalData.logManager.error) {
      this.globalData.logManager.error('JS_ERROR', msg);
    }
  },

  // 未处理的 Promise 拒绝捕获
  onUnhandledRejection(res) {
    console.warn('[App.onUnhandledRejection]', res && res.reason);
    if (this.globalData.logManager && this.globalData.logManager.warn) {
      this.globalData.logManager.warn('UNHANDLED_PROMISE', res && res.reason);
    }
  },

  // 隐私协议检查
  _checkPrivacy() {
    if (!wx.getPrivacySetting) return;
    wx.getPrivacySetting({
      success: (res) => {
        if (res.needAuthorization) {
          wx.showModal({
            title: '用户隐私保护提示',
            content: '感谢您使用本小程序。使用前请阅读并同意《用户隐私保护指引》。',
            confirmText: '同意',
            cancelText: '拒绝',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openPrivacyContract({
                  fail: () => {}
                });
              }
            }
          });
        }
      },
      fail: () => {
        // 开发者环境未配置隐私协议或平台端返回异常时静默忽略
      }
    });
  }
});