# 📋 代码修改规则 — 每次改代码前必须阅读

> **⚠️ 重要：修改任何代码前，必须从头到尾读完本文件。**
>
> 本文件记录了项目中所有**从历史教训中总结出来的不可违反的规则**。每一条规则背后都是一次踩坑经历。
>
> **规则必须与实际代码一致**——如发现本文件与代码不符，请同时修正代码和本文件。

---

## 🔴 优先级最高：先读再改

1. **第一步永远是：读完本文件 DEVELOPER_RULES.md**

2. **阅读三个文档的正确顺序**：
   - 第一次接触项目：先读 `README.md`（了解项目是什么、怎么运行）
   - 要改代码/加功能：再读 `GUIDE.md`（了解具体操作指南）
   - 动手写代码前：**必须读 DEVELOPER_RULES.md（本文件）**（避免踩历史坑）

3. **阅读所有相关文件的完整内容，再动手修改**
   - 修改配置前，必须先读 `app.json`、`project.config.json` 的当前完整内容
   - 修改页面前，必须先读该页面的 `.js`、`.wxml`、`.wxss`、`.json` 四个文件
   - 修改数据前，必须先读 `data/buildings.js` 和 `data/buildingHistory.js` 的完整内容
   - 修改状态管理前，必须先读 `store/gameStore.js` 的完整内容
   - 修改工具类前，必须先读对应 `utils/xxx.js` 的完整内容
   - 修改地图/页面前，必须先读 `config/gameConfig.js`（出生点、地图尺寸等关键参数）

4. **先确认文件实际存在，再写路径**
   - 涉及图片、音频等资源路径时，必须先用文件搜索确认该文件**实际存在**于哪个目录
   - 写路径前先看一遍 `images/`、`audio/`、`data/` 目录的实际内容
   - **禁止**在不确认文件存在的情况下写死路径
   - **禁止**引用本文件底部"图片文件清单"中不存在的文件

5. **路径格式：永远以 `/` 开头**
   - 正确：`/images/buildings/library.png`
   - 错误：`images/buildings/library.png`、`./images/buildings/library.png`
   - 页面间跳转 URL：`/pages/settings/settings`

6. **先确认本文件中的规则是否覆盖了你要做的修改**
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
- **这个字段从未存在于 gameStore 中**
- 建筑探索数 = 徽章数 = `backpack.count()`（唯一真相来源，由 `stats.syncFromBackpack(backpack.count())` 在 `addToBackpack`/`removeFromBackpack`/`setCurrentBuilding`/`forceSyncToCloud`/`_applySnapshot` 中保持一致）
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
| 已探索建筑数 | `backpack.count()` | `stats.syncFromBackpack(backpack.count())` 在 `addToBackpack` / `removeFromBackpack` / `decrementFromBackpack` / `setCurrentBuilding` / `forceSyncToCloud` / `_applySnapshot` 中同步 |
| 已收集徽章数 | `backpack.count()` | 与上一条同步机制一致 |
| 总移动步数 | `stats.totalSteps` | `updatePlayerPos(x, y)` 中调用 `stats.stepOnce()` 自增 |
| 首次启动时间 | `stats.firstLaunchAt` | 构造函数中缺失时设置 `Date.now()` |
| 无痕模式开关 | `saveOnQuit` | `setSaveOnQuit(false)` 时同步 `stats.reset()` |
| 建筑历史文案 | `data/buildingHistory.js` | `buildings.js` 中通过 `HISTORY_TEXTS.xxx` 引用 |

- `gameStore.notify()` 后会走 `_persist()` → `persistence.save(snapshot)`，通过 `_snapshot()` 组装的对象写入 `wx.setStorageSync`；所有字段（player/sportsPlayer/isDay/season/backpack/saveOnQuit/stats）均会被持久化。
- 若新增字段，需同步修改：1) `gameStore` 构造函数初始化；2) `setState(partial)` 处理；3) `getState()` 返回；4) `_snapshot()` 组装；5) `_applySnapshot(data)` 恢复；6) `resetGame()` 重置（如有必要）。

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
- `saveOnQuit = false` 时：gameStore 构造函数不读取历史存档（不恢复），`_persist()` 直接 return 不写入；同时调用 `stats.reset()` 清零步数
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
| 角色 | Canvas 绘制（矩形拼贴像素风人物） | 不需要 sprite 图片，开箱即用 |
| 建筑徽章 | 配置在 `buildings.js` 的 `badge` 字段 | 与建筑数据一起维护，避免分散 |
| 运动场 | 独立页面 `pages/sports/` + 独立地图 `SPORTS_MAP` | 与主地图解耦，避免坐标混乱 |
| 碰撞检测 | `BUILDINGS.COLLISION_ENABLED = false` | 建筑作为触发点而非障碍物，玩家可自由走到建筑前 |

