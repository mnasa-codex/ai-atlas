import { $$, reduced } from '../lib/dom.js';

/** يضبط عرض أشرطة التقييم من data-value (يتجنّب style inline في HTML). */
export function initBars() {
  const bars = $$('[data-bar]');
  if (!bars.length) return { destroy() {} };

  const fill = (el) => {
    const value = Math.max(0, Math.min(100, Number(el.dataset.bar) || 0));
    el.querySelector('i').style.setProperty('--v', `${value}%`);
  };

  if (reduced() || !('IntersectionObserver' in window)) {
    bars.forEach(fill);
    return { destroy() {} };
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      fill(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  bars.forEach((el) => io.observe(el));
  return { destroy: () => io.disconnect() };
}
