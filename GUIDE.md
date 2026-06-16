# 模块化开发指南

本文档说明如何以**模块化方式**开发本项目。核心原则：

> **新增功能 = 新增独立文件 + 在对应 `index.js` 登记 + 在页面几行引用 + 完成**
>
> 不要把业务逻辑堆在 `pages/*.js` 中。页面只负责「组装」，不负责「实现」。

---

## 一、项目分层架构

```
项目根/
├─ pages/           ← 页面层（只组装，不实现业务逻辑）
│  ├─ map/map.js       校园地图页：组装 CanvasBootstrap + PlayerController + ...
│  ├─ sports/sports.js 运动场子地图页：组装同上，但用 sportsRenderer
│  ├─ building/        建筑详情页
│  ├─ backpack/        背包页
│  ├─ settings/        设置页
│  └─ start/           启动页
│
├─ controllers/     ← 控制器层（业务逻辑 + 状态更新）
│  ├─ canvasBootstrap.js   Canvas 初始化 / 重试 / 缩放
│  ├─ playerController.js  玩家移动 / 边界 / 方向 / 防抖保存
│  ├─ buildingController.js 建筑触发检测 / 弹窗 / 冷却
│  ├─ progressLoader.js    像素风加载进度条
│  ├─ gameTimer.js         游戏计时器（00:00）
│  ├─ weatherManager.js    季节 → 天气（雨/雪/无）
│  ├─ touchDispatcher.js   触摸 → 摇杆事件分发
│  └─ index.js             ✅ 统一入口（所有控制器从此文件导出）
│
├─ renderers/       ← 渲染层（纯函数，不持有状态）
│  ├─ campusRenderer.js    校园地图：背景图 / 占位网格 / 触发区 / 日夜遮罩
│  ├─ sportsRenderer.js    运动场地图：独立渲染
│  └─ index.js             ✅ 统一入口
│
├─ store/           ← 状态层（单例 + 订阅发布）
│  ├─ gameStore.js         主入口：getState/setState/updatePlayerPos/resetGame...
│  ├─ backpack.js          徽章/物品增删查
│  ├─ stats.js             步数/建筑/徽章统计（getter 只读）
│  ├─ persistence.js       本地存储 + 云同步封装
│  └─ index.js             ✅ 统一入口
│
├─ services/        ← 服务层（封装数据访问）
│  ├─ buildingService.js   建筑查询 + 触发检测
│  └─ index.js             ✅ 统一入口
│
├─ utils/           ← 工具层（纯工具/类库，不耦合业务）
│  ├─ joystick.js          虚拟摇杆
│  ├─ camera.js            摄像机 / 坐标转换
│  ├─ collision.js         AABB 碰撞检测
│  ├─ sprite.js            玩家绘制 + 帧动画
│  ├─ weatherEffect.js     雨/雪粒子系统
│  ├─ audioManager.js      分页面音频管理（单例）
│  ├─ cloudSync.js         云存档（可选）
│  ├─ logger.js            统一日志（接入微信实时日志）
│  └─ index.js             ✅ 统一入口
│
├─ config/          ← 配置层（纯数据，无逻辑）
│  ├─ player.js            玩家参数（速度/尺寸/出生点）
│  ├─ map.js               主地图参数（宽度/高度/出生点）
│  ├─ sportsMap.js         运动场地图参数
│  ├─ ui.js                UI 参数（摇杆半径/更新间隔）
│  ├─ animation.js         动画参数（帧数/帧时长）
│  ├─ gameConfig.js        兼容旧版（保留以便搜索）
│  └─ index.js             ✅ 统一入口
│
├─ data/            ← 数据层（游戏内容数据）
│  ├─ buildings.js         6 座建筑的配置（triggerZone/badge/interiorImage）
│  ├─ buildingHistory.js   建筑历史文案（文案唯一来源）
│  └─ index.js             ✅ 统一入口
│
└─ styles/
   └─ pixel-theme.wxss     像素风主题样式
```

---

## 二、模块化开发核心原则

### 原则 1：单一职责

每个文件只做一件事。

