// store/persistence.js
// 游戏存档持久化模块：本地存储 + 云端同步（防抖、失败降级）
//
// 设计：
//   - 仅负责"怎么存/怎么读"，不关心"存什么"
//   - cloudSync 通过 setCloudProvider 注入，便于替换实现 / 单测
//   - 所有 API 都 try-catch，失败不抛异常

const STORAGE_KEY = 'game_state';

class Persistence {
  constructor() {
    this._cloudProvider = null;
    this._lastSyncAt = 0;
    this._minSyncInterval = 3000;
  }

  setCloudProvider(provider) {
    this._cloudProvider = provider || null;
  }

  // === 本地存储 ===
  saveLocal(snapshot) {
    try {
      wx.setStorageSync(STORAGE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (e) {
      console.warn('[Persistence] saveLocal failed:', e && e.message);
      return false;
    }
  }

  loadLocal() {
    try {
      const raw = wx.getStorageSync(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[Persistence] loadLocal failed:', e && e.message);
      return null;
    }
  }

  hasLocal() {
    try {
      return !!wx.getStorageSync(STORAGE_KEY);
    } catch (e) {
      return false;
    }
  }

  clearLocal() {
    try {
      wx.removeStorageSync(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // === 云端同步 ===
  cloudAvailable() {
    return !!(this._cloudProvider && this._cloudProvider.available && this._cloudProvider.available());
  }

  syncToCloud(snapshot) {
    if (!this.cloudAvailable()) return Promise.resolve(false);
    const now = Date.now();
    if (now - this._lastSyncAt < this._minSyncInterval) {
      return Promise.resolve(false);
    }
    this._lastSyncAt = now;
    return this._cloudProvider
      .syncToCloud(snapshot)
      .then(() => true)
      .catch(() => false);
  }

  loadFromCloud() {
    if (!this.cloudAvailable()) return Promise.resolve(null);
    return this._cloudProvider.loadFromCloud();
  }

  forceSyncToCloud(snapshot) {
    if (!this.cloudAvailable()) return Promise.resolve(false);
    this._lastSyncAt = 0;
    return this._cloudProvider
      .forceSync(snapshot)
      .then(() => true)
      .catch(() => false);
  }

  // === 通用：本地 + 云 ===
  save(snapshot) {
    const ok = this.saveLocal(snapshot);
    if (ok) this.syncToCloud(snapshot);
    return ok;
  }
}

module.exports = Persistence;