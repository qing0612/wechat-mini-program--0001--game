const { computeCamera, worldToScreen } = require('../utils/camera.js');

describe('computeCamera', () => {
  test('地图小于视口时水平和垂直都居中', () => {
    const result = computeCamera(100, 100, 800, 600, 400, 300);
    expect(result.x).toBe(-200);
    expect(result.y).toBe(-150);
  });

  test('玩家在地图左侧边缘时相机停在0', () => {
    const result = computeCamera(0, 100, 800, 600, 2000, 1500);
    expect(result.x).toBe(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
  });

  test('玩家在地图右侧边缘时相机停在右侧边界', () => {
    const result = computeCamera(2000, 100, 800, 600, 2000, 1500);
    expect(result.x).toBe(1200);
  });

  test('玩家在地图顶部边缘时相机停在0', () => {
    const result = computeCamera(1000, 0, 800, 600, 2000, 1500);
    expect(result.y).toBe(0);
  });

  test('玩家在地图底部边缘时相机停在底部边界', () => {
    const result = computeCamera(1000, 1500, 800, 600, 2000, 1500);
    expect(result.y).toBe(900);
  });

  test('正常位置计算——玩家居中', () => {
    const result = computeCamera(1000, 750, 800, 600, 2000, 1500);
    expect(result.x).toBe(600);
    expect(result.y).toBe(450);
  });

  test('玩家在上半部分时相机贴顶', () => {
    const result = computeCamera(1000, 200, 800, 600, 2000, 1500);
    expect(result.y).toBe(0);
  });

  test('地图宽度等于视口宽度时水平居中为0', () => {
    const result = computeCamera(400, 100, 800, 600, 800, 1500);
    expect(result.x).toBe(0);
  });

  test('地图高度等于视口高度时垂直居中为0', () => {
    const result = computeCamera(100, 300, 800, 600, 2000, 600);
    expect(result.y).toBe(0);
  });
});

describe('worldToScreen', () => {
  test('基础坐标转换', () => {
    const cam = { x: 100, y: 50 };
    const result = worldToScreen(300, 200, cam);
    expect(result.x).toBe(200);
    expect(result.y).toBe(150);
  });

  test('相机在原点时坐标不变', () => {
    const cam = { x: 0, y: 0 };
    const result = worldToScreen(100, 200, cam);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
  });

  test('世界坐标在相机左侧时产生负坐标', () => {
    const cam = { x: 100, y: 50 };
    const result = worldToScreen(0, 0, cam);
    expect(result.x).toBe(-100);
    expect(result.y).toBe(-50);
  });

  test('大坐标转换', () => {
    const cam = { x: 5000, y: 3000 };
    const result = worldToScreen(5200, 3150, cam);
    expect(result.x).toBe(200);
    expect(result.y).toBe(150);
  });
});