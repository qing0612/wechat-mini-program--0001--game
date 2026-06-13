# 📋 代码修改规则 — 每次改代码前必须阅读

> **⚠️ 重要：修改任何代码前，必须从头到尾读完本文件。**
>
> 本文件记录了项目中所有**从历史教训中总结出来的不可违反的规则**。每一条规则背后都是一次踩坑经历。
>
> **规则必须与实际代码一致**——如发现本文件与代码不符，请同时修正代码和本文件。

---

## 🔴 优先级最高：先读再改

1. **第一步永远是：读完本文件 DEVELOPER_RULES.md**

2. **阅读所有相关文件的完整内容，再动手修改**
   - 修改配置前，必须先读 `app.json`、`project.config.json` 的当前完整内容
   - 修改页面前，必须先读该页面的 `.js`、`.wxml`、`.wxss`、`.json` 四个文件
   - 修改数据前，必须先读 `data/buildings.js` 和 `data/buildingHistory.js` 的完整内容
   - 修改状态管理前，必须先读 `store/gameStore.js` 的完整内容
   - 修改工具类前，必须先读对应 `utils/xxx.js` 的完整内容
   - 修改地图/页面前，必须先读 `config/gameConfig.js`（出生点、地图尺寸等关键参数）

3. **先确认文件实际存在，再写路径**
   - 涉及图片、音频等资源路径时，必须先用文件搜索确认该文件**实际存在**于哪个目录
   - 写路径前先看一遍 `images/`、`audio/`、`data/` 目录的实际内容
   - **禁止**在不确认文件存在的情况下写死路径
   - **禁止**引用本文件底部"图片文件清单"中不存在的文件

4. **路径格式：永远以 `/` 开头**
   - 正确：`/images/buildings/library.png`
   - 错误：`images/buildings/library.png`、`./images/buildings/library.png`
   - 页面间跳转 URL：`/pages/settings/settings`

5. **先确认本文件中的规则是否覆盖了你要做的修改**
   - 每次修改前回顾"设计决策速查"表和"常见问题速查表"
   - 做了与既有决策相反的修改 = 高风险，必须有充分理由

---

## 🎯 资源格式与配置（基于当前实际代码）

### ✅ 所有图片统一使用 PNG 格式
- **项目中不再使用 WEBP**，所有图片（建筑内部、徽章、地图背景）都是 `.png`
- `app.json` **不需要** `"webp": true`
- `<image>` 标签 **不需要** `webp="{{true}}"` 属性
- 修改图片路径或添加新图片时，扩展名必须写 `.png`
- 实际图片文件也必须是 PNG 格式

### ✅ 建筑历史文案：从 `data/buildingHistory.js` 集中管理
- `data/buildings.js` 顶部：`const HISTORY_TEXTS = require('./buildingHistory.js');`
- 每座建筑的 `historyText` 字段取值：`HISTORY_TEXTS.xxx`（如 `HISTORY_TEXTS.library`）
- **禁止在 `buildings.js` 中内联大段文字**，统一放到 `buildingHistory.js`
- 修改/新增建筑文案时：**只改 `buildingHistory.js`**，`buildings.js` 自动生效
- `data/buildingHistory.js` 存在且**被代码引用**（与旧规则"未被引用"相反——这是当前真实状态）

### ✅ 隐私协议检查的正确位置
- **`__usePrivacyCheck__` 只能放在 `project.config.json` 的 `setting` 字段中**（当前值：`true`）
- **绝对不要在 `app.json` 中添加 `__usePrivacyCheck__`**（这会触发 `backgroundfetch privacy fail` 错误）
- `app.json` 中保留 `"requiredPrivateInfos": []`（空数组 = 不请求任何敏感权限）
- 隐私协议页面：`pages/privacy/privacy` 存在且已注册到 `app.json` 的 `pages` 数组中

### ✅ 隐私 API 调用必须带 fail 回调
- `wx.getPrivacySetting` 必须有 `fail: () => {}` 回调（开发者环境未配置隐私协议时静默忽略）
- `wx.openPrivacyContract` 必须有 `fail` 回调
- `wx.onNeedPrivacyAuthorization` 必须注册回调（新版隐私接口：平台在需要时自动调起）
- 参考 `app.js` 中 `_checkPrivacy()` 的写法

---

## 🚫 禁止做的事

