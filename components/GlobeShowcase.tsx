"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
const Globe = dynamic(() => import("./Globe3D"), { ssr: false });
class GlobeBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function GlobeShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(media.matches);
    update();
    media.addEventListener("change", update);
    const canvas = document.createElement("canvas");
    try {
      const gl = canvas.getContext("webgl2");
      setReady(!!gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setReady(false);
    }
    const observer = new IntersectionObserver(([e]) =>
      setVisible(e.isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    const visibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const fallback = (
    <img
      className="earth-fallback"
      src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/textures/earth-day.jpg`}
      alt="خريطة الأرض"
    />
  );
  return (
    <div className="globe-showcase" ref={ref}>
      <div
        className="globe-canvas"
        role="img"
        aria-label="كرة أرضية ثلاثية الأبعاد، اسحب لتدويرها"
      >
        {ready ? (
          <GlobeBoundary fallback={fallback}>
            <Globe paused={paused || !visible} />
          </GlobeBoundary>
        ) : (
          fallback
        )}
      </div>
      <span className="globe-coordinate" dir="ltr">
        35° N · 38° E
      </span>
      <div className="globe-caption">
        <span>عالم من الإمكانيات</span>
        <span className="globe-caption-en" dir="ltr">
          A WORLD OF POSSIBILITIES
        </span>
      </div>
      {ready && (
        <button
          className="globe-pause"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "تدوير الكرة" : "إيقاف دوران الكرة"}
          aria-pressed={paused}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
    </div>
  );
}
