# 河北师范大学 · 像素风校园漫游小程序

一款以像素复古风格呈现的校园漫游微信小程序。操控像素角色在校园中行走，进入建筑了解历史，收集专属徽章，体验日夜与四季变化。

## ✨ 功能速览

| 模块 | 说明 |
|------|------|
| 🗺️ 双地图 | 校园主地图（1893×1093）+ 运动场独立地图（949×1592），坐标分别存于 `gameStore.player` / `gameStore.sportsPlayer` |
| 🏛️ 六座建筑 | 图书馆 · 博物馆 · 软件学院 · 天桥 · 真知讲堂 · 体育场馆 |
| 🎒 背包徽章 | 进入建筑自动获得对应徽章，徽章数 = 已探索建筑数 |
| 🏅 成就统计 | 总步数 / 已探索建筑 / 已收集徽章 / 首次启动时间 |
| 🔊 背景音乐 | 启动页与地图页独立控制，设置持久化 |
| 🌞 日夜切换 | `gameStore.isDay` 一键切换，画面立即变化 |
| 🌸 四季系统 | 春夏秋冬季，夏季自动下雨、冬季自动飘雪 |
| 💾 自动存档 | 本地 `wx.setStorageSync('game_state')` |
| ☁️ 云端存档 | 可选云开发，换手机不丢进度 |
| 🛡️ 隐私合规 | 内置隐私政策 + 用户协议页面 |
| ⚙️ 无痕模式 | 不保存历史数据，状态独立 |
| ⏳ 像素风加载 | 页面切换带像素进度条，消除 Canvas 闪烁 |

## 🚀 快速开始