| 层 | 能做什么 | 不能做什么 |
|----|---------|-----------|
| `pages/*.js` | 组装各层模块、管理页面生命周期、绑定 UI 事件 | 直接写业务逻辑、写大段 Canvas 绘制代码 |
| `controllers/*.js` | 业务流程控制、状态更新、事件分发 | 直接写渲染逻辑（绘制函数放 `renderers/`） |
| `renderers/*.js` | 纯绘制函数，接收 ctx + options 输出画面 | 持有状态、更新 gameStore、读写 Storage |
| `store/*.js` | 状态管理 + 订阅发布 + 持久化 | 包含页面相关逻辑、依赖 Canvas |
| `utils/*.js` | 纯工具/类库 | 依赖业务数据（如具体建筑配置） |
| `config/*.js` | 纯数据导出 | 包含业务逻辑代码 |

### 原则 2：统一入口

每一层都有 `index.js` 作为统一入口。添加新模块时：

1. 新建模块文件（如 `controllers/xxxController.js`）
2. 在该层的 `index.js` 中添加一行导出
3. 在页面文件顶部 require 时，从 `index.js` 获取

**正确示例（从统一入口引入）：**

```javascript
// pages/map/map.js
const { PlayerController, WeatherManager } = require('../../controllers/index.js');
const { gameStore } = require('../../store/index.js');
const { PLAYER, MAP } = require('../../config/index.js');
```

**错误示例（散落 require）：**

```javascript
// ❌ 不要这么写：散落 require 单文件
const PlayerController = require('../../controllers/playerController.js');
const MAP = require('../../config/map.js');
```

### 原则 3：类设计规范

控制器推荐用 **类（Class）**，构造函数接收 `options`，对外暴露明确方法。

**推荐模板（`controllers/xxxController.js`）：**

```javascript
// controllers/xxxController.js
// 一句话说明职责
//
// 设计：
//   - 要点1（例如：不持有状态，每次调用接收 options）
//   - 要点2（例如：通过 onXxx 回调与调用方通信）
class XxxController {
  constructor(options = {}) {
    // 只做初始化，不执行副作用（如 setData、调用 API）
    this.xxx = options.xxx || defaultValue;
    this._onEvent = options.onEvent || null;
  }

  // 对外方法（动词开头）
  update(dt) { /* 每帧调用 */ }
  doSomething() { /* 外部可调用 */ }

  // 内部方法（下划线开头，不被外部调用）
  _internalHelper() { /* ... */ }

  // 清理资源
  destroy() { /* 清定时器 / 解绑事件 / 置空回调 */ }
}

module.exports = XxxController;
```

**在对应 `index.js` 登记（只加一行）：**

```javascript
// controllers/index.js
const XxxController = require('./xxxController.js');

module.exports = {
  // ... 原有导出 ...
  XxxController         // ← 新增一行
};
```

**在页面文件中使用（几行完成组装）：**

```javascript
// pages/map/map.js —— 顶部 require 已自动生效，只需：
this.xxxCtrl = new XxxController({ xxx: myValue });
// ... 在合适时机调用 ...
this.xxxCtrl.update(dt);
// ... 在 onUnload 清理 ...
this.xxxCtrl.destroy();
```

### 原则 4：渲染函数规范

渲染层推荐用 **纯函数**，不持有状态。每次 `render()` 接收 `ctx` + 当前帧所需的所有数据。

**推荐模板（`renderers/xxxRenderer.js`）：**

```javascript
// renderers/xxxRenderer.js
// 渲染 xxx 组件
// 设计：不持有状态，每次 render 接收 ctx + options

function _helper(ctx, opts) {
  // 内部辅助函数，下划线开头
}

function renderXxx(ctx, options) {
  const { cam, dpr, viewW, viewH, ...rest } = options;
  ctx.save();
  ctx.scale(dpr, dpr);
  // ... 纯绘制 ...
  ctx.restore();
}

module.exports = { renderXxx };
```

**在 `renderers/index.js` 登记：**

```javascript
const xxxRenderer = require('./xxxRenderer.js');
module.exports = { /* ...原有... */ xxxRenderer };
```

**在页面使用：**

