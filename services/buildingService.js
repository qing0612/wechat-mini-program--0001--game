// c:\Users\yibohe\Desktop\小程序-代码\services\buildingService.js
const { BUILDINGS } = require('../data/buildings.js');

class BuildingService {
  constructor() {
    this.buildings = BUILDINGS;
  }

  getBuildingById(id) {
    return this.buildings.find(b => b.id === id);
  }

  getAllBuildings() {
    return [...this.buildings];
  }

  checkBuildingTrigger(playerX, playerY) {
    for (const building of this.buildings) {
      const zone = building.triggerZone;
      if (
        playerX >= zone.x &&
        playerX <= zone.x + zone.w &&
        playerY >= zone.y &&
        playerY <= zone.y + zone.h
      ) {
        return building;
      }
    }
    return null;
  }

  getCollisionZones() {
    return this.buildings.map(b => b.collisionZone);
  }

  getBuildingNames() {
    return this.buildings.map(b => ({ id: b.id, name: b.name, nameEn: b.nameEn }));
  }
}

module.exports = new BuildingService();