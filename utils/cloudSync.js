// utils/cloudSync.js
// 云同步模块：登录 → 云数据库存档读取 / 写入
//
// 设计原则：
//   - 失败不阻塞主流程：云端失败时静默降级到本地存储
//   - 初始化在 app.js onLaunch 中调用
//   - 与 gameStore 解耦：外部调用 syncToCloud / loadFromCloud 即可
//   - 任何错误都 try-catch，绝不引起页面挂掉
//
// 云环境准备步骤（需在微信开发者工具手动完成）：
//   1. 点左侧「云开发」→ 开通 → 创建一个云环境（免费版即可）
//   2. 在 app.js onLaunch 中调用 wx.cloud.init({ env: '你的环境ID' })
//   3. 在云开发控制台 → 数据库 → 新建集合：user_saves
//   4. 云开发控制台 → 数据库 → user_saves → 权限设置 → 选「仅创建者可读写」

class CloudSync {
  constructor() {
    this.lastSyncAt = 0;
    this.minSyncInterval = 3000;
  }

  init() {
    // 只是占位，实际是否可用由 available() 动态判断
    // 保留这个方法是为了 API 稳定，方便以后扩展
  }

  // 动态判断是否可用：每次调用都重新检查 app.globalData.cloudReady
  available() {
    try {
      if (!wx.cloud || !wx.cloud.database) return false;
      const app = getApp();
      if (!app || !app.globalData || !app.globalData.cloudReady) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  // 安全获取数据库实例：避免 wx.cloud.database() 在异常情况下抛出
  _safeGetDb() {
    try {
      if (!this.available()) return null;
      return wx.cloud.database();
    } catch (e) {
      console.warn('[CloudSync] database() failed:', e && e.errMsg);
      return null;
    }
  }

  // 同步到云端：把 gameStore 的 state 快照写入云数据库
  syncToCloud(stateSnapshot) {
    if (!this.available()) return Promise.resolve();

    const now = Date.now();
    if (now - this.lastSyncAt < this.minSyncInterval) {
      return Promise.resolve();
    }
    this.lastSyncAt = now;

    const db = this._safeGetDb();
    if (!db) return Promise.resolve();

    let collection;
    try {
      collection = db.collection('user_saves');
    } catch (e) {
      console.warn('[CloudSync] collection failed:', e && e.errMsg);
      return Promise.resolve();
    }

    const payload = {
      player: stateSnapshot.player,
      isDay: stateSnapshot.isDay,
      season: stateSnapshot.season,
      backpack: stateSnapshot.backpack,
      sportsPlayer: stateSnapshot.sportsPlayer,
      saveOnQuit: stateSnapshot.saveOnQuit,
      updatedAt: db.serverDate()
    };

    return new Promise((resolve) => {
      try {
        collection
          .limit(1)
          .field({ _id: true })
          .get()
          .then((res) => {
            if (res.data && res.data.length > 0) {
              const docId = res.data[0]._id;
              collection
                .doc(docId)
                .update({ data: payload })
                .then(() => {
                  console.log('[CloudSync] syncToCloud updated');
                  resolve();
                })
                .catch((err) => {
                  console.warn('[CloudSync] update failed:', err && err.errMsg);
                  resolve();
                });
            } else {
              collection
                .add({ data: payload })
                .then(() => {
                  console.log('[CloudSync] syncToCloud added');
                  resolve();
                })
                .catch((err) => {
                  console.warn('[CloudSync] add failed:', err && err.errMsg);
                  resolve();
                });
            }
          })
          .catch((err) => {
            console.warn('[CloudSync] query failed:', err && err.errMsg);
            resolve();
          });
      } catch (e) {
        console.warn('[CloudSync] sync exception:', e && e.errMsg);
        resolve();
      }
    });
  }

  // 从云端读取存档：优先云端，没有则返回 null（让调用方走本地缓存兜底）
  loadFromCloud() {
    if (!this.available()) return Promise.resolve(null);

    const db = this._safeGetDb();
    if (!db) return Promise.resolve(null);

    let collection;
    try {
      collection = db.collection('user_saves');
    } catch (e) {
      console.warn('[CloudSync] collection(load) failed:', e && e.errMsg);
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        collection
          .orderBy('updatedAt', 'desc')
          .limit(1)
          .get()
          .then((res) => {
            if (res.data && res.data.length > 0) {
              const doc = res.data[0];
              console.log('[CloudSync] loadFromCloud found:', doc._id);
              resolve({
                player: doc.player,
                isDay: doc.isDay,
                season: doc.season,
                backpack: doc.backpack,
                sportsPlayer: doc.sportsPlayer,
                saveOnQuit: doc.saveOnQuit
              });
            } else {
              console.log('[CloudSync] loadFromCloud: no cloud save');
              resolve(null);
            }
          })
          .catch((err) => {
            console.warn('[CloudSync] loadFromCloud failed:', err && err.errMsg);
            resolve(null);
          });
      } catch (e) {
        console.warn('[CloudSync] load exception:', e && e.errMsg);
        resolve(null);
      }
    });
  }

  // 立即同步（用于设置页面"同步到云端"按钮触发）
  forceSync(stateSnapshot) {
    this.lastSyncAt = 0;
    return this.syncToCloud(stateSnapshot);
  }
}

module.exports = new CloudSync();