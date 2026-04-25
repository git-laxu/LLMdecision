// app/js/pages/projects/historyManager.js
import { AppState } from '../../state.js';
import { $, on } from '../../utils/dom.js';
import { Storage } from '../../utils/storage.js';
import { Toast } from '../../utils/toast.js';

export const HistoryManager = {
  saveRecord(record) {
    if (!record) return;

    AppState.history.unshift({
      id: `H_${Date.now()}`,
      ...record
    });

    Storage.saveHistory();
    this.renderList();
  },

  renderList() {
    const el = $('historyList');
    if (!el) return;

    if (!Array.isArray(AppState.history) || AppState.history.length === 0) {
      el.innerHTML = `
        <div class="data-list-empty">
          <p>暂无历史策略记录</p>
        </div>
      `;
      return;
    }

    el.innerHTML = AppState.history.map((item) => `
      <div class="data-list-item" data-id="${item.id}">
        <div class="data-list-main">
          <div class="data-list-title">${item.task || '未命名策略任务'}</div>
          <div class="data-list-meta">${item.timestamp || ''}</div>
          <div class="data-list-desc">${item.rawText || ''}</div>
        </div>
      </div>
    `).join('');
  },

  clearHistory() {
    AppState.history = [];
    Storage.saveHistory();
    this.renderList();
    Toast.success('历史记录已清空');
  },

  bindEvents() {
    on($('clearHistoryBtn'), 'click', () => this.clearHistory());
  },

  init() {
    this.bindEvents();
    this.renderList();
  }
};