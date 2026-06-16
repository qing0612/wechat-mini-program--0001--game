/* ============================================================
 * heroPixels.js — 首页横幅的装饰像素块（动态生成 + 视差）
 * ============================================================ */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = document.getElementById('heroPixels');
    if (!container) return;

    /* -------- 1. 生成像素块 -------- */
    const colors = ['accent', 'yellow', 'green', 'pink', 'accent2'];
    const positions = [
        { top: '10%', left: '5%' },
        { top: '20%', left: '85%' },
        { top: '40%', left: '15%' },
        { top: '70%', left: '75%' },
        { top: '80%', left: '8%' },
        { top: '30%', left: '88%' },
        { top: '60%', left: '40%' },
        { top: '85%', left: '65%' },
        { top: '15%', left: '50%' },
        { top: '50%', left: '3%' }
    ];

    const frag = document.createDocumentFragment();
    positions.forEach((pos, i) => {
        const el = document.createElement('div');
        el.className = 'pixel-block';
        el.dataset.color = colors[i % colors.length];
        el.style.top = pos.top;
        el.style.left = pos.left;
        if (!prefersReducedMotion) {
            el.style.animationDelay = (i * 0.4) + 's';
        }
        frag.appendChild(el);
    });
    container.appendChild(frag);

    /* -------- 2. 滚动视差（rAF 节流） -------- */
    if (prefersReducedMotion) return;

    let ticking = false;
    const pixelBlocks = container.querySelectorAll('.pixel-block');

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            const scrolled = window.pageYOffset;
            pixelBlocks.forEach((pixel, index) => {
                const speed = (index + 1) * 0.05;
                pixel.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
            });
            ticking = false;
        });
    }, { passive: true });
})();