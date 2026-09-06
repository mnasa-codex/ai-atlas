'use client';

import { useEffect, useRef } from 'react';

export default function StarfieldBackground({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, previous = 0;
    let stars: { x: number; y: number; r: number; speed: number; alpha: number }[] = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(95, Math.floor(width * height / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height, r: .35 + Math.random() * .65,
        speed: 1 + Math.random() * 2, alpha: .12 + Math.random() * .3,
      }));
    };
    const paint = (delta: number) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#F5F5F7';
      for (const star of stars) {
        context.globalAlpha = star.alpha;
        context.beginPath(); context.arc(star.x, star.y, star.r, 0, Math.PI * 2); context.fill();
        star.y = (star.y + star.speed * delta) % Math.max(height, 1);
      }
      context.globalAlpha = 1;
    };
    const tick = (time: number) => {
      // Pause without leaving an idle requestAnimationFrame loop behind.
      if (!active || document.hidden || preference.matches) { frame = 0; return; }
      if (!previous || time - previous >= 32) {
        paint(previous ? Math.min((time - previous) / 1000, .1) : 0);
        previous = time;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      paint(0);
      if (active && !document.hidden && !preference.matches) frame = requestAnimationFrame(tick);
    };
    const handleResize = () => { resize(); sync(); };
    resize(); sync();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', sync);
      preference.removeEventListener('change', sync);
    };
  }, [active]);
  return <canvas ref={ref} className="atlas-star-canvas" aria-hidden="true" />;
}
