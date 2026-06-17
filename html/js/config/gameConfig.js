// 游戏配置（HTML版）
window.GAME_CONFIG = {
  PLAYER: {
    SPEED: 160,
    SIZE: 48,
    SPAWN_X: 1150,
    SPAWN_Y: 940
  },

  MAP: {
    WIDTH: 1893,
    HEIGHT: 1093
  },

  // 运动场地图配置
  SPORTS_MAP: {
    WIDTH: 949,
    HEIGHT: 1592,
    SPAWN_X: 474,
    SPAWN_Y: 1400
  },

  UI: {
    UPDATE_INTERVAL: 3,
    JOYSTICK_RADIUS: 45
  },

  ANIMATION: {
    FRAME_DURATION: 200,
    FRAME_COUNT: 2
  }
};

// 图片路径（相对于HTML文件位置）
window.ASSETS = {
  MAP_BG: 'images/map-bg.png',
  START_BG: 'images/start-bg.png',
  SPORTS_BG: 'images/map/sports-bg.png',
  BUILDING_DIR: 'images/buildings/',
  BADGE_DIR: 'images/badges/',
  BGM_START: 'audio/bgm.mp3',
  BGM_MAP: 'audio/bgm2.mp3'
};