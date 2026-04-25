// app/js/main.js
import { Storage } from './utils/storage.js';
import { Toast } from './utils/toast.js';
import { Header } from './layout/header.js';
import { Router } from './layout/router.js';
import { KnowledgePage } from './pages/knowledge/knowledgePage.js';
import { DataManagementPage } from './pages/projects/dataManagementPage.js';
import { StrategyPage } from './pages/strategy/strategyPage.js';

function bindBaseActions() {
  on($('validateJsonBtn'), 'click', () => {
    const text = $('jsonInputText')?.value?.trim();
    if (!text) {
      Toast.warning('请输入 JSON 数据');
      return;
    }

    try {
      JSON.parse(text);
      Toast.success('JSON 格式正确');
    } catch (err) {
      Toast.error(`JSON 格式错误：${err.message}`);
    }
  });

  on($('importJsonBtn'), 'click', () => {
    const text = $('jsonInputText')?.value?.trim();
    if (!text) {
      Toast.warning('请输入 JSON 数据');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed.knowledge) ? parsed.knowledge : [parsed];

      const normalized = list.map((item, index) => ({
        id: item.id || `K_${Date.now()}_${index}`,
        category: item.category || '未分类',
        title: item.title || item.name || `知识条目 ${index + 1}`,
        content: item.content || '',
        priority: Number(item.priority ?? 1),
        createdAt: new Date().toISOString()
      }));

      AppState.knowledgeBase.push(...normalized);
      Storage.saveKnowledge();
      renderKnowledgeList();
      Toast.success(`成功导入 ${normalized.length} 条知识`);
    } catch (err) {
      Toast.error(`导入失败：${err.message}`);
    }
  });

  on($('clearTextBtn'), 'click', () => {
    if ($('knowledgeTitle')) $('knowledgeTitle').value = '';
    if ($('knowledgeCategory')) $('knowledgeCategory').value = '';
    if ($('knowledgeContent')) $('knowledgeContent').value = '';
    Toast.info('已清空文本输入');
  });

  on($('importTextBtn'), 'click', () => {
    const title = $('knowledgeTitle')?.value?.trim();
    const category = $('knowledgeCategory')?.value?.trim();
    const content = $('knowledgeContent')?.value?.trim();

    if (!title || !content) {
      Toast.warning('请填写知识标题和知识内容');
      return;
    }

    AppState.knowledgeBase.push({
      id: `K_${Date.now()}`,
      title,
      category: category || '未分类',
      content,
      priority: 1,
      createdAt: new Date().toISOString()
    });

    Storage.saveKnowledge();
    renderKnowledgeList();

    $('knowledgeTitle').value = '';
    $('knowledgeCategory').value = '';
    $('knowledgeContent').value = '';

    Toast.success('文本知识导入成功');
  });

  on($('clearSampleDirectBtn'), 'click', () => {
    if ($('sampleSceneText')) $('sampleSceneText').value = '';
    if ($('sampleResponseText')) $('sampleResponseText').value = '';
    Toast.info('已清空样本文本');
  });

  on($('addSampleDirectBtn'), 'click', () => {
    const scene = $('sampleSceneText')?.value?.trim();
    const response = $('sampleResponseText')?.value?.trim();

    if (!scene || !response) {
      Toast.warning('请填写场景描述和响应文本');
      return;
    }

    AppState.sampleBase.push({
      id: `S_${Date.now()}`,
      mode: 'direct',
      sceneText: scene,
      responseText: response,
      createdAt: new Date().toISOString()
    });

    Storage.saveSamples();
    renderSampleList();

    $('sampleSceneText').value = '';
    $('sampleResponseText').value = '';

    Toast.success('样本添加成功');
  });

  on($('clearStructBtn'), 'click', () => {
    if ($('structSceneName')) $('structSceneName').value = '';
    Toast.info('已清空结构化样本输入');
  });

  on($('generateSampleBtn'), 'click', () => {
    const name = $('structSceneName')?.value?.trim();
    if (!name) {
      Toast.warning('请填写场景名称');
      return;
    }

    AppState.sampleBase.push({
      id: `S_${Date.now()}`,
      mode: 'structured',
      sceneName: name,
      createdAt: new Date().toISOString()
    });

    Storage.saveSamples();
    renderSampleList();
    $('structSceneName').value = '';
    Toast.success('结构化样本已生成');
  });

  on($('exportKnowledgeBtn'), 'click', () => {
    exportJsonFile('knowledge-base.json', AppState.knowledgeBase);
  });

  on($('exportSampleBtn'), 'click', () => {
    exportJsonFile('sample-base.json', AppState.sampleBase);
  });

  on($('newProjectBtn'), 'click', () => {
    const modal = $('newProjectModal');
    if (modal) modal.style.display = 'flex';
  });

  on($('closeNewProjectModal'), 'click', closeProjectModal);
  on($('cancelNewProject'), 'click', closeProjectModal);

  on($('confirmNewProject'), 'click', () => {
    const name = $('newProjectName')?.value?.trim();
    const desc = $('newProjectDesc')?.value?.trim();

    if (!name) {
      Toast.warning('请输入项目名称');
      return;
    }

    AppState.projects.push({
      id: `P_${Date.now()}`,
      name,
      description: desc || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    Storage.saveProjects();
    renderProjectList();
    closeProjectModal();

    $('newProjectName').value = '';
    $('newProjectDesc').value = '';

    Toast.success('项目创建成功');
  });

  on($('projectSearchInput'), 'input', () => {
    renderProjectList($('projectSearchInput')?.value?.trim() || '');
  });
}

function closeProjectModal() {
  const modal = $('newProjectModal');
  if (modal) modal.style.display = 'none';
}

function exportJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderKnowledgeList() {
  const el = $('knowledgeList');
  if (!el) return;

  if (!AppState.knowledgeBase.length) {
    el.innerHTML = `<div class="data-list-empty"><p>暂无导入的知识数据</p></div>`;
    return;
  }

  el.innerHTML = AppState.knowledgeBase.map((item) => `
    <div class="data-list-item">
      <div class="data-list-main">
        <div class="data-list-title">${item.title || item.id}</div>
        <div class="data-list-meta">${item.category || '未分类'} · 优先级 ${item.priority ?? 1}</div>
        <div class="data-list-desc">${item.content || ''}</div>
      </div>
    </div>
  `).join('');
}

function renderSampleList() {
  const el = $('sampleList');
  if (!el) return;

  if (!AppState.sampleBase.length) {
    el.innerHTML = `<div class="data-list-empty"><p>暂无样本数据</p></div>`;
    return;
  }

  el.innerHTML = AppState.sampleBase.map((item) => `
    <div class="data-list-item">
      <div class="data-list-main">
        <div class="data-list-title">${item.sceneName || '样本条目'}</div>
        <div class="data-list-meta">模式：${item.mode}</div>
        <div class="data-list-desc">${item.sceneText || item.responseText || ''}</div>
      </div>
    </div>
  `).join('');
}

function renderProjectList(keyword = '') {
  const el = $('projectList');
  if (!el) return;

  const list = AppState.projects.filter((item) => {
    if (!keyword) return true;
    return item.name.includes(keyword) || (item.description || '').includes(keyword);
  });

  if (!list.length) {
    el.innerHTML = `<div class="data-list-empty"><p>暂无项目数据</p></div>`;
    return;
  }

  el.innerHTML = list.map((item) => `
    <div class="data-list-item">
      <div class="data-list-main">
        <div class="data-list-title">${item.name}</div>
        <div class="data-list-meta">${new Date(item.createdAt).toLocaleString()}</div>
        <div class="data-list-desc">${item.description || '无项目描述'}</div>
      </div>
    </div>
  `).join('');
}

function restoreUI() {
  Router.switchModule(AppState.currentModule);
  Router.switchPageTab(AppState.currentTab);
  Router.switchSampleMode(AppState.currentSampleMode);
  Router.switchImportType('json-input');

  renderKnowledgeList();
  renderSampleList();
  renderProjectList();
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    Storage.loadAll();

    Header.init();
    Router.init();

    KnowledgePage.init();
    DataManagementPage.init();
    StrategyPage.init();

    Router.switchModule('knowledge');
    Router.switchPageTab('knowledge');
    Router.switchImportType('json-input');
    Router.switchSampleMode('direct');

    Toast.success('前端基础模块已初始化');
  } catch (err) {
    console.error('初始化失败:', err);
    Toast.error(`页面初始化失败：${err.message}`);
  }
});