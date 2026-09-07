"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function StarfieldBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      width = 0,
      height = 0,
      last = 0;
    let stars: { x: number; y: number; r: number; phase: number }[] = [];
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from(
        { length: Math.min(160, Math.floor(width / 8)) },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.2 + 0.3,
          phase: Math.random() * Math.PI * 2,
        }),
      );
    };
    const draw = (time = 0) => {
      if (time - last > 32 || !last) {
        last = time;
        ctx.clearRect(0, 0, width, height);
        stars.forEach((s) => {
          ctx.fillStyle = `rgba(207,220,255,${0.35 + 0.3 * Math.sin(time / 2500 + s.phase)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
          if (!paused && !media.matches) s.y = (s.y + 0.09) % height;
        });
      }
      if (!paused && !media.matches && !document.hidden)
        frame = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      last = 0;
      draw();
    };
    const onResize = () => {
      resize();
      restart();
    };
    resize();
    restart();
    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", restart);
    media.addEventListener("change", restart);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", restart);
      media.removeEventListener("change", restart);
    };
  }, [paused]);
  return (
    <>
      <div className="space-nebula" aria-hidden="true" />
      <canvas ref={ref} className="space-stars" aria-hidden="true" />
      <button
        className="motion-toggle"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
        aria-label={paused ? "تشغيل حركة النجوم" : "إيقاف حركة النجوم"}
        title={paused ? "تشغيل النجوم" : "إيقاف النجوم"}
      >
        {paused ? <Play size={15} /> : <Pause size={15} />}
      </button>
    </>
  );
}
