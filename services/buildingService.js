// services/buildingService.js
// 建筑数据服务：查询、触发区域检测、徽章匹配
//
// 设计：
//   - 仅依赖 data/buildings.js（静态数据），不依赖 gameStore
//   - checkBuildingTrigger 使用矩形区域 + 中心点距离两种判定
//   - getBuildingById 返回不可变的建筑对象（调用方只读）

const { BUILDINGS } = require('../data/buildings.js');
const buildingHistory = require('../data/buildingHistory.js');

function cloneBuilding(b) {
  return b ? JSON.parse(JSON.stringify(b)) : null;
}

class BuildingService {
  constructor() {
    this._buildings = BUILDINGS;
  }

  getAll() {
    return this._buildings.map(cloneBuilding);
  }

  // 兼容旧代码：getAllBuildings() 等价于 getAll()
  getAllBuildings() {
    return this.getAll();
  }

  getById(id) {
    const b = this._buildings.find((x) => x.id === id);
    return cloneBuilding(b);
  }

  // 兼容旧代码：building.js 使用 getBuildingById
  getBuildingById(id) {
    return this.getById(id);
  }

  getByName(name) {
    if (!name) return null;
    const b = this._buildings.find((x) => x.name === name);
    return cloneBuilding(b);
  }

  getByBadgeId(badgeId) {
    // x.badge 是对象 { id, name, image, description }，需要比较 x.badge.id
    const b = this._buildings.find((x) => x.badge && x.badge.id === badgeId);
    return cloneBuilding(b);
  }

  getTriggerZone(id) {
    const b = this._buildings.find((x) => x.id === id);
    if (!b || !b.triggerZone) return null;
    return { ...b.triggerZone };
  }

  // 检测玩家是否在某建筑触发区域内；返回第一个命中的建筑
  checkBuildingTrigger(playerX, playerY) {
    if (typeof playerX !== 'number' || typeof playerY !== 'number') return null;
    for (const b of this._buildings) {
      const z = b.triggerZone;
      if (!z) continue;
      if (playerX >= z.x && playerX <= z.x + z.w && playerY >= z.y && playerY <= z.y + z.h) {
        return cloneBuilding(b);
      }
    }
    return null;
  }

  // 查找最近的建筑（用于 UI 提示"靠近 xxx 建筑"）
  findNearest(playerX, playerY, maxDistance) {
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const b of this._buildings) {
      const z = b.triggerZone;
      if (!z) continue;
      const cx = z.x + z.w / 2;
      const cy = z.y + z.h / 2;
      const dx = cx - playerX;
      const dy = cy - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = { building: cloneBuilding(b), distance: dist };
      }
    }
    if (!best) return null;
    if (typeof maxDistance === 'number' && best.distance > maxDistance) return null;
    return best;
  }

  // 统计总建筑数 / 已访问数（通过传入已收集的徽章 ID 列表）
  summary(collectedBadgeIds) {
    const set = Array.isArray(collectedBadgeIds) ? new Set(collectedBadgeIds) : new Set();
    const total = this._buildings.length;
    let visited = 0;
    for (const b of this._buildings) {
      if (b.badge && set.has(b.badge)) visited++;
    }
    return { total, visited, remaining: total - visited };
  }

  // 从建筑历史中获取介绍信息（备用字段，用于未来扩展）
  getHistory(id) {
    if (!buildingHistory || typeof buildingHistory.getByBuildingId !== 'function') return null;
    return buildingHistory.getByBuildingId(id);
  }
}

module.exports = new BuildingService();