---

## 🟡 Bug 修复原则（严格遵守）

1. **先理解原始需求和历史行为**
   - 修改前必须明确：用户想要达到什么效果？当前代码做了什么？哪里出了问题？

2. **主动追踪完整数据流和调用链**
   - 例如：修改 `gameStore` 的字段 → 检查 `_snapshot()` / `_applySnapshot()` / `resetGame()` / `getState()` / `setState()` 是否需要同步更新 → 检查 `start.js` / `settings.js` 中是否有直接读取该字段的代码

3. **防御性编程**
   - 操作变量/对象前永远做空值检查：`if (x && x.y)`
   - 读取 `wx.getStorageSync` 结果永远做类型检查和 try-catch
   - `gameStore` 构造函数整体 try-catch 作为最后防线
   - `cloudSync` 中所有数据库操作外包 try-catch
   - 读取 `gameStore.getState().stats.totalSteps` 前做空检查：`(state.stats && state.stats.totalSteps) || 0`

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
| 建筑数 ≠ 徽章数 | 检查 `stats.syncFromBackpack(backpack.count())` 是否在 `addToBackpack` / `removeFromBackpack` / `setCurrentBuilding` / `_applySnapshot` 中正确调用 | 各自维护两套独立数据 |
| 云端同步按钮无反应 | 检查 `app.js` 中 `CLOUD_ENV` 是否填入了有效环境 ID → 检查是否调用 `wx.cloud.init` 并设置 `cloudReady = true` | 盲目增加 console.log |
| 线上错误看不见 | 用 `logger.error()` 上报 | 用 `console.log` 只在开发工具看得到 |
| 隐私审核被拒 | 检查微信后台是否填了「用户隐私保护指引」文本 → 确认 `project.config.json` 中 `__usePrivacyCheck__` 为 true | 只检查代码 |
| 建筑历史文案修改 | 编辑 `data/buildingHistory.js` | 在 `buildings.js` 中硬编码文案 |
| 出生点/地图尺寸修改 | 改 `config/gameConfig.js`（gameStore 引用的是此文件） | 只改 `data/buildings.js` 中的 `SPAWN/MAP_SIZE` |

---

## 🔁 修改流程（严格遵守）

```
1. 阅读本文件 DEVELOPER_RULES.md  ← 第一步永远是这个
2. 阅读 README.md 了解项目全貌（如果是第一次接触）
3. 阅读 GUIDE.md 了解具体操作指南（如果涉及建筑/角色/地图等改动）
4. 阅读要修改的所有相关文件的完整内容
5. 确认资源文件是否存在（搜索 images/、audio/、data/ 目录）
6. 回顾上方"设计决策速查"中是否有相关历史决策
7. 制定最小改动方案
8. 修改代码
9. 检查：是否破坏了数据一致性规则？是否影响了其他模块？
10. 开发者工具编译验证（清缓存 → 全部清除 → 编译）
11. 真机预览验证（扫码在手机上测试修改的功能）
12. 执行 lint 检查：`npm run lint`，如有问题执行 `npm run lint:fix`
13. 如修改了规则性的内容，同步更新本文件 DEVELOPER_RULES.md
14. 按下方「Gitee 协作流程」提交代码并发起 PR
15. Code Review 通过后合并
```

---

## 🌿 Gitee 协作流程（团队协作必须遵守）

### 分支策略

| 分支 | 用途 | 创建方式 | 合并方式 |
|------|------|---------|---------|
| `master` / `main` | 主分支，始终可运行、可发布 | 项目初始即有 | **仅通过 PR 合并**，禁止直接 push |
| `develop` | 开发集成分支，整合所有功能 | 从 master 切出 | 团队成员可直接提交小改动；大改动通过 PR |
| `feature/xxx` | 功能分支 | `git checkout -b feature/xxx develop` | PR 合并到 develop，合并后删除 |
| `hotfix/xxx` | 紧急修复分支 | `git checkout -b hotfix/xxx master` | PR 同时合并到 master 和 develop |

> **命名建议**：feature 分支用简短英文描述，如 `feature/map-smooth-scroll`、`feature/badge-system`；hotfix 用 Bug 编号或简短描述，如 `hotfix/map-crash-issue-12`。

### 标准 Git 工作流（每一步都要执行）

