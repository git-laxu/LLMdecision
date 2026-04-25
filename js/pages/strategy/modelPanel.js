// app/js/pages/strategy/modelPanel.js
import { AppState } from '../../state.js';
import { $, on } from '../../utils/dom.js';

export const ModelPanel = {
  syncState() {
    AppState.modelConfig.apiKey = $('modelApiKey')?.value?.trim() || '';
    AppState.modelConfig.modelId = $('modelId')?.value?.trim() || 'qwen-plus';
    AppState.modelConfig.temperature = Number($('modelTemperature')?.value || 0.7);
    AppState.modelConfig.topP = Number($('modelTopP')?.value || 0.9);
    AppState.modelConfig.maxTokens = Number($('modelMaxTokens')?.value || 2000);
  },

  bindEvents() {
    ['modelApiKey', 'modelId', 'modelTemperature', 'modelTopP', 'modelMaxTokens'].forEach((id) => {
      on($(id), 'input', () => this.syncState());
      on($(id), 'change', () => this.syncState());
    });
  },

  init() {
    this.bindEvents();
    this.syncState();
  }
};