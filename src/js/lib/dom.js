export const $ = (sel, parent = document) => parent.querySelector(sel);
export const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function toast(message) {
  let host = $('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;            // نص فقط — لا innerHTML
  host.append(el);
  setTimeout(() => el.remove(), 3200);
}
