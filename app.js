// c:\Users\yibohe\Desktop\小程序-代码\app.js
const cloudSync = require('./utils/cloudSync.js');
const logger = require('./utils/logger.js');

App({
  globalData: {},
  onLaunch() {
    const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    this.globalData.windowWidth = sys.windowWidth;
    this.globalData.windowHeight = sys.windowHeight;
    this.globalData.pixelRatio = sys.pixelRatio || 2;

    // === 云开发初始化 ===
    // 云环境 ID：请在微信开发者工具 → 云开发 → 开通后获取，并替换下面的字符串
    // 例如：'cloud1-xxx'  或 'prod-xxx'
    // 如果还没有开通云开发，云相关功能会自动降级（不影响使用）
    const CLOUD_ENV = ''; // TODO: 在这里填入你的云开发环境 ID，如 'campus-tour-3gxxxxxxxxxxx'

    if (wx.cloud && CLOUD_ENV) {
      try {
        wx.cloud.init({
          env: CLOUD_ENV,
          traceUser: true
        });
        this.globalData.cloudReady = true;
        logger.info('app', 'cloud init ok', { env: CLOUD_ENV });
      } catch (e) {
        this.globalData.cloudReady = false;
        logger.warn('app', 'cloud init failed', e && e.message);
      }
    } else {
      this.globalData.cloudReady = false;
      logger.info('app', 'cloud skipped', { reason: CLOUD_ENV ? 'base lib too low' : 'env not configured' });
    }

    // 云同步模块初始化（即使没配置云环境也无害）
    cloudSync.init();

    // 隐私协议检查：用户未同意时触发平台授权流程
    this._checkPrivacy();
  },

  // 全局 JS 错误捕获：统一走 logger.error 上报
  onError(msg) {
    logger.error('app', 'global onerror', msg);
  },

  // 未处理的 Promise 拒绝捕获
  onUnhandledRejection(res) {
    logger.warn('app', 'unhandled promise rejection', res && res.reason);
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
        if (res.needAuthorization) {
          wx.showModal({
            title: '用户隐私保护提示',
            content: '感谢您使用本小程序。为了保护您的个人信息，在使用前请阅读并同意《用户隐私保护指引》。点击"同意"后可正常使用。',
            confirmText: '同意并继续',
            cancelText: '不同意',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openPrivacyContract({
                  fail: () => {
                    wx.showToast({ title: '暂未配置隐私协议', icon: 'none' });
                  }
                });
              } else {
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