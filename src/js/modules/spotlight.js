import { $$, reduced } from '../lib/dom.js';

export function initSpotlight() {
  if (reduced() || !matchMedia('(hover: hover)').matches) return { destroy() {} };

  const els = $$('.spot');
  if (!els.length) return { destroy() {} };

  let raf = 0;
  let pending = null;

  const flush = () => {
    if (pending) {
      const { el, x, y } = pending;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      pending = null;
    }
    raf = 0;
  };

  const onMove = (event) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    pending = { el, x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (!raf) raf = requestAnimationFrame(flush);
  };

  els.forEach((el) => el.addEventListener('pointermove', onMove));
  return {
    destroy() {
      cancelAnimationFrame(raf);
      els.forEach((el) => el.removeEventListener('pointermove', onMove));
    }
  };
}
