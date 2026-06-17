// 设置页面控制器（HTML版）
window.SettingsController = {
  init: function() {
    this._syncUI();
    this._bindEvents();
  },

  _syncUI: function() {
    var state = window.gameStore.getState();

    // 日夜
    var dayCheckbox = document.getElementById('dayNightCheckbox');
    if (dayCheckbox) {
      dayCheckbox.checked = state.isDay;
    }
    var dayStatus = document.getElementById('dayNightStatus');
    if (dayStatus) dayStatus.textContent = state.isDay ? '白天' : '夜晚';

    // 季节按钮高亮
    var seasonButtons = document.querySelectorAll('[data-season]');
    for (var i = 0; i < seasonButtons.length; i++) {
      var btn = seasonButtons[i];
      if (btn.getAttribute('data-season') === state.season) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }

    // 音频开关
    var startCheckbox = document.getElementById('startAudioCheckbox');
    var mapCheckbox = document.getElementById('mapAudioCheckbox');
    if (startCheckbox) startCheckbox.checked = !!window.audioManager.getMute('start');
    if (mapCheckbox) mapCheckbox.checked = !!window.audioManager.getMute('map');

    // 音量
    var volumeInput = document.getElementById('volumeSlider');
    if (volumeInput) {
      volumeInput.value = window.audioManager.getVolume();
    }
    var volumeVal = document.getElementById('volumeValue');
    if (volumeVal) volumeVal.textContent = Math.round(window.audioManager.getVolume() * 100) + '%';
  },

  _bindEvents: function() {
    var self = this;

    var dayCheckbox = document.getElementById('dayNightCheckbox');
    if (dayCheckbox) {
      dayCheckbox.addEventListener('change', function() {
        window.gameStore.setIsDay(dayCheckbox.checked);
        self._syncUI();
      });
    }

    var seasonButtons = document.querySelectorAll('[data-season]');
    for (var i = 0; i < seasonButtons.length; i++) {
      seasonButtons[i].addEventListener('click', function(e) {
        var season = e.currentTarget.getAttribute('data-season');
        window.gameStore.setSeason(season);
        self._syncUI();
      });
    }

    var startCheckbox = document.getElementById('startAudioCheckbox');
    if (startCheckbox) {
      startCheckbox.addEventListener('change', function() {
        window.audioManager.setMute('start', startCheckbox.checked);
        if (startCheckbox.checked && App.getCurrentPage() === 'start') {
          window.audioManager.playWithMuteCheck('start');
        }
      });
    }

    var mapCheckbox = document.getElementById('mapAudioCheckbox');
    if (mapCheckbox) {
      mapCheckbox.addEventListener('change', function() {
        window.audioManager.setMute('map', mapCheckbox.checked);
        if (mapCheckbox.checked && (App.getCurrentPage() === 'map' || App.getCurrentPage() === 'sports')) {
          window.audioManager.playWithMuteCheck('map');
        }
      });
    }

    var volumeInput = document.getElementById('volumeSlider');
    if (volumeInput) {
      volumeInput.addEventListener('input', function() {
        window.audioManager.setVolume(parseFloat(volumeInput.value));
        self._syncUI();
      });
    }

    var resetBtn = document.getElementById('resetGameBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        var confirm = window.confirm('确定要重置游戏吗？所有进度将被清除！');
        if (confirm) {
          window.gameStore.resetGame();
          self._syncUI();
          window.audioManager.stop();
        }
      });
    }
  }
};