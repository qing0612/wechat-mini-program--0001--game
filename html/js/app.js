// 主应用（HTML版·模块化）
// 设计：页面层只做组装 ——
//   - 切换页面（showPage，带像素过渡：低→高有动画，高→低/同级直接切换）
//   - 启停地图/运动场控制器
//   - 绑定全局导航按钮
//   - 订阅 gameStore 并同步 UI（进入建筑按钮、日夜/季节 HUD）
// 业务逻辑一律交给 controllers / renderers / store。
(function() {
  var currentPage = 'start';
  var previousPage = 'start';
  var mapCtrl = null;
  var sportsCtrl = null;
  var _navTimer = null;     // 动画进行中的定时器
  var _isNavigating = false; // 防止动画中重复触发

  function $(id) { return document.getElementById(id); }

  // ===== 页面切换（单一入口，与原小程序 navController 对齐） =====
  // 规则：
  //   低层级 → 高层级：显示像素进度条过渡（~0.2s）再切换
  //   高层级 → 低层级 / 同级：直接切换，无过渡
  function showPage(pageName) {
    if (_isNavigating) return;

    var getLevel = window.getNavLevel || function() { return -1; };
    var getTitle = window.getNavTitle || function(p) { return p; };

    var currentLevel = getLevel(currentPage);
    var targetLevel = getLevel(pageName);

    // 高→低 / 同级 / 未知层级：直接切换
    if (targetLevel === -1 || targetLevel <= currentLevel || currentLevel === -1) {
      _doSwitch(pageName);
      return;
    }

    // 低→高：执行像素过渡动画
    _isNavigating = true;
    var overlay = $('nav-transition');
    var bar = $('nav-bar-inner');
    var pctEl = $('nav-percent');
    var titleEl = $('nav-title');

    if (!overlay) { _doSwitch(pageName); _isNavigating = false; return; }

    if (titleEl) titleEl.textContent = getTitle(pageName);
    if (bar) bar.style.width = '0%';
    if (pctEl) pctEl.textContent = '0%';
    overlay.style.display = 'flex';

    var progress = 0;
    var step = 10;         // 每帧 +10%
    var interval = 20;     // 每 20ms 一帧 → 总计 ~0.2s
    var holdMs = 80;       // 动画完成后短暂停留

    _navTimer = setInterval(function() {
      progress += step;
      if (progress >= 100) {
        progress = 100;
        if (bar) bar.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';
        clearInterval(_navTimer);
        _navTimer = null;

        // 短暂停留后真正切换页面并隐藏遮罩
        setTimeout(function() {
          _doSwitch(pageName);
          setTimeout(function() {
            if (overlay) overlay.style.display = 'none';
            _isNavigating = false;
          }, 30);
        }, holdMs);
      } else {
        if (bar) bar.style.width = progress + '%';
        if (pctEl) pctEl.textContent = progress + '%';
      }
    }, interval);
  }

  function goBack() {
    // 返回前一页；如果前一页也是 settings/backpack 这类二级页面，兜底回到 map
    var fallback = 'map';
    var target = previousPage;
    if (target === 'settings' || target === 'backpack') {
      target = fallback;
    }
    showPage(target);
  }

  // ===== 真正执行页面切换（不带动画） =====
  function _doSwitch(pageName) {
    if (pageName !== currentPage) {
      previousPage = currentPage;
    }
    currentPage = pageName;
    _activatePageSection(pageName);
    _manageControllers(pageName);
    _initPageSpecific(pageName);
    _manageAudio(pageName);
  }

  function _activatePageSection(pageName) {
    var allPages = document.querySelectorAll('.page-section');
    for (var i = 0; i < allPages.length; i++) {
      allPages[i].classList.remove('active');
    }
    var target = $('page-' + pageName);
    if (target) target.classList.add('active');
  }

  function _manageControllers(pageName) {
    // 启动/停止主循环，确保同一时刻只有一个控制器在跑
    if (pageName === 'map') {
      if (mapCtrl) { mapCtrl.setSportsMode(false); mapCtrl.start(); }
      if (sportsCtrl) sportsCtrl.stop();
    } else if (pageName === 'sports') {
      if (sportsCtrl) { sportsCtrl.setSportsMode(true); sportsCtrl.start(); }
      if (mapCtrl) mapCtrl.stop();
    } else {
      if (mapCtrl) mapCtrl.stop();
      if (sportsCtrl) sportsCtrl.stop();
    }
  }

  function _initPageSpecific(pageName) {
    if (pageName === 'building') {
      window.BuildingController.init(window.gameStore.getState().currentBuilding);
    } else if (pageName === 'backpack') {
      window.BackpackController.init();
    } else if (pageName === 'settings') {
      window.SettingsController.init();
    } else if (pageName === 'start') {
      _syncContinueButton();
    }
  }

  function _manageAudio(pageName) {
    var audio = window.audioManager;
    if (pageName === 'start') audio.playWithMuteCheck('start');
    else if (pageName === 'map' || pageName === 'sports') audio.playWithMuteCheck('map');
    else audio.stop();
  }

  function _syncContinueButton() {
    var btn = $('continueGameBtn');
    if (!btn) return;
    btn.style.display = window.gameStore.hasSavedGame() ? '' : 'none';
  }

  // ===== UI 更新：进入建筑按钮 / 顶部 HUD =====
  function _syncEnterBuildingBtn() {
    var btn = $('enterBuildingBtn');
    if (!btn) return;
    var state = window.gameStore.getState();
    if (currentPage === 'map' && state.currentBuilding) {
      btn.style.display = 'block';
      btn.textContent = '进入「' + state.currentBuilding.name + '」';
    } else {
      btn.style.display = 'none';
    }
  }

  function _syncHUD() {
    var state = window.gameStore.getState();
    var dayEls = document.querySelectorAll('.day-night-indicator');
    for (var i = 0; i < dayEls.length; i++) {
      dayEls[i].textContent = state.isDay ? '☀️ 白天' : '🌙 夜晚';
    }
    var seasonNames = { spring: '🌸 春', summer: '☀️ 夏', autumn: '🍁 秋', winter: '❄️ 冬' };
    var seasonEls = document.querySelectorAll('.season-indicator');
    for (var j = 0; j < seasonEls.length; j++) {
      seasonEls[j].textContent = seasonNames[state.season] || '';
    }
  }

  function _syncSportsRouteBtn() {
    var btn = $('goToSportsBtn');
    if (!btn) return;
    var state = window.gameStore.getState();
    if (state.currentBuilding && state.currentBuilding.isSportsField) {
      btn.style.display = '';
    } else {
      btn.style.display = 'none';
    }
  }

  // ===== 全局导航绑定（按钮与页面切换解耦） =====
  function bindNav() {
    // 启动页：新旅程 / 继续探索
    var newGameBtn = $('newGameBtn');
    if (newGameBtn) newGameBtn.addEventListener('click', function() { showPage('map'); });

    var continueBtn = $('continueGameBtn');
    if (continueBtn) continueBtn.addEventListener('click', function() { showPage('map'); });

    // 建筑详情页 → 返回校园 / 进入运动场
    var backToMapBtn = $('backToMapBtn');
    if (backToMapBtn) backToMapBtn.addEventListener('click', function() { showPage('map'); });

    var goToSportsBtn = $('goToSportsBtn');
    if (goToSportsBtn) goToSportsBtn.addEventListener('click', function() { showPage('sports'); });

    var backFromSportsBtn = $('backFromSportsBtn');
    if (backFromSportsBtn) backFromSportsBtn.addEventListener('click', function() { showPage('building'); });

    // 通用导航按钮（data-goto="pageName" 或 data-goto="previous"）
    var navBtns = document.querySelectorAll('[data-goto]');
    for (var i = 0; i < navBtns.length; i++) {
      navBtns[i].addEventListener('click', function(e) {
        var target = e.currentTarget.getAttribute('data-goto');
        if (target === 'previous') {
          goBack();
        } else {
          showPage(target);
        }
      });
    }

    // 地图页：大按钮进入建筑
    var enterBtn = $('enterBuildingBtn');
    if (enterBtn) enterBtn.addEventListener('click', function() { showPage('building'); });

    // 重置玩家位置
    var resetPosBtn = $('resetPlayerBtn');
    if (resetPosBtn) resetPosBtn.addEventListener('click', function() {
      if (mapCtrl) mapCtrl.resetPlayerPosition();
    });
  }

  // ===== 摇杆视觉指示器（从 app.js 内联拆出，作为 UI 辅助方法） =====
  function _syncJoystickUI() {
    var ctrl = currentPage === 'sports' ? sportsCtrl : mapCtrl;
    if (!ctrl) return;
    var canvas = ctrl.canvas;
    if (!canvas) return;
    var base = canvas.parentElement.querySelector('.joystick-base');
    var stick = canvas.parentElement.querySelector('.joystick-stick');
    if (!base || !stick) return;

    var state = ctrl.getJoystickUIState();
    if (!state) { base.style.display = 'none'; return; }

    base.style.display = 'block';
    base.style.left = (state.baseX - 45) + 'px';
    base.style.top = (state.baseY - 45) + 'px';
    stick.style.left = (45 + state.offset.x - 25) + 'px';
    stick.style.top = (45 + state.offset.y - 25) + 'px';
  }

  // ===== 订阅 gameStore：状态变化 → 触发 UI 刷新 =====
  function bindStateListeners() {
    window.gameStore.subscribe(function() {
      _syncEnterBuildingBtn();
      _syncHUD();
      _syncSportsRouteBtn();
    });
  }

  // ===== 键盘快捷进入建筑（在 controller 之上的一层 UI 绑定） =====
  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', function(e) {
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        if (currentPage === 'map') {
          var state = window.gameStore.getState();
          if (state.currentBuilding) showPage('building');
        }
      }
    });
  }

  // ===== 主循环外的摇杆视觉刷新（轻量 rAF） =====
  function startJoystickUILoop() {
    function tick() {
      _syncJoystickUI();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ===== 初始化 =====
  function init() {
    // 地图控制器（校园地图）
    var mapCanvas = $('mapCanvas');
    if (mapCanvas) {
      mapCtrl = new window.MapController();
      mapCtrl.init(mapCanvas);
    }

    // 运动场控制器 —— 独立 Canvas，校园与运动场分别跑一套
    var sportsCanvas = $('sportsCanvas');
    if (sportsCanvas) {
      sportsCtrl = new window.MapController();
      sportsCtrl.init(sportsCanvas);
    }

    bindNav();
    bindStateListeners();
    bindKeyboardShortcuts();
    startJoystickUILoop();

    showPage('start');
  }

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露给全局（供 SettingsController 等在外部调用）
  window.App = {
    getCurrentPage: function() { return currentPage; },
    getPreviousPage: function() { return previousPage; },
    showPage: showPage,
    goBack: goBack,
    isNavigating: function() { return _isNavigating; }
  };
})();