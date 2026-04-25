// app/js/pages/projects/projectManager.js
import { AppState } from '../../state.js';
import { $, on, setHTML } from '../../utils/dom.js';
import { Storage } from '../../utils/storage.js';
import { Toast } from '../../utils/toast.js';
import { Modal } from '../../components/modal.js';

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const ProjectManager = {
  renderList(keyword = '') {
    const container = $('projectList');
    if (!container) return;

    const list = AppState.projects.filter((item) => {
      if (!keyword) return true;
      return (item.name || '').includes(keyword) || (item.description || '').includes(keyword);
    });

    if (!list.length) {
      setHTML(container, `<div class="data-list-empty"><p>暂无项目数据</p></div>`);
      return;
    }

    setHTML(
      container,
      list.map((item) => `
        <div class="project-card" data-id="${escapeHtml(item.id)}">
          <div class="project-card-main">
            <div class="project-card-title">${escapeHtml(item.name || '未命名项目')}</div>
            <div class="project-card-meta">
              创建时间：${escapeHtml(item.createdAt || '')}
            </div>
            <div class="project-card-desc">${escapeHtml(item.description || '无项目描述')}</div>
          </div>
          <div class="project-card-actions">
            <button class="btn btn-secondary btn-sm project-view-btn" data-id="${escapeHtml(item.id)}">查看</button>
            <button class="btn btn-secondary btn-sm project-download-btn" data-id="${escapeHtml(item.id)}">下载</button>
            <button class="btn btn-danger btn-sm project-delete-btn" data-id="${escapeHtml(item.id)}">删除</button>
          </div>
        </div>
      `).join('')
    );

    container.querySelectorAll('.project-view-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.viewProject(btn.dataset.id));
    });

    container.querySelectorAll('.project-download-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.downloadProject(btn.dataset.id));
    });

    container.querySelectorAll('.project-delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.deleteProject(btn.dataset.id));
    });
  },

  createProject() {
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
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      dataSummary: {
        knowledgeCount: AppState.knowledgeBase.length,
        sampleCount: AppState.sampleBase.length,
        historyCount: AppState.history.length
      }
    });

    Storage.saveProjects();
    this.renderList();
    Modal.close('newProjectModal');

    if ($('newProjectName')) $('newProjectName').value = '';
    if ($('newProjectDesc')) $('newProjectDesc').value = '';

    Toast.success('项目创建成功');
  },

  deleteProject(id) {
    const target = AppState.projects.find((item) => item.id === id);
    if (!target) {
      Toast.warning('未找到项目');
      return;
    }

    AppState.projects = AppState.projects.filter((item) => item.id !== id);
    Storage.saveProjects();
    this.renderList($('projectSearchInput')?.value?.trim() || '');

    Toast.success(`项目“${target.name}”已删除`);
  },

  downloadProject(id) {
    const project = AppState.projects.find((item) => item.id === id);
    if (!project) {
      Toast.warning('未找到项目');
      return;
    }

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('项目已导出');
  },

  viewProject(id) {
    const project = AppState.projects.find((item) => item.id === id);
    if (!project) {
      Toast.warning('未找到项目');
      return;
    }

    AppState.currentProjectId = id;
    Toast.info(`当前查看项目：${project.name}`);
  },

  bindEvents() {
    on($('newProjectBtn'), 'click', () => Modal.open('newProjectModal'));
    on($('confirmNewProject'), 'click', () => this.createProject());

    on($('projectSearchInput'), 'input', () => {
      const keyword = $('projectSearchInput')?.value?.trim() || '';
      this.renderList(keyword);
    });

    Modal.bindClose('newProjectModal', ['closeNewProjectModal', 'cancelNewProject']);
  },

  init() {
    this.bindEvents();
    this.renderList();
  }
};