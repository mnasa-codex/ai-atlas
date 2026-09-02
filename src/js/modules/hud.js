import { $ } from '../lib/dom.js';
import { dirSign } from '../lib/rtl.js';

export function initHud() {
  const hud = $('.hud');
  if (!hud) return { destroy() {} };
  let raf = 0;
  const apply = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, scrollY / max);
    hud.style.transform = `translateX(${(progress * 6 * dirSign()).toFixed(2)}px)`;
    raf = 0;
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
  apply(); addEventListener('scroll', onScroll, { passive: true });
  return { destroy() { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); } };
}
