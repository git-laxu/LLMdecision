import { AppState } from '../state.js';
import { $, $all, on } from '../utils/dom.js';

function moduleIdFromName(name) {
  if (!name) return '';
  return `module${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

function importPanelIdFromType(type) {
  const map = {
    'json-input': 'jsonInputPanel',
    'text-input': 'textInputPanel',
    'pdf-file': 'pdfFilePanel',
    'word-file': 'wordFilePanel',
    'json-file': 'jsonFilePanel'
  };
  return map[type] || '';
}

function samplePanelIdFromMode(mode) {
  const map = {
    direct: 'sampleDirectPanel',
    structured: 'sampleStructuredPanel'
  };
  return map[mode] || '';
}

export const Router = {
  init() {
    $all('.page-tab').forEach((tab) => {
      on(tab, 'click', () => {
        this.switchPageTab(tab.dataset.tab);
      });
    });

    $all('.import-type-btn').forEach((btn) => {
      on(btn, 'click', () => {
        this.switchImportType(btn.dataset.importType);
      });
    });

    $all('.sample-mode-btn').forEach((btn) => {
      on(btn, 'click', () => {
        this.switchSampleMode(btn.dataset.sampleMode);
      });
    });
  },

  switchModule(moduleName) {
    if (!moduleName) return;
    AppState.currentModule = moduleName;

    $all('.module-nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.module === moduleName);
    });

    const targetId = moduleIdFromName(moduleName);
    $all('.module-page').forEach((page) => {
      page.classList.toggle('active', page.id === targetId);
    });
  },

  switchPageTab(tabName) {
    if (!tabName) return;
    AppState.currentTab = tabName;

    $all('.page-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    $all('.tab-content').forEach((content) => {
      content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
  },

  switchImportType(type) {
    if (!type) return;

    $all('.import-type-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.importType === type);
    });

    const targetId = importPanelIdFromType(type);
    $all('.import-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === targetId);
    });
  },

  switchSampleMode(mode) {
    if (!mode) return;
    AppState.currentSampleMode = mode;

    $all('.sample-mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.sampleMode === mode);
    });

    const targetId = samplePanelIdFromMode(mode);
    $all('.sample-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === targetId);
    });
  }
};