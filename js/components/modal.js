// app/js/components/modal.js
import { $, on } from '../utils/dom.js';

export const Modal = {
  open(id) {
    const el = $(id);
    if (!el) return;
    el.style.display = 'flex';
    el.classList.add('is-open');
  },

  close(id) {
    const el = $(id);
    if (!el) return;
    el.style.display = 'none';
    el.classList.remove('is-open');
  },

  bindClose(modalId, closeBtnIds = []) {
    closeBtnIds.forEach((btnId) => {
      on($(btnId), 'click', () => this.close(modalId));
    });

    const modal = $(modalId);
    on(modal, 'click', (e) => {
      if (e.target === modal) {
        this.close(modalId);
      }
    });
  }
};