```javascript
// pages/map/map.js 的 render() 中
const { renderXxx } = require('../../renderers/index.js');
renderXxx(this.ctx, { cam: this.cam, dpr: this.dpr, viewW: this.viewW });
```

---

## 三、通过实际示例：添加「迷你地图」功能

下面以 **新增一个「迷你地图」渲染器** 为例，完整演示模块化开发流程。

### 步骤 1：创建新模块文件（唯一需要写业务逻辑的地方）

```javascript
// renderers/minimapRenderer.js
// 迷你地图渲染器：在屏幕右下角绘制小地图 + 玩家位置
// 设计：纯函数，不持有状态，每次 render 接收 ctx + 玩家坐标 + 地图尺寸
const { MAP } = require('../config/index.js');

function renderMinimap(ctx, options) {
  const { playerX, playerY, mapW, mapH, dpr, viewW, viewH } = options;
  const mmW = 200;          // 迷你地图显示宽度（像素）
  const mmH = mmW * (mapH / mapW);
  const mmX = viewW - mmW - 20;
  const mmY = 20;

  ctx.save();
  ctx.scale(dpr, dpr);

  // 1. 半透明背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(mmX, mmY, mmW, mmH);

  // 2. 边框
  ctx.strokeStyle = '#4ECDC4';
  ctx.lineWidth = 2;
  ctx.strokeRect(mmX, mmY, mmW, mmH);

  // 3. 玩家位置点（按比例换算）
  const px = mmX + (playerX / mapW) * mmW;
  const py = mmY + (playerY / mapH) * mmH;
  ctx.fillStyle = '#FFE66D';
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

module.exports = { renderMinimap };
```

### 步骤 2：在统一入口登记（一行）

```javascript
// renderers/index.js
const campusRenderer = require('./campusRenderer.js');
const sportsRenderer = require('./sportsRenderer.js');
const minimapRenderer = require('./minimapRenderer.js');   // ← 新增一行

module.exports = {
  campusRenderer,
  sportsRenderer,
  minimapRenderer                                            // ← 新增一行
};
```

### 步骤 3：在页面引用并使用（几行完成）

```javascript
// pages/map/map.js —— 顶部（已有 require，不需要改）
const { campusRenderer, minimapRenderer } = require('../../renderers/index.js');

// pages/map/map.js —— 在 render() 方法末尾加 3 行
if (this.playerCtrl) {
  const pos = this.playerCtrl.getPlayerPos();
  minimapRenderer.renderMinimap(this.ctx, {
    playerX: pos.x,
    playerY: pos.y,
    mapW: MAP.WIDTH,
    mapH: MAP.HEIGHT,
    dpr: this.dpr,
    viewW: this.viewW,
    viewH: this.viewH
  });
}
```

✅ **完成**。原有代码几乎不需要改动，只新增了文件 + 2 行导出 + 几行调用。

---

## 四、通过实际示例：添加「NPC 对话」功能

### 步骤 1：新建数据文件

```javascript
// data/npcs.js
const NPCS = [
  {
    id: 'guide',
    name: '校园向导',
    pos: { x: 940, y: 900 },
    dialog: ['欢迎来到河北师范大学！', '用摇杆探索校园吧！']
  },
  {
    id: 'librarian',
    name: '图书馆管理员',
    pos: { x: 600, y: 400 },
    dialog: ['这里有丰富的藏书', '欢迎随时来阅读！']
  }
];

module.exports = NPCS;
```

### 步骤 2：在 `data/index.js` 登记

```javascript
const buildings = require('./buildings.js');
const buildingHistory = require('./buildingHistory.js');
const NPCS = require('./npcs.js');            // ← 新增一行

module.exports = {
  BUILDINGS: buildings.BUILDINGS,
  BUILDING_HISTORY: buildingHistory,
  NPCS                                           // ← 新增一行
};
```

### 步骤 3：新建控制器

