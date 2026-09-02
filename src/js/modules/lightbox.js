import { $, $$ } from '../lib/dom.js';

export function initLightbox(root = document) {
  const dialog = $('#lightbox');
  const triggers = $$('[data-lightbox]', root);
  if (!dialog || !triggers.length || !dialog.showModal) return { destroy() {} };

  const img = $('img', dialog);
  const caption = $('figcaption', dialog);

  const open = (btn) => {
    img.src = btn.dataset.lightbox;
    img.alt = btn.dataset.alt || '';
    caption.textContent = btn.dataset.caption || '';
    dialog.showModal();
  };

  triggers.forEach((btn) => btn.addEventListener('click', () => open(btn)));
  $('.lightbox-close', dialog)?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();   // النقر على الخلفية يغلق
  });

  return { destroy() {} };
}
