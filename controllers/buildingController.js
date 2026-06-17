// controllers/buildingController.js
// 建筑触发控制器：检测玩家是否进入某建筑触发区域 → 更新 currentBuilding 状态
//
// 设计目标（与 HTML 版对齐）：
//   - 进入触发区时不打断操作（不弹 modal）
//   - 只更新 currentBuilding 状态（页面层据此显示浮动按钮）
//   - 玩家点击按钮后由页面层执行导航
//
// 使用：
//   const ctrl = new BuildingController({ buildingService, gameStore });
//   ctrl.update(playerX, playerY);         // 每帧
//   ctrl.onShowReturn();                   // 从建筑页返回时调用
//
// 页面层读取：
//   const bld = buildingCtrl.currentBuilding;   // 当前触发区建筑 / null
//   if (bld) nav.forward('/pages/building/building?id=' + bld.id, ...);

class BuildingController {
  constructor(options = {}) {
    this.buildingService = options.buildingService;
    this.gameStore = options.gameStore || null;

    // 当前触发区对应的建筑（有值 = 玩家在某建筑触发区内）
    this.currentBuilding = null;
    // 当前触发区建筑的 id（快速比较用）
    this._currentBuildingId = null;
    // 冷却期标记：短时间内不响应进入事件（从建筑页返回时用）
    this._cooldown = false;
    this._cooldownTimer = null;
  }

  // 启用冷却期（从建筑页返回时调用，防止立即再次触发）
  enableCooldown(ms) {
    this._cooldown = true;
    if (this._cooldownTimer) clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._cooldown = false;
    }, ms);
  }

  // 从其他页面返回地图时调用：清除状态 + 短暂冷却
  onShowReturn(ms = 800) {
    this.currentBuilding = null;
    this._currentBuildingId = null;
    if (this.gameStore) {
      this.gameStore.setInTriggerZone(false);
      this.gameStore.setCurrentBuilding(null);
    }
    this.enableCooldown(ms);
  }

  // 每帧调用：检测玩家是否在某建筑触发区内
  update(playerX, playerY) {
    // 冷却期间不检测
    if (this._cooldown) return;

    const bld = this.buildingService.checkBuildingTrigger(playerX, playerY);

    if (bld) {
      // 玩家在某建筑触发区内
      if (this._currentBuildingId !== bld.id) {
        // 第一次进入该建筑触发区，或切换到了另一个建筑
        this.currentBuilding = bld;
        this._currentBuildingId = bld.id;
        if (this.gameStore) {
          this.gameStore.setInTriggerZone(true);
          this.gameStore.setCurrentBuilding(bld);
        }
      }
      // 已在同一建筑触发区内：什么都不做（避免每帧 setData）
    } else {
      // 玩家不在任何建筑触发区内
      if (this._currentBuildingId !== null) {
        // 之前在某建筑触发区内，现在离开了
        this.currentBuilding = null;
        this._currentBuildingId = null;
        if (this.gameStore) {
          this.gameStore.setInTriggerZone(false);
          this.gameStore.setCurrentBuilding(null);
        }
      }
      // 本来就不在任何触发区内：什么都不做
    }
  }

  forceReset() {
    this.currentBuilding = null;
    this._currentBuildingId = null;
    this._cooldown = false;
    if (this._cooldownTimer) {
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = null;
    }
    if (this.gameStore) {
      this.gameStore.setInTriggerZone(false);
      this.gameStore.setCurrentBuilding(null);
    }
  }

  destroy() {
    this.forceReset();
  }
}

module.exports = BuildingController;