```bash
# ============ 1. 克隆与初始化 ============
git clone https://gitee.com/[你的用户名]/[项目仓库名].git
cd [项目目录]
git remote -v              # 确认 origin 指向 Gitee
npm install                # 安装开发依赖（eslint/jest）

# ============ 2. 同步最新代码（每天上班第一件事） ============
git checkout develop
git pull origin develop    # 拉取团队最新代码

# ============ 3. 创建功能分支 ============
git checkout -b feature/add-gym-building

# ============ 4. 开发与本地验证 ============
# ... 修改代码 ...
npm run lint:fix           # 统一代码风格（必须执行）
npm test                   # 运行单元测试（如有）
# 微信开发者工具：清缓存 → 全部清除 → 编译，确认页面正常

# ============ 5. 提交代码 ============
git status                 # 检查改动文件列表，确认没有提交不该提交的
git diff                   # 检查具体改动
git add -A                 # 或精准 git add 具体文件
git commit -m "feat: 添加体育馆建筑与徽章，包含 triggerZone 和 collisionZone"
# 注意：一次 commit 只做一件事，消息用中文描述具体改动

# ============ 6. 推送到 Gitee ============
git pull origin develop    # 推送前先合并 develop 的最新代码，避免冲突
# 如有冲突，手动解决后 git add + git commit
git push origin feature/add-gym-building

# ============ 7. 发起 Pull Request ============
# 浏览器打开 Gitee 项目 → Pull Requests → 新建 Pull Request
# 源分支：feature/add-gym-building
# 目标分支：develop
# 标题：feat: 添加体育馆建筑与徽章
# 描述：
#   - 改动文件：data/buildings.js, data/buildingHistory.js, images/buildings/gym.png
#   - 实现功能：新增体育馆建筑，包含触发区、碰撞区、历史文案和徽章
#   - 测试建议：走到体育馆入口 → 点击"进入" → 确认徽章获得 → 背包查看
#   - @reviewer1 @reviewer2 请审核

# ============ 8. Code Review ============
# - 收到 Review 意见后，在同一分支修改并 push（无需新建分支）
# - 再次 commit 并 push，PR 自动更新
# - 所有 Comment 都需回复（「已修改」/「保留原方案，理由是...」）

# ============ 9. 合并到 develop ============
# Review 通过后，由 Reviewer 或项目负责人点击「合并」
# 推荐使用 Squash Merge（合并为一个 commit，保持历史简洁）
# 合并后在 Gitee 删除 feature 分支

# ============ 10. 本地清理 ============
git checkout develop
git pull origin develop
git branch -d feature/add-gym-building   # 删除本地已合并分支
```

### 提交信息规范（必须遵守，影响 Gitee 搜索和自动生成日志）

**格式**：`<type>: <subject>`

| type | 含义 | 使用场景 |
|------|------|---------|
| `feat` | 新增功能 | 添加新建筑、新页面、新徽章、新系统 |
| `fix` | Bug 修复 | 修复崩溃、修复显示异常、修复逻辑错误 |
| `docs` | 文档更新 | 修改 README.md、GUIDE.md、DEVELOPER_RULES.md |
| `style` | 代码风格调整 | 统一缩进、引号、分号等（不影响逻辑） |
| `refactor` | 代码重构 | 重构函数结构、拆分文件、优化性能（不新增/不修复功能） |
| `test` | 添加/修改测试 | 新增测试用例、修改现有测试 |
| `chore` | 构建/工具链/配置 | 更新 package.json、修改 ESLint 规则、更新依赖版本 |

**好的 commit 示例**：
- `feat: 添加体育馆建筑与徽章，包含 triggerZone 和 collisionZone`
- `fix: 修复从运动场返回主校园时玩家位置错乱`
- `docs: 更新 GUIDE.md 徽章系统说明，补充双地图坐标独立存储规则`
- `style: 统一所有 JS 文件为单引号 + 2 空格缩进`

**坏的 commit 示例（避免）**：
- `update` / `修改` / `fix bug` → 信息太少，无法检索
- 一个 commit 同时改建筑数据 + 改页面逻辑 + 改文档 → 拆成多个 commit

### Code Review（代码评审）清单

每次发起 PR 前，自检以下项目：

| 检查项 | 说明 | 状态 |
|--------|------|------|
| `npm run lint` 无 error | warning 也要尽量消除 | ⬜ |
| 路径以 `/` 开头 | `data/buildings.js` 中的图片/徽章路径 | ⬜ |
| 路径对应文件实际存在 | 检查 `images/` 目录 | ⬜ |
| gameStore 字段改动已同步 `_snapshot()` / `_applySnapshot()` / `resetGame()` / `getState()` / `setState()` / `_persist()` | 新增字段要确保持久化/恢复/重置正常 | ⬜ |
| 不修改 `visitedBuildingIds`（该字段从未真实使用） | 用 `backpack.count()` 替代 | ⬜ |
| 不使用分包（subPackages） | 当前 7 个页面无需分包 | ⬜ |
| 不将 `__usePrivacyCheck__` 放在 `app.json` | 仅在 `project.config.json` 中 | ⬜ |
| 新增建筑时，同时添加了历史文案到 `buildingHistory.js` | 两个文件同步修改 | ⬜ |
| 功能在微信开发者工具中实际验证 | 不提交未测试的代码 | ⬜ |
| commit 信息符合规范 | type + 中文描述 | ⬜ |

