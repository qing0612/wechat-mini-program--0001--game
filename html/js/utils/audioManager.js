// 音频管理器（HTML版）
window.audioManager = (function() {
  var VOLUME_KEY = 'game_volume_html';
  var MUTE_KEY = 'game_mute_html';

  function AudioManager() {
    this.audio = {};
    this.currentKey = null;
    this.isPlaying = false;
    this.volume = this._getStoredVolume();
    this.mute = this._getStoredMute();
    this.errorState = {};
  }

  AudioManager.prototype._getStoredVolume = function() {
    try {
      var v = parseFloat(localStorage.getItem(VOLUME_KEY));
      if (!isNaN(v)) return v;
    } catch (e) {}
    return 1;
  };

  AudioManager.prototype._getStoredMute = function() {
    try {
      var raw = localStorage.getItem(MUTE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { start: true, map: true };
  };

  AudioManager.prototype._saveVolume = function() {
    try { localStorage.setItem(VOLUME_KEY, String(this.volume)); } catch (e) {}
  };

  AudioManager.prototype._saveMute = function() {
    try { localStorage.setItem(MUTE_KEY, JSON.stringify(this.mute)); } catch (e) {}
  };

  AudioManager.prototype.init = function() {
    // 不预加载音频文件，避免不支持音频的环境出错
  };

  // 懒加载音频元素
  AudioManager.prototype._getAudio = function(key) {
    if (!this.audio[key]) {
      try {
        var src = key === 'start' ? window.ASSETS.BGM_START : window.ASSETS.BGM_MAP;
        var a = new Audio();
        a.src = src;
        a.loop = true;
        a.volume = this.volume;
        a.preload = 'none';
        var self = this;
        a.addEventListener('error', function() {
          self.errorState[key] = true;
        });
        a.addEventListener('playing', function() { self.isPlaying = true; });
        a.addEventListener('pause', function() { self.isPlaying = false; });
        this.audio[key] = a;
      } catch (e) {
        return null;
      }
    }
    return this.audio[key];
  };

  AudioManager.prototype.playWithMuteCheck = function(key) {
    if (!this.mute[key]) {
      this.stop();
      this.currentKey = null;
      return false;
    }
    var a = this._getAudio(key);
    if (!a || this.errorState[key]) return false;

    if (this.currentKey !== key) {
      this.stop();
      this.currentKey = key;
    }

    a.volume = this.volume;
    var p = a.play();
    if (p && p.catch) {
      p.catch(function() { /* 自动播放被浏览器阻止 */ });
    }
    this.isPlaying = true;
    return true;
  };

  AudioManager.prototype.stop = function() {
    if (this.currentKey && this.audio[this.currentKey]) {
      try {
        this.audio[this.currentKey].pause();
        this.audio[this.currentKey].currentTime = 0;
      } catch (e) {}
    }
    this.isPlaying = false;
  };

  AudioManager.prototype.pause = function() {
    this.stop();
  };

  AudioManager.prototype.setVolume = function(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._saveVolume();
    for (var k in this.audio) {
      if (this.audio[k] && this.audio[k].volume !== undefined) {
        try { this.audio[k].volume = this.volume; } catch (e) {}
      }
    }
  };

  AudioManager.prototype.getVolume = function() {
    return this.volume;
  };

  AudioManager.prototype.setMute = function(key, enabled) {
    this.mute[key] = enabled;
    this._saveMute();
    if (!enabled && this.currentKey === key) {
      this.stop();
      this.currentKey = null;
    }
  };

  AudioManager.prototype.getMute = function(key) {
    return this.mute[key] !== undefined ? this.mute[key] : true;
  };

  return new AudioManager();
})();