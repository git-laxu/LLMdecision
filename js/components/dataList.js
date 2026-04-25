import { setHTML } from '../utils/dom.js';

function renderEmpty(message = '暂无数据') {
  return `
    <div class="data-list-empty">
      <p>${message}</p>
    </div>
  `;
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeList(list) {
  return Array.isArray(list) ? list : [];
}

export const DataList = {
  renderKnowledge(container, list = []) {
    const safeList = normalizeList(list);
    if (!container) return;

    if (safeList.length === 0) {
      setHTML(container, renderEmpty('暂无导入的知识数据'));
      return;
    }

    setHTML(
      container,
      safeList.map((item) => `
        <div class="data-list-item" data-id="${escapeHtml(item.id)}">
          <div class="data-list-main">
            <div class="data-list-title">${escapeHtml(item.title || item.id || '未命名知识')}</div>
            <div class="data-list-meta">
              分类：${escapeHtml(item.category || '未分类')}　
              优先级：${escapeHtml(item.priority ?? 1)}
            </div>
            <div class="data-list-desc">${escapeHtml(item.content || '')}</div>
          </div>
        </div>
      `).join('')
    );
  },

  renderSamples(container, list = []) {
    const safeList = normalizeList(list);
    if (!container) return;

    if (safeList.length === 0) {
      setHTML(container, renderEmpty('暂无样本数据'));
      return;
    }

    setHTML(
      container,
      safeList.map((item) => `
        <div class="data-list-item" data-id="${escapeHtml(item.id)}">
          <div class="data-list-main">
            <div class="data-list-title">${escapeHtml(item.sceneName || '样本条目')}</div>
            <div class="data-list-meta">模式：${escapeHtml(item.mode || 'unknown')}</div>
            <div class="data-list-desc">
              ${escapeHtml(item.sceneText || item.responseText || '')}
            </div>
          </div>
        </div>
      `).join('')
    );
  },

  renderProjects(container, list = []) {
    const safeList = normalizeList(list);
    if (!container) return;

    if (safeList.length === 0) {
      setHTML(container, renderEmpty('暂无项目数据'));
      return;
    }

    setHTML(
      container,
      safeList.map((item) => `
        <div class="data-list-item" data-id="${escapeHtml(item.id)}">
          <div class="data-list-main">
            <div class="data-list-title">${escapeHtml(item.name || '未命名项目')}</div>
            <div class="data-list-meta">${escapeHtml(item.createdAt || '')}</div>
            <div class="data-list-desc">${escapeHtml(item.description || '')}</div>
          </div>
        </div>
      `).join('')
    );
  }
};