// 背包页面控制器（HTML版）
window.BackpackController = {
  init: function() {
    this.renderBackpack();
  },

  renderBackpack: function() {
    var container = document.getElementById('badgeGrid');
    if (!container) return;
    container.innerHTML = '';

    var backpack = window.gameStore.getBackpack();
    var buildings = window.buildingService.getAll();
    var totalCount = buildings.length;

    // 标题计数
    var title = document.getElementById('backpackTitle');
    if (title) title.textContent = '我的徽章 (' + backpack.length + '/' + totalCount + ')';

    // 已获得徽章
    for (var i = 0; i < backpack.length; i++) {
      var item = backpack[i];
      var card = this._createCard(item, true);
      container.appendChild(card);
    }

    // 未获得的显示为占位
    for (var j = 0; j < buildings.length; j++) {
      var b = buildings[j];
      if (b.badge && !window.gameStore.hasBadge(b.badge.id)) {
        var placeholder = this._createCard({
          name: b.name,
          description: '继续探索以获得',
          image: ''
        }, false);
        container.appendChild(placeholder);
      }
    }

    // 统计
    var statsContainer = document.getElementById('backpackStats');
    if (statsContainer) {
      var state = window.gameStore.getState();
      statsContainer.innerHTML =
        '<div class="stats-row"><span>总步数</span><span>' + state.stats.totalSteps + '</span></div>' +
        '<div class="stats-row"><span>探索建筑</span><span>' + state.stats.buildingsVisited + ' 座</span></div>' +
        '<div class="stats-row"><span>收集徽章</span><span>' + state.stats.badgesCollected + ' 个</span></div>';
    }
  },

  _createCard: function(item, isOwned) {
    var card = document.createElement('div');
    card.className = 'badge-card' + (isOwned ? '' : ' badge-card-locked');

    var imgWrap = document.createElement('div');
    imgWrap.className = 'badge-card-img';
    if (item.image && isOwned) {
      var img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      imgWrap.appendChild(img);
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'badge-card-placeholder';
      placeholder.textContent = '?';
      imgWrap.appendChild(placeholder);
    }

    var titleEl = document.createElement('div');
    titleEl.className = 'badge-card-title';
    titleEl.textContent = item.name;

    var descEl = document.createElement('div');
    descEl.className = 'badge-card-desc';
    descEl.textContent = item.description || '';

    card.appendChild(imgWrap);
    card.appendChild(titleEl);
    card.appendChild(descEl);
    return card;
  }
};