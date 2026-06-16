/* ============================================================
 * featureData.js — 核心功能卡片的数据配置
 * 替代 HTML 中硬编码的 9 个 feature-card 结构
 * ============================================================ */

(function (global) {
    'use strict';

    /**
     * 核心功能列表 — 每项对应一张卡片。
     * icon: 对应 FEATURE_ICONS 中的 key
     * tag:  右上角技术标签
     * name: 标题
     * desc: 主描述
     * techNote: 下方补充的技术说明（可选）
     */
    const FEATURES = [
        {
            icon: 'dual-map',
            tag: 'CANVAS2D',
            name: '双场景独立地图自由切换',
            desc: '校园主地图 + 运动场分图双场景，独立玩家坐标存档隔离，切换流畅无错乱。',
            techNote: '主地图 1893×1093，运动场分图 949×1592'
        },
        {
            icon: 'joystick',
            tag: '触屏交互',
            name: '触屏摇杆像素行走操控',
            desc: 'Canvas 2D 游戏渲染循环驱动，虚拟摇杆精准控向，配套连贯像素人物行走帧动画。',
            techNote: '完美适配手机触屏，低延迟操作'
        },
        {
            icon: 'building',
            tag: '场景触发',
            name: '校园建筑沉浸式科普互动',
            desc: '靠近建筑自动弹出交互气泡，点击查看校史沿革、建筑介绍与原创像素内景插画。',
            techNote: 'AABB 碰撞检测 · 6 座标志性建筑'
        },
        {
            icon: 'badge',
            tag: '成就系统',
            name: '全校园徽章收集成就系统',
            desc: '每栋建筑绑定专属像素徽章，背包统一收纳，集齐全部徽章解锁限定成就页面。',
            techNote: '本地存储自动同步 · 独立背包页'
        },
        {
            icon: 'daynight',
            tag: '渲染切换',
            name: '一键切换校园昼夜光影',
            desc: '两套像素渲染图层动态切换，昼夜自动适配灯光、阴影与专属氛围色调。',
            techNote: '色调分层渲染 · 暗部自动叠加蓝紫滤镜'
        },
        {
            icon: 'season',
            tag: '粒子系统',
            name: '动态四季天气粒子特效',
            desc: '春夏秋冬一键切换，夏雨、冬雪实时粒子动画，季节专属校园配色渲染。',
            techNote: 'Canvas 粒子系统 · 随屏幕尺寸动态调整密度'
        },
        {
            icon: 'music',
            tag: '音频管理',
            name: '分场景独立音频控制',
            desc: '启动页、地图场景音乐分离，音量开关独立可控，设置永久本地存储。',
            techNote: '独立 AudioManager 封装 · 零第三方依赖'
        },
        {
            icon: 'cloud',
            tag: '云开发',
            name: '本地 + 云端双向存档',
            desc: '玩家位置、背包、进度自动本地缓存，上线云端同步数据，更换设备数据不丢失。',
            techNote: '3 秒防抖 · 微信云开发 user_saves 集合'
        },
        {
            icon: 'loading',
            tag: '帧动画',
            name: '像素风平滑加载动画',
            desc: '页面、地图切换时展示像素进度条过渡画面，彻底消除 Canvas 初始化闪烁。',
            techNote: 'requestAnimationFrame 驱动 · 进度百分比显示'
        }
    ];

    /**
     * 建筑展示列表 — 6 座校园建筑
     */
    const BUILDINGS = [
        { emoji: '📚', name: '图书馆',    nameEn: 'Library',          desc: '河北师范大学图书馆，知识的殿堂，收藏海量文献资源，是学子们汲取知识的重要场所。', badge: '图书馆徽章' },
        { emoji: '🏛️', name: '博物馆',    nameEn: 'Museum',           desc: '校园博物馆，珍藏校史文物与文化遗产，记录着学校百余年的发展历程与文化积淀。', badge: '博物馆徽章' },
        { emoji: '💻', name: '软件学院',  nameEn: 'School of Software', desc: '软件学院教学楼，前沿的计算机科学与软件工程教学基地，培养优秀的信息技术人才。', badge: '软件学院徽章' },
        { emoji: '🌉', name: '天桥',      nameEn: 'Pont',             desc: '连接校园各区的标志性天桥，漫步其上，俯瞰校园美景，是独特的校园风景线。', badge: '天桥徽章' },
        { emoji: '🎓', name: '真知讲堂',  nameEn: 'Zhenzhi Lecture Hall', desc: '大型学术报告厅，举办各类学术讲座、重要会议与活动，见证思想的碰撞与传播。', badge: '真知讲堂徽章' },
        { emoji: '🏟️', name: '体育场馆',  nameEn: 'Sports Center',    desc: '独立的运动场地图，包含广阔的运动场地，是师生锻炼健身、举办运动会的重要场所。', badge: '体育场馆徽章' }
    ];

    /**
     * 技术亮点时间轴
     */
    const TECH_ITEMS = [
        {
            title: '🎨 Canvas 2D 渲染引擎',
            desc: '使用 Canvas 2D API 驱动游戏循环，实现像素狮子的绘制与动画。通过 <code>requestAnimationFrame</code> 保证流畅的帧率体验。像素角色通过网格字符定义，每个字符映射对应颜色，实现可定制的像素美术。'
        },
        {
            title: '📍 AABB 碰撞检测系统',
            desc: '建筑触发区采用 AABB（轴对齐包围盒）矩形碰撞检测，玩家进入 <code>triggerZone</code> 时自动弹出交互气泡。精确的坐标校准确保触发体验自然流畅。'
        },
        {
            title: '💾 单例状态管理 (GameStore)',
            desc: '自研 <code>GameStore</code> 单例，统一管理玩家位置、背包、徽章、日夜、季节等游戏状态。采用订阅-通知模式，页面监听状态变化自动刷新。状态变更自动持久化到 <code>wx.setStorageSync</code>。'
        },
        {
            title: '☁️ 云端同步系统',
            desc: '可选配置微信云开发，启用后自动同步进度到 <code>user_saves</code> 集合。采用 3 秒防抖机制避免频繁请求，数据库权限天然按微信 OpenID 隔离用户数据，保障隐私安全。'
        },
        {
            title: '🌧️ Canvas 粒子天气系统',
            desc: '基于 Canvas 绘制的动态粒子系统，根据季节自动切换：夏季下雨、冬季飘雪。粒子数量根据屏幕尺寸动态计算，性能与视觉效果平衡。切换季节后效果即时生效。'
        },
        {
            title: '🛡️ 隐私合规与代码规范',
            desc: '内置隐私政策页面与用户协议页面，支持微信官方隐私授权弹窗。项目配置 ESLint 统一代码风格，Jest 单元测试覆盖核心逻辑，<code>packOptions.ignore</code> 优化打包体积。'
        }
    ];

    /**
     * 页面预览 — 6 个小程序页面入口
     */
    const PREVIEWS = [
        { icon: '🚪', subtitle: 'START PAGE',  label: '启动页 · 北门背景' },
        { icon: '🗺️', subtitle: 'MAP PAGE',    label: '地图页 · 像素探索' },
        { icon: '🏛️', subtitle: 'BUILDING',    label: '建筑页 · 历史介绍' },
        { icon: '🎒', subtitle: 'BACKPACK',    label: '背包页 · 徽章管理' },
        { icon: '⚙️', subtitle: 'SETTINGS',    label: '设置页 · 日夜季节' },
        { icon: '🏟️', subtitle: 'SPORTS MAP',  label: '运动场 · 独立地图' }
    ];

    global.FEATURE_DATA = {
        features: FEATURES,
        buildings: BUILDINGS,
        techItems: TECH_ITEMS,
        previews: PREVIEWS
    };
})(window);