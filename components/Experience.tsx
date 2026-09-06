'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';

type ExperienceState = { motionAllowed: boolean; pageVisible: boolean };
const ExperienceContext = createContext<ExperienceState>({ motionAllowed: false, pageVisible: false });
export const useExperience = () => useContext(ExperienceContext);

export default function Experience({ children }: { children: ReactNode }) {
  // The server and the first client render are intentionally still.
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(preference.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    try { setPaused(sessionStorage.getItem('atlas-motion-paused') === 'true'); } catch {}
    updateMotion();
    updateVisibility();
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      preference.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  const motionAllowed = !reduced && !paused;
  const toggle = () => {
    const next = !paused;
    setPaused(next);
    try { sessionStorage.setItem('atlas-motion-paused', String(next)); } catch {}
  };

  return (
    <ExperienceContext.Provider value={{ motionAllowed, pageVisible }}>
      <div className="atlas-public" data-motion={motionAllowed ? 'on' : 'off'} data-page-visible={pageVisible}>
        {children}
        {!reduced && (
          <button type="button" className="motion-toggle" onClick={toggle}
            aria-pressed={paused} aria-label={paused ? 'تشغيل المؤثرات المتحركة' : 'إيقاف المؤثرات المتحركة'}>
            {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            <span>{paused ? 'تشغيل الحركة' : 'إيقاف الحركة'}</span>
          </button>
        )}
      </div>
    </ExperienceContext.Provider>
  );
}
