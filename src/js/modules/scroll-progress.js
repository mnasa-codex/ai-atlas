export function initScrollProgress(bar) {
  if (!bar) return { destroy() {} };
  let raf = 0;

  const compute = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    bar.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
    raf = 0;
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };

  compute();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  return {
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    }
  };
}

export function initToTop(btn) {
  if (!btn) return { destroy() {} };
  let raf = 0;
  const check = () => {
    btn.classList.toggle('is-visible', scrollY > innerHeight * 0.6);
    raf = 0;
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
  check();
  addEventListener('scroll', onScroll, { passive: true });
  return { destroy() { cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); } };
}