```javascript
// controllers/npcController.js
// NPC 对话系统：检测玩家靠近 → 触发对话弹窗 → 显示文字
// 设计：通过 onShowDialog 回调与页面通信，不直接操作 wx API
class NpcController {
  constructor(options = {}) {
    this.npcs = options.npcs || [];
    this.triggerRadius = options.triggerRadius || 80;
    this.cooldownMs = options.cooldownMs || 1500;
    this._lastTriggerAt = {};
    this._onShowDialog = options.onShowDialog || null;
  }

  update(playerX, playerY) {
    const now = Date.now();
    for (const npc of this.npcs) {
      const dx = playerX - npc.pos.x;
      const dy = playerY - npc.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= this.triggerRadius) {
        const last = this._lastTriggerAt[npc.id] || 0;
        if (now - last > this.cooldownMs) {
          this._lastTriggerAt[npc.id] = now;
          if (this._onShowDialog) {
            this._onShowDialog(npc);
          }
        }
      }
    }
  }

  destroy() { this._onShowDialog = null; }
}

module.exports = NpcController;
```

### 步骤 4：在 `controllers/index.js` 登记

```javascript
const NpcController = require('./npcController.js');
module.exports = { /* ...原有... */ NpcController };
```

### 步骤 5：在页面使用（几行完成）

```javascript
// pages/map/map.js —— 顶部（已有，不需要改）
const { NpcController } = require('../../controllers/index.js');
const { NPCS } = require('../../data/index.js');

// onLoad() 中实例化：
this.npcCtrl = new NpcController({
  npcs: NPCS,
  onShowDialog: (npc) => {
    wx.showModal({
      title: npc.name,
      content: npc.dialog.join('\n'),
      showCancel: false
    });
  }
});

// render() 游戏循环中调用：
if (this.npcCtrl && this.playerCtrl) {
  const p = this.playerCtrl.getPlayerPos();
  this.npcCtrl.update(p.x, p.y);
}

// onUnload() 清理：
if (this.npcCtrl) this.npcCtrl.destroy();
```

✅ **完成**。整个功能的业务逻辑集中在 `controllers/npcController.js`，页面只做「组装」。

---

## 五、通过实际示例：添加新「季节效果」

假设要给春天加「花瓣飘落」效果。

### 步骤 1：新建工具模块

```javascript
// utils/petalEffect.js
// 花瓣粒子：用于春季装饰效果
class PetalEffect {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.width = options.width || 0;
    this.height = options.height || 0;
    this.particles = [];
    this.count = Math.floor(this.width * this.height * 0.0001);
    this.running = false;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 2 + Math.random() * 3,
        speedY: 0.5 + Math.random() * 1.2,
        speedX: -0.3 + Math.random() * 0.6
      });
    }
  }

  start() { this.running = true; }
  stop() { this.running = false; }

  render(ctx, dpr) {
    if (!this.running) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#FFB6C1';
    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y > this.height) { p.y = -5; p.x = Math.random() * this.width; }
      if (p.x > this.width) p.x = 0;
      if (p.x < 0) p.x = this.width;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}

module.exports = PetalEffect;
```

### 步骤 2：在 `utils/index.js` 登记（一行）

```javascript
const PetalEffect = require('./petalEffect.js');
module.exports = { /* ...原有... */ PetalEffect };
```

### 步骤 3：在 `controllers/weatherManager.js` 微改（几行）

```javascript
// controllers/weatherManager.js —— 在季节处理处新增 spring 分支
const { PetalEffect } = require('../utils/index.js');   // ← 顶部加一行

class WeatherManager {
  // ... 原有代码 ...
  setSeason(season) {
    this._season = season;
    if (season === 'spring' && !this._petal) {
      this._petal = new PetalEffect({
        canvas: this.canvas, width: this.width, height: this.height
      });
      this._petal.init();
      this._petal.start();
    }
    // ... 原有 summer/winter 分支保留 ...
  }
  render(ctx, dpr) {
    if (this._season === 'spring' && this._petal) {
      this._petal.render(ctx, dpr);
    }
    // ... 原有 summer/winter 渲染保留 ...
  }
}
```

✅ **完成**。新效果完全自包含在 `utils/petalEffect.js`，只在现有 WeatherManager 加了几行。

---

## 六、通过实际示例：添加新建筑

建筑系统最能体现「数据驱动 + 服务层」的设计。

### 步骤 1：准备素材

