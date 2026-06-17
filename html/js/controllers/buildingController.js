// 建筑页面控制器（HTML版 · 与微信小程序版保持一致）
window.BuildingController = {
  currentBuilding: null,

  // 进入建筑时调用（对应小程序 onLoad）
  init: function(building) {
    if (!building) return;
    this.currentBuilding = building;
    this._renderBuilding();
    this._tryClaimBadge();
  },

  // 渲染建筑信息（全屏背景图 + 标题 + 历史卡片）
  _renderBuilding: function() {
    var b = this.currentBuilding;
    if (!b) return;

    // 标题（中英文）
    var nameEl = document.getElementById('buildingName');
    var nameEnEl = document.getElementById('buildingNameEn');
    var phNameEl = document.getElementById('phBuildingName');
    if (nameEl) nameEl.textContent = b.name || '';
    if (nameEnEl) nameEnEl.textContent = b.nameEn || '';
    if (phNameEl) phNameEl.textContent = b.name || '建筑';

    // 建筑历史文案
    var historyEl = document.getElementById('buildingHistoryText');
    if (historyEl) historyEl.textContent = b.historyText || '';

    // 全屏背景图
    var bgImg = document.getElementById('buildingBgImage');
    var bgPh = document.getElementById('buildingBgPlaceholder');
    if (bgImg) {
      if (b.interiorImage) {
        bgImg.src = b.interiorImage;
        bgImg.style.display = 'block';
        bgImg.onerror = function() {
          bgImg.style.display = 'none';
          if (bgPh) bgPh.style.display = 'flex';
        };
        bgImg.onload = function() {
          if (bgPh) bgPh.style.display = 'none';
        };
      } else {
        bgImg.style.display = 'none';
        if (bgPh) bgPh.style.display = 'flex';
      }
    }

    // 运动场入口（仅体育场馆显示）
    var sportsBox = document.getElementById('sportsEntryBox');
    if (sportsBox) {
      sportsBox.style.display = (b.isSportsField) ? 'block' : 'none';
    }
  },

  // 自动尝试领取徽章（对应小程序 onLoad 逻辑）
  _tryClaimBadge: function() {
    var b = this.currentBuilding;
    if (!b || !b.badge) return;

    if (window.gameStore && !window.gameStore.hasBadge(b.badge.id)) {
      var result = window.gameStore.addToBackpack(b.badge);
      if (result && result.isNew) {
        this._showBadgePopup(b.badge);
      }
    }
  },

  // 显示徽章弹窗
  _showBadgePopup: function(badge) {
    var popup = document.getElementById('badgePopup');
    var icon = document.getElementById('badgePopupIcon');
    var nameEl = document.getElementById('badgePopupName');
    var descEl = document.getElementById('badgePopupDesc');
    var closeBtn = document.getElementById('badgePopupClose');

    if (!popup) return;
    if (icon && badge.image) {
      icon.src = badge.image;
      icon.style.display = 'block';
    }
    if (nameEl) nameEl.textContent = badge.name || '';
    if (descEl) descEl.textContent = badge.description || '';

    popup.style.display = 'flex';

    if (closeBtn) {
      closeBtn.onclick = function() {
        popup.style.display = 'none';
      };
    }
    // 点击遮罩关闭
    popup.onclick = function(e) {
      if (e.target === popup) popup.style.display = 'none';
    };
  },

  // 是否为运动场建筑（供 mapCtrl 检测）
  enterSports: function() {
    var b = this.currentBuilding;
    return b && b.isSportsField;
  }
};