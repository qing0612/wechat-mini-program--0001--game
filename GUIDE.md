# 开发指南（建筑、角色、徽章、双地图、工程化、云同步、日志）

本文档说明如何在小程序中添加新建筑、新角色、新徽章、新独立地图，以及美术资源规格、过渡画面/进度条、日夜模式、天气效果、音频管理、云同步、日志系统等工程化内容，确保文档与实际代码完全一致。

---

## 三个文档的关系

| 文档 | 什么时候读 | 核心内容 |
|------|----------|---------|
| **README.md** | 第一次接触项目 | 项目介绍、功能亮点、快速开始、技术要点、Gitee 协作流程 |
| **GUIDE.md**（本文件） | 要修改/扩展项目时 | 建筑/角色/徽章/地图等具体操作指南 |
| **DEVELOPER_RULES.md** | 提交代码前必须读 | 代码风格、Git/Gitee 协作规范、Bug 修复原则 |

**阅读路径**：先看 README → 开发时查 GUIDE → 提交前读 DEVELOPER_RULES。

---

## 一、添加新建筑

### 1. 数据结构（当前实际架构）

当前项目使用三个文件协同管理建筑数据：

| 文件 | 职责 |
|------|------|
| `data/buildingHistory.js` | 独立存放历史文案（`HISTORY_TEXTS` 对象），便于内容编辑 |
| `data/buildings.js` | 建筑核心数据（`BUILDINGS` 数组），通过 `HISTORY_TEXTS.id` 引用文案 |
| `services/buildingService.js` | 统一服务（单例），提供 `getBuildingById()` / `getAllBuildings()` / `checkBuildingTrigger()` |

在 `data/buildingHistory.js` 中添加文案：

```javascript
const HISTORY_TEXTS = {
  // ... 已有建筑 ...
  my_building: '这里是我的建筑介绍文案...\n\n' +
    '可以用 + 号换行连接多行文本。\n\n' +
    '建议 200-400 字。'
};
module.exports = HISTORY_TEXTS;
```

然后在 `data/buildings.js` 中添加建筑对象：

```javascript
const HISTORY_TEXTS = require('./buildingHistory.js');

const BUILDINGS = [
  // ... 已有建筑 ...
  {
    id: 'my_building',              // 唯一标识符（英文，用于URL参数）
    name: '建筑名称',                // 中文名（显示在地图和详情页）
    nameEn: 'English Name',         // 英文名（显示在详情页副标题）
    triggerZone: {                  // 触发区域（玩家进入此矩形触发"进入"按钮）
      x: 1000,                      // X 坐标（像素，以地图左上角为原点）
      y: 500,                       // Y 坐标
      w: 150,                       // 宽度（像素，建筑正面宽度 + 余量）
      h: 100                        // 高度（像素，建筑正面高度 + 余量）
    },
    collisionZone: {                // 碰撞区域（略大于触发区，覆盖建筑轮廓，预留）
      x: 985,
      y: 490,
      w: 180,
      h: 130
    },
    interiorImage: '/images/buildings/my_building.png',  // 建筑内部插画
    badge: {                                                    // 探索徽章（可选）
      id: 'badge_my_building',
      name: '建筑名称徽章',
      image: '/images/badges/my_building-badge.png',
      description: '参观获得的荣誉徽章'
    },
    historyText: HISTORY_TEXTS.my_building  // 引用独立文案文件
    // isSportsField: true,                 // 特殊标识：设置为 true 时跳转到独立地图页
  }
];
```

> 💡 **关于 `isSportsField`**：体育场馆建筑使用此字段。当玩家进入并点击"进入"时，不会跳转到普通建筑详情页（`pages/building`），而是跳转到独立的运动场地图页（`pages/sports`）。该页面拥有独立的地图尺寸（`SPORTS_MAP`）和玩家坐标（`gameStore.state.sportsPlayer`）。普通建筑不要设置此字段。

### 2. 坐标获取方法

1. 微信开发者工具中运行小程序，打开地图页
2. 用摇杆走到目标建筑门口
3. 观察地图画面（地图页会实时显示坐标，可在 `map.js` 的 `render()` 方法中看到坐标写入 `data.coordX` / `data.coordY`）
4. 记录建筑门口中心的 `(x, y)` 值
5. 以该点为中心，设定 `triggerZone`：
   - `x` = 中心X - 宽度/2
   - `y` = 中心Y - 高度/2
   - `w` = 建筑正面宽度 + 20 像素余量
   - `h` = 建筑正面高度 + 20 像素余量

