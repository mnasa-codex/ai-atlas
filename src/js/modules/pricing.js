import { $, $$ } from '../lib/dom.js';
import { money } from '../lib/format.js';

export function initPricing(root = document) {
  const section = $('[data-pricing]', root);
  if (!section) return { destroy() {} };

  const buttons = $$('[data-cycle-btn]', section);
  const prices = $$('[data-price]', section);
  const notes = $$('[data-price-note]', section);

  const set = (cycle) => {
    section.dataset.cycle = cycle;

    buttons.forEach((btn) => {
      const on = btn.dataset.cycleBtn === cycle;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    prices.forEach((el) => {
      const raw = cycle === 'annual' ? el.dataset.annual : el.dataset.monthly;
      if (raw === undefined || raw === '') return;
      el.classList.remove('is-rolling');
      void el.offsetWidth;                                  // إعادة تشغيل الحركة
      el.textContent = money(Number(raw), el.dataset.currency || 'USD');
      el.classList.add('is-rolling');
    });

    notes.forEach((el) => {
      const text = cycle === 'annual' ? el.dataset.annualNote : el.dataset.monthlyNote;
      if (text !== undefined) el.textContent = text;
    });
  };

  buttons.forEach((btn) => btn.addEventListener('click', () => set(btn.dataset.cycleBtn)));
  set(section.dataset.cycle || 'monthly');

  return { destroy() {} };
}
