/* ============================================================
 * icons.js — 功能卡片的 SVG 像素图标集合
 * 以模块化方式提供：按名称查询 SVG 字符串
 * ============================================================ */

(function (global) {
    'use strict';

    /**
     * 统一的像素矢量图标。每个图标都是一个 viewBox="0 0 64 64" 的内联 SVG。
     * 通过 FEATURE_ICONS.get(name) 获取 HTML 字符串，直接写入 DOM。
     */
    const ICONS = {
        /* 1. 双地图系统 — 两个网格地图 + 像素点路径 */
        'dual-map': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="6" y="8" width="24" height="20" />
    <rect x="34" y="8" width="24" height="20" />
    <rect x="6" y="36" width="24" height="20" />
    <rect x="34" y="36" width="24" height="20" />
    <path d="M 10 16 h 16" />
    <path d="M 10 20 h 16" />
    <path d="M 38 16 h 16" />
    <path d="M 38 20 h 16" />
    <circle cx="14" cy="44" r="2" fill="#ff6b35" stroke="none" />
    <circle cx="46" cy="50" r="2" fill="#ff6b35" stroke="none" />
    <path d="M 14 44 l 20 -4 l 12 10" />
</svg>`,

        /* 2. 虚拟摇杆 — 圆形方向盘 + 中心点 */
        'joystick': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="22" />
    <circle cx="32" cy="32" r="14" />
    <circle cx="32" cy="32" r="6" fill="#ff6b35" stroke="#ff6b35" />
    <path d="M 32 10 l 0 6" />
    <path d="M 32 48 l 0 6" />
    <path d="M 10 32 l 6 0" />
    <path d="M 48 32 l 6 0" />
</svg>`,

        /* 3. 建筑探索 — 像素房子 + 屋顶圆标 */
        'building': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M 12 48 l 0 -24 l 16 -12 l 16 12 l 0 24" />
    <path d="M 20 48 l 0 -20 l 24 0 l 0 20" />
    <rect x="28" y="32" width="8" height="16" />
    <rect x="16" y="20" width="6" height="6" />
    <rect x="42" y="20" width="6" height="6" />
    <circle cx="32" cy="14" r="2" fill="#ff6b35" stroke="none" />
</svg>`,

        /* 4. 徽章收集 — 圆形徽章 + 飘带 */
        'badge': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="26" r="14" />
    <circle cx="32" cy="26" r="8" />
    <path d="M 22 36 l -6 16 l 16 -6 l 16 6 l -6 -16" />
    <circle cx="32" cy="26" r="3" fill="#ff6b35" stroke="none" />
</svg>`,

        /* 5. 日夜模式 — 太阳 + 月亮组合图标 */
        'daynight': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="22" cy="32" r="12" />
    <circle cx="20" cy="30" r="3" fill="#ff6b35" stroke="none" />
    <circle cx="22" cy="32" r="10" fill="none" />
    <path d="M 22 18 l 0 -4" />
    <path d="M 22 46 l 0 -4" />
    <path d="M 8 32 l 4 0" />
    <circle cx="46" cy="22" r="10" />
    <circle cx="42" cy="18" r="2" fill="#1a1a2e" stroke="none" />
    <circle cx="52" cy="30" r="1.5" fill="#1a1a2e" stroke="none" />
</svg>`,

        /* 6. 四季系统 — 雪花/叶子 + 点缀像素点 */
        'season': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M 32 10 l 4 10 l 12 2 l -10 8 l 2 12 l -8 -6 l -8 6 l 2 -12 l -10 -8 l 12 -2 l 4 -10" />
    <circle cx="12" cy="46" r="2" fill="#ff6b35" stroke="none" />
    <circle cx="52" cy="50" r="2" fill="#ff6b35" stroke="none" />
    <circle cx="18" cy="56" r="1.5" fill="#ff6b35" stroke="none" />
    <circle cx="48" cy="56" r="1.5" fill="#ff6b35" stroke="none" />
</svg>`,

        /* 7. 背景音乐 — 音符 + 声波线 */
        'music': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="20" width="6" height="24" />
    <path d="M 16 24 l 14 -6 l 0 28 l -14 -6" />
    <circle cx="44" cy="32" r="6" />
    <path d="M 50 32 a 6 6 0 0 0 -6 -6" />
    <path d="M 52 32 a 8 8 0 0 0 -8 -8" />
    <rect x="40" y="30" width="8" height="4" fill="#ff6b35" stroke="none" />
</svg>`,

        /* 8. 云端存档 — 像素云朵 + 内部十字 */
        'cloud': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M 16 44 a 10 10 0 0 1 4 -18 a 14 14 0 0 1 28 4 a 8 8 0 0 1 2 16 l -34 0 z" />
    <path d="M 28 36 l 8 0 l 0 -8 l 4 0 l 0 8 l 8 0 l 0 4 l -8 0 l 0 8 l -4 0 l 0 -8 l -8 0 z" fill="#ff6b35" stroke="none" />
    <path d="M 28 36 l 8 0 l 0 -8 l 4 0 l 0 8 l 8 0 l 0 4 l -8 0 l 0 8 l -4 0 l 0 -8 l -8 0 z" />
</svg>`,

        /* 9. 像素加载过渡 — 进度条 + 上下像素点 */
        'loading': `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="8" y="24" width="48" height="16" />
    <rect x="12" y="28" width="8" height="8" fill="#ff6b35" stroke="none" />
    <rect x="22" y="28" width="8" height="8" fill="#ff6b35" stroke="none" />
    <rect x="32" y="28" width="8" height="8" fill="#ff6b35" stroke="none" />
    <rect x="42" y="28" width="8" height="8" />
    <path d="M 16 16 l 0 -4" />
    <path d="M 24 16 l 0 -4" />
    <path d="M 32 16 l 0 -4" />
    <path d="M 40 16 l 0 -4" />
    <path d="M 48 16 l 0 -4" />
    <path d="M 16 48 l 0 4" />
    <path d="M 24 48 l 0 4" />
    <path d="M 32 48 l 0 4" />
    <path d="M 40 48 l 0 4" />
    <path d="M 48 48 l 0 4" />
</svg>`
    };

    function getIcon(name) {
        return ICONS[name] || '';
    }

    /** 按顺序返回所有图标名称（与 features 区块的 9 张卡片一一对应） */
    function getIconList() {
        return ['dual-map', 'joystick', 'building', 'badge', 'daynight', 'season', 'music', 'cloud', 'loading'];
    }

    global.FEATURE_ICONS = {
        get: getIcon,
        list: getIconList
    };
})(window);