### 3. 添加步骤清单

- [ ] 在 `data/buildingHistory.js` 中添加 `historyText` 文案
- [ ] 在 `data/buildings.js` 的 `BUILDINGS` 数组中添加完整建筑对象
- [ ] 准备建筑内部插画 `images/buildings/{id}.png`
- [ ] 准备徽章图标 `images/badges/{id}-badge.png`（可选）
- [ ] 预览校准 `triggerZone` 坐标
- [ ] 测试进入/返回流程、徽章获得、背包查看

### 4. 删除建筑

从 `BUILDINGS` 数组中移除对应对象即可，代码会自动适配（`buildingService` 是动态读取的）。

---

## 二、角色/人物系统

### 1. 当前角色：像素风狮子（使用像素网格绘制）

**狮子使用字符像素网格绘制**，定义在 `utils/sprite.js`。四个方向（down/up/left/right）各有独立网格图案，每个字符对应一种颜色，每格渲染为 4×4 像素块，总绘制尺寸 48 像素。

#### 核心文件

| 文件 | 内容 |
|------|------|
| `utils/sprite.js` | `SpriteAnimator`（动画管理）、`dirFromVector`（方向判断）、`drawPlayer`（像素网格渲染）、`SPRITE_COLORS`、`SPRITE_GRIDS` |
| `config/gameConfig.js` | `PLAYER.SPEED`（160像素/秒）、`PLAYER.SIZE`（48像素）、`ANIMATION.FRAME_COUNT`（2帧）、`ANIMATION.FRAME_DURATION`（200ms/帧，**页面实际使用该配置值**） |
| `pages/map/map.js` | 通过 `new SpriteAnimator({ frameCount, frameDuration })` 和 `drawPlayer()` 集成到游戏循环 |
| `pages/sports/sports.js` | 与 map 相同的角色渲染方式 |

#### 颜色映射（`SPRITE_COLORS`）

```javascript
const SPRITE_COLORS = {
  o: '#3D2200',  // 深棕色（轮廓）
  O: '#3D2200',  // 深棕色（轮廓，别名）
  M: '#C07820',  // 深金色（鬃毛）
  b: '#D4A030',  // 金黄色（身体）
  v: '#F5E6C8',  // 浅米色（腹部）
  e: '#1A1A1A',  // 黑色（眼睛）
  h: '#FFFFFF',  // 白色（眼睛高光）
  n: '#2D1800',  // 深棕色（鼻子）
  E: '#C07820',  // 金色（耳朵）
  I: '#F0A0A0'   // 粉色（耳朵内侧）
};
```

> ⚠️ `utils/sprite.js` 的 `SpriteAnimator` 构造函数默认 `frameDuration: 180`，但**页面代码（`map.js`/`sports.js`）显式传入 `gameConfig.ANIMATION.FRAME_DURATION`（200ms）**，故实际帧率由配置文件决定。修改帧率只需改 `gameConfig.js`，无需改 sprite.js。

#### 绘制流程（`drawPlayer()`）

```
drawPlayer(ctx, x, y, moving, frameIndex, dir)
  ├── s = 48（总像素大小），p = 4（每格像素）
  ├── bounce = moving && frameIndex === 1 ? -4 : 0
  │   （行走帧1时，角色上浮4像素模拟行走摆动）
  ├── 选择网格：SPRITE_GRIDS[dir] 或 down（方向未知时兜底）
  └── 双重 for 循环遍历 grid[r][c]：
        非 '.' 且存在颜色键 → ctx.fillRect(ox + c*p, oy + r*p, p, p)
```

#### 修改角色外观

| 修改项 | 位置 | 方式 |
|--------|------|------|
| 颜色 | `utils/sprite.js` 的 `SPRITE_COLORS` | 修改 16 进制颜色值 |
| 大小 | `utils/sprite.js` 的 `drawPlayer()` 中 `s` 与 `p` | `s` 总像素，`p` 每格像素（保持 s = p × 网格行数 可等比缩放） |
| 像素图案 | `utils/sprite.js` 的 `SPRITE_GRIDS[dir]` | 直接编辑字符网格 |
| 行走速度 | `config/gameConfig.js` 的 `PLAYER.SPEED` | 默认 160 像素/秒 |
| 动画帧率 | `config/gameConfig.js` 的 `ANIMATION.FRAME_DURATION` | 默认 200ms/帧 |
| 动画帧数 | `config/gameConfig.js` 的 `ANIMATION.FRAME_COUNT` | 默认 2 帧 |

