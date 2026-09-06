'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useExperience } from './Experience';

const Starfield = dynamic(() => import('./StarfieldBackground'), { ssr: false, loading: () => null });

export default function SiteAtmosphere() {
  const { motionAllowed, pageVisible } = useExperience();
  const [ready, setReady] = useState(false);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motionAllowed || !pageVisible || ready) return;
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, [motionAllowed, pageVisible, ready]);

  useEffect(() => {
    if (!motionAllowed || !pageVisible) return;
    const element = glow.current;
    if (!element) return;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let x = 0, y = 0;
    const clear = () => { element.style.opacity = '0'; };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType === 'touch') return;
      x = event.clientX; y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        element.style.transform = `translate3d(${x - 220}px, ${y - 220}px, 0)`;
        element.style.opacity = '1';
        frame = 0;
      });
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', clear);
    window.addEventListener('blur', clear);
    pointer.addEventListener('change', clear);
    return () => {
      cancelAnimationFrame(frame);
      clear();
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', clear);
      window.removeEventListener('blur', clear);
      pointer.removeEventListener('change', clear);
    };
  }, [motionAllowed, pageVisible]);

  return <div className="atlas-atmosphere" aria-hidden="true">
    <div className="atlas-static-stars" />
    {ready && motionAllowed && <Starfield active={pageVisible} />}
    <div className="atlas-pointer-glow" ref={glow} />
  </div>;
}
