import { $ } from '../lib/dom.js';
import { reduced } from '../lib/dom.js';

const KEY = 'atlas-scroll-ratio';

export function initLangSwitch() {
  const link = $('.lang-flip');

  // استعادة موضع القراءة بعد تبديل اللغة (طول النص يختلف بين اللغتين)
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved) {
      sessionStorage.removeItem(KEY);
      const ratio = Number(saved);
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (max > 0 && ratio > 0) scrollTo({ top: max * ratio, behavior: 'auto' });
      });
    }
  } catch {}

  if (!link) return { destroy() {} };

  link.addEventListener('click', (event) => {
    try {
      const max = document.documentElement.scrollHeight - innerHeight;
      sessionStorage.setItem(KEY, String(max > 0 ? scrollY / max : 0));
      localStorage.setItem('atlas-lang', link.dataset.lang || '');
    } catch {}

    if (reduced()) return;                       // انتقال فوري بلا حركة

    event.preventDefault();
    link.classList.add('is-flipping');
    const go = () => { location.assign(link.href); };

    if (document.startViewTransition) {
      setTimeout(() => document.startViewTransition(go), 170);
    } else {
      document.body.style.transition = 'opacity .18s';
      document.body.style.opacity = '0';
      setTimeout(go, 180);
    }
  });

  return { destroy() {} };
}