### 处理冲突的正确方式

```bash
# 场景：feature 分支推送时，develop 已有新代码
git checkout feature/add-gym-building
git pull origin develop        # 合并 develop 的最新改动
# 如果出现 CONFLICT，打开冲突文件：
#   <<<<<<< HEAD （你的改动）
#   ... 冲突内容 ...
#   =======
#   ... develop 上的改动 ...
#   >>>>>>> develop
# 手动选择保留哪一方的代码（或两方合并），然后：
git add 冲突的文件
git commit -m "merge: 合并 develop 最新改动"
git push origin feature/add-gym-building
```

> 如果冲突过多，说明分支太久没同步，建议改为 `git rebase develop` 逐个解决冲突，但 rebase 会改写历史，仅在你是该分支唯一开发者时使用。

### 标签与版本发布

```bash
# 当 develop 上的功能集合成一个可发布版本时
git checkout master
git merge develop
git tag -a v1.2.0 -m "版本 1.2.0：新增体育馆建筑、双地图系统、进度条过渡画面"
git push origin master --tags
```

> 版本号遵循 **语义化版本（SemVer）**：`主版本号.次版本号.修订号`
> - 主版本号：不兼容的 API 更改（很少触发，小程序页面结构大变）
> - 次版本号：向下兼容的功能性新增（新增建筑、新增系统）
> - 修订号：向下兼容的问题修正（Bug 修复、性能优化）

### Gitee 项目管理

- **Issues**：所有功能建议、Bug 报告、讨论都在 Gitee Issues 发起
  - 使用标签分类：`bug` / `feature` / `documentation` / `performance` / `question`
  - 关联到对应 Milestone（版本里程碑）
- **Milestones**：按版本号管理，如 `v1.2.0`、`v1.3.0`，每个里程碑关联一组要完成的 Issues
- **Wiki**：会议纪要、设计讨论、非代码类文档放在 Gitee Wiki
- **PR 模板**：在 Gitee 项目设置中添加 `Pull Request 模板`，让提交者按模板填写改动说明

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
| `pages/map/map.js` | **核心地图**（Canvas 渲染 + 摇杆 + 建筑触发检测 + 像素角色绘制 + 日夜叠加） | `data/buildings.js`, `config/gameConfig.js`, `utils/joystick.js`, `utils/sprite.js`, `utils/camera.js`, `utils/weatherEffect.js` |
| `pages/sports/sports.js` | **运动场子地图**（独立 Canvas + 返回按钮） | `data/buildings.js`（sports 建筑配置 + `isSportsField` 标识）, `config/gameConfig.js`（SPORTS_MAP 尺寸） |
| `pages/privacy/privacy.js` | **隐私政策页面**（可访问的政策文本 + 用户协议） | `pages/settings/settings.js`（入口链接） |
| `pages/backpack/backpack.js` | **背包页面**（物品格 + 徽章查看 + 丢弃/使用） | `store/gameStore.js`（backpack 数据） |
| `utils/cloudSync.js` | **云同步**（可选启用，默认禁用） | `app.js`（需要 `CLOUD_ENV` + `cloudReady`） |
| `utils/logger.js` | **统一日志工具**（接入微信实时日志） | `app.js`（onError）, `store/gameStore.js`, `utils/cloudSync.js` |
| `utils/audioManager.js` | **音频管理**（背景音乐 + 静音设置持久化） | `pages/start/start.js`, `pages/map/map.js`, `pages/settings/settings.js` |
| `services/buildingService.js` | **建筑服务**（查询建筑 + 触发检测） | `data/buildings.js`, `pages/map/map.js` |
| `utils/joystick.js` | **虚拟摇杆** | `pages/map/map.js`, `pages/sports/sports.js` |
| `utils/sprite.js` | **精灵/玩家绘制**（SpriteAnimator 帧管理 + drawPlayer 矩形拼贴） | `pages/map/map.js`, `pages/sports/sports.js` |
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

> 注意：像素角色使用 Canvas 绘制（矩形拼贴模拟），**不需要**精灵图片文件。

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
| 动画帧间隔 | 200ms | `gameConfig.ANIMATION.FRAME_DURATION` | 角色行走动画 |
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