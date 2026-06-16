/* ============================================================
 * smoothScroll.js — 平滑锚点滚动（兼容 prefers-reduced-motion）
 * ============================================================ */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
            /* 移动端点击导航链接后关闭菜单（由 navigation.js 暴露） */
            if (typeof window.__closeMobileMenu === 'function') {
                window.__closeMobileMenu();
            }
        });
    });
})();