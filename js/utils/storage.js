// app/js/utils/storage.js
import { AppState } from '../state.js';

const STORAGE_KEYS = {
  knowledge: 'becs_knowledge_base',
  knowledgeCategories: 'becs_knowledge_categories',
  sample: 'becs_sample_base',
  projects: 'becs_projects',
  history: 'becs_history'
};

function safeParse(text, fallback) {
  if (text === null || text === undefined || text === '') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export const Storage = {
  loadAll() {
    AppState.knowledgeBase = ensureArray(
      safeParse(localStorage.getItem(STORAGE_KEYS.knowledge), [])
    );

    AppState.knowledgeCategories = ensureArray(
      safeParse(localStorage.getItem(STORAGE_KEYS.knowledgeCategories), [])
    );

    if (!AppState.knowledgeCategories.length) {
  AppState.knowledgeCategories = [];
}

if (
  !AppState.currentKnowledgeCategoryId ||
  !AppState.knowledgeCategories.find(c => c.id === AppState.currentKnowledgeCategoryId)
) {
  AppState.currentKnowledgeCategoryId = AppState.knowledgeCategories[0]?.id || '';
}

    AppState.sampleBase = ensureArray(
      safeParse(localStorage.getItem(STORAGE_KEYS.sample), [])
    );

    AppState.projects = ensureArray(
      safeParse(localStorage.getItem(STORAGE_KEYS.projects), [])
    );

    AppState.history = ensureArray(
      safeParse(localStorage.getItem(STORAGE_KEYS.history), [])
    );
  },

  saveKnowledge() {
    localStorage.setItem(STORAGE_KEYS.knowledge, JSON.stringify(AppState.knowledgeBase ?? []));
  },

  saveKnowledgeCategories() {
    localStorage.setItem(
      STORAGE_KEYS.knowledgeCategories,
      JSON.stringify(AppState.knowledgeCategories ?? [])
    );
  },

  saveSamples() {
    localStorage.setItem(STORAGE_KEYS.sample, JSON.stringify(AppState.sampleBase ?? []));
  },

  saveProjects() {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(AppState.projects ?? []));
  },

  saveHistory() {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(AppState.history ?? []));
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    AppState.knowledgeBase = [];
    AppState.knowledgeCategories = [
      { id: 'default', name: '默认分类', createdAt: new Date().toISOString() }
    ];
    AppState.sampleBase = [];
    AppState.projects = [];
    AppState.history = [];
  }
};