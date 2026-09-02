/* أيقونات SVG مضمّنة — بديل مكتبة lucide، stroke 1.5، بلا تبعيات. */
const S = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

const paths = {
  bolt: '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  dot: '<circle cx="12" cy="12" r="3.5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z"/>',
  whatsapp: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.3-.8-1 .8c-1-.5-2-1.5-2.5-2.5l.8-1L10.7 9c-.5 0-1 .4-1 1"/>',
  facebook: '<path d="M14.5 8.5h2.5V5.5h-2.5c-2 0-3.5 1.5-3.5 3.5v2H9v3h2v6.5h3V14h2.3l.7-3H14v-1.5c0-.6.4-1 .5-1Z"/>',
  alert: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17.5v.5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/>',
  sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-1.6 1-2.2 2.5-2.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="10.5" r="1"/>',
  crop: '<path d="M6 3v13a2 2 0 0 0 2 2h13M18 21V8a2 2 0 0 0-2-2H3"/>',
  infinity: '<path d="M7 9c-2 0-3.5 1.3-3.5 3S5 15 7 15c2.5 0 3.5-2.5 5-2.5S15 15 17 15c2 0 3.5-1.3 3.5-3S19 9 17 9c-2.5 0-3.5 2.5-5 2.5S9.5 9 7 9Z"/>',
  brush: '<path d="M15 3l6 6-8 8-6-6 8-8Z"/><path d="M7 11l-2 6 6-2"/>',
  layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M3 13l9 5 9-5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.5 2"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5.5A1.5 1.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A1.5 1.5 0 0 0 5.5 15"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.5M3.5 12h.5M3.5 18h.5"/>'
};

export function icon(name, extraClass = '') {
  const body = paths[name] || paths.dot;
  const cls = ['i', `i-${name}`, extraClass].filter(Boolean).join(' ');
  return `<svg class="${cls}" viewBox="0 0 24 24" ${S} aria-hidden="true" focusable="false">${body}</svg>`;
}

export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(paths, name);
