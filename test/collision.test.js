const { pointInRect, findActiveBuilding, rectCollides, resolveCollision } = require('../utils/collision.js');

describe('pointInRect', () => {
  test('点在矩形中心返回 true', () => {
    expect(pointInRect(50, 50, { x: 0, y: 0, w: 100, h: 100 })).toBe(true);
  });

  test('点在矩形左上角边界返回 true', () => {
    expect(pointInRect(0, 0, { x: 0, y: 0, w: 100, h: 100 })).toBe(true);
  });

  test('点在矩形右下角边界返回 true', () => {
    expect(pointInRect(100, 100, { x: 0, y: 0, w: 100, h: 100 })).toBe(true);
  });

  test('点在矩形外返回 false', () => {
    expect(pointInRect(150, 50, { x: 0, y: 0, w: 100, h: 100 })).toBe(false);
  });

  test('点在矩形上方返回 false', () => {
    expect(pointInRect(50, -10, { x: 0, y: 0, w: 100, h: 100 })).toBe(false);
  });

  test('偏移矩形内的点返回 true', () => {
    expect(pointInRect(250, 150, { x: 200, y: 100, w: 100, h: 100 })).toBe(true);
  });
});

describe('findActiveBuilding', () => {
  const buildings = [
    { id: 'a', triggerZone: { x: 0, y: 0, w: 100, h: 100 } },
    { id: 'b', triggerZone: { x: 200, y: 200, w: 100, h: 100 } },
    { id: 'c', triggerZone: { x: 400, y: 0, w: 100, h: 100 } }
  ];

  test('玩家在建筑a的触发区返回建筑a', () => {
    const result = findActiveBuilding(50, 50, buildings);
    expect(result).toBe(buildings[0]);
  });

  test('玩家在建筑b的触发区返回建筑b', () => {
    const result = findActiveBuilding(250, 250, buildings);
    expect(result).toBe(buildings[1]);
  });

  test('玩家不在任何建筑的触发区返回 null', () => {
    const result = findActiveBuilding(150, 150, buildings);
    expect(result).toBeNull();
  });

  test('空建筑列表返回 null', () => {
    const result = findActiveBuilding(50, 50, []);
    expect(result).toBeNull();
  });
});

describe('rectCollides', () => {
  const obstacles = [
    { x: 0, y: 0, w: 100, h: 100 },
    { x: 200, y: 200, w: 50, h: 50 }
  ];

  test('玩家完全在障碍物内返回 true', () => {
    expect(rectCollides(50, 50, 20, 20, obstacles)).toBe(true);
  });

  test('玩家部分重叠返回 true', () => {
    expect(rectCollides(90, 50, 20, 20, obstacles)).toBe(true);
  });

  test('玩家不在障碍物内返回 false', () => {
    expect(rectCollides(150, 150, 20, 20, obstacles)).toBe(false);
  });

  test('玩家紧贴障碍物不接触返回 false', () => {
    expect(rectCollides(110, 50, 10, 10, obstacles)).toBe(false);
  });

  test('空障碍物列表返回 false', () => {
    expect(rectCollides(50, 50, 20, 20, [])).toBe(false);
  });

  test('与第二个障碍物碰撞返回 true', () => {
    expect(rectCollides(225, 225, 20, 20, obstacles)).toBe(true);
  });
});

describe('resolveCollision', () => {
  const obstacles = [
    { x: 0, y: 0, w: 100, h: 100 }
  ];

  test('无碰撞时玩家移动到目标位置', () => {
    const result = resolveCollision(200, 200, 300, 300, 20, 20, obstacles);
    expect(result.x).toBe(300);
    expect(result.y).toBe(300);
  });

  test('水平方向碰撞时x坐标不变', () => {
    const result = resolveCollision(150, 150, 50, 150, 20, 20, obstacles);
    expect(result.x).toBe(150);
    expect(result.y).toBe(150);
  });

  test('垂直方向碰撞时y坐标不变', () => {
    const result = resolveCollision(150, 150, 150, 50, 20, 20, obstacles);
    expect(result.x).toBe(150);
    expect(result.y).toBe(150);
  });

  test('无障碍物时玩家自由移动', () => {
    const result = resolveCollision(10, 10, 200, 200, 20, 20, []);
    expect(result.x).toBe(200);
    expect(result.y).toBe(200);
  });
});