- 建筑内部插画 → `images/buildings/myBuilding.png`
- 徽章图标（可选） → `images/badges/myBuilding-badge.png`

### 步骤 2：在 `data/buildingHistory.js` 添加文案

```javascript
// data/buildingHistory.js —— 加一个 key
module.exports = {
  // ... 已有建筑 ...
  myBuilding: '这里是建筑介绍文案...\n支持多行文本。'
};
```

### 步骤 3：在 `data/buildings.js` 添加配置

```javascript
// data/buildings.js —— 加一个对象到 BUILDINGS 数组
const HISTORY_TEXTS = require('./buildingHistory.js');

const BUILDINGS = [
  // ... 已有建筑 ...
  {
    id: 'myBuilding',                         // 唯一标识符（英文）
    name: '我的建筑',                          // 中文名
    nameEn: 'My Building',                    // 英文名
    triggerZone: { x: 500, y: 500, w: 140, h: 100 }, // 触发区域
    interiorImage: '/images/buildings/myBuilding.png',
    badge: {
      id: 'badge_myBuilding',
      name: '我的建筑徽章',
      image: '/images/badges/myBuilding-badge.png',
      description: '探索我的建筑获得的徽章'
    },
    historyText: HISTORY_TEXTS.myBuilding
  }
];

module.exports = { BUILDINGS };
```

### 步骤 4：校准坐标

在地图页开发者工具中，走到建筑附近，右下角显示实时坐标。

将坐标填入 `triggerZone`：
- `x, y` = 触发区左上角（建筑入口附近）
- `w, h` = 触发区宽度和高度（通常 120-160 像素宽，90-120 像素高）

### 步骤 5：测试

1. 进入地图页 → 走到建筑附近 → 出现「进入」气泡
2. 点击进入 → 建筑详情页显示插画 + 历史文案
3. 自动获得徽章 → 背包页可查看

✅ **完成**。没有改任何代码文件，只有数据文件改动。

---

## 七、通过实际示例：新增独立子地图

（例如：「教学区」子地图，类似已有的「运动场」）

### 步骤 1：新建配置文件

```javascript
// config/teachingMap.js
module.exports = {
  WIDTH: 1200,
  HEIGHT: 800,
  SPAWN_X: 600,
  SPAWN_Y: 700
};
```

在 `config/index.js` 登记：

```javascript
const TEACHING_MAP = require('./teachingMap.js');
module.exports = { /* ...原有... */ TEACHING_MAP };
```

### 步骤 2：复制页面（`pages/sports/*` → `pages/teaching/*`）

复制以下 4 个文件：
- `pages/sports/sports.js` → `pages/teaching/teaching.js`
- `pages/sports/sports.json` → `pages/teaching/teaching.json`
- `pages/sports/sports.wxml` → `pages/teaching/teaching.wxml`
- `pages/sports/sports.wxss` → `pages/teaching/teaching.wxss`

修改 `teaching.js`：
- 所有 `SPORTS_MAP` → `TEACHING_MAP`
- 背景图路径改为 `'/images/map/teaching-bg.png'`

### 步骤 3：在 `app.json` 注册

```json
"pages": [
  ...,
  "pages/teaching/teaching"
]
```

### 步骤 4：在 `data/buildings.js` 标记主地图上的入口建筑

```javascript
{
  id: 'teaching_entrance',
  name: '教学区入口',
  // ...
  isTeachingField: true        // 触发时跳到 teaching 页面
}
```

### 步骤 5：在 `pages/map/map.js` 的 `BuildingController` 回调中加一行

```javascript
onEnter: (bld) => {
  if (bld.isSportsField) { /* 原有 */ }
  else if (bld.isTeachingField) {                       // ← 新增 3 行
    wx.navigateTo({ url: '/pages/teaching/teaching' });
  } else { /* 原有 building 详情页 */ }
}
```

✅ **完成**。核心改动集中在一个新页面 + 配置文件。

---

## 八、通过实际示例：添加新配置项

### 步骤 1：在对应配置文件修改

