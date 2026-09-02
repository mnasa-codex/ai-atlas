/* يُحمَّل في <head> بشكل متزامن لمنع وميض الثيم قبل الرسم. */
try {
  const saved = localStorage.getItem('atlas-theme');
  const theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = theme;
} catch { /* التخزين معطّل — يبقى الغامق الافتراضي */ }