### 1. 安装开发环境

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（Stable 稳定版）
2. 注册 AppID：登录 [mp.weixin.qq.com](https://mp.weixin.qq.com) → 注册小程序 → 获取 AppID
   - 或导入项目时勾选「测试号」（开发预览用，不可发布）
3. 开发者工具 → 导入项目 → 选本目录 → 填入 AppID 或勾选测试号

### 2. 准备美术素材（重要）

项目当前使用占位图，替换以下素材可获得完整效果：

| 资源 | 路径 | 说明 |
|------|------|------|
| 主地图底图 | `images/map-bg.png` | 像素化校园鸟瞰图，建议 2000×1100 |
| 运动场底图 | `images/map/sports-bg.png` | 949×1592 像素图 |
| 启动页背景 | `images/start-bg.png` | 北门照片或像素图 |
| 建筑内部 | `images/buildings/*.png` | 5 张室内插画（library/museum/software/pont/lecture） |
| 徽章图标 | `images/badges/*.png` | PNG 透明背景，每座建筑一枚 |

> 主角角色无需图片——`utils/sprite.js:drawPlayer()` 用像素矩形拼贴绘制，颜色值在函数内直接修改。

### 3. 填写建筑文案

历史文案已独立到 `data/buildingHistory.js`，按建筑 id 为 key 组织：

```javascript
module.exports = {
  library: '河北师范大学图书馆...',
  museum:  '博物馆...',
  // ... 其他建筑
};
```

修改文案只需编辑该文件，`data/buildings.js` 通过 `HISTORY_TEXTS.id` 引用。

### 4. 校准建筑触发区

在开发者工具中预览地图后，走到建筑附近，右下角显示实时坐标。
将坐标填入 `data/buildings.js` 每座建筑的 `triggerZone`：

```javascript
triggerZone: { x: 实测X, y: 实测Y, w: 140, h: 110 }
```

### 5. 准备音频

放入 `audio/` 目录：
- `bgm.mp3` — 启动页音乐
- `bgm2.mp3` — 地图页音乐

在 **设置页** 可分别控制开关与音量。

### 6. 开通云开发（可选，推荐）

1. 微信开发者工具 → 顶部「云开发」→ 开通 → 创建环境
2. 打开 `app.js`，替换 `const CLOUD_ENV = 'cloud1-xxxxxx';` 为你的环境 ID
3. 云开发控制台 → 数据库 → 新建集合 `user_saves`，权限设为「仅创建者可读写」
4. 重新编译，设置页「同步进度到云端」即可使用

> 💡 未填环境 ID 时，云相关代码会自动短路，不影响本地运行。

### 7. 配置隐私政策（上架必做）

1. 项目已内置 `pages/privacy/`（隐私政策 + 用户协议）
2. **必须手动**：登录微信公众平台后台 → 设置 → 用户隐私保护指引 → 填写文本
3. `project.config.json` 已启用 `"__usePrivacyCheck__": true`

### 8. 预览测试

1. 开发者工具左侧确认页面正常渲染
2. 测试摇杆移动、建筑触发、背包、徽章、设置
3. 右上角「预览」扫码，真机测试

### 9. 发布（需 AppID）

开发者工具 → 上传 → 填写版本号 → 登录 mp.weixin.qq.com → 版本管理 → 提交审核

## 📁 项目结构

```
xiaochenxu/
├─ app.json / app.js / app.wxss      # 全局配置（横屏/导航/云开发/隐私）
│
├─ pages/                             # 7 个页面
│  ├─ start/                          # 启动页（北门+进入/新建游戏）
│  ├─ map/                            # 主地图（Canvas+像素进度条+摇杆+气泡）
│  ├─ sports/                         # 运动场子地图（独立 Canvas）
│  ├─ building/                       # 建筑详情（插画+历史+徽章领取）
│  ├─ settings/                       # 设置页（音乐/日夜/季节/云端/统计/隐私）
│  ├─ backpack/                       # 背包页（物品+徽章）
│  └─ privacy/                        # 隐私政策 & 用户协议（上架必查）
│
├─ controllers/                       # 控制器层
│  ├─ buildingController.js           # 建筑交互控制
│  ├─ canvasBootstrap.js              # Canvas 初始化引导
│  ├─ gameTimer.js                    # 游戏循环计时
│  ├─ playerController.js             # 玩家输入/移动
│  ├─ progressLoader.js               # 像素风进度加载
│  ├─ touchDispatcher.js              # 触摸事件分发
│  └─ weatherManager.js               # 天气效果管理
│
├─ renderers/                         # 渲染层
│  ├─ campusRenderer.js               # 校园地图渲染
│  └─ sportsRenderer.js               # 运动场地图渲染
│
├─ data/
│  ├─ buildings.js                    # 建筑配置（triggerZone/badge/interiorImage）
│  └─ buildingHistory.js              # 建筑历史文案（文案唯一来源）
│
├─ config/                            # 游戏参数
│  ├─ gameConfig.js                   # 主配置（速度/出生点/地图尺寸/动画/摇杆）
│  ├─ animation.js                    # 动画参数
│  ├─ map.js / sportsMap.js           # 地图尺寸
│  ├─ player.js                       # 玩家参数
│  └─ ui.js                           # UI 参数
│
├─ services/
│  └─ buildingService.js              # 建筑查询与触发检测
│
├─ store/                             # 状态管理（单例 + 订阅）
│  ├─ gameStore.js                    # 主 Store（getState/setState/updatePlayer...）
│  ├─ backpack.js                     # 背包/徽章（add/remove/has/count）
│  ├─ stats.js                        # 统计（步数/建筑/徽章，getter 只读）
│  ├─ persistence.js                  # 本地存储 + 云同步封装
│  └─ index.js                        # 统一导出
│
├─ utils/                             # 工具类
│  ├─ joystick.js                     # 虚拟摇杆
│  ├─ camera.js                       # 摄像机/坐标转换
│  ├─ collision.js                    # AABB 碰撞检测
│  ├─ sprite.js                       # 玩家绘制 + 帧动画
│  ├─ weatherEffect.js                # 雨/雪粒子
│  ├─ audioManager.js                 # 分页面音频管理
│  ├─ cloudSync.js                    # 云存档（可选）
│  └─ logger.js                       # 统一日志（接入微信实时日志）
│
├─ images/                            # 美术资源
│  ├─ map-bg.png                      # 主地图背景
│  ├─ start-bg.png                    # 启动页背景
│  ├─ buildings/                      # 建筑内部插画
│  ├─ badges/                         # 徽章图标
│  └─ map/sports-bg.png               # 运动场背景
│
├─ audio/                             # 音频
│  ├─ bgm.mp3 / bgm2.mp3
│
├─ styles/
│  └─ pixel-theme.wxss                # 像素风主题样式
│
├─ i18n/
│  └─ base.json                       # 多语言基础（预留）
│
├─ user/                              # 备用目录（backpack / settings 页面副本）
│
├─ .eslintrc.json / .eslintignore     # 代码规范
├─ package.json                       # 脚本 + 开发依赖
├─ project.config.json                # 小程序项目配置（含 packOptions.ignore）
└─ README.md / GUIDE.md / DEVELOPER_RULE.md
```

## 🎮 核心技术要点

### 渲染与游戏循环

- **渲染**：Canvas 2D，`requestAnimationFrame` 驱动循环
- **控制**：虚拟摇杆（触摸 → 归一化方向向量）
- **视口**：摄像机跟随玩家，到达地图边缘自动钳制
- **双地图**：校园 + 运动场独立坐标体系

### 状态管理（gameStore）

- 单例模式，订阅-通知机制
- 模块化拆分：`backpack` / `stats` / `persistence`
- 关键 API：`getState()` / `setState()` / `updatePlayerPos()` / `addToBackpack()` / `resetGame()`
- 变更自动触发 `notify()` → 持久化，3 秒防抖写云
- **唯一真相来源规则**：建筑访问数 = 徽章数 = `backpack.count()`

### 像素风加载过渡（消除闪烁）

页面进入/返回时显示全屏像素进度条，分阶段文字提示（资源加载 → 初始化画布 → 准备就绪），进度与图片 `onload` 回调联动，图片未加载时上限 90%。100% 后延迟 300ms 隐藏，Canvas 已完全初始化。

### 配置参数速查（`config/gameConfig.js`）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `PLAYER.SPEED` | 160 | 玩家移动速度（px/s） |
| `PLAYER.SIZE` | 48 | 玩家绘制尺寸（px） |
| `MAP.WIDTH/HEIGHT` | 1893×1093 | 主地图像素尺寸 |
| `SPORTS_MAP.WIDTH/HEIGHT` | 949×1592 | 运动场像素尺寸 |
| `UI.JOYSTICK_RADIUS` | 45 | 摇杆半径（px） |

### 包体优化

`project.config.json` 的 `packOptions.ignore` 已排除：
`.claude`、`.git`、`.vscode`、`node_modules`、`test`、`docs`、`README.md`、`GUIDE.md`、`LICENSE`、`.eslintrc.*`、`package.json`、`package-lock.json`、`.gitignore`

若美术资源过大，可在 `app.json` 中将建筑页面配置为分包：

```json
"subPackages": [{
  "root": "pages/building",
  "pages": ["building"]
}]
```

## 📋 上架检查清单

提交审核前确认：

| 项目 | 状态 |
|------|------|
| AppID 已配置（非测试号） | ⬜ |
| 执行 `npm run lint:fix` 无 error | ⬜ |
| 微信后台已填写隐私政策 | ⬜ |
| 云开发环境 ID 已填（若需） | ⬜ |
| `user_saves` 集合权限：仅创建者可读写（若需） | ⬜ |

✅ 以下项目默认已配置：`__usePrivacyCheck__`、`requiredPrivateInfos`（空数组）、`packOptions.ignore`、隐私政策页面、用户协议页面、`sitemap.json`、像素风加载过渡。

## 📖 更多文档

| 文档 | 面向场景 | 链接 |
|------|---------|------|
| **README.md** | 初次接触项目 | 本文件 |
| **GUIDE.md** | 修改/扩展功能 | [GUIDE.md](./GUIDE.md) |
| **DEVELOPER_RULES.md** | 团队协作规范 | [DEVELOPER_RULES.md](./DEVELOPER_RULES.md) |

**阅读路径**：README 了解项目 → GUIDE 查具体操作 → DEVELOPER_RULES 确保规范。

---

## 版权说明

本项目为河北师范大学校园漫游小程序，仅供学习交流使用。