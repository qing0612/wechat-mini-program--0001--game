// controllers/buildingController.js
// 建筑触发控制器：检测玩家是否进入某建筑触发区域 → 弹出确认框 → 跳转到建筑页
//
// 状态机：
//   - isInTriggerZone : 当前是否在某建筑触发区内（用于识别"刚进入"的边缘）
//   - modalShowing    : 是否正在弹窗（弹窗期间禁用摇杆移动）
//   - modalDismissed  : 弹窗已关闭，但玩家还在建筑区内（避免重复弹窗）
//   - cooldown        : 冷却期（进入页面后的前 N 毫秒内不弹窗）
//
// 使用：
//   const ctrl = new BuildingController({ buildingService, onEnter: (bld) => navigateTo(...) });
//   ctrl.enableCooldown(2000);      // 页面进入时
//   ctrl.update(playerX, playerY);  // 每帧
//   ctrl.onShowReturn();             // 从其他页面返回时调用（重置冷却期）

class BuildingController {
  constructor(options = {}) {
    this.buildingService = options.buildingService;
    this.onEnter = options.onEnter || null;     // (building) => void，玩家点击"是"
    this.modalText = options.modalText || {
      title: (b) => b.name,
      content: '是否想要进入这个建筑并了解它的历史？',
      confirmText: '是',
      cancelText: '否'
    };

    this.isInTriggerZone = false;
    this.modalShowing = false;
    this.modalDismissed = false;
    this._cooldown = false;
    this._cooldownTimer = null;
  }

  enableCooldown(ms) {
    this._cooldown = true;
    if (this._cooldownTimer) clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._cooldown = false;
    }, ms);
  }

  onShowReturn(ms = 2000) {
    this.modalShowing = false;
    this.modalDismissed = false;
    this.enableCooldown(ms);
  }

  update(playerX, playerY) {
    const bld = this.buildingService.checkBuildingTrigger(playerX, playerY);
    if (bld) {
      if (!this.isInTriggerZone && !this.modalShowing && !this.modalDismissed && !this._cooldown) {
        this.isInTriggerZone = true;
        this.modalShowing = true;
        this._showModal(bld);
      } else {
        this.isInTriggerZone = true;
      }
    } else {
      this.isInTriggerZone = false;
      this.modalDismissed = false;
      this._cooldown = false;
    }
  }

  _showModal(bld) {
    wx.showModal({
      title: typeof this.modalText.title === 'function' ? this.modalText.title(bld) : bld.name,
      content: this.modalText.content,
      confirmText: this.modalText.confirmText,
      cancelText: this.modalText.cancelText,
      success: (res) => {
        this.modalShowing = false;
        this.modalDismissed = true;
        if (res.confirm && this.onEnter) {
          this.onEnter(bld);
        }
      }
    });
  }

  forceReset() {
    this.isInTriggerZone = false;
    this.modalShowing = false;
    this.modalDismissed = false;
    this._cooldown = false;
    if (this._cooldownTimer) {
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = null;
    }
  }

  destroy() {
    this.forceReset();
  }
}

module.exports = BuildingController;