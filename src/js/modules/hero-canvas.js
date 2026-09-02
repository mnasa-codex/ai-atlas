import { reduced } from '../lib/dom.js';

/** خلفية متدرّجة متحرّكة بـ 30fps، نصف الدقة، تتوقّف خارج الشاشة. */
export function initHeroCanvas(canvas) {
  if (!canvas || reduced()) return { destroy() {} };
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { destroy() {} };

  const SCALE = 0.5;
  const FPS = 30;
  const frameTime = 1000 / FPS;

  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let visible = true;

  const nodes = [
    { fx: 0.22, fy: 0.30, vx: 0.35, vy: 0.26, r: 0.46, color: [109, 92, 255, 0.5] },
    { fx: 0.78, fy: 0.38, vx: -0.28, vy: 0.31, r: 0.52, color: [0, 211, 242, 0.38] },
    { fx: 0.52, fy: 0.74, vx: 0.24, vy: -0.22, r: 0.42, color: [255, 77, 157, 0.32] }
  ];
  const pts = nodes.map((n) => ({ ...n, x: 0, y: 0, r0: 0 }));

  const resize = () => {
    w = canvas.width = Math.max(1, Math.round(canvas.offsetWidth * SCALE));
    h = canvas.height = Math.max(1, Math.round(canvas.offsetHeight * SCALE));
    pts.forEach((p) => {
      p.x = p.fx * w;
      p.y = p.fy * h;
      p.r0 = p.r * Math.max(w, h);
    });
  };

  const draw = (time) => {
    raf = requestAnimationFrame(draw);
    if (!visible) return;
    const delta = time - last;
    if (delta < frameTime) return;
    last = time - (delta % frameTime);

    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const [r, g, b, a] = p.color;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r0);
      grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(canvas);

  const onVisibility = () => { visible = !document.hidden; };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  resize();
  document.addEventListener('visibilitychange', onVisibility);
  raf = requestAnimationFrame(draw);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    }
  };
}