```javascript
// config/player.js
module.exports = {
  SPEED: 160,        // 像素/秒
  SIZE: 48,          // 绘制尺寸
  SPAWN_X: 945,      // 出生点 X
  SPAWN_Y: 900,      // 出生点 Y
  DIRECTION: 'down', // 初始方向
  RUN_MULTIPLIER: 1.6  // ← 新增：奔跑时速度倍率
};
```

### 步骤 2：在控制器使用

```javascript
// controllers/playerController.js
const { PLAYER } = require('../config/index.js');

class PlayerController {
  constructor(options = {}) {
    this.runMultiplier = options.runMultiplier || PLAYER.RUN_MULTIPLIER;
    // ... 其他初始化 ...
  }
  setRunning(isRunning) { this._isRunning = isRunning; }
  update(dt) {
    // ...
    const speed = this.speed * (this._isRunning ? this.runMultiplier : 1);
    // ...
  }
}
```

✅ **完成**。配置与逻辑分离，修改参数不需要改业务代码。

---

## 九、通过实际示例：添加新状态字段到 gameStore

### 步骤 1：在 `store/gameStore.js` 中加字段

```javascript
// store/gameStore.js —— _applySnapshot() 中添加
_applySnapshot(snap) {
  this.state.player = snap.player || { x: PLAYER.SPAWN_X, y: PLAYER.SPAWN_Y, direction: 'down' };
  // ... 原有字段 ...
  this.state.exploredCount = snap.exploredCount || 0;  // ← 新增一行
}
```

### 步骤 2：暴露对外方法

```javascript
// store/gameStore.js
incrementExplored() {
  this.state.exploredCount = (this.state.exploredCount || 0) + 1;
  this.notify();          // 自动触发持久化 + 通知订阅者
}
```

### 步骤 3：在页面使用

```javascript
// pages/map/map.js —— 任意地方调用
gameStore.incrementExplored();
```

✅ **完成**。状态变更 + 持久化 + 订阅通知全部自动生效。

---

## 十、通过实际示例：添加新徽章

### 步骤 1：在目标建筑配置中加 `badge` 字段

```javascript
// data/buildings.js —— 给某建筑加 badge
{
  id: 'myBuilding',
  // ...
  badge: {
    id: 'badge_myBuilding',
    name: '我的建筑徽章',
    image: '/images/badges/myBuilding-badge.png',
    description: '探索我的建筑获得的荣誉徽章'
  }
}
```

### 步骤 2：自动获得（无需改代码）

`pages/building/building.js` 中已有逻辑：进入建筑详情页时，自动检查 `building.badge`，若未获得则加入背包。

✅ **完成**。徽章系统数据驱动，零代码改动。

---

## 十一、文件组织速查表

| 你想做什么 | 新建/修改什么文件 | 在哪个 index.js 登记 |
|-----------|-------------------|----------------------|
| 新控制器（业务逻辑） | `controllers/xxxController.js` | `controllers/index.js` |
| 新渲染器（Canvas 绘制） | `renderers/xxxRenderer.js` | `renderers/index.js` |
| 新工具/类库 | `utils/xxx.js` | `utils/index.js` |
| 新状态字段 | 改 `store/gameStore.js` | ——（无需登记） |
| 新参数/配置 | `config/xxx.js` | `config/index.js` |
| 新游戏数据（建筑/NPC/物品） | `data/xxx.js` | `data/index.js` |
| 新页面 | `pages/xxx/xxx.{js,json,wxml,wxss}` | `app.json` 的 `pages` 数组 |
| 新服务（数据访问封装） | `services/xxxService.js` | `services/index.js` |
| 新样式 | `styles/xxx.wxss` | ——（直接在页面 `@import` 或在 app.wxss 引用） |

---

## 十二、代码风格约定

### 文件命名

- 控制器：`xxxController.js`（驼峰 + 后缀）
- 渲染器：`xxxRenderer.js`
- 服务：`xxxService.js`
- 工具：`xxx.js`（简短、动词或名词）
- 配置：`xxx.js`（小写名词）

### 代码格式

- 2 空格缩进，禁止 Tab
- 单引号优先
- 语句末尾加分号
- 连续空行不超过 2 行
- 禁止使用 `var`，用 `const` / `let`
- 函数括号前留空格：`function name() {}`