### ❌ 禁止盲目新增文件/页面
- **除非用户明确说"新增一个页面/文件"**，否则不要新建 `pages/xxx/` 目录
- 能修改现有文件实现的，绝不新增文件
- 当前页面：7 个（start、map、building、sports、settings、backpack、privacy）

### ❌ 禁止使用分包（subPackages）
- 当前项目只有 7 个页面 + 少量图片，主包体积绝不会超限
- 分包会导致手机端（真机）资源路径解析问题，图片/音频可能加载失败
- 所有页面统一放在 `app.json` 的 `pages` 数组中
- **绝对禁止**在 `app.json` 中添加 `subPackages` 字段

### ❌ 禁止随意修改图片路径
- 图片文件统一放在 `images/` 目录下，结构如下（与本文件底部"图片文件清单"完全一致）：
  - `images/buildings/` — 建筑背景图（5 张 PNG）
  - `images/badges/` — 徽章图标（5 张 PNG）
  - `images/map/` — 运动场地图背景（1 张 PNG）
  - `images/map-bg.png` — 主地图背景
  - `images/start-bg.png` — 启动页背景
- **不要**把图片放到 `pages/xxx/images/` 等页面子目录内
- **不要**改动 `images/` 的目录结构

### ❌ 禁止在 `app.json` 中添加无效/冗余字段
- 不要加 `"webp": true`（不需要）
- 不要加顶层 `"__usePrivacyCheck__"`（应在 project.config.json 中）
- app.json 的字段应严格限于：pages、window、style、sitemapLocation、lazyCodeLoading、requiredPrivateInfos
- 当前 `app.json` 就是正确模板，不要添加额外字段

### ❌ 禁止维护 `visitedBuildingIds`
- **这个字段从未存在于 gameStore 中**（`settings.js` 里有兼容代码，但只是兜底，不依赖此字段）
- 建筑探索数 = 徽章数 = `backpack.length`（唯一真相来源）
- `gameStore.stats.buildingsVisited` 和 `gameStore.stats.badgesCollected` 在每次 `_save()` 时自动同步为 `backpack.length`
- 不要在任何地方新增或读取 `visitedBuildingIds`

### ❌ 禁止直接手动 setState 新建游戏
- "新建游戏/重置游戏" 必须调用 `gameStore.resetGame()`
- **不要**手动 `setState({ player: ..., backpack: [] })` 拼凑
- `resetGame()` 会一并重置 totalSteps、徽章数、季节等所有字段

### ❌ 禁止在云开发未配置时调用 `wx.cloud.database()`
- 云同步是**可选功能**，不是必需功能
- 默认**未启用**（`app.js` 中 `CLOUD_ENV = ''` 为空字符串时跳过初始化）
- 任何云数据库操作前必须先调用 `cloudSync.available()` 检查
- `cloudSync.available()` 每次调用都动态检查 `app.globalData.cloudReady`
- 启用云同步的唯一方式：在 `app.js` 中填入 `CLOUD_ENV = '你的云环境ID'`（成功初始化后设置 `cloudReady = true`）
- 云数据库集合名：`user_saves`（需在云开发控制台手动创建，权限设为"仅创建者可读写"）

### ❌ 禁止在配置文件中硬编码个人信息
- `project.config.json` 中的 `appid` 是项目标识，不要替换为个人测试号的 appid
- 个人测试号应在 `project.private.config.json` 中覆盖（该文件已被忽略，不提交到代码库）
- `app.miniapp.json` 中的多平台配置不要修改

### ❌ 禁止修改代码文件顶部的路径注释
- JS 文件顶部的 `// c:\Users\...\config\gameConfig.js` 格式注释是开发环境标记，不要删除或修改

---

## ✅ 必须做的事

### ✅ 数据一致性：唯一真相来源（Single Source of Truth）

| 数据 | 真相来源 | 同步位置 |
|------|----------|---------|
| 已探索建筑数 | `state.backpack.length` | `_save()` / `_restore()` / `setCurrentBuilding()` 中同步 |
| 已收集徽章数 | `state.backpack.length` | `_save()` / `_restore()` 中同步 |
| 总移动步数 | `state.stats.totalSteps` | `updatePlayerPos()` 中 +1 |
| 首次启动时间 | `state.stats.firstLaunchAt` | 构造函数中设置（如果缺失） |
| 无痕模式开关 | `state.saveOnQuit` | `setSaveOnQuit(false)` 时同步重置 totalSteps = 0 |
| 建筑历史文案 | `data/buildingHistory.js` | `buildings.js` 中通过 `HISTORY_TEXTS.xxx` 引用 |

