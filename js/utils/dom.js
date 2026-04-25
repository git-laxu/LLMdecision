export function $(id) {
  return document.getElementById(id);
}

export function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function on(el, event, handler, options) {
  if (!el) return;
  el.addEventListener(event, handler, options);
}

export function show(el) {
  if (!el) return;
  el.style.display = '';
}

export function hide(el) {
  if (!el) return;
  el.style.display = 'none';
}

export function setText(el, text = '') {
  if (!el) return;
  el.textContent = text;
}

export function setHTML(el, html = '') {
  if (!el) return;
  el.innerHTML = html;
}

export function toggleClass(el, className, active) {
  if (!el) return;
  el.classList.toggle(className, active);
}

export function activateByDataAttr(selector, dataKey, value) {
  $all(selector).forEach((el) => {
    el.classList.toggle('active', el.dataset[dataKey] === value);
  });
}