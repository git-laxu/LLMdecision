// app/js/pages/strategy/semanticPanel.js
import { AppState } from '../../state.js';
import { $, on } from '../../utils/dom.js';
import { Toast } from '../../utils/toast.js';

function buildSemanticText() {
  const location = $('strategyLocation')?.value?.trim() || '未设置地点';
  const spaceType = $('strategySpaceType')?.value?.trim() || '未设置空间类型';
  const airTemp = $('strategyAirTemp')?.value?.trim() || '未设置';
  const humidity = $('strategyHumidity')?.value?.trim() || '未设置';
  const tsv = $('strategyTSV')?.value?.trim() || '未设置';
  const goal = $('strategyGoal')?.value?.trim() || '未设置';

  return [
    `当前场景位置为${location}。`,
    `建筑空间类型为${spaceType}。`,
    `当前空气温度为${airTemp}℃，相对湿度为${humidity}% 。`,
    `当前个体热舒适TSV为${tsv}。`,
    `本次调节目标为${goal}。`
  ].join('\n');
}

export const SemanticPanel = {
  generate() {
    const semanticText = buildSemanticText();
    AppState.semanticContext = semanticText;

    const output = $('semanticOutput');
    if (output) {
      output.value = semanticText;
    }

    Toast.success('语义化状态上下文已生成');
  },

  copy() {
    const output = $('semanticOutput');
    const text = output?.value?.trim();

    if (!text) {
      Toast.warning('当前没有可复制的语义化内容');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => Toast.success('已复制语义化状态上下文'))
      .catch(() => Toast.error('复制失败'));
  },

  bindEvents() {
    on($('generateSemanticBtn'), 'click', () => this.generate());
    on($('copySemanticBtn'), 'click', () => this.copy());
  },

  init() {
    this.bindEvents();
  }
};