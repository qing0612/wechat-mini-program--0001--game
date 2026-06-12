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

    // 隐私协议检查：用户未同意时触发平台授权流程
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

  // 隐私协议检查：使用官方隐私接口
  // 需配合开发者后台"用户隐私保护指引"配置，以及 project.config.json 的 __usePrivacyCheck__ = true
  _checkPrivacy() {
    if (!wx.getPrivacySetting) return;

    // 注册隐私授权回调（新版隐私接口：平台在需要时自动调起）
    if (wx.onNeedPrivacyAuthorization) {
      wx.onNeedPrivacyAuthorization(() => {
        wx.showModal({
          title: '用户隐私保护提示',
          content: '感谢您使用本小程序。为了保护您的个人信息，在使用前请阅读并同意《用户隐私保护指引》。',
          confirmText: '同意并继续',
          cancelText: '不同意',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.openPrivacyContract({ fail: () => {} });
            }
          }
        });
      });
    }

    wx.getPrivacySetting({
      success: (res) => {
        // needAuthorization 为 true 表示平台判定需要弹隐私协议
        if (res.needAuthorization) {
          wx.showModal({
            title: '用户隐私保护提示',
            content: '感谢您使用本小程序。为了保护您的个人信息，在使用前请阅读并同意《用户隐私保护指引》。点击"同意"后可正常使用。',
            confirmText: '同意并继续',
            cancelText: '不同意',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 打开平台配置的隐私协议页，用户在协议页点"同意"后由平台完成授权
                wx.openPrivacyContract({
                  fail: () => {
                    wx.showToast({ title: '暂未配置隐私协议', icon: 'none' });
                  }
                });
              } else {
                // 用户拒绝时友好提示，不阻塞退出
                wx.showToast({ title: '您已拒绝隐私协议，部分功能可能无法使用', icon: 'none' });
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