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
    this.currentSongKey = 'start';
    // 静音状态设置
    this.muteSettings = {
      start: true,  // start页面音乐是否开启
      map: true     // map页面音乐是否开启
    };
    AudioManager.instance = this;
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

  // 获取播放状态
  getPlayingState() {
    return this.isPlaying;
  }

  // 获取当前歌曲信息
  getCurrentSong() {
    return this.songs[this.currentSongKey];
  }

  // 获取歌曲列表
  getSongs() {
    return this.songs;
  }

  // 切换到指定页面的歌曲
  playSong(key) {
    if (this.songs[key]) {
      this.currentSongKey = key;
      if (this.innerAudioContext) {
        const wasPlaying = this.isPlaying;
        this.innerAudioContext.src = this.songs[key].src;
        if (wasPlaying) {
          this.innerAudioContext.play().catch((err) => {
            console.error('播放失败:', err);
          });
        }
      }
    }
    return this.songs[this.currentSongKey];
  }

  // 设置静音状态
  setMute(key, enabled) {
    if (this.muteSettings[key] !== undefined) {
      this.muteSettings[key] = enabled;
      // 如果当前播放的是被静音的歌曲，暂停播放
      if (!enabled && this.currentSongKey === key) {
        this.pause();
      }
    }
  }

  // 获取静音状态
  getMute(key) {
    return this.muteSettings[key] !== undefined ? this.muteSettings[key] : true;
  }

  // 根据静音设置播放音乐
  playWithMuteCheck(key) {
    if (this.muteSettings[key]) {
      this.playSong(key);
      this.play();
      return true;
    }
    return false;
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