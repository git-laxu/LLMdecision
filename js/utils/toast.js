import { $ } from './dom.js';

function buildToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-inner">
      <span class="toast-message">${message}</span>
    </div>
  `;
  return toast;
}

export const Toast = {
  show(message, type = 'info', duration = 2200) {
    const container = $('toastContainer');
    if (!container) {
      console.warn(`[${type}] ${message}`);
      return;
    }

    const toast = buildToast(message, type);
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error', 2800);
  },

  warning(message) {
    this.show(message, 'warning', 2600);
  },

  info(message) {
    this.show(message, 'info');
  }
};