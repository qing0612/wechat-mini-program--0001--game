// controllers/index.js
// 控制器统一入口

const CanvasBootstrap = require('./canvasBootstrap.js');
const PlayerController = require('./playerController.js');
const BuildingController = require('./buildingController.js');
const ProgressLoader = require('./progressLoader.js');
const GameTimer = require('./gameTimer.js');
const WeatherManager = require('./weatherManager.js');
const TouchDispatcher = require('./touchDispatcher.js');
const NavController = require('./navController.js');
const MapController = require('./mapController.js');
const SportsController = require('./sportsController.js');

module.exports = {
  CanvasBootstrap,
  PlayerController,
  BuildingController,
  ProgressLoader,
  GameTimer,
  WeatherManager,
  TouchDispatcher,
  NavController,
  MapController,
  SportsController
};