- `gameStore._save()`、`_restore()`、`setCurrentBuilding()`、`forceSyncToCloud()` 中必须确保：
  ```javascript
  state.stats.buildingsVisited = state.backpack.length;
  state.stats.badgesCollected = state.backpack.length;
  ```

### ✅ 建筑数据的组织方式（实际现状）
- 建筑总数：6 座（library, pont, software, museum, lecture, sports）
- `data/buildings.js` 中每座建筑包含完整配置：
  ```javascript
  {
    id: 'library',                       // 唯一标识，用于 URL 参数
    name: '图书馆',                       // 中文名
    nameEn: 'Library',                    // 英文名
    triggerZone: { x, y, w, h },          // 触发区域（进入此区域弹出气泡）
    collisionZone: { x, y, w, h },        // 碰撞区域（当前 COLLISION_ENABLED=false，未启用实际碰撞）
    interiorImage: '/images/buildings/library.png',  // 建筑内部插画
    badge: {                              // 徽章配置
      id: 'badge_library',
      name: '图书馆徽章',
      image: '/images/badges/library-badge.png',
      description: '...'
    },
    isSportsField: true,                  // 仅 sports 建筑有此字段——进入时跳转到独立地图
    historyText: HISTORY_TEXTS.library    // 从 buildingHistory.js 集中获取
  }
  ```
- 徽章配置在 `buildings.js` 中，**不是独立文件**
- `data/buildingHistory.js` 存在且**被代码引用**，是历史文案的唯一编辑位置
- 修改建筑数据时，必须同时确保 `interiorImage` 和 `badge.image` 的路径与 `images/` 目录下的实际文件名一致
- 建筑地图坐标来自 `config/gameConfig.js` 的 `SPAWN` / `MAP_SIZE`，与 `buildings.js` 中导出的同名常量保持一致（两处都有，以 `gameConfig.js` 为准——因为 `gameStore` 引用的是 `gameConfig`）

### ✅ 云开发启用步骤（如需要云端同步）
1. 微信开发者工具 → 左侧「云开发」→ 开通
2. 获取云环境 ID（形如 `campus-tour-3gxxxxxxxxxxx`）
3. 在 `app.js` 的 `onLaunch()` 中填入：`const CLOUD_ENV = '你的环境ID';`
4. 云开发控制台 → 数据库 → 新建集合：`user_saves`
5. 云开发控制台 → 数据库 → `user_saves` → 权限 → 选「仅创建者可读写」
6. 编译运行，设置页面「同步到云端」按钮即可使用

### ✅ 日志与错误处理
- 统一使用 `utils/logger.js` 的 `logger.info/warn/error()`
- 不要在页面代码中写裸 `console.log`（调试临时可以，生产代码用 logger）
- `app.js` 的 `onError` / `onUnhandledRejection` 必须保留，全局捕获上报
- `gameStore` 构造函数整体 try-catch 兜底到最小可用状态
- `cloudSync` 中所有数据库操作外包 try-catch

### ✅ 每次修改后的验证步骤
1. **开发者工具编译**：清缓存 → 全部清除 → 编译，确认无报错
2. **真机预览**：用微信扫码在手机上打开，确认修改的功能在真机正常
3. **建筑页面测试**：进入每个建筑，确认背景图和徽章都正常显示
4. **背包页面测试**：打开背包，确认徽章图标正常显示
5. **新建游戏测试**：点击启动页「新建游戏」→ 确认步数归零、背包清空、位置回到出生点
6. **设置页测试**：切换日夜/季节 → 确认生效；点击「同步到云端」→ 未配置时提示"云开发未启用"
7. **隐私协议测试**：在设置页点击「隐私政策」→ 确认 `pages/privacy/privacy` 页面正常打开

### ✅ 修改路径/资源相关时
- 先列出现有文件清单（用文件搜索确认，或对照本文件底部"图片文件清单"）
- 修改代码路径后，确认 `data/buildings.js` 中的路径与实际文件位置完全一致
- 路径格式：以 `/` 开头，如 `/images/buildings/library.png`

### ✅ 分享功能
- 页面需要分享时，在该页面 `.js` 中添加 `onShareAppMessage()` 和 `onShareTimeline()`
- 不要修改 `app.json` 的任何分享配置

