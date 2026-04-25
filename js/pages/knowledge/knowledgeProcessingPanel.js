// app/js/pages/knowledge/knowledgeProcessingPanel.js
import { AppState } from '../../state.js';
import { $, on, setHTML, setText } from '../../utils/dom.js';
import { Toast } from '../../utils/toast.js';
import { knowledgeProcessApi } from '../../api/knowledgeProcessApi.js';

function getKnowledgeIdsByCurrentCategory() {
  return AppState.knowledgeBase
    .filter(item => item.categoryId === AppState.currentKnowledgeCategoryId)
    .map(item => item.id);
}

export const KnowledgeProcessingPanel = {
  syncConfigFromInputs() {
    AppState.knowledgeProcessConfig.chunkSize = Number($('chunkSizeInput')?.value || 1000);
    AppState.knowledgeProcessConfig.chunkOverlap = Number($('chunkOverlapInput')?.value || 50);
    AppState.knowledgeProcessConfig.embeddingModel = $('embeddingModelInput')?.value || 'text-embedding-v1';
    AppState.knowledgeProcessConfig.vectorStore = $('vectorStoreInput')?.value || 'building_env_knowledge';
  },

  pushLog(message) {
    AppState.knowledgeProcessState.logs.unshift({
      time: new Date().toLocaleString(),
      message
    });

    if (AppState.knowledgeProcessState.logs.length > 20) {
      AppState.knowledgeProcessState.logs = AppState.knowledgeProcessState.logs.slice(0, 20);
    }
  },

  renderStatus() {
    const state = AppState.knowledgeProcessState;

    setText($('processStatusValue'), state.status || 'idle');
    setText($('processChunkCountValue'), String(state.chunkCount || 0));
    setText($('processVectorCountValue'), String(state.vectorizedCount || 0));
    setText($('processLastTimeValue'), state.lastProcessedAt || '暂无');

    const logBox = $('processLogBox');
    if (logBox) {
      if (!state.logs.length) {
        setHTML(logBox, `<div class="process-log-empty">暂无处理日志</div>`);
      } else {
        setHTML(
          logBox,
          state.logs.map(log => `
            <div class="process-log-item">
              <div class="process-log-time">${log.time}</div>
              <div class="process-log-message">${log.message}</div>
            </div>
          `).join('')
        );
      }
    }
  },

  async handleChunking() {
    this.syncConfigFromInputs();

    const knowledgeIds = getKnowledgeIdsByCurrentCategory();
    if (!knowledgeIds.length) {
      Toast.warning('当前类别下没有可处理的知识条目');
      return;
    }

    AppState.knowledgeProcessState.status = 'chunking';
    this.pushLog('开始执行文本解析与切分');
    this.renderStatus();

    try {
      const result = await knowledgeProcessApi.parseAndChunk({
        categoryId: AppState.currentKnowledgeCategoryId,
        knowledgeIds,
        chunkSize: AppState.knowledgeProcessConfig.chunkSize,
        chunkOverlap: AppState.knowledgeProcessConfig.chunkOverlap
      });

      AppState.knowledgeProcessState.status = result.status;
      AppState.knowledgeProcessState.chunkCount = result.chunkCount || 0;
      AppState.knowledgeProcessState.lastProcessedAt = new Date().toLocaleString();
      this.pushLog(result.message);

      this.renderStatus();
      Toast.success('文本解析与切分完成');
    } catch (err) {
      AppState.knowledgeProcessState.status = 'error';
      this.pushLog(`文本切分失败：${err.message}`);
      this.renderStatus();
      Toast.error(`文本切分失败：${err.message}`);
    }
  },

  async handleVectorize() {
    this.syncConfigFromInputs();

    const chunkCount = AppState.knowledgeProcessState.chunkCount || 0;
    if (!chunkCount) {
      Toast.warning('请先执行文本解析与切分');
      return;
    }

    AppState.knowledgeProcessState.status = 'vectorizing';
    this.pushLog('开始执行文本向量化与知识表示');
    this.renderStatus();

    try {
      const result = await knowledgeProcessApi.vectorize({
        categoryId: AppState.currentKnowledgeCategoryId,
        chunkCount,
        embeddingModel: AppState.knowledgeProcessConfig.embeddingModel,
        vectorStore: AppState.knowledgeProcessConfig.vectorStore
      });

      AppState.knowledgeProcessState.status = result.status;
      AppState.knowledgeProcessState.vectorizedCount = result.vectorizedCount || 0;
      AppState.knowledgeProcessState.lastProcessedAt = new Date().toLocaleString();
      this.pushLog(result.message);

      this.renderStatus();
      Toast.success('文本向量化完成');
    } catch (err) {
      AppState.knowledgeProcessState.status = 'error';
      this.pushLog(`文本向量化失败：${err.message}`);
      this.renderStatus();
      Toast.error(`文本向量化失败：${err.message}`);
    }
  },

  async handleProcessAll() {
    this.syncConfigFromInputs();

    const knowledgeIds = getKnowledgeIdsByCurrentCategory();
    if (!knowledgeIds.length) {
      Toast.warning('当前类别下没有可处理的知识条目');
      return;
    }

    AppState.knowledgeProcessState.status = 'chunking';
    this.pushLog('开始执行一键知识处理');
    this.renderStatus();

    try {
      const result = await knowledgeProcessApi.processAll({
        categoryId: AppState.currentKnowledgeCategoryId,
        knowledgeIds,
        chunkSize: AppState.knowledgeProcessConfig.chunkSize,
        chunkOverlap: AppState.knowledgeProcessConfig.chunkOverlap,
        embeddingModel: AppState.knowledgeProcessConfig.embeddingModel,
        vectorStore: AppState.knowledgeProcessConfig.vectorStore
      });

      AppState.knowledgeProcessState.status = result.status;
      AppState.knowledgeProcessState.chunkCount = result.chunkCount || 0;
      AppState.knowledgeProcessState.vectorizedCount = result.vectorizedCount || 0;
      AppState.knowledgeProcessState.lastProcessedAt = new Date().toLocaleString();
      this.pushLog(result.message);

      this.renderStatus();
      Toast.success('一键知识处理完成');
    } catch (err) {
      AppState.knowledgeProcessState.status = 'error';
      this.pushLog(`一键处理失败：${err.message}`);
      this.renderStatus();
      Toast.error(`一键处理失败：${err.message}`);
    }
  },

  bindEvents() {
    on($('chunkSizeInput'), 'input', () => this.syncConfigFromInputs());
    on($('chunkOverlapInput'), 'input', () => this.syncConfigFromInputs());
    on($('embeddingModelInput'), 'input', () => this.syncConfigFromInputs());
    on($('vectorStoreInput'), 'input', () => this.syncConfigFromInputs());

    on($('runChunkingBtn'), 'click', () => this.handleChunking());
    on($('runVectorizeBtn'), 'click', () => this.handleVectorize());
    on($('runAllProcessBtn'), 'click', () => this.handleProcessAll());
    on($('refreshProcessStatusBtn'), 'click', () => this.renderStatus());

    document.addEventListener('knowledge-category-changed', () => {
      this.renderStatus();
    });
  },

  init() {
    const chunkSizeInput = $('chunkSizeInput');
    const chunkOverlapInput = $('chunkOverlapInput');
    const embeddingModelInput = $('embeddingModelInput');
    const vectorStoreInput = $('vectorStoreInput');

    if (chunkSizeInput) chunkSizeInput.value = AppState.knowledgeProcessConfig.chunkSize;
    if (chunkOverlapInput) chunkOverlapInput.value = AppState.knowledgeProcessConfig.chunkOverlap;
    if (embeddingModelInput) embeddingModelInput.value = AppState.knowledgeProcessConfig.embeddingModel;
    if (vectorStoreInput) vectorStoreInput.value = AppState.knowledgeProcessConfig.vectorStore;

    this.bindEvents();
    this.renderStatus();
  }
};