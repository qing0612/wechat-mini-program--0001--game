# 河北师范大学 校园像素风 漫游小程序

一款基于微信小程序的像素风校园漫游应用。玩家可以控制像素狮子角色在校园中探索，进入建筑物了解历史介绍，收集徽章，并体验天气、季节、昼夜等丰富的游戏元素。进入页面和页面切换时带有像素风进度条加载过渡动画，消除切换闪烁。

## 功能亮点

- 🎮 **双地图系统**:校园主地图 + 运动场独立地图
- 🏛️ **6 座建筑**:图书馆、博物馆、软件学院、天桥、真知讲堂、体育场馆
- 🎒 **背包系统**:探索建筑收集物品和徽章
- 🏅 **徽章系统**:每座建筑提供独特徽章，可在背包中查看
- 📊 **成就统计**:总移动步数 / 已探索建筑数 / 已收集徽章数（设置页实时显示）
- 🔊 **背景音乐**:可分别控制启动页与地图页的音乐
- 🌞 **日夜切换**:体验校园昼夜风景变化
- 🌸 **四季系统**:春/夏/秋/冬 季节切换
- 💾 **自动存档**:玩家位置、背包、设置自动保存到本地
- ☁️ **云端存档**（可选）:配置云开发后，进度自动同步到云端，换手机不丢进度
- 🛡️ **隐私合规**:内置隐私政策页面、用户协议页面，支持微信官方隐私授权弹窗
- ⚙️ **无痕模式**:可选不保存进度，保持游戏状态独立
- ⏳ **像素风加载过渡**:页面进入和切换时显示带进度条的像素风加载画面，完全消除 Canvas 初始化闪烁

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
- 尺寸建议: 长边 2000-2400 像素，不超过 2MB

#### B. 运动场底图 → `images/map/sports-bg.webp`
- 为体育场馆独立地图准备背景图，尺寸匹配 `SPORTS_MAP` (949×1592)

#### C. 启动页北门背景（图三） → `images/start-bg.png`
- 直接保存图三为 PNG 即可

#### D. 狮子主角精灵图 → `images/lion/`
- **MVP 模式**: 无需准备！ 代码已内置了像素风狮子绘制（色块模拟），开箱即用
- **进阶**: 用 Piskel(piskelapp.com) 手绘 4 方向行走帧 8 张
- 替换文件: `walk-down-1.png`, `walk-down-2.png`, `walk-up-1.png`... 等 9 张

#### E. 建筑内部插画 → `images/buildings/`
- 需要 6 张像素风室内场景：
  - `library.webp` — 图书馆内部
  - `museum.webp` — 博物馆内部
  - `software.webp` — 软件学院内部
  - `pont.png` — 天桥内部
  - `lecture.png` — 真知讲堂内部
  - `sports-bg.webp` — 体育场馆背景（用作独立地图）
- 每张约 800×600，可用 AI 生成像素风室内场景

#### F. 徽章图标 → `images/badges/`
- 为每座建筑准备一枚徽章图标，PNG/WEBP 格式

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
│  ├─ building/                    # 建筑详情页（插画+历史文案+徽章领取）
│  ├─ settings/                    # 设置页（音乐/日夜/季节/无痕/云端同步/成就统计/隐私政策）
│  ├─ backpack/                    # 背包页（16格物品栏+徽章查看）
│  └─ privacy/                     # ★ 隐私政策页（隐私政策+用户协议，上架必查）
│
├─ data/
│  ├─ buildings.js                 # ★ 建筑配置（6座建筑+触发区+碰撞区）
│  └─ buildingHistory.js           # ★ 建筑历史文案（独立文件，方便编辑和扩展）
│
├─ config/
│  └─ gameConfig.js                # 游戏参数（速度/地图尺寸/动画帧/摇杆半径）
│
├─ services/
│  └─ buildingService.js           # 建筑服务（查询/触发检测）
│
├─ store/
│  └─ gameStore.js                 # ★ 游戏状态管理（单例+订阅+本地存档+云端同步+成就统计）
│
├─ utils/                          # 工具类
│  ├─ joystick.js                  # 虚拟摇杆（触摸归一化）
│  ├─ camera.js                    # 摄像机/世界坐标↔屏幕坐标转换
│  ├─ collision.js                 # 碰撞检测（AABB）
│  ├─ sprite.js                    # 精灵/玩家绘制（像素狮子）
│  ├─ weatherEffect.js             # 天气粒子效果（雨/雪）
│  ├─ audioManager.js              # ★ 音频管理器（单例+分页面音乐+音量持久化）
│  ├─ cloudSync.js                 # ★ 云同步（微信云开发 user_saves 集合，可选启用）
│  └─ logger.js                    # ★ 统一日志工具（接入微信实时日志，线上排查问题）
│
├─ test/                           # ★ 单元测试目录
│  ├─ camera.test.js               # 摄像机与坐标转换测试
│  └─ collision.test.js            # AABB 碰撞检测测试
│
├─ images/                         # 美术资源
│  ├─ map-bg.png / start-bg.png    # 主地图/启动页背景
│  ├─ buildings/                   # 建筑内部插画
│  ├─ badges/                      # 徽章图标
│  └─ map/sports-bg.webp           # 运动场背景
│
├─ audio/                          # 音频资源
│  ├─ bgm.mp3                      # 启动页音乐
│  └─ bgm2.mp3                     # 地图页音乐
│
├─ i18n/
│  └─ base.json                    # 多语言基础配置（预留）
│
├─ styles/
│  └─ pixel-theme.wxss             # 像素风主题样式
│
├─ .eslintrc.json                  # ★ ESLint 代码规范配置
├─ .eslintignore                   # ★ ESLint 忽略文件
├─ package.json                    # ★ 脚本与开发依赖（eslint/jest）
├─ GUIDE.md                        # 建筑与人物添加指南（开发者参考）
├─ DEVELOPER_RULES.md              # 开发规则与约定
├─ sitemap.json                    # 搜索收录配置
└─ project.config.json             # 微信项目配置（AppID/libVersion/__usePrivacyCheck__/packOptions.ignore）
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

