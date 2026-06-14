# 河北师范大学 校园像素风 漫游小程序

一款基于微信小程序的像素风校园漫游应用。玩家可以控制像素狮子角色在校园中探索，进入建筑物了解历史介绍，收集徽章，并体验天气、季节、昼夜等丰富的游戏元素。进入页面和页面切换时带有像素风进度条加载过渡动画，消除切换闪烁。

## 功能亮点

- 🎮 **双地图系统**:校园主地图（1893×1093）+ 运动场独立地图（949×1592），各自独立的玩家坐标存储
- 🏛️ **6 座建筑**:图书馆、博物馆、软件学院、天桥、真知讲堂、体育场馆
- 🎒 **背包系统**:探索建筑收集徽章，`backpack.length` = 已探索建筑数 = 已获得徽章数（唯一真相来源）
- 🏅 **徽章系统**:每座建筑在 `data/buildings.js` 中配置一个 `badge` 字段，进入详情页自动获得
- 📊 **成就统计**:总移动步数 / 已探索建筑数 / 已收集徽章数 / 首次启动时间（设置页实时显示）
- 🔊 **背景音乐**:可分别控制启动页与地图页的音乐开关和音量，持久化到本地存储
- 🌞 **日夜切换**:通过 `gameStore.state.isDay` 控制，切换后地图页画面立即变化，状态持久化
- 🌸 **四季系统**:春/夏/秋/冬 季节切换，夏季自动显示下雨，冬季自动显示飘雪粒子效果
- 💾 **自动存档**:玩家位置、背包、设置自动保存到 `wx.setStorageSync('game_state')`
- ☁️ **云端存档**（可选）:配置云开发后，进度自动同步到 `user_saves` 集合，换手机不丢进度
- 🛡️ **隐私合规**:内置隐私政策页面、用户协议页面，支持微信官方隐私授权弹窗（`__usePrivacyCheck__` 已开启）
- ⚙️ **无痕模式**:可选不保存进度（`saveOnQuit = false`），保持游戏状态独立
- ⏳ **像素风加载过渡**:页面进入和切换时显示带进度条的像素风加载画面，分阶段文字提示，完全消除 Canvas 初始化闪烁

## 快速开始