### 2. 替换为精灵图（进阶）

如需用真正的像素精灵图替换像素网格绘制：

#### A. 准备精灵图

用 [Piskel](https://www.piskelapp.com/) 或 Aseprite 绘制：
- 4 个方向 × 2 帧 = 8 张行走帧
- 另加 1 张静止帧 = 共 9 张
- 每张尺寸：48×48 像素（与当前 `PLAYER.SIZE` 一致）
- 保存到 `images/lion/` 目录

#### B. 文件命名规范

```
images/lion/
├── idle.png            # 静止帧
├── walk-down-1.png     # 向下走 帧1
├── walk-down-2.png     # 向下走 帧2
├── walk-up-1.png       # 向上走 帧1
├── walk-up-2.png       # 向上走 帧2
├── walk-left-1.png     # 向左走 帧1
├── walk-left-2.png     # 向左走 帧2
├── walk-right-1.png    # 向右走 帧1
└── walk-right-2.png    # 向右走 帧2
```

#### C. 修改 `utils/sprite.js`

将 `drawPlayer()` 替换为基于图片的实现：

```javascript
// 预加载（在 map.js / sports.js 的 onLoad 中调用）
function preloadSpriteImages(canvas) {
  const imgs = {};
  const dirs = ['up', 'down', 'left', 'right'];
  dirs.forEach(d => {
    for (let f = 1; f <= 2; f++) {
      const key = `walk-${d}-${f}`;
      const img = canvas.createImage();
      img.src = `/images/lion/${key}.png`;
      imgs[key] = img;
    }
  });
  const idle = canvas.createImage();
  idle.src = '/images/lion/idle.png';
  imgs.idle = idle;
  return imgs;
}

// 替换 drawPlayer
function drawPlayer(ctx, x, y, moving, frameIndex, dir, spriteImages) {
  const s = 48;
  const bounce = moving && frameIndex === 1 ? -4 : 0;
  const key = moving ? `walk-${dir}-${frameIndex + 1}` : 'idle';
  const sprite = spriteImages[key];
  if (sprite && sprite.complete) {
    ctx.drawImage(sprite, x - s/2, y - s/2 + bounce, s, s);
  }
}
```

#### D. 在页面中调用

在 `pages/map/map.js` 和 `pages/sports/sports.js` 的 `onLoad()` 中加载：

```javascript
this.spriteImages = preloadSpriteImages(this.canvas);
```

在 `render()` 的 `drawPlayer` 调用中传入 `spriteImages`：

```javascript
drawPlayer(ctx, sp.x, sp.y, this.moving, this.anim.frameIndex, this.playerDir, this.spriteImages);
```

### 3. 添加新角色（NPC）

如需添加 NPC 或其他角色：

#### A. 在 `data/buildings.js` 中扩展

```javascript
// 新增角色配置
const CHARACTERS = [
  {
    id: 'guide_npc',
    name: '校园向导',
    pos: { x: 940, y: 900 },   // 出生位置
    dialog: ['欢迎来到河北师范大学！', '用摇杆探索校园吧！']
  }
];

module.exports = { BUILDINGS, OBSTACLES, SPAWN, MAP_SIZE, CHARACTERS };
```

#### B. 在 `services/buildingService.js` 中添加查询方法

```javascript
const { BUILDINGS, CHARACTERS } = require('../data/buildings.js');

class BuildingService {
  constructor() {
    this.buildings = BUILDINGS;
    this.characters = CHARACTERS || [];
  }
  getCharacterById(id) { return this.characters.find(c => c.id === id); }
  getAllCharacters() { return [...this.characters]; }
}
```

#### C. 在 `pages/map/map.js` 中添加角色渲染

```javascript
// 1. onLoad 中
const buildingService = require('../../services/buildingService.js');
this.npcs = buildingService.getAllCharacters();

// 2. render() 中，绘制玩家之前/之后
this.npcs.forEach(npc => {
  const sp = worldToScreen(npc.pos.x, npc.pos.y, cam);
  if (sp.x < 0 || sp.x > this.viewW || sp.y < 0 || sp.y > this.viewH) return;
  // 用简化的像素方块绘制 NPC，或加载精灵图
  ctx.fillStyle = '#4ECDC4';
  ctx.fillRect(sp.x - 20, sp.y - 24, 40, 48);
});
```

---

## 三、徽章系统

### 1. 徽章数据结构

每个建筑可配置一个徽章（字段 `badge`，可省略）：

```javascript
badge: {
  id: 'badge_library',                           // 徽章唯一ID
  name: '图书馆徽章',                             // 名称（显示在背包和获得弹窗）
  image: '/images/badges/library-badge.png',      // 图标
  description: '探索图书馆获得的荣誉徽章'           // 描述
}
```

### 2. 获得流程（自动触发）

在 `pages/building/building.js` 的 `onLoad()` 中：

```javascript
// 进入建筑详情页时自动检查
if (building.badge && !gameStore.hasBadge(building.badge.id)) {
  gameStore.addToBackpack(building.badge);        // 加入背包
  this.setData({ badgeEarned: true, showBadgePopup: true });  // 显示获得弹窗
}
```

### 3. 查看徽章

在 `pages/backpack/backpack.js` 中读取：

```javascript
const state = gameStore.getState();
state.backpack;  // 包含所有获得的徽章和物品
```

### 4. 成就统计

`store/gameStore.js` 中 `stats` 对象自动统计：

```javascript
stats: {
  totalSteps: 0,              // 总移动步数（地图页按距离累计）
  buildingsVisited: 0,        // 已探索建筑数（= 已获得徽章数）
  badgesCollected: 0,         // 已获得徽章数（与 buildingsVisited 同步）
  firstLaunchAt: '2025-01-01' // 首次启动时间
}
```

---

## 四、双地图系统（主校园 + 运动场）

### 1. 架构总览

| 地图 | 页面 | 配置 | 玩家坐标存储 |
|------|------|------|-------------|
| 主校园 | `pages/map/map.js` | `config/gameConfig.js` 的 `MAP`（1893×1093） | `gameStore.state.player` |
| 运动场 | `pages/sports/sports.js` | `config/gameConfig.js` 的 `SPORTS_MAP`（949×1592） | `gameStore.state.sportsPlayer` |

### 2. 在 `data/buildings.js` 中标记运动场建筑

```javascript
{
  id: 'sports',
  name: '体育场馆',
  nameEn: 'Sports Center',
  triggerZone: { x: 1260, y: 131, w: 150, h: 120 },
  collisionZone: { x: 185, y: 685, w: 180, h: 150 },
  interiorImage: '/images/map/sports-bg.png',   // 运动场底图（PNG）
  badge: { id: 'badge_sports', name: '体育场馆徽章', image: '/images/badges/lecture-badge.png', description: '进入体育场馆获得的荣誉徽章' },
  isSportsField: true,   // ← 关键！设置后点击进入跳转到运动场独立页面
  historyText: HISTORY_TEXTS.sports
}
```

### 3. 跳转逻辑（`pages/map/map.js` 中触发后）

当玩家走到体育场馆触发区并点击"进入"时：

```javascript
const b = buildingService.checkBuildingTrigger(this.player.x, this.player.y);
if (b) {
  if (b.isSportsField) {
    wx.navigateTo({ url: '/pages/sports/sports' });      // 跳独立运动场
  } else {
    wx.navigateTo({ url: '/pages/building/building?id=' + b.id });  // 跳普通详情页
  }
}
```

> 💡 `sports.js` 内部使用 `sportsBuilding.interiorImage` 作为背景图（即 `data/buildings.js` 中 sports 建筑的 `interiorImage` 字段），所以更换运动场底图只需修改 `buildings.js` 中该字段的路径，无需改 sports.js。

### 4. 运动场玩家坐标独立存储

`gameStore.state.sportsPlayer` 与主校园的 `state.player` **完全独立**，互不干扰。从运动场返回主校园时，主校园位置保持不变。

### 5. 添加新独立地图

如需添加更多独立地图（例如"教学区地图"、"食堂地图"）：

1. 准备地图底图（PNG 或 WEBP 均可），例如 `images/map/teaching-bg.png`
2. 在 `config/gameConfig.js` 中添加新配置：

```javascript
TEACHING_MAP: {
  WIDTH: 1200,
  HEIGHT: 800,
  SPAWN_X: 600,
  SPAWN_Y: 700
}
```

3. 复制 `pages/sports/sports.*` 三份（wxml/wxss/js）为 `pages/teaching/teaching.*`
4. 修改新页面中所有 `SPORTS_MAP` 为 `TEACHING_MAP`，修改背景图片路径
5. 在 `app.json` 的 `pages` 数组中注册新页面路径（`pages/teaching/teaching`）
6. 在 `data/buildings.js` 中添加带标记的建筑（如 `isTeachingField: true`），并在 `map.js` 中扩展跳转逻辑

---

## 五、美术资源规格

### 1. 地图底图（主校园）

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/map-bg.png` |
| 格式 | PNG 或 WEBP |
| 尺寸 | **必须匹配** `config/gameConfig.js` 中 `MAP.WIDTH` × `MAP.HEIGHT`（当前 1893×1093） |
| 建议长边 | 1500-2500 像素 |
| 文件大小 | < 2MB（主包限制） |
| 处理方式 | 原图像素化处理（滤镜 → 马赛克 8-12 像素） |

### 2. 地图底图（运动场）

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/map/sports-bg.png`（由 `data/buildings.js` 的 sports `interiorImage` 字段配置） |
| 格式 | PNG（当前使用）或 WEBP |
| 尺寸 | **必须匹配** `SPORTS_MAP.WIDTH` × `SPORTS_MAP.HEIGHT`（当前 949×1592） |

> ⚠️ 更换运动场底图只需修改 `data/buildings.js` 中 `sports` 建筑的 `interiorImage` 字段，`pages/sports/sports.js` 会自动读取。

### 3. 启动页背景

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/start-bg.png` |
| 格式 | PNG 或 JPG |
| 尺寸 | 任意，建议 16:9 比例 |
| 文件大小 | < 1MB |

### 4. 建筑内部插画

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/buildings/{id}.png` |
| 格式 | PNG（支持透明背景）或 WEBP |
| 尺寸 | 800×600 或 16:9 比例 |
| 文件大小 | 每张 < 300KB |
| 风格 | 像素风室内场景，与地图风格统一 |

### 5. 徽章图标

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/badges/{id}-badge.png` |
| 格式 | PNG（透明背景） |
| 尺寸 | 建议 64×64 或 128×128 像素 |
| 文件大小 | 每张 < 20KB |

### 6. 角色精灵图（进阶）

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/lion/walk-{dir}-{n}.png` |
| 格式 | PNG（支持透明背景） |
| 尺寸 | 48×48 像素 |
| 帧数 | 4 方向 × 2 帧 + 1 静止帧 = 9 张 |
| 文件大小 | 每张 < 10KB |

### 7. 图片压缩建议

- 地图底图：JPG quality 82-85；或 WEBP 效果更佳
- 建筑插画：PNG 用 pngquant 压缩到 256 色；或 WEBP
- 徽章图标：不需要特别压缩
- 总包体控制：主包 < 2MB，可将建筑详情页配置为分包

---

## 六、坐标校准详细步骤

### 方法一：Canvas 实时坐标（推荐）

**当前地图页已自动在 `data` 中维护 `coordX` / `coordY`**。直接在开发者工具的 AppData 面板中实时查看数值：

1. 开发者工具 → 调试 → 点击页面 → 右侧 AppData → `coordX` 和 `coordY` 即为当前玩家在地图上的坐标
2. 或者在 `map.wxml` 中临时添加一行显示：

```html
<text>X:{{coordX}} Y:{{coordY}}</text>
```

### 方法二：在 Canvas 上绘制坐标

在 `pages/map/map.js` 的 `render()` 方法中，`ctx.restore()` 之前添加：

```javascript
// 绘制当前坐标到屏幕左下角
ctx.save();
ctx.scale(dpr, dpr);
ctx.fillStyle = '#ffffff';
ctx.font = '14px monospace';
ctx.textAlign = 'left';
ctx.fillText(
  `X:${Math.round(this.player.x)} Y:${Math.round(this.player.y)}`,
  20,
  this.viewH - 20
);
ctx.restore();
```

### triggerZone 填写示例

假设你在图书馆门口记录到坐标为 `(870, 380)`，建筑宽度约 120 像素，高度约 90 像素：

```javascript
triggerZone: {
  x: 870 - 60,    // 810
  y: 380 - 45,    // 335
  w: 120,         // 建筑宽度
  h: 90           // 建筑高度
},
collisionZone: {   // 略大于触发区，覆盖建筑实体
  x: 870 - 80,
  y: 380 - 55,
  w: 160,
  h: 110
}
```

---

## 七、代码规范与 Lint

项目已配置 ESLint，编辑代码后建议执行一次检查：

```bash
npm install       # 首次使用
npm run lint      # 检查所有 JS 文件
npm run lint:fix  # 自动修复可修复的问题（缩进、引号、分号等）
```

### 核心规则

| 规则 | 要求 |
|------|------|
| 缩进 | 2 空格，禁止 Tab |
| 字符串 | 单引号优先 |
| 分号 | 必须使用 |
| 变量声明 | 禁止 `var`，使用 `const` / `let` |
| 括号 | 函数括号前需空格（`function ()`） |
| 空行 | 连续空行不超过 2 行 |

配置文件：`.eslintrc.json`，忽略规则：`.eslintignore`

---

## 八、过渡画面与进度条

页面切换时显示像素风加载遮罩，包含进度条动画，防止画面闪烁。

### 1. 核心文件

| 文件 | 作用 |
|------|------|
| `pages/map/map.js` | `_startProgress()` 方法驱动进度条，`onShow()` 重新显示过渡 |
| `pages/sports/sports.js` | 与 map 相同的 `_startProgress()` 实现 |
| `pages/map/map.wxml` | `.loading-overlay` 遮罩 + `.loading-progress-bar` 进度条 |
| `pages/sports/sports.wxml` | 同样的遮罩结构 |

### 2. 实现逻辑

```javascript
// map.js 的 _startProgress()
this._progressTimer = setInterval(() => {
  // 阶段 1：0 → 30%，快速推进（加载初始化）
  // 阶段 2：30% → 70%，等待地图底图加载完成（this.mapLoaded）
  // 阶段 3：70% → 100%，加载完成后快速收尾
  // 100% 时清除定时器，300ms 后隐藏遮罩
}, 50);
```

### 3. data 字段

```javascript
data: {
  loadProgress: 0,         // 当前百分比（0-100）
  loadVisible: true,       // 是否显示遮罩
  loadStageText: '资源加载中...'  // 当前阶段提示文字
}
```

### 4. onShow 重新触发

从其他页面返回地图页时，`onShow()` 会重置进度并再次启动过渡画面，防止闪屏：

```javascript
onShow() {
  this.setData({ loadProgress: 0, loadVisible: true, loadStageText: '资源加载中...' });
  setTimeout(() => this._startProgress(), 50);
  // ... 其余逻辑（天气效果、音频播放等）
}
```

---

## 九、日夜模式切换

### 1. 核心实现

`gameStore.state.isDay`（布尔值）控制地图底色与遮罩。

```javascript
// pages/map/map.js render()
ctx.fillStyle = this.isDay ? '#ffffff' : '#000000';  // 底色
ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
// ... 绘制地图底图 ...
if (!this.isDay) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';              // 夜间半透明黑遮罩
  ctx.fillRect(0, 0, this.viewW, this.viewH);
}
```

### 2. 状态持久化

- `gameStore._save()` 写入 `wx.setStorageSync('game_state')`
- `gameStore._restore()` 启动时恢复，刷新/重启后日夜状态保持

### 3. 切换方式

在设置页面（`pages/settings/settings`）提供按钮调用 `gameStore.setState({ isDay: !state.isDay })`，地图页通过 `gameStore.subscribe` 监听变化，`handleStateChange` 立即生效。

---

## 十、天气效果（雨雪粒子系统）

### 1. 核心文件

| 文件 | 作用 |
|------|------|
| `utils/weatherEffect.js` | `WeatherEffect` 类：粒子生成 / 更新 / 渲染 |
| `pages/map/map.js` | `_updateWeatherEffect()` 根据季节切换雨雪 |

### 2. 季节 → 天气映射

```javascript
// pages/map/map.js 的 _updateWeatherEffect()
season === 'summer' → 'rain'
season === 'winter' → 'snow'
其他季节（spring/autumn）→ 'none'（无天气）
```

> 💡 `gameStore.state.season` 决定天气。修改季节后，`handleStateChange` 自动调用 `_updateWeatherEffect()`。

### 3. 粒子系统原理

- **雨**：斜线移动 + 循环重置，数量 = `width × height × 0.0003`
- **雪**：随机大小粒子 + sin 漂移 + 下落循环，数量 = `width × height × 0.00015`
- 粒子在 `WeatherEffect.render()` 中绘制在 Canvas 最上层，由主游戏循环调用 `_renderWeatherEffect()`

### 4. 开关控制

```javascript
// 启动
this.weatherEffect = new WeatherEffect(canvas);
this.weatherEffect.init(canvas.width, canvas.height);
this.weatherEffect.setType('rain');  // 或 'snow' / 'none'
this.weatherEffect.start();

// 停止
this.weatherEffect.stop();
```

---

## 十一、音频管理

### 1. 核心文件

`utils/audioManager.js`（单例 `AudioManager`，全局一个实例）

### 2. 页面与歌曲映射

| 页面 | 歌曲 |
|------|------|
| `pages/start/start` | `songs.start` → `/audio/bgm.mp3` |
| `pages/map/map` | `songs.map` → `/audio/bgm2.mp3` |

### 3. 使用方式

```javascript
const audioManager = require('../../utils/audioManager.js');

// 进入页面时（onShow）
audioManager.playWithMuteCheck('map');   // 未静音则切换并播放 map 页音乐

// 设置页面：静音切换
audioManager.setMute('map', false);       // 设为 true 时禁用该页音乐
audioManager.getMute('map');              // 获取当前静音状态
audioManager.setVolume(0.7);              // 全局音量 0-1，持久化到 Storage
```

### 4. 持久化

- **音量**：`game_volume`（localStorage key）
- **静音设置**：`mute_settings`（JSON：`{ start: true, map: true }`）
- 均通过 `wx.setStorageSync` 保存，重启小程序后恢复

---

## 十二、云同步

### 1. 核心文件

| 文件 | 作用 |
|------|------|
| `utils/cloudSync.js` | `CloudSync` 单例：`syncToCloud` / `loadFromCloud` / `forceSync` |
| `store/gameStore.js` | 在 `_save()` 中自动调用 `cloudSync.syncToCloud`，在构造函数中尝试 `cloudSync.loadFromCloud` |
| `app.js` | `onLaunch` 中 `wx.cloud.init({ env: CLOUD_ENV })` |

### 2. 启用步骤（微信开发者工具手动）

1. 左侧「云开发」→ 开通 → 创建云环境（免费版即可）
2. 在 `app.js` 的 `CLOUD_ENV` 常量中填入你的环境 ID（如 `'campus-tour-3gxxxxxxxxxxx'`）
3. 云开发控制台 → 数据库 → 新建集合：`user_saves`
4. `user_saves` → 权限设置 → 选「仅创建者可读写」

### 3. 数据同步字段

云数据库 `user_saves` 存储的文档字段（与 `gameStore.state` 对齐）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `player` | Object | 主校园玩家位置 / 方向 |
| `sportsPlayer` | Object | 运动场玩家位置 / 方向 |
| `isDay` | Boolean | 是否白天 |
| `season` | String | spring / summer / autumn / winter |
| `backpack` | Array | 徽章和物品 |
| `saveOnQuit` | Boolean | 是否保存进度 |
| `updatedAt` | Date | 云数据库服务端时间 |

### 4. 设计原则

- **失败不阻塞**：云端失败时静默降级到本地存储，不影响小程序使用
- **防抖合并**：`minSyncInterval = 3000ms`，避免频繁写云数据库
- **首次启动云端覆盖**：云存档徽章数 ≥ 本地时，用云端数据覆盖本地（仅覆盖 player/isDay/season/backpack/sportsPlayer，不覆盖用户设置）

### 5. 手动同步

设置页面按钮调用 `gameStore.forceSyncToCloud()` → 内部清时间戳后走一次完整 `cloudSync.forceSync()`，并显示 `wx.showToast` 反馈。

---

## 十三、日志系统

### 1. 核心文件

`utils/logger.js`（单例 `Logger`）

### 2. 四个日志级别

```javascript
const logger = require('../../utils/logger.js');

logger.debug('map', 'player move', { x: 100, y: 200 });  // 调试信息
logger.info('map', 'building entered', { id: 'library' }); // 普通信息
logger.warn('map', 'unknown building id', { id: 'xxx' }); // 警告（非致命）
logger.error('app', 'init failed', error && error.message); // 错误
```

### 3. 输出渠道

- **本地**：`console.debug / log / warn / error`，带 `[LEVEL] 模块 | 消息 | 附加JSON` 格式
- **线上**：微信实时日志 `wx.getRealtimeLogManager()`（若存在则同时上报，方便在微信开发者平台查看线上日志）

### 4. 全局错误捕获

`app.js` 已配置：

```javascript
onError(msg) {
  logger.error('app', 'global onerror', msg);
}
onUnhandledRejection(res) {
  logger.warn('app', 'unhandled promise rejection', res && res.reason);
}
```

### 5. try-catch 包装器

```javascript
// 把可能失败的函数包一层，失败自动上报
logger.wrap(() => {
  // 可能抛异常的操作
  JSON.parse(potentiallyInvalidData);
}, 'map', 'data parse failed');
```

---

## 十四、常见问题

### Q：添加建筑后不显示触发气泡？

A：检查 `triggerZone` 坐标是否正确。走到建筑附近用坐标显示确认位置，然后调整 `x` / `y` / `w` / `h` 使其覆盖建筑入口。

### Q：建筑详情页图片不显示？

A：检查 `interiorImage` 路径是否正确，文件是否存在。路径以 `/` 开头表示小程序根目录。页面也处理了图片加载错误，会显示占位文字。

### Q：徽章获得后在背包中看不到？

A：进入 `pages/backpack/backpack.js` 确认是否正确读取 `gameStore.getState().backpack`。徽章被添加为背包物品类型 `badge`。

### Q：从建筑详情页返回地图，玩家位置变了？

A：检查 `store/gameStore.js` 中的 `state.player` 是否持久化到本地。`gameStore` 会自动保存到 `wx.setStorageSync('game_state')`，下次进入地图时恢复坐标。

### Q：如何修改狮子的移动速度？

A：修改 `config/gameConfig.js` 中的 `PLAYER.SPEED`（像素/秒）。

### Q：横屏后摇杆太大/太小？

A：修改 `config/gameConfig.js` 中的 `UI.JOYSTICK_RADIUS`，同时同步修改 `map.js` 和 `sports.js` 中 `data.joystickBaseR` 的初始值（已通过 `UI.JOYSTICK_RADIUS` 自动读取）。

### Q：地图包体太大无法上传？

A：在 `app.json` 中配置分包，将 building/sports 页面及其插画放入分包：

```json
"subPackages": [{
  "root": "subpkg",
  "pages": ["pages/building/building"]
}]
```

### Q：从运动场返回主校园后位置不对？

A：两个地图使用独立的坐标存储（`state.player` vs `state.sportsPlayer`）。从运动场返回地图页不会修改主校园坐标——但如果用户在建筑详情页的返回按钮操作，会正常回到进入时的位置。

### Q：狮子颜色/图案想自定义？

A：直接编辑 `utils/sprite.js` 中的 `SPRITE_COLORS`（修改颜色）或 `SPRITE_GRIDS`（修改像素图案）。例如修改 `SPRITE_COLORS.b` 为新的身体颜色。

### Q：想新增第四个方向的不同图案？

A：`SPRITE_GRIDS` 已支持 `down` / `up` / `left` / `right` 四个方向，直接编辑对应字符网格即可。注意保持每个方向网格行数和列数一致。

### Q：页面切换有闪屏/白屏？

A：确认 `onShow()` 中已重置并重新启动进度条过渡画面。过渡遮罩（`.loading-overlay`）应覆盖整个页面，确保 Canvas 初始化和图片加载期间用户看不到空白/闪烁。相关实现见「八、过渡画面与进度条」章节。

### Q：想增加下雨/下雪效果？

A：在 `config/gameConfig.js` 中控制 `season`（spring/summer/autumn/winter），或在设置页面增加季节切换按钮。`map.js` 的 `_updateWeatherEffect()` 会自动根据季节显示雨/雪。详见「十、天气效果」章节。

### Q：如何开启云端存档同步？

A：参考「十二、云同步」章节：1) 开通微信云开发获取环境 ID；2) 在 `app.js` 的 `CLOUD_ENV` 填入 ID；3) 云开发控制台建 `user_saves` 集合；4) 权限设为「仅创建者可读写」。未配置时，云相关功能自动降级为纯本地存储，不影响使用。

### Q：如何查看线上玩家的报错日志？

A：`utils/logger.js` 自动走 `wx.getRealtimeLogManager()` 上报（若存在）。在微信小程序管理后台「开发 → 运维中心 → 实时日志」即可查看线上玩家的 error/warn 日志。本地调试时，`logger.info/warn/error` 也会在 Console 中打印。