### ✅ 无痕模式（saveOnQuit）
- `saveOnQuit = false` 时：gameStore 构造函数不读取历史存档，`_save()` 直接 return 不写入
- `setSaveOnQuit(false)` 调用时同步重置 `totalSteps = 0`
- `saveOnQuit = true` 时：正常读写 `wx.setStorageSync('game_state')`

---

## 🔵 设计决策速查（来自历史决策）

| 问题 | 决策 | 理由 |
|------|------|------|
| 建筑数 vs 徽章数 | 两者相等，都 = `backpack.length` | 避免两套数据不一致的历史坑 |
| 新建游戏 | `gameStore.resetGame()` | 之前手动 setState 漏了 totalSteps 归零 |
| 云开发未配置 | 自动短路，不影响运行 | 之前直接调用 database() 导致黑屏 |
| 图片格式 | 统一 PNG，禁止 WEBP | 微信小程序对 WEBP 支持不一致，PNG 兼容性最好 |
| 隐私协议 | 内置 `pages/privacy/` + `wx.openPrivacyContract()` | 审核需要可访问页面 + 官方授权弹窗 |
| 隐私检查开关 | 放在 `project.config.json`，**不要**放在 `app.json` | app.json 放开关会触发 backgroundfetch 内部错误 |
| 历史文案 | 集中在 `data/buildingHistory.js` | buildings.js 代码简洁，修改文案只需改一处 |
| 日志 | 统一 `utils/logger.js` + 实时日志 | 分散 console.log 线上看不到错误 |
| gameStore 构造函数 | 整体 try-catch 兜底到最小可用状态 | 任何异常不能导致黑屏 |
| 存档同步 | 本地优先 + 异步同步云端 + 3 秒防抖 | 频繁写入避免微信限流 |
| 云端存档冲突解决 | 徽章数多的一方获胜 | 新手机上不要覆盖老进度 |
| 狮子角色 | Canvas 绘制（色块像素风）| 不需要 sprite 图片，开箱即用 |
| 建筑徽章 | 配置在 `buildings.js` 的 `badge` 字段 | 与建筑数据一起维护，避免分散 |
| 运动场 | 独立页面 `pages/sports/` + 独立地图 `SPORTS_MAP` | 与主地图解耦，避免坐标混乱 |
| 碰撞检测 | `BUILDINGS.COLLISION_ENABLED = false` | 建筑作为触发点而非障碍物，玩家可自由走到建筑前 |

---

## 🟡 Bug 修复原则（严格遵守）

1. **先理解原始需求和历史行为**
   - 修改前必须明确：用户想要达到什么效果？当前代码做了什么？哪里出了问题？

2. **主动追踪完整数据流和调用链**
   - 例如：修改 `gameStore` 的字段 → 检查 `_save()` / `_restore()` 是否需要同步更新 → 检查 `start.js` / `settings.js` 中是否有直接读取该字段的代码

3. **防御性编程**
   - 操作变量/对象前永远做空值检查：`if (x && x.y)`
   - 读取 `wx.getStorageSync` 结果永远做类型检查和 try-catch
   - `gameStore` 构造函数整体 try-catch 作为最后防线
   - `cloudSync` 中所有数据库操作外包 try-catch
   - 读取 `gameStore.state.stats` 前做空检查：`(state.stats && state.stats.totalSteps) || 0`

4. **最小改动原则**
   - 能用一行改的，绝不改十行
   - 不修改与当前任务无关的代码

5. **区分「核心逻辑错误」和「配置/环境问题」**
   - 小程序黑屏大概率是配置问题（app.json 有无效字段 / gameStore 构造抛异常）
   - 图片不显示大概率是路径问题（路径写错 / 文件不存在 / 扩展名不匹配）
   - 数据不一致大概率是逻辑错误（没同步更新）

6. **微信内部错误不代表代码有问题**
   - `[wxapplib] backgroundfetch privacy fail` → app.json 有无效的 `__usePrivacyCheck__`
   - `[广告调优]` 相关错误 → 微信内部广告模块，非代码问题，可忽略

---

## 📌 常见问题速查表

