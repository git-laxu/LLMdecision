import { AppState } from '../../state.js';
import { $, on, setHTML } from '../../utils/dom.js';
import { Storage } from '../../utils/storage.js';
import { Toast } from '../../utils/toast.js';

function uid(prefix = 'ID') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getCurrentCategory() {
  return (
    AppState.knowledgeCategories.find(c => c.id === AppState.currentKnowledgeCategoryId) ||
    AppState.knowledgeCategories[0]
  );
}

function getCurrentKnowledgeType() {
  return $('knowledgeTypeSelect')?.value || 'other';
}

function normalizeKnowledgeItem(item, index = 0, sourceType = 'json') {
  const currentCategory = getCurrentCategory();
  return {
    id: item.id || uid('K'),
    sourceType,
    knowledgeType: getCurrentKnowledgeType(),
    fileType: '',
    fileName: '',
    fileSize: 0,
    categoryId: currentCategory.id,
    categoryName: currentCategory.name,
    title: item.title || item.name || `知识条目 ${index + 1}`,
    content: item.content || '',
    priority: Number(item.priority ?? 1),
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function buildFileKnowledgeRecord(file, fileType) {
  const currentCategory = getCurrentCategory();
  return {
    id: uid('KF'),
    sourceType: 'file',
    knowledgeType: getCurrentKnowledgeType(),
    fileType,
    fileName: file.name,
    fileSize: file.size,
    categoryId: currentCategory.id,
    categoryName: currentCategory.name,
    title: file.name,
    content: `[${fileType.toUpperCase()} 文件导入] ${file.name}`,
    priority: 1,
    createdAt: new Date().toISOString()
  };
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const KnowledgeManager = {

  // openCategoryModal() {
  //   const modal = $('newKnowledgeCategoryModal');
  //   if (!modal) return;
  //   modal.style.display = 'flex';
  //   modal.classList.add('is-open');
  // },

  // closeCategoryModal() {
  //   const modal = $('newKnowledgeCategoryModal');
  //   if (!modal) return;
  //   modal.style.display = 'none';
  //   modal.classList.remove('is-open');
  // },
  ensureCategoryModalMounted() {
  const modal = $('newKnowledgeCategoryModal');
  if (!modal) return null;

  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  return modal;
},

openCategoryModal() {
  const modal = this.ensureCategoryModalMounted();
  if (!modal) return;

  modal.style.display = 'flex';
  modal.classList.add('is-open');

  const input = $('newKnowledgeCategoryName');
  if (input) {
    requestAnimationFrame(() => input.focus());
  }
},

closeCategoryModal() {
  const modal = $('newKnowledgeCategoryModal');
  if (!modal) return;

  modal.style.display = 'none';
  modal.classList.remove('is-open');
},

normalizeExistingKnowledge() {
  // const defaultCategory =
  //   AppState.knowledgeCategories.find(c => c.id === 'default') ||
  //   AppState.knowledgeCategories[0];
  const defaultCategory = AppState.knowledgeCategories[0] || {
  id: '',
  name: '未分类'
};

  AppState.knowledgeBase = AppState.knowledgeBase.map((item) => {
    let knowledgeType = item.knowledgeType;

    if (!knowledgeType) {
      if (item.sourceType === 'file') {
        if (item.fileType === 'pdf' || item.fileType === 'word') {
          knowledgeType = 'paper';
        } else if (item.fileType === 'json') {
          knowledgeType = 'structured';
        } else {
          knowledgeType = 'other';
        }
      } else if (item.sourceType === 'json' || item.sourceType === 'json-file') {
        knowledgeType = 'structured';
      } else {
        knowledgeType = 'other';
      }
    }

    return {
      sourceType: 'text',
      fileType: '',
      fileName: '',
      fileSize: 0,
      priority: 1,
      createdAt: new Date().toISOString(),
      ...item,
      categoryId: item.categoryId || defaultCategory.id,
      categoryName: item.categoryName || defaultCategory.name,
      knowledgeType
    };
  });
},

  renderCategoryOptions() {
  const select1 = $('knowledgeCategorySelect');
  const select2 = $('moveKnowledgeTargetCategory');

  const optionsHtml = AppState.knowledgeCategories.map(cat => `
    <option value="${cat.id}" ${cat.id === AppState.currentKnowledgeCategoryId ? 'selected' : ''}>
      ${escapeHtml(cat.name)}
    </option>
  `).join('') + `
    <option value="__create_new__">+ 新建类别</option>
  `;

  if (select1) setHTML(select1, optionsHtml);

  if (select2) {
  setHTML(
    select2,
    `
      <option value="">请选择目标类别</option>
      ${AppState.knowledgeCategories.map(cat => `
        <option value="${cat.id}">${escapeHtml(cat.name)}</option>
      `).join('')}
    `
  );
}
},

  isCategoryExpanded(categoryId) {
    return AppState.knowledgeGroupOpenState[categoryId] !== false;
  },

  toggleCategoryExpand(categoryId) {
    AppState.knowledgeGroupOpenState[categoryId] = !this.isCategoryExpanded(categoryId);
    this.renderGroupedList();
  },

  renderStats() {
    const el = $('knowledgeStats');
    if (!el) return;

    const total = AppState.knowledgeBase.length;
    const standardCount = AppState.knowledgeBase.filter(i => i.knowledgeType === 'standard').length;
    const paperCount = AppState.knowledgeBase.filter(i => i.knowledgeType === 'paper').length;
    const structuredCount = AppState.knowledgeBase.filter(i => i.knowledgeType === 'structured').length;

    setHTML(el, `
      <div class="knowledge-stat-card">
        <div class="knowledge-stat-value">${total}</div>
        <div class="knowledge-stat-label">全部条目</div>
      </div>
      <div class="knowledge-stat-card">
        <div class="knowledge-stat-value">${standardCount}</div>
        <div class="knowledge-stat-label">标准</div>
      </div>
      <div class="knowledge-stat-card">
        <div class="knowledge-stat-value">${paperCount}</div>
        <div class="knowledge-stat-label">论文</div>
      </div>
      <div class="knowledge-stat-card">
        <div class="knowledge-stat-value">${structuredCount}</div>
        <div class="knowledge-stat-label">结构化信息</div>
      </div>
    `);
  },

  renderGroupedList() {
  const el = $('knowledgeGroupedList');
  if (!el) return;

  if (!AppState.knowledgeBase.length) {
    setHTML(el, `<div class="data-list-empty"><p>暂无导入的知识数据</p></div>`);
    return;
  }

  const groups = AppState.knowledgeCategories.map(category => {
    const items = AppState.knowledgeBase.filter(i => {
      const itemCategoryId = i.categoryId || AppState.knowledgeCategories[0]?.id || '';
      return itemCategoryId === category.id;
    });

    const expanded = this.isCategoryExpanded(category.id);

    return `
      <div class="knowledge-group-card">
        <div class="knowledge-group-header">
          <div class="knowledge-group-header-left">
            <button
              type="button"
              class="knowledge-group-toggle ${expanded ? 'expanded' : 'collapsed'}"
              data-category-id="${category.id}"
              aria-label="切换展开折叠"
            >
              ${expanded ? '▾' : '▸'}
            </button>

            <div>
              <div class="knowledge-group-title">${escapeHtml(category.name)}</div>
              <div class="knowledge-group-meta">条目数：${items.length}</div>
            </div>
          </div>

          <button class="btn btn-danger btn-sm delete-category-btn" data-category-id="${category.id}">
            删除该类别
          </button>
        </div>

        <div class="knowledge-group-body ${expanded ? 'expanded' : 'collapsed'}">
          ${
            items.length === 0
              ? `<div class="data-list-empty"><p>该类别下暂无知识</p></div>`
              : `
                <div class="knowledge-group-scroll">
                  ${items.map(item => `
                    <div class="knowledge-item-card">
                      <div class="knowledge-item-select">
                        <input type="checkbox" class="knowledge-item-checkbox" data-id="${item.id}">
                      </div>
                      <div class="knowledge-item-main">
                        <div class="knowledge-item-title">${escapeHtml(item.title || item.fileName || '未命名条目')}</div>
                        <div class="knowledge-item-meta">
                          类型：${escapeHtml(item.knowledgeType || 'other')}
                          ${item.fileType ? `｜文件类型：${escapeHtml(item.fileType)}` : ''}
                          ${item.fileName ? `｜文件名：${escapeHtml(item.fileName)}` : ''}
                        </div>
                        <div class="knowledge-item-desc">${escapeHtml(item.content || '')}</div>
                      </div>
                      <div class="knowledge-item-actions">
                        <button class="btn btn-danger btn-sm delete-knowledge-item-btn" data-id="${item.id}">
                          删除
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `
          }
        </div>
      </div>
    `;
  }).join('');

  setHTML(el, groups);

  el.querySelectorAll('.delete-knowledge-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      this.deleteKnowledgeItem(btn.dataset.id);
    });
  });

  el.querySelectorAll('.delete-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      this.deleteCategory(btn.dataset.categoryId);
    });
  });

  el.querySelectorAll('.knowledge-group-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      this.toggleCategoryExpand(btn.dataset.categoryId);
    });
  });
},

  renderAll() {
    this.renderCategoryOptions();
    this.renderStats();
    this.renderGroupedList();
  },

  createCategory() {
  const name = $('newKnowledgeCategoryName')?.value?.trim();
  if (!name) {
    Toast.warning('请输入知识类别名称');
    return;
  }

  const exists = AppState.knowledgeCategories.some(c => c.name === name);
  if (exists) {
    Toast.warning('该知识类别已存在');
    return;
  }

  const category = {
    id: uid('CAT'),
    name,
    createdAt: new Date().toISOString()
  };

  AppState.knowledgeCategories.push(category);
  AppState.currentKnowledgeCategoryId = category.id;
  AppState.knowledgeGroupOpenState[category.id] = true;

  Storage.saveKnowledgeCategories();
  this.renderAll();

  if ($('newKnowledgeCategoryName')) $('newKnowledgeCategoryName').value = '';

  this.closeCategoryModal();

  Toast.success('知识类别创建成功');
},

  deleteCategory(categoryId) {
    // if (categoryId === 'default') {
    //   Toast.warning('默认分类不能删除');
    //   return;
    // }

    const category = AppState.knowledgeCategories.find(c => c.id === categoryId);
    if (!category) {
      Toast.warning('未找到该知识类别');
      return;
    }

    AppState.knowledgeBase = AppState.knowledgeBase.filter(item => item.categoryId !== categoryId);
    AppState.knowledgeCategories = AppState.knowledgeCategories.filter(c => c.id !== categoryId);
    delete AppState.knowledgeGroupOpenState[categoryId];

    if (AppState.currentKnowledgeCategoryId === categoryId) {
      AppState.currentKnowledgeCategoryId = 'default';
    }

    Storage.saveKnowledge();
    Storage.saveKnowledgeCategories();
    this.renderAll();

    Toast.success(`已删除类别“${category.name}”及其内部全部知识条目`);
  },

  deleteCurrentCategory() {
    this.deleteCategory(AppState.currentKnowledgeCategoryId);
  },

  deleteKnowledgeItem(id) {
    AppState.knowledgeBase = AppState.knowledgeBase.filter(item => item.id !== id);
    Storage.saveKnowledge();
    this.renderAll();
    Toast.success('知识条目已删除');
  },

  getSelectedKnowledgeIds() {
    return Array.from(document.querySelectorAll('.knowledge-item-checkbox:checked')).map(el => el.dataset.id);
  },

  moveSelectedKnowledge() {
    const ids = this.getSelectedKnowledgeIds();
    const targetCategoryId = $('moveKnowledgeTargetCategory')?.value;

if (!ids.length) {
  Toast.warning('请先勾选知识条目');
  return;
}

if (!targetCategoryId) {
  Toast.warning('请先选择目标类别');
  return;
}

const targetCategory = AppState.knowledgeCategories.find(c => c.id === targetCategoryId);
if (!targetCategory) {
  Toast.warning('目标类别不存在');
  return;
}

    AppState.knowledgeBase = AppState.knowledgeBase.map(item => {
      if (ids.includes(item.id)) {
        return {
          ...item,
          categoryId: targetCategory.id,
          categoryName: targetCategory.name
        };
      }
      return item;
    });

    Storage.saveKnowledge();
    this.renderAll();
    if ($('moveKnowledgeTargetCategory')) $('moveKnowledgeTargetCategory').value = '';
    Toast.success(`已将 ${ids.length} 个知识条目移动到“${targetCategory.name}”`);
  },

  deleteSelectedKnowledge() {
    const ids = this.getSelectedKnowledgeIds();
    if (!ids.length) {
      Toast.warning('请先勾选知识条目');
      return;
    }

    AppState.knowledgeBase = AppState.knowledgeBase.filter(item => !ids.includes(item.id));
    Storage.saveKnowledge();
    this.renderAll();
    Toast.success(`已删除 ${ids.length} 个知识条目`);
  },

  validateJson() {
    const text = $('jsonInputText')?.value?.trim();
    if (!text) {
      Toast.warning('请输入 JSON 数据');
      return false;
    }

    try {
      JSON.parse(text);
      Toast.success('JSON 格式正确');
      return true;
    } catch (err) {
      Toast.error(`JSON 格式错误：${err.message}`);
      return false;
    }
  },

  importJsonText() {
    const text = $('jsonInputText')?.value?.trim();
    if (!text) {
      Toast.warning('请输入 JSON 数据');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed.knowledge) ? parsed.knowledge : [parsed];
      const normalized = list.map((item, index) => normalizeKnowledgeItem(item, index, 'json'));

      AppState.knowledgeBase.push(...normalized);
      Storage.saveKnowledge();
      this.renderAll();
      Toast.success(`成功导入 ${normalized.length} 条知识`);
    } catch (err) {
      Toast.error(`导入失败：${err.message}`);
    }
  },

  importText() {
    const title = $('knowledgeTitle')?.value?.trim();
    const content = $('knowledgeContent')?.value?.trim();

    if (!title || !content) {
      Toast.warning('请填写知识标题和知识内容');
      return;
    }

    const currentCategory = getCurrentCategory();

    AppState.knowledgeBase.push({
      id: uid('K'),
      sourceType: 'text',
      knowledgeType: getCurrentKnowledgeType(),
      fileType: '',
      fileName: '',
      fileSize: 0,
      categoryId: currentCategory.id,
      categoryName: currentCategory.name,
      title,
      content,
      priority: 1,
      createdAt: new Date().toISOString()
    });

    Storage.saveKnowledge();
    this.renderAll();

    if ($('knowledgeTitle')) $('knowledgeTitle').value = '';
    if ($('knowledgeContent')) $('knowledgeContent').value = '';

    Toast.success('文本知识导入成功');
  },

  importPdfFiles() {
    const files = AppState.uploads.pdf || [];
    if (!files.length) {
      Toast.warning('请先选择 PDF 文件');
      return;
    }

    const records = files.map(file => buildFileKnowledgeRecord(file, 'pdf'));
    AppState.knowledgeBase.push(...records);
    AppState.importedFiles.pdf.push(...files);
    AppState.uploads.pdf = [];

    Storage.saveKnowledge();
    this.renderAll();
    Toast.success(`已导入 ${records.length} 个 PDF 文件记录`);

    const listEl = $('pdfPreviewList');
    if (listEl) listEl.innerHTML = '';
    const btn = $('importPdfBtn');
    if (btn) btn.disabled = true;
  },

  importWordFiles() {
    const files = AppState.uploads.word || [];
    if (!files.length) {
      Toast.warning('请先选择 Word 文件');
      return;
    }

    const records = files.map(file => buildFileKnowledgeRecord(file, 'word'));
    AppState.knowledgeBase.push(...records);
    AppState.importedFiles.word.push(...files);
    AppState.uploads.word = [];

    Storage.saveKnowledge();
    this.renderAll();
    Toast.success(`已导入 ${records.length} 个 Word 文件记录`);

    const listEl = $('wordPreviewList');
    if (listEl) listEl.innerHTML = '';
    const btn = $('importWordBtn');
    if (btn) btn.disabled = true;
  },

  importJsonFiles() {
    const files = AppState.uploads.json || [];
    if (!files.length) {
      Toast.warning('请先选择 JSON 文件');
      return;
    }

    let importedCount = 0;
    let pending = files.length;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          const list = Array.isArray(parsed.knowledge) ? parsed.knowledge : [parsed];
          const normalized = list.map((item, index) => normalizeKnowledgeItem(item, index, 'json-file'));

          AppState.knowledgeBase.push(
            buildFileKnowledgeRecord(file, 'json'),
            ...normalized
          );
          importedCount += normalized.length;
        } catch (err) {
          Toast.error(`JSON 文件 ${file.name} 解析失败：${err.message}`);
        } finally {
          pending -= 1;
          if (pending === 0) {
            AppState.importedFiles.json.push(...files);
            AppState.uploads.json = [];
            Storage.saveKnowledge();
            this.renderAll();

            const listEl = $('jsonFilePreviewList');
            if (listEl) listEl.innerHTML = '';
            const btn = $('importJsonFileBtn');
            if (btn) btn.disabled = true;

            Toast.success(`JSON 文件导入完成，共新增 ${importedCount} 条知识`);
          }
        }
      };
      reader.readAsText(file, 'utf-8');
    });
  },

  async exportKnowledge() {
    try {
      const zip = new JSZip();

      const exportData = {
        exportedAt: new Date().toISOString(),
        total: AppState.knowledgeBase.length,
        categories: AppState.knowledgeCategories,
        knowledge: AppState.knowledgeBase
      };

      zip.file('knowledge-base.json', JSON.stringify(exportData, null, 2));

      const addFilesToZip = (files, folderName) => {
        if (!Array.isArray(files) || files.length === 0) return;
        const folder = zip.folder(folderName);
        files.forEach((file) => {
          folder.file(file.name, file);
        });
      };

      addFilesToZip(AppState.importedFiles.pdf, 'pdf-files');
      addFilesToZip(AppState.importedFiles.word, 'word-files');
      addFilesToZip(AppState.importedFiles.json, 'json-files');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-base-${Date.now()}.zip`;
      a.click();

      URL.revokeObjectURL(url);
      Toast.success('知识库压缩包已导出');
    } catch (err) {
      Toast.error(`知识库导出失败：${err.message}`);
    }
  },

  bindEvents() {
  on($('knowledgeCategorySelect'), 'change', (e) => {
  const value = e.target.value;

  if (value === '__create_new__') {
    this.openCategoryModal();
    this.renderCategoryOptions();
    return;
  }

  AppState.currentKnowledgeCategoryId = value;
  this.renderCategoryOptions();

  document.dispatchEvent(new CustomEvent('knowledge-category-changed'));
});

  on($('confirmKnowledgeCategoryBtn'), 'click', () => this.createCategory());

//   on($('closeKnowledgeCategoryModal'), 'click', () => {
//   const modal = $('newKnowledgeCategoryModal');
//   if (modal) {
//     modal.style.display = 'none';
//     modal.classList.remove('is-open');
//   }
// });

// on($('cancelKnowledgeCategoryBtn'), 'click', () => {
//   const modal = $('newKnowledgeCategoryModal');
//   if (modal) {
//     modal.style.display = 'none';
//     modal.classList.remove('is-open');
//   }
// });
  on($('closeKnowledgeCategoryModal'), 'click', () => this.closeCategoryModal());
  on($('cancelKnowledgeCategoryBtn'), 'click', () => this.closeCategoryModal());

  on($('deleteKnowledgeCategoryBtn'), 'click', () => this.deleteCurrentCategory());

  on($('moveSelectedKnowledgeBtn'), 'click', () => this.moveSelectedKnowledge());
  on($('deleteSelectedKnowledgeBtn'), 'click', () => this.deleteSelectedKnowledge());

  on($('validateJsonBtn'), 'click', () => this.validateJson());
  on($('importJsonBtn'), 'click', () => this.importJsonText());

  on($('clearTextBtn'), 'click', () => {
    if ($('knowledgeTitle')) $('knowledgeTitle').value = '';
    if ($('knowledgeContent')) $('knowledgeContent').value = '';
    Toast.info('已清空文本输入');
  });

  on($('importTextBtn'), 'click', () => this.importText());
  on($('importPdfBtn'), 'click', () => this.importPdfFiles());
  on($('importWordBtn'), 'click', () => this.importWordFiles());
  on($('importJsonFileBtn'), 'click', () => this.importJsonFiles());
  on($('exportKnowledgeBtn'), 'click', () => this.exportKnowledge());
},

  init() {
  this.normalizeExistingKnowledge();
  Storage.saveKnowledge();

  this.renderAll();
  this.bindEvents();

  const modal = this.ensureCategoryModalMounted();
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeCategoryModal();
      }
    });
  }
}
};