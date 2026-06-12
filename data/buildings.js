const HISTORY_TEXTS = require('./buildingHistory.js');

const BUILDINGS = [
  {
    id: 'library',
    name: '图书馆',
    nameEn: 'Library',
    triggerZone: { x: 1190, y: 395, w: 120, h: 110 },
    // 碰撞区域（不可穿越的建筑实体），略大于触发区，覆盖建筑轮廓
    collisionZone: { x: 1155, y: 400, w: 150, h: 140 },
    interiorImage: '/images/buildings/library.png',
    badge: { id: 'badge_library', name: '图书馆徽章', image: '/images/badges/library-badge.png', description: '探索图书馆获得的荣誉徽章' },
    historyText: HISTORY_TEXTS.library
  },
  {
    id: 'pont',
    name: '天桥',
    nameEn: 'Pont',
    triggerZone: { x: 1480, y: 950, w: 60, h: 110 },
    collisionZone: { x: 1470, y: 935, w: 80, h: 140 },
    interiorImage: '/images/buildings/pont.png',
    badge: { id: 'badge_pont', name: '天桥徽章', image: '/images/badges/pont-badge.png', description: '漫步天桥获得的荣誉徽章' },
    historyText: HISTORY_TEXTS.pont
  },
  {
    id: 'software',
    name: '软件学院',
    nameEn: 'School of Software',
    triggerZone: { x: 860, y: 650, w: 160, h: 90 },
    collisionZone: { x: 845, y: 635, w: 190, h: 120 },
    interiorImage: '/images/buildings/software.png',
    badge: { id: 'badge_software', name: '软件学院徽章', image: '/images/badges/software-badge.png', description: '参观软件学院获得的荣誉徽章' },
    historyText: HISTORY_TEXTS.software
  },
  {
    id: 'museum',
    name: '博物馆',
    nameEn: 'Museum',
    triggerZone: { x: 1230, y: 520, w: 120, h: 110 },
    collisionZone: { x: 1215, y: 495, w: 150, h: 140 },
    interiorImage: '/images/buildings/museum.png',
    badge: { id: 'badge_museum', name: '博物馆徽章', image: '/images/badges/museum-badge.png', description: '探索博物馆获得的荣誉徽章' },
    historyText: HISTORY_TEXTS.museum
  },
  {
    id: 'lecture',
    name: '真知讲堂',
    nameEn: 'Zhenzhi Lecture Hall',
    triggerZone: { x: 455, y: 530, w: 120, h: 110 },
    collisionZone: { x: 440, y: 515, w: 150, h: 140 },
    interiorImage: '/images/buildings/lecture.png',
    badge: { id: 'badge_lecture', name: '真知讲堂徽章', image: '/images/badges/lecture-badge.png', description: '聆听真知获得的荣誉徽章' },
    historyText: HISTORY_TEXTS.lecture
  },
  {
    id: 'sports',
    name: '体育场馆',
    nameEn: 'Sports Center',
    triggerZone: { x: 1260, y: 131, w: 150, h: 120 },
    collisionZone: { x: 185, y: 685, w: 180, h: 150 },
    interiorImage: '/images/map/sports-bg.png',
    badge: { id: 'badge_sports', name: '体育场馆徽章', image: '/images/badges/pont-badge.png', description: '进入体育场馆获得的荣誉徽章' },
    // 特殊标识：进入此建筑跳转到运动场地图
    isSportsField: true,
    historyText: HISTORY_TEXTS.sports
  }
];

// 障碍物列表：不可穿越区域（建筑实体、围墙等）
// 建筑不再作为障碍物——玩家可以走进建筑范围，触发进入弹框
// 如需添加非建筑障碍物（如围墙、水池等），在此数组中手动添加
const OBSTACLES = [];

// 北门出生点:图1中"北门"标注位置下方
const SPAWN = { x: 940, y: 960 };

// 地图尺寸:匹配实际图片 1893×1093
const MAP_SIZE = { w: 1893, h: 1093 };

module.exports = { BUILDINGS, OBSTACLES, SPAWN, MAP_SIZE };