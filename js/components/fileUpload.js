// app/js/components/fileUpload.js
import { $, on, setHTML } from '../utils/dom.js';
import { AppState } from '../state.js';
import { Toast } from '../utils/toast.js';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function getStore(type) {
  if (!Array.isArray(AppState.uploads[type])) {
    AppState.uploads[type] = [];
  }
  return AppState.uploads[type];
}

function renderPreviewList(type, listId, importBtnId) {
  const listEl = $(listId);
  const importBtn = $(importBtnId);
  const files = getStore(type);

  if (!listEl) return;

  if (files.length === 0) {
    setHTML(listEl, '');
    if (importBtn) importBtn.disabled = true;
    return;
  }

  setHTML(
    listEl,
    files.map((file, index) => `
      <div class="file-preview-item" data-type="${type}" data-index="${index}">
        <div class="file-preview-main">
          <div class="file-preview-name">${file.name}</div>
          <div class="file-preview-meta">${formatFileSize(file.size)}</div>
        </div>
        <div class="file-preview-actions">
          <button type="button" class="btn btn-sm btn-icon file-remove-btn" data-type="${type}" data-index="${index}">
            删除
          </button>
        </div>
      </div>
    `).join('')
  );

  if (importBtn) importBtn.disabled = false;

  listEl.querySelectorAll('.file-remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const targetType = btn.dataset.type;
      const targetIndex = Number(btn.dataset.index);
      const arr = getStore(targetType);
      arr.splice(targetIndex, 1);

      renderPreviewList(targetType, listId, importBtnId);
      Toast.info('文件已移除');
    });
  });
}

function appendFiles(type, fileList, acceptExt, listId, importBtnId) {
  const store = getStore(type);
  const files = Array.from(fileList || []);

  if (files.length === 0) return;

  const accepted = [];
  const rejected = [];

  files.forEach((file) => {
    const lower = file.name.toLowerCase();
    const valid = acceptExt.some((ext) => lower.endsWith(ext));
    if (valid) {
      store.push(file);
      accepted.push(file.name);
    } else {
      rejected.push(file.name);
    }
  });

  renderPreviewList(type, listId, importBtnId);

  if (accepted.length) {
    Toast.success(`已加入 ${accepted.length} 个文件`);
  }
  if (rejected.length) {
    Toast.warning(`以下文件格式不支持：${rejected.join('，')}`);
  }
}

function bindUploadArea({
  type,
  zoneId,
  inputId,
  listId,
  importBtnId,
  acceptExt = []
}) {
  const zone = $(zoneId);
  const input = $(inputId);

  if (!zone || !input) return;

  on(zone, 'click', (e) => {
    const removeBtn = e.target.closest('.file-remove-btn');
    const previewItem = e.target.closest('.file-preview-item');

    if (removeBtn) return;
    if (previewItem) return;

    input.click();
  });

  on(zone, 'dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  on(zone, 'dragleave', () => {
    zone.classList.remove('dragover');
  });

  on(zone, 'drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    appendFiles(type, e.dataTransfer.files, acceptExt, listId, importBtnId);
  });

  on(input, 'change', (e) => {
    appendFiles(type, e.target.files, acceptExt, listId, importBtnId);
    input.value = '';
  });

  renderPreviewList(type, listId, importBtnId);
}

export const FileUpload = {
  initKnowledgeUploads() {
    bindUploadArea({
      type: 'pdf',
      zoneId: 'pdfUploadZone',
      inputId: 'pdfFileInput',
      listId: 'pdfPreviewList',
      importBtnId: 'importPdfBtn',
      acceptExt: ['.pdf']
    });

    bindUploadArea({
      type: 'word',
      zoneId: 'wordUploadZone',
      inputId: 'wordFileInput',
      listId: 'wordPreviewList',
      importBtnId: 'importWordBtn',
      acceptExt: ['.doc', '.docx']
    });

    bindUploadArea({
      type: 'json',
      zoneId: 'jsonUploadZone',
      inputId: 'jsonFileInput',
      listId: 'jsonFilePreviewList',
      importBtnId: 'importJsonFileBtn',
      acceptExt: ['.json']
    });
  }
};