| 问题 | 正确做法 | 错误做法 |
|------|---------|---------|
| 图片不显示 | 检查 `images/` 目录的实际文件名，修正 `data/buildings.js` 中路径 | 盲目改扩展名、移动文件 |
| 手机端图片加载失败 | 确保路径以 `/` 开头，图片是 PNG 格式 | 继续调整分包配置 |
| 图片路径 | `/images/buildings/library.png` | `images/buildings/library.png` |
| 小程序黑屏 | 检查 `app.json` 是否有无效字段 → 检查 `gameStore` 构造是否抛异常 → 检查 `cloudSync` | 盲目乱改 |
| 需要隐私入口 | `wx.openPrivacyContract()` + `pages/privacy/` 页面 | 只说"隐私政策"四个字 |
| 隐私后台报错 | 检查 `app.json` 中是否误加了 `__usePrivacyCheck__` → 确认该开关仅在 `project.config.json` | 改 app.json 的其他字段 |
| 新建游戏后步数不归零 | 调用 `gameStore.resetGame()` | 手动 setState 只清 player 和 backpack |
| 建筑数 ≠ 徽章数 | 检查 `_save()` 和 `_restore()` 中是否同步了 `stats.buildingsVisited = backpack.length` | 各自维护两套独立数据 |
| 云端同步按钮无反应 | 检查 `app.js` 中 `CLOUD_ENV` 是否填入了有效环境 ID → 检查是否调用 `wx.cloud.init` 并设置 `cloudReady = true` | 盲目增加 console.log |
| 线上错误看不见 | 用 `logger.error()` 上报 | 用 `console.log` 只在开发工具看得到 |
| 隐私审核被拒 | 检查微信后台是否填了「用户隐私保护指引」文本 → 确认 `project.config.json` 中 `__usePrivacyCheck__` 为 true | 只检查代码 |
| 建筑历史文案修改 | 编辑 `data/buildingHistory.js` | 在 `buildings.js` 中硬编码文案 |
| 出生点/地图尺寸修改 | 改 `config/gameConfig.js`（gameStore 引用的是此文件） | 只改 `data/buildings.js` 中的 `SPAWN/MAP_SIZE` |

---

## 🔁 修改流程（严格遵守）

```
1. 阅读本文件 DEVELOPER_RULES.md  ← 第一步永远是这个
2. 阅读要修改的所有相关文件的完整内容
3. 确认资源文件是否存在（搜索 images/、audio/、data/ 目录）
4. 回顾上方「设计决策速查」中是否有相关历史决策
5. 制定最小改动方案
6. 修改代码
7. 检查：是否破坏了数据一致性规则？是否影响了其他模块？
8. 开发者工具编译验证
9. 真机预览验证
10. 如修改了规则性的内容，同步更新本文件 DEVELOPER_RULES.md
11. 告知用户已完成的修改 + 需要用户手动操作的步骤
```

---

## 📂 文件地图（修改前必读列表）

