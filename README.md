# 河北师范大学 校园像素风 漫游小程序

## 快速开始

### 1. 安装开发环境
1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (Stable 稳定版)
2. 注册小程序 AppID: 登录 [mp.weixin.qq.com](https://mp.weixin.qq.com) → 注册小程序 → 获取 AppID
   - 或在开发者工具新建项目时勾选"测试号"(开发预览,不可发布)
3. 开发者工具 → "导入项目" → 选本目录 → 填入 AppID 或勾选测试号

### 2. 准备美术素材(重要!)

项目目前有**占位图**,直接导入即可预览布局和交互逻辑。但要获得完整效果,需要替换以下素材:

#### A. 地图底图(图一像素化) → `images/map-bg.png`
- **方法一**: Photoshop 打开图一 → 滤镜 → 像素化 → 马赛克(8-12像素) → 导出 PNG
- **方法二**: 免费在线工具 pixelitapp.com → 上传图一 → 调整像素块大小 → 下载
- 尺寸建议: 长边 2000-2400 像素,不超过 2MB

#### B. 启动页北门背景(图三) → `images/start-bg.png`
- 直接保存图三为 PNG 即可

#### C. 狮子主角精灵图 → `images/lion/`
- **MVP 模式**: 无需准备! 代码已内置了像素风狮子绘制(色块模拟),开箱即用
- **进阶**: 用 Piskel(piskelapp.com) 手绘 4 方向行走帧 8 张
- 替换文件: `walk-down-1.png`, `walk-down-2.png`, `walk-up-1.png`... 等 9 张

#### D. 建筑内部插画 → `images/buildings/`
- 需要 4 张像素风室内场景:
  - `library.png` — 图书馆内部
  - `software.png` — 软件学院内部
  - `museum.png` — 博物馆内部
  - `lecture.png` — 真知讲堂内部
- 每张约 800×600,可用 AI 生成像素风室内场景

### 3. 填写建筑历史文案

编辑 `data/buildings.js`,找到每条记录的 `historyText` 字段,替换为真实的建筑历史介绍:

```javascript
{
  id: 'library',
  name: '图书馆',
  // ...
  historyText: '河北师范大学图书馆始建于...(你的文案)'
}
```

### 4. 校准建筑触发区坐标

在开发者工具中预览后,走到各建筑附近,右下角会实时显示坐标。记录下来填入 `data/buildings.js` 的 `triggerZone`:

```javascript
triggerZone: { x: 实测X, y: 实测Y, w: 140, h: 110 }
```

### 5. 预览测试
1. 开发者工具左侧自动渲染 → 确认启动页和地图正常显示
2. 测试摇杆移动、建筑触发、进入详情页、返回地图
3. 右上角"预览"扫码 → 手机真机测试

### 6. 发布(需 AppID)
- 开发者工具点击"上传" → 填写版本号
- 登录 mp.weixin.qq.com → 版本管理 → 提交审核

## 项目结构

```
小程序/
├─ app.json / app.js / app.wxss    # 全局配置
├─ pages/
│  ├─ start/                       # 启动页(北门+进入按钮)
│  ├─ map/                         # 核心地图(Canvas渲染+摇杆+碰撞检测)
│  └─ building/                    # 建筑详情页(插画+历史文案)
├─ data/buildings.js               # ★ 建筑配置(填文案+校准坐标)
├─ utils/                          # 工具类(摇杆/摄像机/碰撞/动画)
├─ images/                         # 美术资源目录
└─ project.config.json             # 微信项目配置
```

## 技术要点
- **渲染**: Canvas 2D, requestAnimationFrame 游戏循环
- **控制**: 虚拟摇杆(触摸事件 → 归一化方向向量)
- **视口**: 摄像机跟随玩家,地图边缘停止
- **触发**: AABB 矩形碰撞检测,进入建筑区域时弹出气泡
- **导航**: 玩家位置通过 globalData 跨页面保持,返回地图时回到原位

## 包体限制
微信小程序主包限制 2MB。如果美术素材过大,将 building 页面配置为分包:
```json
// app.json
"subPackages": [{
  "root": "pages/building",
  "pages": ["building"]
}]
```
