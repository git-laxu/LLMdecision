// app/js/pages/knowledge/sampleManager.js
import { AppState } from '../../state.js';
import { $, on } from '../../utils/dom.js';
import { Toast } from '../../utils/toast.js';
import { Storage } from '../../utils/storage.js';
import { DataList } from '../../components/dataList.js';

export const SampleManager = {
  renderList() {
    DataList.renderSamples($('sampleList'), AppState.sampleBase);
  },

  addDirectSample() {
    const scene = $('sampleSceneText')?.value?.trim();
    const response = $('sampleResponseText')?.value?.trim();

    if (!scene || !response) {
      Toast.warning('请填写场景描述和响应文本');
      return;
    }

    AppState.sampleBase.push({
      id: `S_${Date.now()}`,
      mode: 'direct',
      sceneName: '直接输入样本',
      sceneText: scene,
      responseText: response,
      createdAt: new Date().toISOString()
    });

    Storage.saveSamples();
    this.renderList();

    $('sampleSceneText').value = '';
    $('sampleResponseText').value = '';

    Toast.success('样本添加成功');
  },

  clearDirectSample() {
    if ($('sampleSceneText')) $('sampleSceneText').value = '';
    if ($('sampleResponseText')) $('sampleResponseText').value = '';
    Toast.info('已清空样本文本');
  },

  generateStructuredSample() {
    const name = $('structSceneName')?.value?.trim();

    if (!name) {
      Toast.warning('请填写场景名称');
      return;
    }

    AppState.sampleBase.push({
      id: `S_${Date.now()}`,
      mode: 'structured',
      sceneName: name,
      sceneText: '',
      responseText: '',
      createdAt: new Date().toISOString()
    });

    Storage.saveSamples();
    this.renderList();

    $('structSceneName').value = '';
    Toast.success('结构化样本已生成');
  },

  clearStructuredSample() {
    if ($('structSceneName')) $('structSceneName').value = '';
    Toast.info('已清空结构化输入');
  },

  exportSamples() {
    const blob = new Blob([JSON.stringify(AppState.sampleBase, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-base.json';
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('样本库已导出');
  },

  bindEvents() {
    on($('clearSampleDirectBtn'), 'click', () => this.clearDirectSample());
    on($('addSampleDirectBtn'), 'click', () => this.addDirectSample());
    on($('clearStructBtn'), 'click', () => this.clearStructuredSample());
    on($('generateSampleBtn'), 'click', () => this.generateStructuredSample());
    on($('exportSampleBtn'), 'click', () => this.exportSamples());
  },

  init() {
    this.bindEvents();
    this.renderList();
  }
};