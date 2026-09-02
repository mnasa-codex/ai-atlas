export function initTheme(btn) {
  if (!btn) return;
  const root = document.documentElement;

  const apply = (theme) => {
    root.dataset.theme = theme;
    btn.setAttribute('aria-pressed', String(theme === 'light'));
    try { localStorage.setItem('atlas-theme', theme); } catch {}
  };

  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => apply(next));
    } else {
      apply(next);
    }
  });
}
