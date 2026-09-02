import { $$, reduced } from '../lib/dom.js';

export function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return { destroy() {} };

  if (reduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return { destroy() {} };
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const group = entry.target.parentElement
        ? Array.from(entry.target.parentElement.children).indexOf(entry.target)
        : 0;
      entry.target.style.setProperty('--d', `${Math.min(group, 5) * 70}ms`);
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

  items.forEach((el) => io.observe(el));
  return { destroy: () => io.disconnect() };
}
