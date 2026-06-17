// 建筑数据（HTML版）
window.BUILDINGS = [
  {
    id: 'library',
    name: '图书馆',
    nameEn: 'Library',
    triggerZone: { x: 1190, y: 395, w: 120, h: 110 },
    interiorImage: window.ASSETS.BUILDING_DIR + 'library.png',
    badge: {
      id: 'badge_library',
      name: '图书馆徽章',
      image: window.ASSETS.BADGE_DIR + 'library-badge.png',
      description: '探索图书馆获得的荣誉徽章'
    },
    historyText: window.BUILDING_HISTORY.library
  },
  {
    id: 'pont',
    name: '天桥',
    nameEn: 'Pont',
    triggerZone: { x: 1480, y: 950, w: 60, h: 110 },
    interiorImage: window.ASSETS.BUILDING_DIR + 'pont.png',
    badge: {
      id: 'badge_pont',
      name: '天桥徽章',
      image: window.ASSETS.BADGE_DIR + 'pont-badge.png',
      description: '漫步天桥获得的荣誉徽章'
    },
    historyText: window.BUILDING_HISTORY.pont
  },
  {
    id: 'software',
    name: '软件学院',
    nameEn: 'School of Software',
    triggerZone: { x: 860, y: 650, w: 160, h: 90 },
    interiorImage: window.ASSETS.BUILDING_DIR + 'software.png',
    badge: {
      id: 'badge_software',
      name: '软件学院徽章',
      image: window.ASSETS.BADGE_DIR + 'software-badge.png',
      description: '参观软件学院获得的荣誉徽章'
    },
    historyText: window.BUILDING_HISTORY.software
  },
  {
    id: 'museum',
    name: '博物馆',
    nameEn: 'Museum',
    triggerZone: { x: 1230, y: 520, w: 120, h: 110 },
    interiorImage: window.ASSETS.BUILDING_DIR + 'museum.png',
    badge: {
      id: 'badge_museum',
      name: '博物馆徽章',
      image: window.ASSETS.BADGE_DIR + 'museum-badge.png',
      description: '探索博物馆获得的荣誉徽章'
    },
    historyText: window.BUILDING_HISTORY.museum
  },
  {
    id: 'lecture',
    name: '真知讲堂',
    nameEn: 'Zhenzhi Lecture Hall',
    triggerZone: { x: 455, y: 530, w: 120, h: 110 },
    interiorImage: window.ASSETS.BUILDING_DIR + 'lecture.png',
    badge: {
      id: 'badge_lecture',
      name: '真知讲堂徽章',
      image: window.ASSETS.BADGE_DIR + 'lecture-badge.png',
      description: '聆听真知获得的荣誉徽章'
    },
    historyText: window.BUILDING_HISTORY.lecture
  },
  {
    id: 'sports',
    name: '体育场馆',
    nameEn: 'Sports Center',
    triggerZone: { x: 1260, y: 131, w: 150, h: 120 },
    interiorImage: window.ASSETS.SPORTS_BG,
    badge: {
      id: 'badge_sports',
      name: '体育场馆徽章',
      image: window.ASSETS.BADGE_DIR + 'pont-badge.png',
      description: '进入体育场馆获得的荣誉徽章'
    },
    isSportsField: true,
    historyText: window.BUILDING_HISTORY.sports
  }
];

// 建筑查询工具
window.BuildingService = {
  getAllBuildings: function() {
    return window.BUILDINGS;
  },
  getBuildingById: function(id) {
    return window.BUILDINGS.find(function(b) { return b.id === id; });
  },
  // 检查某坐标是否在建筑触发区
  checkTrigger: function(x, y) {
    for (var i = 0; i < window.BUILDINGS.length; i++) {
      var b = window.BUILDINGS[i];
      var tz = b.triggerZone;
      if (x >= tz.x && x <= tz.x + tz.w && y >= tz.y && y <= tz.y + tz.h) {
        return b;
      }
    }
    return null;
  }
};