### 运行 lint 检查

```bash
npm run lint       # 检查所有 JS 文件
npm run lint:fix   # 自动修复可修复问题
```

---

## 十三、与原有大文件代码的对比

| 旧写法（堆在 pages/map.js，600+ 行） | 新写法（模块化，约 200 行） |
|------------------------------------|--------------------------|
| 所有 Canvas 绘制代码在 map.js `render()` 中 | `renderers/campusRenderer.js` 纯函数绘制，map.js 只调用一行 |
| 玩家移动/边界/方向/保存逻辑在 map.js | `controllers/playerController.js` 类封装，map.js 只 `new + update` |
| 建筑触发检测/弹窗/冷却在 map.js | `controllers/buildingController.js` 类封装 |
| 进度条/倒计时/天气/触摸分散在 map.js | 各自独立控制器文件 |
| 修改一个功能可能影响其他功能 | 每个模块独立，改动隔离 |
| 难以测试（逻辑嵌在 Page({}) 内部） | 每个类/函数可独立测试 |
| 团队协作容易冲突（都改同一个大文件） | 不同开发者改不同文件，零冲突 |

---

## 十四、常见问题

### Q：我应该把代码放在哪一层？

答：按下面的顺序判断：

1. 它**绘制画面**？→ `renderers/`
2. 它**处理业务流程/状态更新**？→ `controllers/`
3. 它**管理全局状态/持久化**？→ `store/`
4. 它**封装数据访问**？→ `services/`
5. 它**是通用工具，不依赖本项目数据**？→ `utils/`
6. 它**是纯数据/参数**？→ `config/` 或 `data/`
7. 它**需要页面生命周期或绑定 UI 事件**？→ `pages/*.js`（尽量薄）

### Q：新增功能后，旧代码还能工作吗？

答：能。`index.js` 统一入口保留旧导出，不会破坏现有调用。新增的是**额外**的导出项。

### Q：页面文件太长怎么办？

答：按本指南继续拆分。任何超过 300 行的页面文件都应该审视：是否有业务逻辑可以抽成控制器？是否有绘制代码可以抽成渲染器？

### Q：如何在两个页面共享同一控制器？

答：控制器是 **类（Class）**，不是单例。每个页面 `new XxxController({...})` 创建自己的实例。如果需要跨页面共享**数据**，数据应放在 `store/`（如 `gameStore`），控制器从 store 读写。

### Q：如何测试？

答：每个控制器/工具都是独立的类或函数，可以脱离小程序环境在 Node.js 中做单元测试（例如 Jest）。

### Q：修改了某座建筑的坐标，需要改代码吗？

答：不需要。建筑位置在 `data/buildings.js`，是纯数据。修改后重新编译即可。

### Q：季节/日夜切换是如何自动生效的？

答：`gameStore.setState({ season: 'winter' })` → `notify()` 通知所有订阅者 → 页面的 `handleStateChange` 重新设置内部 `_season` → `WeatherManager.setSeason()` 自动切换粒子效果 → 渲染层 `renderCampus()` 接收 `season` 参数自动改变底色遮罩。整条链路上的每个模块都是**自包含**的，改动任一处不会牵一发而动全身。

### Q：如何开启云端存档？

答：
1. 开通微信云开发 → 获取环境 ID
2. 在 `app.js` 的 `CLOUD_ENV` 常量填入 ID
3. 云开发控制台 → 数据库 → 新建集合 `user_saves` → 权限「仅创建者可读写」
4. 重新编译

未配置时，云相关代码会自动短路降级为纯本地存储，不影响使用。

---

## 总结：模块化开发三字诀

| 字 | 含义 | 怎么做 |
|----|------|--------|
| **拆** | 拆分大文件 | 任何超过 200 行的文件都审视是否可拆 |
| **引** | 引用入口 | 从 `xxx/index.js` 统一 require，不要散落引用单文件 |
| **薄** | 页面做薄 | `pages/*.js` 只负责组装生命周期和 UI 绑定，不写业务逻辑 |

**记住：新增功能 = 新增文件 + index.js 登记 + 页面几行引用** ✅