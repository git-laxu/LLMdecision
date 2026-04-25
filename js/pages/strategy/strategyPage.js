// app/js/pages/strategy/strategyPage.js
import { $ , on } from '../../utils/dom.js';
import { AppState } from '../../state.js';
import { Toast } from '../../utils/toast.js';
import { LlmApi } from '../../api/llmApi.js';
import { SemanticPanel } from './semanticPanel.js';
import { ModelPanel } from './modelPanel.js';
import { ResultPanel } from './resultPanel.js';
import { HistoryManager } from '../projects/historyManager.js';

function collectConstraints() {
  return {
    goal: $('strategyGoal')?.value?.trim() || '',
    energyPriority: $('strategyEnergyPriority')?.checked || false,
    localFirst: $('strategyLocalFirst')?.checked || false,
    deviceLimit: $('strategyDeviceLimit')?.value?.trim() || ''
  };
}

function collectKnowledgeRefs() {
  return AppState.knowledgeBase.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title
  }));
}

export const StrategyPage = {
  async generateStrategy() {
    if (!AppState.semanticContext) {
      Toast.warning('请先生成语义化状态上下文');
      return;
    }

    ModelPanel.syncState();

    const loading = $('strategyLoading');
    if (loading) loading.style.display = 'flex';

    try {
      const result = await LlmApi.generateStrategy({
        semanticContext: AppState.semanticContext,
        modelConfig: AppState.modelConfig,
        constraints: collectConstraints(),
        knowledgeRefs: collectKnowledgeRefs()
      });

      AppState.currentResult = result;
      ResultPanel.render(result);
      HistoryManager.saveRecord(result);

      Toast.success('策略生成完成');
    } catch (err) {
      console.error(err);
      Toast.error(`策略生成失败：${err.message}`);
    } finally {
      if (loading) loading.style.display = 'none';
    }
  },

  bindEvents() {
    on($('generateStrategyBtn'), 'click', () => this.generateStrategy());
  },

  init() {
    SemanticPanel.init();
    ModelPanel.init();
    ResultPanel.init();
    this.bindEvents();
  }
};