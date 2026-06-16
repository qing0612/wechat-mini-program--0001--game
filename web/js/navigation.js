/* ============================================================
 * navigation.js — 移动端菜单切换、点击外部/ESC 关闭
 * ============================================================ */

(function () {
    'use strict';

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (!menuToggle || !navLinks) return;

    function closeMenu() {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    }

    menuToggle.addEventListener('click', toggleMenu);

    /* 点击菜单外部关闭 */
    document.addEventListener('click', function (e) {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    /* ESC 关闭 */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    /* 暴露给 smoothScroll，以便点击锚点后关闭移动菜单 */
    window.__closeMobileMenu = closeMenu;
})();