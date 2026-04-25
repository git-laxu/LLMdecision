// app/js/pages/strategy/resultPanel.js
import { $, setText, setHTML, on } from '../../utils/dom.js';
import { Toast } from '../../utils/toast.js';

export const ResultPanel = {
  render(result) {
    if (!result) return;

    setText($('resultTask'), result.task || '');
    setText($('resultConstraints'), result.constraints || '');
    setText($('resultRules'), result.rules || '');
    setText($('resultDecisionText'), result.rawText || '');

    const jsonBox = $('resultJson');
    if (jsonBox) {
      jsonBox.value = JSON.stringify(result.decision || result, null, 2);
    }
  },

  copyJson() {
    const text = $('resultJson')?.value?.trim();
    if (!text) {
      Toast.warning('暂无可复制的结果JSON');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => Toast.success('结果JSON已复制'))
      .catch(() => Toast.error('复制失败'));
  },

  exportJson() {
    const text = $('resultJson')?.value?.trim();
    if (!text) {
      Toast.warning('暂无可导出的结果JSON');
      return;
    }

    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strategy-result.json';
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('策略结果已导出');
  },

  bindEvents() {
    on($('copyResultBtn'), 'click', () => this.copyJson());
    on($('exportResultBtn'), 'click', () => this.exportJson());
  },

  init() {
    this.bindEvents();
  }
};