// app/js/components/tabs.js
import { $all, on } from '../utils/dom.js';

export const Tabs = {
  bind({
    tabSelector,
    panelSelector,
    activeClass = 'active',
    dataKey,
    panelIdGetter
  }) {
    const tabs = $all(tabSelector);
    const panels = $all(panelSelector);

    tabs.forEach((tab) => {
      on(tab, 'click', () => {
        const value = tab.dataset[dataKey];

        tabs.forEach((t) => t.classList.toggle(activeClass, t === tab));

        panels.forEach((panel) => {
          panel.classList.toggle(activeClass, panel.id === panelIdGetter(value));
        });
      });
    });
  }
};