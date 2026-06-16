// _test_full_chain.js
// 快速验证：模块化后所有 require 路径都能正确解析（用于 Node 环境自检）
// 运行：node _test_full_chain.js

const ok = [];
const failed = [];

function test(label, fn) {
  try {
    const r = fn();
    ok.push(label + ' ✔');
    return r;
  } catch (e) {
    failed.push(label + ' ✘: ' + e.message);
    return null;
  }
}

// === store 层 ===
const gameStore = test('store/index.js', () => require('./store/index.js'));
test('  gameStore.getState()', () => {
  const state = gameStore.gameStore.getState();
  if (!state || typeof state !== 'object') throw new Error('state empty');
  return state;
});
test('  gameStore.updatePlayerPos()', () => {
  gameStore.gameStore.updatePlayerPos(100, 100);
  return true;
});
test('  gameStore.updateSportsPlayer()', () => {
  gameStore.gameStore.updateSportsPlayer(500, 300, 'up');
  return true;
});

// === data & services 层 ===
const buildings = test('data/buildings.js', () => require('./data/buildings.js'));
const services = test('services/index.js', () => require('./services/index.js'));
test('  buildingService.getAllBuildings()', () =>
  services.buildingService.getAllBuildings());
test('  buildingService.checkBuildingTrigger()', () =>
  services.buildingService.checkBuildingTrigger(50, 50));

// === config 层 ===
const cfg = test('config/index.js', () => require('./config/index.js'));
test('  config.PLAYER', () => cfg.PLAYER);
test('  config.MAP', () => cfg.MAP);
test('  config.SPORTS_MAP', () => cfg.SPORTS_MAP);
test('  config.UI.UPDATE_INTERVAL', () => {
  if (!cfg.UI || !cfg.UI.UPDATE_INTERVAL) throw new Error('UPDATE_INTERVAL missing');
  return cfg.UI.UPDATE_INTERVAL;
});
test('  config.ANIMATION', () => cfg.ANIMATION);

// === utils 层 ===
const utils = test('utils/index.js', () => require('./utils/index.js'));
test('  utils.sprite', () => utils.sprite);
test('  utils.camera.computeCamera()', () =>
  utils.camera.computeCamera(100, 100, 375, 600, 1893, 1093));
test('  utils.sprite.SpriteAnimator', () =>
  new utils.sprite.SpriteAnimator({ frameCount: 4, frameDuration: 100 }));
test('  utils.sprite.drawPlayer (no canvas, just invoke with stub)', () => {
  const ctx = {
    fillStyle: '',
    fillRect: () => {}
  };
  utils.sprite.drawPlayer(ctx, 50, 50, true, 0, 'down');
  return true;
});

// === renderers 层 ===
const renderers = test('renderers/index.js', () => require('./renderers/index.js'));
test('  campusRenderer.renderCampus (stub ctx)', () => {
  const ctx = new Proxy({ fillStyle: '', strokeStyle: '', lineWidth: 0 }, {
    get: (t, k) => (typeof t[k] !== 'undefined' ? t[k] : (() => {}))
  });
  renderers.campusRenderer.renderCampus(ctx, {
    cam: { x: 0, y: 0, scale: 1 },
    mapImg: null,
    mapLoaded: false,
    isDay: true,
    viewW: 375, viewH: 600,
    dpr: 2,
    mapW: 1893, mapH: 1093
  });
  return true;
});
test('  sportsRenderer.renderSports (stub ctx)', () => {
  const ctx = { save: () => {}, restore: () => {}, fillStyle: '', fillRect: () => {}, drawImage: () => {}, scale: () => {} };
  renderers.sportsRenderer.renderSports(ctx, {
    cam: { x: 0, y: 0, scale: 1 },
    mapImg: null,
    mapLoaded: false,
    dpr: 2,
    viewW: 375, viewH: 600,
    mapW: 1893, mapH: 1093
  });
  return true;
});

// === controllers 层（注意：有些依赖 wx，在 Node 下不实际调用生命周期）===
const controllers = test('controllers/index.js', () => require('./controllers/index.js'));
test('  controllers.CanvasBootstrap', () => controllers.CanvasBootstrap);
test('  controllers.PlayerController', () => {
  const PlayerController = controllers.PlayerController;
  return new PlayerController({
    mapSize: { width: 1893, height: 1093 },
    playerSize: 48,
    speed: 160,
    spawnX: 100, spawnY: 100,
    spawnDir: 'down',
    dirFromVector: (x, y) => Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up')
  });
});
test('  controllers.BuildingController', () => controllers.BuildingController);
test('  controllers.ProgressLoader', () => controllers.ProgressLoader);
test('  controllers.GameTimer', () => controllers.GameTimer);
test('  controllers.WeatherManager', () => controllers.WeatherManager);
test('  controllers.TouchDispatcher', () => controllers.TouchDispatcher);

console.log('\n==============================');
console.log('  测试结果：' + ok.length + ' 通过，' + failed.length + ' 失败');
console.log('==============================\n');
if (failed.length > 0) {
  console.log('✘ 失败项：');
  failed.forEach(f => console.log('  ' + f));
  console.log('');
  process.exit(1);
} else {
  console.log('✔ 所有模块 require + 基本调用都通过！');
  console.log('');
  process.exit(0);
}