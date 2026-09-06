import { ArrowDown, ShieldCheck } from 'lucide-react';
import ToolsExplorer from '@/components/ToolsExplorer';
import GlobeShowcase from '@/components/GlobeShowcase';
import ScrollReveal from '@/components/ScrollReveal';

export default function Home() {
  return <div className="workspace">
    <header className="workspace-heading atlas-hero">
      <div className="atlas-hero-copy">
        <div className="eyebrow" dir="ltr">ATLAS / AI DISCOVERY</div>
        <h1>أدوات أذكى.<br /><span>إمكانيات أبعد.</span></h1>
        <p>ابحث عن الأداة المناسبة، افهم خططها، وابدأ من مكان واحد.</p>
        <div className="atlas-hero-actions">
          <a href="#atlas-search" className="atlas-cta">استكشف الأدوات <ArrowDown size={16} aria-hidden="true" /></a>
          <span className="atlas-trust-note"><ShieldCheck size={15} aria-hidden="true" /> معلومة واضحة. اختيار واعٍ.</span>
        </div>
      </div>
      <GlobeShowcase />
    </header>
    <ToolsExplorer />
    <ScrollReveal>
      <footer className="workspace-footer"><span>أطلس © 2026</span><span>اختيار واعٍ يبدأ بمعلومة واضحة.</span></footer>
    </ScrollReveal>
  </div>;
}
