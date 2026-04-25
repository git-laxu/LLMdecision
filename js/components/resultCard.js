// app/js/components/resultCard.js
import { setHTML } from '../utils/dom.js';

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const ResultCard = {
  render(container, result) {
    if (!container) return;

    if (!result) {
      setHTML(container, `<div class="data-list-empty"><p>暂无结果</p></div>`);
      return;
    }

    setHTML(
      container,
      `
      <div class="result-card">
        <div class="result-card-section">
          <h4>任务</h4>
          <p>${escapeHtml(result.task || '')}</p>
        </div>
        <div class="result-card-section">
          <h4>约束</h4>
          <p>${escapeHtml(result.constraints || '')}</p>
        </div>
        <div class="result-card-section">
          <h4>策略结果</h4>
          <pre>${escapeHtml(JSON.stringify(result.decision || result, null, 2))}</pre>
        </div>
      </div>
      `
    );
  }
};