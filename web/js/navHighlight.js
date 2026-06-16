/* ============================================================
 * navHighlight.js — 滚动时导航链接高亮当前所处区块
 * ============================================================ */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 构造 "区块 ID → 导航 <a>" 的映射表 */
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    const sectionMap = {};
    navAnchors.forEach(a => {
        const id = a.getAttribute('href').substring(1);
        const sec = document.getElementById(id);
        if (sec) sectionMap[id] = a;
    });

    const sectionIds = Object.keys(sectionMap);
    if (sectionIds.length === 0) return;

    let ticking = false;

    window.addEventListener('scroll', function () {
        if (prefersReducedMotion || ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            const scrollPos = window.pageYOffset + window.innerHeight * 0.3;
            sectionIds.forEach(id => {
                const sec = document.getElementById(id);
                if (!sec) return;
                const top = sec.offsetTop;
                const bottom = top + sec.offsetHeight;
                const link = sectionMap[id];
                if (scrollPos >= top && scrollPos < bottom) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            ticking = false;
        });
    }, { passive: true });
})();