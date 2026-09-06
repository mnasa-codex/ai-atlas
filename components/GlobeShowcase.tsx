'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useExperience } from './Experience';

function GlobeFallback() {
  return <div className="atlas-globe-fallback"><span /><span /><span /></div>;
}
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <GlobeFallback /> : this.props.children; }
}
const Globe3D = dynamic(() => import('./Globe3D'), {
  ssr: false,
  loading: () => <GlobeFallback />,
});
let playedInThisTab = false;

export default function GlobeShowcase() {
  const host = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { motionAllowed, pageVisible } = useExperience();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (ready || !motionAllowed || !pageVisible || !visible) return;
    const id = window.setTimeout(() => setReady(true), 180);
    return () => window.clearTimeout(id);
  }, [ready, motionAllowed, pageVisible, visible]);

  const playMoment = useCallback(() => {
    if (playedInThisTab || !motionAllowed || !pageVisible) return;
    try {
      if (sessionStorage.getItem('atlas-aura-played') === 'true') { playedInThisTab = true; return; }
      sessionStorage.setItem('atlas-aura-played', 'true');
    } catch { /* Memory fallback also prevents replay when storage is unavailable. */ }
    playedInThisTab = true;
    const shell = host.current?.closest<HTMLElement>('.atlas-public');
    if (!shell) return;
    shell.dataset.atlasAura = 'playing';
    timer.current = setTimeout(() => { delete shell.dataset.atlasAura; }, 2800);
  }, [motionAllowed, pageVisible]);

  useEffect(() => {
    const shell = host.current?.closest<HTMLElement>('.atlas-public');
    if (!motionAllowed || !pageVisible) {
      if (timer.current) clearTimeout(timer.current);
      if (shell) delete shell.dataset.atlasAura;
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (shell) delete shell.dataset.atlasAura;
    };
  }, [motionAllowed, pageVisible]);
  const unavailable = useCallback(() => setFailed(true), []);

  return <figure ref={host} className="atlas-globe" aria-hidden="true">
    <div className="atlas-orbit" />
    <div className="atlas-globe-stage">
      {ready && motionAllowed && !failed ? (
        <SceneBoundary><Globe3D active={visible && pageVisible} onFirstMorph={playMoment} onUnavailable={unavailable} /></SceneBoundary>
      ) : <GlobeFallback />}
    </div>
    <figcaption><span /> أفق أوسع لاختياراتك <span /></figcaption>
  </figure>;
}
