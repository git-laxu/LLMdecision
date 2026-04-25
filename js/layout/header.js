import { $all, on } from '../utils/dom.js';
import { Router } from './router.js';

export const Header = {
  init() {
    const moduleButtons = $all('.module-nav-btn');
    moduleButtons.forEach((btn) => {
      on(btn, 'click', () => {
        const moduleName = btn.dataset.module;
        Router.switchModule(moduleName);
      });
    });
  }
};