# 建筑与人物添加指南

本文档说明如何在小程序中添加新建筑、新角色,以及美术资源规格,确保代码完整性。

---

## 一、添加新建筑

### 1. 数据结构

在 `data/buildings.js` 的 `BUILDINGS` 数组中添加一个对象:

```javascript
{
  id: 'unique_id',           // 唯一标识符(英文,用于URL参数)
  name: '建筑名称',           // 中文名(显示在地图和详情页)
  nameEn: 'English Name',    // 英文名(显示在详情页副标题)
  triggerZone: {             // 触发区域(玩家进入此矩形触发"进入"按钮)
    x: 100,                 // X坐标(像素,以地图左上角为原点)
    y: 200,                 // Y坐标
    w: 130,                 // 宽度
    h: 100                  // 高度
  },
  interiorImage: '/images/buildings/my_building.png',  // 建筑内部插画路径
  historyText: '历史介绍文案...'                         // 建筑介绍(200-400字)
}
```

### 2. 坐标获取方法

1. 微信开发者工具中运行小程序,打开地图页
2. 用摇杆走到目标建筑门口
3. 观察地图左下角或底部提示栏中显示的坐标数值
4. 记录建筑门口中心的 (x, y) 值
5. 以该点为中心,设定 triggerZone:
   - `x` = 中心X - 宽度/2
   - `y` = 中心Y - 高度/2
   - `w` = 建筑正面宽度 + 20像素余量
   - `h` = 建筑正面高度 + 20像素余量

### 3. 添加步骤清单

- [ ] 在 `data/buildings.js` 中添加建筑对象
- [ ] 准备建筑内部插画 `images/buildings/xxx.png`
- [ ] 填写 `historyText` 文案
- [ ] 预览校准 `triggerZone` 坐标
- [ ] 测试进入/返回流程

### 4. 删除建筑

从 `BUILDINGS` 数组中移除对应对象即可,代码会自动适配。

---

## 二、角色/人物系统

### 1. 当前角色:像素风狮子

狮子使用 Canvas 绘制(非精灵图),定义在 `pages/map/map.js` 的 `drawLion()` 方法中。

#### 配色参数(位于 map.js 顶部)

```javascript
const LION_COLORS = {
  body: '#D4A030',       // 金黄毛发
  belly: '#F5E6C8',      // 浅色腹部
  mane: '#C07820',       // 深色鬃毛
  outline: '#3D2200',    // 轮廓线
  eye: '#1A1A1A',        // 眼睛
  nose: '#2D1800'        // 鼻子
};
```

#### 绘制结构

```
drawLion(ctx, x, y, dir, frame, moving)
  ├── 阴影(椭圆)
  ├── 鬃毛(外圈圆形)
  ├── 身体(内圈圆形)
  ├── 腹部(小圆形)
  ├── 眼睛(2个圆点 + 2个高光点)
  ├── 鼻子(1个圆点)
  ├── 耳朵(2个圆形,仅朝上/左右时显示)
  └── 腿(2个矩形,行走帧动画时可见)
```

#### 修改角色外观

- 改变颜色: 修改 `LION_COLORS` 对象
- 改变大小: 修改 `PLAYER_SIZE` 常量(当前40像素)
- 改变行走速度: 修改 `PLAYER_SPEED` 常量(当前150像素/秒)
- 改变动画帧数: 修改 `SpriteAnimator` 的 `frameCount` 和 `frameDuration`

### 2. 替换为精灵图(进阶)

如需用真正的像素精灵图替换 Canvas 绘制:

#### A. 准备精灵图

