import { $$ } from '../lib/dom.js';

export function initScrollSpy(nav) {
  if (!nav || !('IntersectionObserver' in window)) return { destroy() {} };

  const links = $$('a[href^="#"]', nav);
  const map = new Map();
  links.forEach((link) => {
    const section = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (section) map.set(section, link);
  });
  if (!map.size) return { destroy() {} };

  const setActive = (link) => {
    links.forEach((l) => {
      const on = l === link;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    // يُبقي العنصر الفعّال مرئياً داخل الشريط الأفقي
    link?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (visible) setActive(map.get(visible.target));
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  map.forEach((_, section) => io.observe(section));
  return { destroy: () => io.disconnect() };
}
