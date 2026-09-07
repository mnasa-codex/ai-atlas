import ToolsExplorer from "@/components/ToolsExplorer";
import GlobeShowcase from "@/components/GlobeShowcase";
import { Sparkles } from "lucide-react";
export default function Home() {
  return (
    <div className="workspace">
      <header className="cosmic-hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <Sparkles size={15} /> اكتشف الذكاء. وسّع إمكانياتك.
          </div>
          <h1>
            فكرتك القادمة،
            <br />
            <span>أبعد مما تتخيّل.</span>
          </h1>
          <p>
            عالم من أدوات الذكاء الاصطناعي، بين يديك.
            <br />
            اكتشف، قارن، واختر ما يُطلق إمكانياتك.
          </p>
          <a className="hero-link" href="#explore">
            ابدأ الاكتشاف <span aria-hidden="true">↓</span>
          </a>
        </div>
        <GlobeShowcase />
      </header>
      <section
        id="explore"
        className="explorer-section"
        aria-label="اكتشاف الأدوات"
      >
        <ToolsExplorer />
      </section>
      <footer className="workspace-footer">
        <span>أطلس © 2026</span>
        <span>فضولك هو نقطة البداية.</span>
      </footer>
    </div>
  );
}
