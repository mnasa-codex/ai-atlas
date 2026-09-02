import { $, $$ } from '../lib/dom.js';

export function initCatalog() {
  const grid = $('[data-tool-grid]');
  if (!grid) return { destroy() {} };

  const cards = $$('.tool-card', grid);
  const input = $('[data-search]');
  const chips = $$('[data-filter]');
  const count = $('[data-count]');
  const empty = $('[data-empty]');
  const reset = $('[data-reset]');
  const template = count?.dataset.template || '{n}';

  const state = { query: '', price: 'all' };

  const apply = () => {
    const query = state.query.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const matchQuery = !query || card.dataset.search.includes(query);
      const matchPrice = state.price === 'all' || card.dataset.price.includes(state.price);
      const show = matchQuery && matchPrice;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (count) count.textContent = template.replace('{n}', String(visible));
    empty?.classList.toggle('is-visible', visible === 0);

    const url = new URL(location.href);
    state.query ? url.searchParams.set('q', state.query) : url.searchParams.delete('q');
    state.price !== 'all' ? url.searchParams.set('price', state.price) : url.searchParams.delete('price');
    history.replaceState(null, '', url);
  };

  const setChips = () => {
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === state.price)));
  };

  let timer = 0;
  input?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.query = input.value; apply(); }, 140);
  });

  chips.forEach((chip) => chip.addEventListener('click', () => {
    state.price = chip.dataset.filter;
    setChips();
    apply();
  }));

  reset?.addEventListener('click', () => {
    state.query = '';
    state.price = 'all';
    if (input) input.value = '';
    setChips();
    apply();
    input?.focus();
  });

  // استعادة الحالة من الرابط (روابط قابلة للمشاركة)
  const params = new URLSearchParams(location.search);
  state.query = params.get('q') || '';
  state.price = params.get('price') || 'all';
  if (input) input.value = state.query;
  setChips();
  apply();

  return { destroy() { clearTimeout(timer); } };
}
