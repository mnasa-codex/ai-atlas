'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';

// تحميل الكرة ثلاثية الأبعاد بشكل كسول (Lazy) وبدون SSR — مكتبة Three.js ثقيلة نسبيًا
// ولا داعي إطلاقًا لتحميلها ضمن أول حزمة JS تصل للمستخدم.
const Globe3D = dynamic(() => import('./Globe3D'), {
  ssr: false,
  loading: () => <GlobeSkeleton pulsing />
});

function GlobeSkeleton({ pulsing = false }: { pulsing?: boolean }) {
  return (
    <div className="h-full w-full grid place-items-center">
      <div className={`h-56 w-56 md:h-72 md:w-72 rounded-full bg-gradient-to-br from-purple/30 to-gold/20 blur-[2px] ${pulsing ? 'animate-pulse' : ''}`} />
    </div>
  );
}

export default function GlobeShowcase() {
  const [mode, setMode] = useState<'loading' | '3d' | 'static'>('loading');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMode(reduce ? 'static' : '3d');
  }, []);

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="relative overflow-hidden glass rounded-[40px] p-6 md:p-10">
          <div className="absolute -inset-20 bg-purple/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative text-center mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-xs text-gold"><Globe2 size={14} /> أطلس بالعربي، والعالم بأكمله بين يديك</div>
          </div>
          <div className="relative h-[340px] md:h-[460px]">
            {mode === '3d' && <Globe3D />}
            {mode === 'static' && <GlobeSkeleton />}
            {mode === 'loading' && <GlobeSkeleton pulsing />}
          </div>
          <p className="relative text-center text-xs text-muted mt-2">اسحب لتدوير الكرة — راقبها وهي تتحول لموجة بحر وترجع من جديد</p>
        </div>
      </div>
    </section>
  );
}
