import { $, $$, toast } from '../lib/dom.js';

export function initFab() {
  const fab = $('.fab');
  if (!fab) return { destroy() {} };

  const trigger = $('.fab-trigger', fab);
  const panel = $('.fab-panel', fab);
  panel.hidden = false;

  const setOpen = (open) => {
    fab.dataset.open = String(open);
    trigger.setAttribute('aria-expanded', String(open));
    if (open) $('a', panel)?.focus();
  };

  trigger.addEventListener('click', () => setOpen(fab.dataset.open !== 'true'));

  const onKey = (event) => {
    if (event.key === 'Escape' && fab.dataset.open === 'true') {
      setOpen(false);
      trigger.focus();
    }
  };
  const onOutside = (event) => {
    if (fab.dataset.open === 'true' && !fab.contains(event.target)) setOpen(false);
  };

  document.addEventListener('keydown', onKey);
  document.addEventListener('pointerdown', onOutside);

  // نبضة واحدة عند أول زيارة فقط
  try {
    if (!localStorage.getItem('atlas-fab-seen')) {
      fab.classList.add('is-first');
      localStorage.setItem('atlas-fab-seen', '1');
    }
  } catch {}

  // زر نسخ الرقم (الفوتر وصفحة التواصل)
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = value;
        document.body.append(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      toast(btn.dataset.copiedMsg || 'OK');
    });
  });

  return {
    destroy() {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside);
    }
  };
}