**工作原理**：页面进入或从其他页面返回时，先显示覆盖全屏的深色遮罩层（`map-overlay`），通过 JS 控制 `loadProgress` 从 0% 到 100% 分阶段递增，进度达到 100% 后延迟 300ms 自动隐藏遮罩，此时 Canvas 和图片已完成初始化，实现零闪烁过渡。

**分阶段文字**：
- 0% → 30%：资源加载中...
- 30% → 70%：初始化画布... / 加载地图资源...（或"加载运动场..."）
- 85% → 100%：准备就绪...

**进度与资源联动**：进度条在图片 `onload` 回调触发后才会从 70% 继续推进到 100%，图片加载失败时也不会卡住（`onerror` 同样标记为加载完成）。

**CSS 样式**：像素风格进度条（深色容器 + 橙色渐变 + 发光阴影 + 网格纹理 + 闪烁像素点），与游戏整体视觉一致。

**相关代码**：
- `pages/map/map.js`: `_startProgress()` 方法
- `pages/map/map.wxml`: `.map-overlay` 及其子元素
- `pages/map/map.wxss`: `.progress-bar-outer`, `.progress-bar-inner`, `.pixel-dot`, `@keyframes pixelBlink`
- `pages/sports/sports.*`: 运动场页面相同结构

### 建筑与触发系统
- **触发检测**: AABB 矩形碰撞检测，玩家进入 `triggerZone` 时弹出气泡
- **碰撞区**: `collisionZone` 定义建筑实体边界（预留）
- **建筑服务**: `buildingService.js` 统一提供建筑查询与触发检测
- **特殊建筑**: `isSportsField` 标记体育场馆，进入时跳转到独立 `sports` 页面
- **历史文案**: 文案独立在 `data/buildingHistory.js`，`buildings.js` 通过 `HISTORY_TEXTS.id` 引用

### 状态管理（gameStore）
- **单例模式**: `module.exports = new GameStore()`
- **订阅-通知**: `subscribe()` / `notify()` 支持页面间状态同步
- **持久化**: 自动写入 `wx.setStorageSync('game_state')`，下次启动恢复
- **云端同步**（可选）: 状态变更后异步写入云数据库 `user_saves` 集合，3秒防抖避免频繁请求
- **无痕模式**: `saveOnQuit: false` 时不读取/不保存历史数据
- **成就统计**: `stats` 对象记录 `totalSteps`（总步数）、`buildingsVisited`（探索建筑数=徽章数）、`badgesCollected`（已收集徽章数）、`firstLaunchAt`（首次启动时间）
- **管理字段**: `player`(坐标/方向)、`sportsPlayer`(运动场坐标)、`isDay`、`season`、`backpack`、`saveOnQuit`、`stats`
- **安全兜底**: 构造函数整体 try-catch，任何异常回落到最小可用状态，绝不黑屏

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
- **季节映射**: 春→无效果、夏→无效果、秋→无效果、冬→雪（预留雨）
- **日夜叠加**: `isDay` 控制画面色调（预留）

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

详细的建筑添加、角色定制、坐标校准方法请参见 [GUIDE.md](./GUIDE.md)。开发规则与约定参见 [DEVELOPER_RULES.md](./DEVELOPER_RULES.md)。