用 [Piskel](https://www.piskelapp.com/) 或 Aseprite 绘制:
- 4个方向 × 2帧 = 8张行走帧
- 另加1张静止帧 = 共9张
- 每张尺寸: 32×32 或 48×48 像素
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

#### C. 代码替换

在 `map.js` 的 `onLoad()` 中预加载所有精灵图:

```javascript
onLoad() {
  // ...现有代码...
  this.spriteImages = {};
  const dirs = ['up', 'down', 'left', 'right'];
  dirs.forEach(d => {
    for (let f = 1; f <= 2; f++) {
      const key = `walk-${d}-${f}`;
      const img = this.canvas.createImage();
      img.src = `/images/lion/${key}.png`;
      this.spriteImages[key] = img;
    }
  });
  const idle = this.canvas.createImage();
  idle.src = '/images/lion/idle.png';
  this.spriteImages.idle = idle;
}
```

在 `render()` 中替换 `drawLion()` 调用:

```javascript
// 替换这行:
this.drawLion(ctx, sp.x, sp.y, this.dir, this.anim.frameIndex, this.moving);

// 改为:
const frameKey = this.moving ? `walk-${this.dir}-${this.anim.frameIndex + 1}` : 'idle';
const sprite = this.spriteImages[frameKey];
if (sprite && sprite.complete) {
  ctx.drawImage(sprite, sp.x - PLAYER_SIZE/2, sp.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
}
```

### 3. 添加新角色

如需添加NPC或其他角色:

#### A. 在 buildings.js 中添加角色数据

```javascript
// 新增角色配置
const CHARACTERS = [
  {
    id: 'guide_npc',
    name: '校园向导',
    pos: { x: 940, y: 900 },   // 出生位置
    sprite: '/images/npc/guide.png',
    dialog: ['欢迎来到河北师范大学!', '用摇杆探索校园吧!']
  }
];
```

#### B. 在 map.js 中添加角色渲染

```javascript
// 新增属性
this.npcs = CHARACTERS.map(c => ({
  ...c,
  spriteImg: null
}));

// 在 onLoad 中加载精灵图
this.npcs.forEach(npc => {
  npc.spriteImg = this.canvas.createImage();
  npc.spriteImg.src = npc.sprite;
});

// 在 render() 中绘制
this.npcs.forEach(npc => {
  const sp = worldToScreen(npc.pos.x, npc.pos.y, cam);
  if (npc.spriteImg && npc.spriteImg.complete) {
    ctx.drawImage(npc.spriteImg, sp.x - 20, sp.y - 20, 40, 40);
  } else {
    // 占位: 绿色方块
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(sp.x - 15, sp.y - 15, 30, 30);
  }
});

// 在 update() 中添加对话触发检测
const npcDist = (px, py, nx, ny) => Math.sqrt((px-nx)**2 + (py-ny)**2);
this.npcs.forEach(npc => {
  if (npcDist(this.player.x, this.player.y, npc.pos.x, npc.pos.y) < 50) {
    // 触发对话
    this.showDialog(npc.dialog);
  }
});
```

#### C. 对话框 WXML(在 map.wxml 中添加)

```html
<view class="dialog-box" wx:if="{{dialogText}}">
  <text class="dialog-name">{{dialogName}}</text>
  <text class="dialog-content">{{dialogText}}</text>
  <text class="dialog-tap" bindtap="dismissDialog">点击继续</text>
</view>
```

#### D. 对话框 CSS(在 map.wxss 中添加)

```css
.dialog-box {
  position: absolute;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600rpx;
  background: #1a1a2e;
  border: 3rpx solid #f4a261;
  padding: 20rpx 24rpx;
  z-index: 25;
  box-shadow: 5rpx 5rpx 0 0 #0f0f1a;
}
.dialog-name { color: #f4a261; font-weight: 900; font-size: 24rpx; display: block; margin-bottom: 8rpx; }
.dialog-content { color: #ccc; font-size: 24rpx; line-height: 1.6; display: block; }
.dialog-tap { color: #888; font-size: 18rpx; display: block; text-align: right; margin-top: 10rpx; }
```

---

## 三、美术资源规格

### 1. 地图底图

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/map-bg.png` |
| 格式 | PNG 或 JPG |
| 尺寸 | 匹配 `buildings.js` 中的 `MAP_SIZE` 值 |
| 建议长边 | 1500-2500 像素 |
| 文件大小 | < 2MB (主包限制) |
| 处理方式 | 原图像素化处理(马赛克 8-12 像素) |

### 2. 启动页背景

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/start-bg.png` |
| 格式 | PNG 或 JPG |
| 尺寸 | 任意,建议 16:9 比例 |
| 文件大小 | < 1MB |

### 3. 建筑内部插画

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/buildings/{id}.png` |
| 格式 | PNG (支持透明背景) |
| 尺寸 | 800×600 或 16:9 比例 |
| 文件大小 | 每张 < 300KB |
| 风格 | 像素风室内场景,与地图风格统一 |

### 4. 角色精灵图(进阶)

| 项目 | 规格 |
|------|------|
| 文件路径 | `images/lion/walk-{dir}-{n}.png` |
| 格式 | PNG (支持透明背景) |
| 尺寸 | 32×32 或 48×48 像素 |
| 帧数 | 4方向 × 2帧 + 1静止帧 = 9张 |
| 文件大小 | 每张 < 10KB |

### 5. 图片压缩建议

- 地图底图: JPG quality 82-85 即可
- 建筑插画: PNG 用 pngquant 压缩到 256 色
- 精灵图: 尺寸小不需要压缩
- 总包体控制: 主包 < 2MB,可将建筑详情页配置为分包

---

## 四、坐标校准详细步骤

### 方法一:Canvas 实时显示(推荐)

当前地图页会在画面中心显示实时坐标(无图模式下)。走到建筑门口,记录显示的数值。

### 方法二:console.log 输出

在 `map.js` 的 `update()` 方法中添加:

```javascript
// 每秒输出一次坐标
if (Math.floor(ts / 1000) !== Math.floor((ts - dt) / 1000)) {
  console.log('玩家坐标:', Math.round(this.player.x), Math.round(this.player.y));
}
```

在开发者工具控制台中查看输出。

### 方法三:在 Canvas 上绘制坐标

在 `map.js` 的 `render()` 方法中, `ctx.restore()` 之前添加:

```javascript
// 绘制当前坐标到屏幕左下角
ctx.save();
ctx.scale(dpr, dpr);
ctx.fillStyle = '#fff';
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

假设你在图书馆门口记录到坐标为 (870, 380),建筑宽度约 120 像素,高度约 90 像素:

```javascript
triggerZone: {
  x: 870 - 60,    // 810
  y: 380 - 45,    // 335
  w: 120,         // 建筑宽度
  h: 90           // 建筑高度
}
```

---

## 五、常见问题

### Q: 添加建筑后不显示触发气泡?
A: 检查 triggerZone 坐标是否正确。走到建筑附近用坐标显示确认位置。

### Q: 建筑详情页图片不显示?
A: 检查 interiorImage 路径是否正确,文件是否存在。路径以 `/` 开头表示小程序根目录。

### Q: 横屏后摇杆太大/太小?
A: 修改 `map.js` 中 `onLoad` 的 `Joystick` radius 值,和 `data` 中的 `joystickBaseR`。

### Q: 地图包体太大无法上传?
A: 在 `app.json` 中配置分包,将 building 页面及其插画放入分包:
```json
"subPackages": [{
  "root": "subpkg",
  "pages": ["pages/building/building"]
}]
```

### Q: 如何修改狮子的移动速度?
A: 修改 `map.js` 顶部的 `PLAYER_SPEED` 常量(像素/秒)。