### 1. 安装开发环境
1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (Stable 稳定版)
2. 注册小程序 AppID: 登录 [mp.weixin.qq.com](https://mp.weixin.qq.com) → 注册小程序 → 获取 AppID
   - 或在开发者工具新建项目时勾选"测试号"(开发预览，不可发布)
3. 开发者工具 → "导入项目" → 选本目录 → 填入 AppID 或勾选测试号

### 2. 代码规范检查（推荐）

项目已配置 ESLint 规则，统一代码风格。在发布前执行一次检查：

```bash
# 安装依赖（首次使用）
npm install

# 检查所有 JS 文件
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

主要规则：2 空格缩进、单引号、必须分号、禁止 `var`、函数括号前需空格等。详见 `.eslintrc.json`。

### 3. 准备美术素材（重要！）

项目目前有**占位图**，直接导入即可预览布局和交互逻辑。但要获得完整效果，需要替换以下素材：

#### A. 地图底图（校园像素化） → `images/map-bg.png`
- **方法一**: Photoshop 打开图一 → 滤镜 → 像素化 → 马赛克（8-12像素） → 导出 PNG
- **方法二**: 免费在线工具 pixelitapp.com → 上传图一 → 调整像素块大小 → 下载
- 尺寸建议: 长边 2000-2400 像素，不超过 2MB，必须匹配 `config/gameConfig.js` 的 `MAP.WIDTH/HEIGHT`（当前 1893×1093）

#### B. 运动场底图 → `images/map/sports-bg.png`
- 为体育场馆独立地图准备背景图，尺寸匹配 `SPORTS_MAP.WIDTH/HEIGHT`（当前 949×1592）
- 实际路径由 `data/buildings.js` 中 `sports` 建筑的 `interiorImage` 字段配置，更换底图只需修改该字段

#### C. 启动页北门背景（图三） → `images/start-bg.png`
- 直接保存图三为 PNG 即可

#### D. 狮子主角 → 代码内置像素网格绘制（无需图片）
- `utils/sprite.js` 中 `SPRITE_GRIDS` 定义四个方向的像素网格图案，每个字符对应 `SPRITE_COLORS` 中的颜色
- 每个字符渲染为 4×4 像素方块，总绘制尺寸 48 像素
- 修改颜色：编辑 `SPRITE_COLORS`；修改图案：编辑 `SPRITE_GRIDS[dir]` 字符网格
- 动画帧率由 `config/gameConfig.js` 的 `ANIMATION.FRAME_DURATION` 控制（当前 200ms/帧）

#### E. 建筑内部插画 → `images/buildings/`
- 需要 5 张室内场景（图书馆、博物馆、软件学院、天桥、真知讲堂）：
  - `library.png` — 图书馆内部
  - `museum.png` — 博物馆内部
  - `software.png` — 软件学院内部
  - `pont.png` — 天桥内部
  - `lecture.png` — 真知讲堂内部
- 每张约 800×600，可用 AI 生成像素风室内场景
- 文件路径由 `data/buildings.js` 中每座建筑的 `interiorImage` 字段配置

#### F. 徽章图标 → `images/badges/`
- 为每座建筑准备一枚徽章图标，PNG 格式（透明背景）
- 文件路径由 `data/buildings.js` 中每座建筑的 `badge.image` 字段配置
- 体育场馆徽章当前复用了 `lecture-badge.png`，如需独立徽章需新增 `sports-badge.png` 并更新配置

### 4. 填写建筑历史文案

建筑历史文案已独立到 `data/buildingHistory.js`，按建筑 id 为 key 组织：

```javascript
// data/buildingHistory.js
module.exports = {
  library: '河北师范大学图书馆始建于...',
  museum: '...',
  // ... 其他建筑
};
```

在 `data/buildings.js` 中通过 `historyText: HISTORY_TEXTS.library` 引用，修改文案只需编辑 `buildingHistory.js`。

### 5. 校准建筑触发区坐标

在开发者工具中预览后，走到各建筑附近，右下角会实时显示坐标。记录下来填入 `data/buildings.js` 的 `triggerZone`：

```javascript
triggerZone: { x: 实测X, y: 实测Y, w: 140, h: 110 }
```

### 6. 准备音频文件

将背景音乐文件放入 `audio/` 目录：
- `bgm.mp3` — 启动页音乐
- `bgm2.mp3` — 地图页音乐

音频设置可在 **设置页** 中分别控制开关与音量。

### 7. 单元测试（可选）

对关键工具函数（摄像机、碰撞检测等）进行自动化测试：

```bash
npm install    # 首次使用
npm test       # 运行所有测试
npm run test:coverage   # 显示覆盖率
```

测试文件位于 `test/` 目录，测试框架为 Jest。

### 8. 开通云开发（可选，推荐）

开通后自动启用**云端存档**，换手机、清缓存不丢进度。步骤：

1. 微信开发者工具 → 顶部「云开发」→ 开通 → 创建环境（免费版即可）
2. 打开 `app.js`，第 17 行附近填入你的云环境 ID：
   ```javascript
   const CLOUD_ENV = 'cloud1-xxxxxx'; // 替换为你的环境ID
   ```
3. 云开发控制台 → 数据库 → 新建集合 `user_saves`
4. `user_saves` 集合 → 「权限设置」→ 选「**仅创建者可读写**」
5. 重新编译运行，设置页「同步进度到云端」按钮即可使用

> 💡 **没填环境ID也没关系**：云相关代码会自动短路跳过，完全不影响本地运行。

### 9. 配置隐私政策（上架必做）

1. 项目已内置 `pages/privacy/` 页面（含隐私政策 + 用户协议），从设置页可访问
2. **必须手动做**: 登录微信公众平台后台 → 设置 → 基本设置 → 用户隐私保护指引 → 填写隐私政策文本（可复制 `pages/privacy/privacy.wxml` 中的内容）
3. `project.config.json` 中已启用 `"__usePrivacyCheck__": true`，无需额外配置

### 10. 预览测试
1. 开发者工具左侧自动渲染 → 确认启动页和地图正常显示
2. 测试摇杆移动、建筑触发、进入详情页、返回地图
3. 测试背包、徽章获取、设置页、云端同步等功能
4. 右上角"预览"扫码 → 手机真机测试

### 11. 发布（需 AppID）
- 开发者工具点击"上传" → 填写版本号
- 登录 mp.weixin.qq.com → 版本管理 → 提交审核

## 项目结构

```javascript
小程序/
├─ app.json / app.js / app.wxss    # 全局配置（横屏/导航/页面注册/云开发初始化/隐私协议）
│
├─ pages/                          # 页面目录（共 7 个页面）
│  ├─ start/                       # 启动页（北门背景+进入按钮/新建游戏）
│  ├─ map/                         # 核心地图（Canvas渲染+像素风进度条加载+摇杆+触发气泡）
│  ├─ sports/                      # 运动场子地图（独立 Canvas+像素风进度条加载+返回按钮）
│  ├─ building/                    # 建筑详情页（插画+历史文案+徽章领取弹窗）
│  ├─ settings/                    # 设置页（音乐/日夜/季节/无痕/云端同步/成就统计/隐私政策）
│  ├─ backpack/                    # 背包页（物品栏+徽章查看+丢弃/使用）
│  └─ privacy/                     # ★ 隐私政策页（隐私政策+用户协议，上架必查）
│
├─ data/
│  ├─ buildings.js                 # ★ 建筑配置（6座建筑+triggerZone+collisionZone+badge）
│  └─ buildingHistory.js           # ★ 建筑历史文案（独立文件，文案唯一真相来源）
│
├─ config/
│  └─ gameConfig.js                # 游戏参数（玩家速度/大小+出生点+地图尺寸+动画帧+摇杆半径）
│
├─ services/
│  └─ buildingService.js           # 建筑服务（查询+触发检测，封装 buildings.js 原始数据）
│
├─ store/
│  └─ gameStore.js                 # ★ 游戏状态管理（单例+订阅+本地存档+云端同步+成就统计）
│
├─ utils/                          # 工具类
│  ├─ joystick.js                  # 虚拟摇杆（触摸归一化）
│  ├─ camera.js                    # 摄像机/世界坐标↔屏幕坐标转换
│  ├─ collision.js                 # 碰撞检测（AABB）
│  ├─ sprite.js                    # 精灵/玩家绘制（像素网格狮子，SPRITE_GRIDS + SPRITE_COLORS）
│  ├─ weatherEffect.js             # 天气粒子效果（雨/雪，基于季节自动切换）
│  ├─ audioManager.js              # ★ 音频管理器（单例+分页面音乐+音量/静音持久化）
│  ├─ cloudSync.js                 # ★ 云同步（微信云开发 user_saves 集合，3秒防抖，可选启用）
│  └─ logger.js                    # ★ 统一日志工具（接入微信实时日志，线上排查问题）
│
├─ test/                           # ★ 单元测试目录（Jest）
│  ├─ camera.test.js               # 摄像机与坐标转换测试
│  └─ collision.test.js            # AABB 碰撞检测测试
│
├─ images/                         # 美术资源（路径一律以 / 开头）
│  ├─ map-bg.png                   # 主地图背景（1893×1093）
│  ├─ start-bg.png                 # 启动页背景
│  ├─ buildings/                   # 建筑内部插画（5张 PNG）
│  ├─ badges/                      # 徽章图标（PNG，透明背景）
│  └─ map/sports-bg.png            # 运动场地图背景（949×1592，独立地图使用）
│
├─ audio/                          # 音频资源
│  ├─ bgm.mp3                      # 启动页音乐
│  └─ bgm2.mp3                     # 地图页音乐
│
├─ styles/
│  └─ pixel-theme.wxss             # 像素风主题样式
│
├─ .eslintrc.json                  # ★ ESLint 代码规范配置（2空格/单引号/分号/禁止var 等）
├─ .eslintignore                   # ★ ESLint 忽略文件
├─ .gitignore                      # ★ Git 忽略（node_modules/IDE临时文件/构建输出）
├─ package.json                    # ★ 脚本与开发依赖（eslint/jest）
├─ README.md                       # ★ 项目说明（开发者首次阅读）
├─ GUIDE.md                        # ★ 开发指南（添加建筑/角色/徽章/地图等操作说明）
├─ DEVELOPER_RULES.md              # ★ 开发规则与协作规范（修改代码前必读+Git/Gitee 工作流）
├─ project.config.json             # 微信项目配置（AppID/libVersion/__usePrivacyCheck__/packOptions.ignore）
└─ sitemap.json                    # 搜索收录配置
```

## 技术要点

### 渲染与游戏循环
- **渲染**: Canvas 2D，`requestAnimationFrame` 驱动游戏循环
- **控制**: 虚拟摇杆（触摸事件 → 归一化方向向量）
- **视口**: 摄像机跟随玩家，地图边缘停止
- **动画**: 行走帧动画（`SpriteAnimator`），2帧循环，200ms/帧
- **双地图**: 校园地图（1893×1093） + 运动场地图（949×1592）

### 像素风加载过渡画面（消除切换闪烁）
`pages/map/` 和 `pages/sports/` 页面均已集成。

**工作原理**：页面进入或从其他页面返回时，先显示覆盖全屏的深色遮罩层（`.loading-overlay`），通过 JS 控制 `loadProgress` 从 0% 到 100% 分阶段递增，进度达到 100% 后延迟 300ms 自动隐藏遮罩，此时 Canvas 和图片已完成初始化，实现零闪烁过渡。

**分阶段文字**：
- 0% → 30%：资源加载中...
- 30% → 70%：初始化画布... / 加载地图资源...（或"加载运动场..."）
- 85% → 100%：准备就绪...

**进度与资源联动**：进度条在图片 `onload` 回调触发后才会从 70% 继续推进到 100%，图片未加载完成时上限 90%（每步 +0.5%，防止卡死）。

**CSS 样式**：像素风格进度条（深色容器 + 橙色渐变 + 发光阴影 + 网格纹理 + 闪烁像素点），与游戏整体视觉一致。

**相关代码**：
- `pages/map/map.js`: `_startProgress()` 方法，`onShow()` 重置并重新启动
- `pages/map/map.wxml`: `.loading-overlay` 及其子元素
- `pages/map/map.wxss`: `.progress-bar-outer`, `.progress-bar-inner`, `.pixel-dot`, `@keyframes pixelBlink`
- `pages/sports/sports.*`: 运动场页面相同结构

**data 字段**：`loadProgress`（当前百分比）、`loadVisible`（是否显示）、`loadStageText`（阶段提示文字）

### 建筑与触发系统
- **触发检测**: AABB 矩形碰撞检测，玩家进入 `triggerZone` 时弹出气泡
- **碰撞区**: `collisionZone` 定义建筑实体边界（预留）
- **建筑服务**: `buildingService.js` 统一提供建筑查询与触发检测
- **特殊建筑**: `isSportsField` 标记体育场馆，进入时跳转到独立 `sports` 页面
- **历史文案**: 文案独立在 `data/buildingHistory.js`，`buildings.js` 通过 `HISTORY_TEXTS.id` 引用

### 状态管理（gameStore）
- **单例模式**: `module.exports = new GameStore()`，全局只有一个实例
- **订阅-通知**: `subscribe(callback)` / `unsubscribe(callback)` / `notify()`，页面通过监听状态变化自动刷新
- **主要 API**:
  - `getState()` — 获取当前完整状态
  - `setState(partial)` — 部分更新状态并通知
  - `updatePlayerPos(x, y, dir)` — 更新玩家位置，增加步数
  - `addToBackpack(item)` — 添加物品/徽章到背包
  - `hasBadge(badgeId)` — 检查是否已获得某徽章
  - `resetGame()` — 重置玩家位置、背包、步数、日夜/季节等
  - `forceSyncToCloud()` — 立即同步到云端（设置页按钮调用）
- **持久化**: 自动写入 `wx.setStorageSync('game_state')`，下次启动恢复
- **云端同步**（可选）: 状态变更后异步写入云数据库 `user_saves` 集合，3 秒防抖（`minSyncInterval = 3000ms`）避免频繁请求
- **无痕模式**: `saveOnQuit: false` 时不读取/不保存历史数据
- **安全兜底**: 构造函数整体 try-catch，任何异常回落到最小可用状态 `{ player: DEFAULT_SPAWN, backpack: [], isDay: true, season: 'spring', saveOnQuit: true, stats: DEFAULT_STATS }`，绝不黑屏

### 音频系统（audioManager）
- **单例模式**: 全局唯一音频上下文，避免重复创建
- **分页面音乐**: `start` / `map` 两个键位，可独立开关
- **持久化**: 音量和静音设置保存到 `wx.getStorageSync`
- **接口**: `playWithMuteCheck(key)` 根据静音设置智能播放

### 云同步系统（cloudSync，可选）
- **动态可用性**: 仅当 `app.js` 中填入 `CLOUD_ENV` 且 wx.cloud.init 成功后才启用
- **数据库集合**: 使用 `user_saves` 集合，权限设为「仅创建者可读写」，天然按微信 OpenID 隔离用户数据
- **读取策略**: 启动时读取云端存档，对比徽章数，谁更新用谁的（避免覆盖新手机的新进度）
- **写入策略**: 每次 `gameStore.notify()` 触发时异步写入，3 秒防抖
- **手动同步**: 设置页「同步进度到云端」按钮可立即同步

### 日志系统（logger）
- **统一工具**: `logger.info/warn/error()` 替代分散的 `console.log`
- **实时日志**: 接入 `wx.getRealtimeLogManager()`，线上错误可在微信开发者工具实时日志面板查看
- **全局捕获**: `app.js` 中 `onError` / `onUnhandledRejection` 统一上报

### 天气与季节（weatherEffect）
- **粒子系统**: 雨/雪 两种效果，基于 Canvas 粒子绘制
- **季节映射**: `gameStore.state.season` →
  - `spring`（春）：无天气效果
  - `summer`（夏）：下雨粒子效果
  - `autumn`（秋）：无天气效果
  - `winter`（冬）：飘雪粒子效果
- **粒子数量**: 雨 = `width × height × 0.0003`；雪 = `width × height × 0.00015`
- **动态切换**: 切换季节后 `map.js` 的 `_updateWeatherEffect()` 自动重置并启动对应效果

### 代码规范（ESLint）
- **配置文件**: `.eslintrc.json`，基于 `eslint:recommended`
- **关键规则**：2 空格缩进、必须分号、单引号优先、禁止 `var`、函数括号前需空格、禁止 Tab、空行不超过 2 行
- **小程序全局变量**：`wx`, `App`, `Page`, `Component`, `Behavior`, `getApp`, `getCurrentPages` 已声明为只读全局变量，避免 `no-undef` 误报
- **执行命令**：`npm run lint`（检查）/ `npm run lint:fix`（自动修复）
- **忽略规则**：`.eslintignore` 中排除 `node_modules/` 等无需检查的目录

### 打包排除优化（packOptions.ignore）
`project.config.json` 的 `packOptions.ignore` 已配置以下项目，不打入发布包，控制包体大小：

| 类型 | 排除项 | 说明 |
|------|--------|------|
| folder | `.claude` | IDE 配置目录 |
| folder | `.git` | Git 版本库 |
| folder | `.vscode` | VSCode 配置 |
| folder | `node_modules` | npm 依赖 |
| folder | `test` | 单元测试 |
| folder | `docs` | 文档目录 |
| file | `README.md` | 项目说明 |
| file | `GUIDE.md` | 开发指南 |
| file | `LICENSE` | 许可证 |
| file | `.eslintrc.json` | Lint 配置 |
| file | `.eslintignore` | Lint 忽略 |
| file | `package.json` | npm 配置 |
| file | `package-lock.json` | npm 锁文件 |
| file | `.gitignore` | Git 忽略 |

### 单元测试（Jest）
- **测试框架**: Jest 29.x（`npm test`）
- **测试目录**: `test/`，文件格式 `*.test.js`
- **已覆盖模块**：
  - `utils/camera.js`：摄像机位置计算、世界坐标↔屏幕坐标转换、地图边界处理
  - `utils/collision.js`：AABB 矩形碰撞/包含/点在矩形内检测
- **覆盖率**: `npm run test:coverage` 生成报告

### 隐私合规
- **隐私协议弹窗**: 启动时检测微信官方隐私授权状态，按需弹出 `wx.openPrivacyContract`
- **隐私开关**: `project.config.json` 中 `"__usePrivacyCheck__": true`，`app.json` 中 `"requiredPrivateInfos": []`（空数组表示不请求任何敏感权限）
- **隐私政策页**: `pages/privacy/privacy` 提供可访问的隐私政策和用户协议文本

### 导航与数据持久化
- 玩家位置通过 `gameStore` 跨页面保持，返回地图时回到原位
- 运动场有独立的 `sportsPlayer` 坐标，与主地图互不影响
- `backpack` 系统支持徽章领取、物品叠加数量、丢弃、使用
- 换手机场景：启用云开发后，登录同一微信自动拉取云端存档

## 配置参数速查

修改 `config/gameConfig.js` 可调整核心参数：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `PLAYER.SPEED` | 160 | 玩家移动速度（像素/秒） |
| `PLAYER.SIZE` | 48 | 玩家绘制尺寸（像素） |
| `MAP.WIDTH` / `HEIGHT` | 1893×1093 | 主地图实际像素尺寸 |
| `SPORTS_MAP.WIDTH` / `HEIGHT` | 949×1592 | 运动场地图实际像素尺寸 |
| `UI.JOYSTICK_RADIUS` | 45 | 摇杆半径（像素） |
| `ANIMATION.FRAME_COUNT` | 2 | 行走动画帧数 |
| `ANIMATION.FRAME_DURATION` | 200 | 每帧持续时间（ms） |

### 进度条参数速查（`pages/map/map.js` 中的 `_startProgress()`）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 阶段推进间隔 | 50ms | setInterval 定时器时长 |
| 阶段一（资源加载） | 0% → 30% | 每步 +2% |
| 阶段二（画布/地图） | 30% → 70% | 每步 +1.5% |
| 阶段三（准备就绪） | 70% → 100% | 每步 +3%，需地图 `onload` 完成 |
| 图片未加载完成时上限 | 90% | 每步 +0.5%，避免卡死 |
| 完成后延迟隐藏 | 300ms | 100% 后隐藏遮罩的延迟 |

### 云同步参数速查（`utils/cloudSync.js`）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `minSyncInterval` | 3000ms | 云写入最小间隔（防抖） |
| 集合名 | `user_saves` | 云数据库存储玩家存档 |
| 权限 | 仅创建者可读写 | 每个用户只能看到自己的存档 |

## 包体限制

微信小程序主包限制 2MB。如果美术素材过大，将 building 页面配置为分包：

```json
// app.json
"subPackages": [{
  "root": "pages/building",
  "pages": ["building"]
}]
```

> 💡 注：`project.config.json` 的 `packOptions.ignore` 已排除测试目录、Lint 配置、文档、npm 依赖、Git 目录等非运行时文件，有效控制打包体积。

## 上架检查清单

提交审核前确保以下项目齐全：

| 项目 | 状态 | 文件/配置 |
|------|------|----------|
| AppID 已配置 | ⬜ | `project.config.json` |
| 代码已执行 `lint:fix` | ⬜ | `npm run lint:fix` |
| 隐私政策后台已填写 | ⬜ | 微信公众平台后台 → 用户隐私保护指引 |
| `__usePrivacyCheck__` 开关 | ✅ | `project.config.json` 已配置 |
| `requiredPrivateInfos` 权限声明 | ✅ | `app.json` 已配置空数组 |
| `packOptions.ignore` 打包排除 | ✅ | `project.config.json` 已配置 |
| 隐私政策页面可访问 | ✅ | `pages/privacy/` 已内置 |
| 用户协议页面可访问 | ✅ | `pages/privacy/` tab 切换 |
| `sitemap.json` 搜索配置 | ✅ | 已存在 |
| 云开发环境ID（可选） | ⬜ | `app.js` 中 `CLOUD_ENV` |
| `user_saves` 集合权限（可选） | ⬜ | 云开发控制台 → 仅创建者可读写 |
| 单元测试通过（可选） | ⬜ | `npm test` |
| 页面切换无闪烁 | ✅ | 进度条加载画面已集成（map/sports） |

## 开发指南

### 三个文档的作用

| 文档 | 面向场景 | 核心内容 |
|------|---------|---------|
| **README.md**（本文件） | 第一次接触项目的人 | 项目介绍、功能亮点、快速开始、项目结构、技术要点概述、上架清单 |
| **GUIDE.md** | 修改/扩展项目的开发者 | 添加建筑、自定义角色、徽章系统、双地图、过渡画面、日夜模式、天气效果、音频管理、云同步、日志系统等具体操作指南 |
| **DEVELOPER_RULES.md** | 提交代码的团队成员 | 代码风格、Git 提交规范、文件组织、测试要求、安全约定、Gitee 协作工作流、Bug 修复原则 |

**阅读路径**：先看 README 了解项目 → 遇到开发问题查 GUIDE → 写代码前读 DEVELOPER_RULES 确保符合规范。

详细的建筑添加、角色定制、坐标校准方法请参见 [GUIDE.md](./GUIDE.md)。开发规则与协作规范参见 [DEVELOPER_RULES.md](./DEVELOPER_RULES.md)。

---

## Gitee 协作工作流

本项目使用 Gitee 进行团队协作。以下是推荐的分支与提交规范。

### 分支策略

| 分支 | 用途 | 操作权限 |
|------|------|---------|
| `master` / `main` | 主分支，始终保持可运行、可发布 | 仅通过合并请求（Pull Request）写入 |
| `develop` | 开发集成分支，整合所有功能 | 团队成员可直接提交或通过 PR 合并 |
| `feature/xxx` | 功能分支，例如 `feature/add-building-museum`、`feature/snow-particle` | 开发者在自己的分支上开发 |
| `hotfix/xxx` | 紧急修复分支，例如 `hotfix/map-crash` | 从 `master` 切出，修复后合并回 `master` 和 `develop` |

### 完整开发流程

```
1. 克隆项目到本地
   git clone https://gitee.com/你的用户名/campus-pixel-miniprogram.git
   cd campus-pixel-miniprogram

2. 从 develop 切出功能分支
   git checkout develop
   git pull origin develop
   git checkout -b feature/add-building-gym

3. 开发 + 本地测试（微信开发者工具预览 + lint 检查）
   npm run lint:fix      # 统一代码风格
   npm test              # 运行单元测试（可选）

4. 提交到 Gitee
   git add -A
   git commit -m "feat: 添加体育馆建筑与徽章"
   git push origin feature/add-building-gym

5. 在 Gitee 上发起 Pull Request（PR）：feature/add-building-gym → develop
   - 标题简洁描述改动内容
   - 描述中说明：改动了哪些文件、实现了什么功能、需要测试哪些页面
   - @项目成员请求 Code Review

6. Code Review 通过后，由 Reviewer 合并到 develop
   - 如需修改，直接在同一分支提交并 push，PR 自动更新
   - 合并后删除远程 feature 分支

7. 发布版本时，将 develop 合并到 master，并打 tag
   git checkout master
   git merge develop
   git tag -a v1.2.0 -m "版本 1.2.0：添加体育馆，修复地图切换闪屏"
   git push origin master --tags
```

### 提交信息规范（Conventional Commits 简化版）

commit message 格式：`<type>: <subject>`

| type | 含义 | 示例 |
|------|------|------|
| `feat` | 新增功能 | `feat: 添加体育馆建筑与徽章` |
| `fix` | Bug 修复 | `fix: 修复从运动场返回主校园位置错乱` |
| `docs` | 文档更新 | `docs: 更新 GUIDE.md 徽章系统说明` |
| `style` | 代码风格调整（不影响逻辑） | `style: 统一使用单引号` |
| `refactor` | 代码重构（不新增/不修复功能） | `refactor: 重构建筑服务为单例` |
| `test` | 添加/修改测试 | `test: 补充摄像机边界测试用例` |
| `chore` | 构建/工具链/配置等杂项 | `chore: 更新 ESLint 依赖版本` |

> **原则**: 一次 commit 只做一件事，commit 消息使用中文描述具体做了什么，方便在 Gitee commit 历史中快速检索。

### Code Review（代码评审）要点

1. **必查项**：
   - `npm run lint` 无 error（warning 尽量也消除）
   - `data/buildings.js` 中路径与实际文件一致
   - 修改了 `gameStore` 字段时，`_save()` / `_restore()` 是否同步处理
   - 新增文件路径是否以 `/` 开头
2. **功能测试**：Reviewer 需要在微信开发者工具中实际运行验证
3. **冲突处理**：PR 有冲突时，由 PR 提交者在本地 `git rebase develop` 解决冲突后重新 push
4. **合并方式**：优先使用 Squash Merge（合并为一个 commit 到 develop，保持历史简洁）

### Gitee 项目管理建议

- **Issues**：功能建议、Bug 报告统一在 Gitee Issues 提交，使用标签分类（`bug` / `feature` / `documentation` / `performance`）
- **Milestones**：按版本号管理里程碑，每个里程碑关联一组 Issues 和 PRs
- **Wiki**：可以在 Gitee Wiki 中记录会议纪要、设计讨论等不适合放在代码仓库的文档

---

## 版权说明

本项目为河北师范大学校园漫游小程序，仅供学习交流使用。