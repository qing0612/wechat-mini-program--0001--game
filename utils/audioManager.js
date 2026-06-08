// 音频管理器单例
class AudioManager {
  constructor() {
    if (AudioManager.instance) {
      return AudioManager.instance;
    }
    this.innerAudioContext = null;
    this.isPlaying = false;
    // 从本地存储读取音量，默认为1（100%）
    this.volume = this.getStoredVolume();
    // 歌曲列表
    this.songs = {
      start: { id: 1, name: '开始页面音乐', src: '/audio/bgm.mp3' },
      map: { id: 2, name: '地图页面音乐', src: '/audio/bgm2.mp3' }
    };
    this.currentSongKey = null;
    // 静音状态设置（从本地存储读取）
    this.muteSettings = this.getStoredMuteSettings();
    AudioManager.instance = this;
  }

  // 从本地存储读取静音设置
  getStoredMuteSettings() {
    try {
      const stored = wx.getStorageSync('mute_settings');
      if (stored !== '') {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('读取静音设置失败:', e);
    }
    // 默认开启
    return {
      start: true,
      map: true
    };
  }

  // 保存静音设置到本地存储
  saveMuteSettings() {
    try {
      wx.setStorageSync('mute_settings', JSON.stringify(this.muteSettings));
    } catch (e) {
      console.error('保存静音设置失败:', e);
    }
  }

  // 从本地存储读取音量
  getStoredVolume() {
    try {
      const stored = wx.getStorageSync('game_volume');
      if (stored !== '') {
        return parseFloat(stored);
      }
    } catch (e) {
      console.error('读取音量设置失败:', e);
    }
    return 1; // 默认100%
  }

  // 将音量保存到本地存储
  saveVolume() {
    try {
      wx.setStorageSync('game_volume', this.volume.toString());
    } catch (e) {
      console.error('保存音量设置失败:', e);
    }
  }

  // 初始化音频上下文
  init() {
    if (this.innerAudioContext) return;
    
    this.innerAudioContext = wx.createInnerAudioContext();
    // 设置音频源（请将音乐文件放在 audio 目录）
    this.innerAudioContext.src = this.songs[this.currentSongKey]?.src || '/audio/bgm.mp3';
    this.innerAudioContext.volume = this.volume;
    this.innerAudioContext.loop = true; // 循环播放
    
    // 监听播放错误
    this.innerAudioContext.onError((err) => {
      console.error('音频播放错误:', err);
    });
    
    // 监听播放状态
    this.innerAudioContext.onPlay(() => {
      this.isPlaying = true;
    });
    
    this.innerAudioContext.onPause(() => {
      this.isPlaying = false;
    });
    
    this.innerAudioContext.onStop(() => {
      this.isPlaying = false;
    });
  }

  // 播放音频
  play() {
    if (!this.innerAudioContext) {
      this.init();
    }
    this.innerAudioContext.play().catch((err) => {
      console.error('播放失败:', err);
    });
  }

  // 暂停音频
  pause() {
    if (this.innerAudioContext && this.isPlaying) {
      this.innerAudioContext.pause();
    }
  }

  // 停止音频
  stop() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }

    this.isPlaying = false;  // 添加这一行
  }

  // 设置音量
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log('设置音量:', this.volume);
    if (this.innerAudioContext) {
      this.innerAudioContext.volume = this.volume;
      console.log('音频上下文音量:', this.innerAudioContext.volume);
    }
    // 保存到本地存储
    this.saveVolume();
  }

  // 切换到指定页面的歌曲
  playSong(key) {
    if (this.songs[key]) {
      this.currentSongKey = key;
      if (this.innerAudioContext) {
        this.innerAudioContext.src = this.songs[key].src;
        // 不自动播放，由调用者决定是否播放
      }
    }
    return this.songs[this.currentSongKey];
  }

  // 设置静音状态
  setMute(key, enabled) {
    if (this.muteSettings[key] !== undefined) {
      this.muteSettings[key] = enabled;
      // 保存到本地存储
      this.saveMuteSettings();
      // 如果当前播放的是被静音的歌曲，停止播放
      if (!enabled && this.currentSongKey === key) {
        this.stop();
        this.currentSongKey = null;
      }
    }
  }

  // 获取静音状态
  getMute(key) {
    return this.muteSettings[key] !== undefined ? this.muteSettings[key] : true;
  }

  // 根据静音设置播放音乐（每个页面只播放自己的音乐）
  playWithMuteCheck(key) {
    // 如果该页面的音乐被静音，停止播放并返回
    if (!this.muteSettings[key]) {
      this.stop();
      this.currentSongKey = null;
      return false;
    }
    // 如果当前播放的不是目标页面的音乐，先停止并切换
    if (this.currentSongKey !== key) {
      this.stop();
      this.playSong(key);
    }
    // 如果还没在播放，开始播放
    if (!this.isPlaying) {
      this.play();
    }
    return true;
  }

  // 销毁音频上下文
  destroy() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
      this.innerAudioContext = null;
      this.isPlaying = false;
    }
  }
}

// 创建单例实例
const audioManager = new AudioManager();

module.exports = audioManager;