| 关键文件 | 作用 | 修改时必须检查的关联文件 |
|---------|------|---------------------|
| `data/buildings.js` | **建筑配置**（6 座建筑 + 触发区 + 碰撞区 + 徽章） | `data/buildingHistory.js`（文案来源）, `pages/building/building.js`, `pages/map/map.js`, `services/buildingService.js`, `config/gameConfig.js`（坐标/尺寸基准） |
| `data/buildingHistory.js` | **历史文案**（所有建筑的 historyText 集中在此） | `data/buildings.js`（确认 key 对应正确） |
| `config/gameConfig.js` | **游戏参数**（玩家速度/大小 + 出生点 + 地图尺寸 + 动画 + 摇杆半径） | `pages/map/map.js`, `pages/sports/sports.js`, `store/gameStore.js`（引用 SPAWN_X/Y） |
| `store/gameStore.js` | **状态管理**（单例 + 订阅 + 本地存档 + 云端同步 + 成就统计） | `pages/start/start.js`, `pages/settings/settings.js`, `pages/building/building.js`, `utils/cloudSync.js`, `utils/logger.js` |
| `app.js` | **全局初始化**（窗口信息 + 云开发初始化 + 实时日志 + 隐私检查） | `app.json`, `project.config.json`, `utils/cloudSync.js`, `utils/logger.js` |
| `app.json` | **全局配置**（页面路由 + 窗口设置 + 权限声明） | `project.config.json`, `pages/` 下所有页面 |
| `project.config.json` | **开发者工具配置**（AppID + libVersion + `__usePrivacyCheck__` 开关 + packOptions 忽略列表） | `app.json`（权限声明要一致） |
| `project.private.config.json` | **私有配置**（开发者个人环境，不提交到代码库） | 不要分享给他人 |
| `pages/settings/settings.js` | **设置页面**（音乐开关/音量 + 日夜/季节 + 云端同步 + 成就统计 + 隐私政策入口） | `store/gameStore.js`, `pages/privacy/privacy.js`, `utils/audioManager.js` |
| `pages/start/start.js` | **启动页面**（北门背景 + 进入按钮 + 新建游戏 + 音乐播放） | `store/gameStore.js`（新建游戏逻辑）, `utils/audioManager.js` |
| `pages/building/building.js` | **建筑详情页**（插画 + 历史文案 + 徽章领取） | `data/buildings.js`, `store/gameStore.js`（徽章领取） |
| `pages/map/map.js` | **核心地图**（Canvas 渲染 + 摇杆 + 建筑触发检测 + 狮子绘制 + 日夜叠加） | `data/buildings.js`, `config/gameConfig.js`, `utils/joystick.js`, `utils/sprite.js`, `utils/camera.js`, `utils/weatherEffect.js` |
| `pages/sports/sports.js` | **运动场子地图**（独立 Canvas + 返回按钮） | `data/buildings.js`（sports 建筑配置 + `isSportsField` 标识）, `config/gameConfig.js`（SPORTS_MAP 尺寸） |
| `pages/privacy/privacy.js` | **隐私政策页面**（可访问的政策文本 + 用户协议） | `pages/settings/settings.js`（入口链接） |
| `pages/backpack/backpack.js` | **背包页面**（物品格 + 徽章查看 + 丢弃/使用） | `store/gameStore.js`（backpack 数据） |
| `utils/cloudSync.js` | **云同步**（可选启用，默认禁用） | `app.js`（需要 `CLOUD_ENV` + `cloudReady`） |
| `utils/logger.js` | **统一日志工具**（接入微信实时日志） | `app.js`（onError）, `store/gameStore.js`, `utils/cloudSync.js` |
| `utils/audioManager.js` | **音频管理**（背景音乐 + 静音设置持久化） | `pages/start/start.js`, `pages/map/map.js`, `pages/settings/settings.js` |
| `services/buildingService.js` | **建筑服务**（查询建筑 + 触发检测） | `data/buildings.js`, `pages/map/map.js` |
| `utils/joystick.js` | **虚拟摇杆** | `pages/map/map.js`, `pages/sports/sports.js` |
| `utils/sprite.js` | **精灵/玩家绘制**（像素狮子动画帧） | `pages/map/map.js`, `pages/sports/sports.js` |
| `utils/camera.js` | **摄像机/世界坐标↔屏幕坐标转换** | `pages/map/map.js`, `pages/sports/sports.js` |
| `utils/weatherEffect.js` | **天气粒子效果**（雨/雪） | `pages/map/map.js` |
| `utils/collision.js` | **AABB 碰撞检测** | `pages/map/map.js`, `data/buildings.js`（OBSTACLES 列表） |
| `styles/pixel-theme.wxss` | **像素风主题样式**（全局复用的 CSS） | 各页面 `.wxss` |
| `app.miniapp.json` / `project.miniapp.json` | **多端适配配置**（HarmonyOS/Android/iOS） | 不要修改，除非明确要求跨平台发布 |

---

## 📄 建筑徽章清单（当前实际配置）

| 建筑ID | 建筑名 | 徽章ID | 徽章图片路径 | 建筑内部插画 | 特殊属性 |
|--------|--------|--------|-------------|-------------|---------|
| `library` | 图书馆 | `badge_library` | `/images/badges/library-badge.png` | `/images/buildings/library.png` | — |
| `pont` | 天桥 | `badge_pont` | `/images/badges/pont-badge.png` | `/images/buildings/pont.png` | — |
| `software` | 软件学院 | `badge_software` | `/images/badges/software-badge.png` | `/images/buildings/software.png` | — |
| `museum` | 博物馆 | `badge_museum` | `/images/badges/museum-badge.png` | `/images/buildings/museum.png` | — |
| `lecture` | 真知讲堂 | `badge_lecture` | `/images/badges/lecture-badge.png` | `/images/buildings/lecture.png` | — |
| `sports` | 体育场馆 | `badge_sports` | `/images/badges/pont-badge.png`（⚠️复用天桥徽章图） | `/images/map/sports-bg.png`（⚠️运动场地图背景，不是传统室内插画） | `isSportsField: true`（跳转到独立 `sports` 地图） |

