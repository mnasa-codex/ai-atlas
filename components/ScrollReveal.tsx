'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useExperience } from './Experience';

export default function ScrollReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const { motionAllowed, pageVisible } = useExperience();
  useEffect(() => {
    const element = ref.current;
    if (!element || seen.current || !motionAllowed || !pageVisible) return;
    if (!('IntersectionObserver' in window) || !element.animate) return;
    // No content is hidden before JS. Already-visible sections never flash.
    if (element.getBoundingClientRect().top < window.innerHeight) { seen.current = true; return; }
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen.current = true;
      animation = element.animate(
        [{ opacity: .25, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 450, easing: 'cubic-bezier(.2,.75,.25,1)' },
      );
      observer.disconnect();
    }, { threshold: .08 });
    const revealForFocus = () => { seen.current = true; animation?.cancel(); observer.disconnect(); };
    observer.observe(element);
    element.addEventListener('focusin', revealForFocus);
    return () => { observer.disconnect(); animation?.cancel(); element.removeEventListener('focusin', revealForFocus); };
  }, [motionAllowed, pageVisible]);
  return <div ref={ref} className={className}>{children}</div>;
}
