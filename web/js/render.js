/* ============================================================
 * render.js — 根据 FEATURE_DATA + FEATURE_ICONS 动态渲染
 * 功能卡片 / 建筑卡片 / 技术亮点 / 页面预览 四个区块
 * ============================================================ */

(function () {
    'use strict';

    /* 依赖检查 */
    if (!window.FEATURE_DATA || !window.FEATURE_ICONS) {
        console.warn('[render.js] FEATURE_DATA 或 FEATURE_ICONS 未加载，请确认脚本引入顺序。');
        return;
    }

    const { features, buildings, techItems, previews } = window.FEATURE_DATA;

    /* -------- 1. 功能卡片 -------- */
    const featureGrid = document.getElementById('featureGrid');
    if (featureGrid) {
        featureGrid.innerHTML = features.map(f => `
            <article class="feature-card" tabindex="0" aria-label="${f.name}">
                <span class="feature-tag">${f.tag}</span>
                <div class="feature-icon-wrap">${window.FEATURE_ICONS.get(f.icon)}</div>
                <div class="feature-name">${f.name}</div>
                <div class="feature-desc">
                    ${f.desc}
                    ${f.techNote ? `<span class="tech-note">${f.techNote}</span>` : ''}
                </div>
            </article>
        `).join('');
    }

    /* -------- 2. 建筑卡片（主题从 1 开始递增） -------- */
    const buildingGrid = document.getElementById('buildingGrid');
    if (buildingGrid) {
        buildingGrid.innerHTML = buildings.map((b, i) => `
            <div class="building-card" data-theme="${i + 1}">
                <div class="building-preview"><span>${b.emoji}</span></div>
                <div class="building-content">
                    <div class="building-name">${b.name}</div>
                    <div class="building-name-en">${b.nameEn}</div>
                    <div class="building-desc">${b.desc}</div>
                    <div class="building-badge">★ ${b.badge}</div>
                </div>
            </div>
        `).join('');
    }

    /* -------- 3. 技术亮点时间轴 -------- */
    const techTimeline = document.getElementById('techTimeline');
    if (techTimeline) {
        techTimeline.innerHTML = techItems.map(t => `
            <div class="tech-item">
                <div class="tech-title">${t.title}</div>
                <div class="tech-desc">${t.desc}</div>
            </div>
        `).join('');
    }

    /* -------- 4. 页面预览 -------- */
    const previewGrid = document.getElementById('previewGrid');
    if (previewGrid) {
        previewGrid.innerHTML = previews.map(p => `
            <div class="preview-card">
                <div class="preview-mock">
                    <div class="phone-frame">
                        <div class="phone-content">
                            <div class="preview-icon">${p.icon}</div>
                            <div class="phone-subtitle">${p.subtitle}</div>
                        </div>
                    </div>
                </div>
                <div class="preview-label">${p.label}</div>
            </div>
        `).join('');
    }
})();