> ⚠️ 注意：体育场馆（sports）目前有两个临时配置：
> 1. `badge.image` 指向 `pont-badge.png`（复用天桥徽章）——如需修正需准备 `sports-badge.png`
> 2. `interiorImage` 指向 `images/map/sports-bg.png`（运动场地图背景）——与传统建筑插画不同

---

## 🖼️ 图片文件清单（确认修改路径时对照）

**以下为当前 `images/` 目录下实际存在的文件。引用任何路径前必须在此表中找到。**

```
images/
├── map-bg.png                              # 主地图背景（1893×1093）
├── start-bg.png                            # 启动页背景（北门）
├── buildings/
│   ├── library.png                         # 图书馆内部插画
│   ├── pont.png                            # 天桥内部插画
│   ├── software.png                        # 软件学院内部插画
│   ├── museum.png                          # 博物馆内部插画
│   └── lecture.png                         # 真知讲堂内部插画
├── badges/
│   ├── library-badge.png                   # 图书馆徽章图标
│   ├── pont-badge.png                      # 天桥徽章图标（⚠️ sports 建筑也复用此图）
│   ├── software-badge.png                  # 软件学院徽章图标
│   ├── museum-badge.png                    # 博物馆徽章图标
│   └── lecture-badge.png                   # 真知讲堂徽章图标
└── map/
    └── sports-bg.png                       # 运动场地图背景（949×1592，独立地图使用）
```

> 注意：狮子角色使用 Canvas 绘制（色块模拟），**不需要**精灵图片文件。

---

## 📐 坐标与尺寸参考

| 参数 | 值 | 来源 | 用途 |
|------|-----|------|------|
| 主地图出生点 X | 1150 | `gameConfig.PLAYER.SPAWN_X` | 玩家在主地图的初始 X 坐标 |
| 主地图出生点 Y | 940 | `gameConfig.PLAYER.SPAWN_Y` | 玩家在主地图的初始 Y 坐标 |
| 主地图尺寸 | 1893 × 1093 | `gameConfig.MAP.WIDTH/HEIGHT` | Canvas 绘制范围 |
| 运动场出生点 | (474, 1400) | `gameConfig.SPORTS_MAP.SPAWN_X/Y` | 运动场独立地图初始坐标 |
| 运动场尺寸 | 949 × 1592 | `gameConfig.SPORTS_MAP.WIDTH/HEIGHT` | 运动场 Canvas 绘制范围 |
| 玩家速度 | 160 | `gameConfig.PLAYER.SPEED` | 像素/秒 |
| 玩家绘制尺寸 | 48 | `gameConfig.PLAYER.SIZE` | 像素 |
| 摇杆半径 | 45 | `gameConfig.UI.JOYSTICK_RADIUS` | 虚拟摇杆触摸检测半径 |
| 动画帧间隔 | 200ms | `gameConfig.ANIMATION.FRAME_DURATION` | 狮子行走动画 |
| 碰撞检测开关 | false | `gameConfig.BUILDINGS.COLLISION_ENABLED` | 当前未启用建筑碰撞 |

> 注意：`data/buildings.js` 也导出了 `SPAWN = { x: 940, y: 960 }` 和 `MAP_SIZE`，但 `gameStore` 和页面代码实际引用的是 `config/gameConfig.js` 中的值。**以 gameConfig.js 为准。**

---

## 🔧 包体与发布配置

`project.config.json` 中 `packOptions.ignore` 已配置以下文件不被打包到小程序主包：
- `.claude/` 目录（开发工具配置）
- `README.md`、`GUIDE.md`、`DEVELOPER_RULES.md`（文档文件）
- `.eslintrc.json`、`.eslintignore`（代码检查配置）
- `package.json`、`package-lock.json`（npm 配置）
- `.gitignore`（Git 配置）
- `.vscode/` 目录（编辑器配置）

**如需新增文档或配置文件**，确认是否需要加入 `packOptions.ignore` 列表以避免影响包体。

---

## ✅ 当前规则自检状态

- [x] 所有图片路径与 `images/` 目录一致
- [x] 建筑数 = 徽章数 = 背包长度 的一致性规则已在代码中实现
- [x] `__usePrivacyCheck__` 位置正确（仅在 `project.config.json`）
- [x] `gameStore.resetGame()` 重置 totalSteps、徽章数、季节等
- [x] `cloudSync.available()` 动态检查，未配置云环境时自动降级
- [x] 历史文案集中在 `data/buildingHistory.js`
- [x] DEVELOPER_RULES.md 本身与代码一致