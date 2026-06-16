/* ============================================================
 * reveal.js — 滚动淡入 + 功能卡片依次展开动画
 * 依赖 IntersectionObserver（降级方案：直接显示）
 * ============================================================ */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -------- 1. 功能卡片初始隐藏样式 -------- */
    const featureCards = document.querySelectorAll('.feature-card');
    const showcaseItems = document.querySelectorAll('.showcase-item');

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });
    showcaseItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
    });

    /* -------- 2. 降级方案：直接显示所有 -------- */
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        featureCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
        showcaseItems.forEach(item => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        });
        return;
    }

    /* -------- 3. 区块级淡入 -------- */
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.reveal').forEach(el => sectionObserver.observe(el));

    /* -------- 4. 功能区卡片依次淡入（features 区块可见时触发） -------- */
    const featureSection = document.getElementById('features');
    if (!featureSection) return;

    const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            featureCards.forEach((card, i) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.25s ease';
                }, i * 80);
            });
            showcaseItems.forEach((item, i) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s ease';
                }, 700 + i * 60);
            });
            cardObserver.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    cardObserver.observe(featureSection);
})();