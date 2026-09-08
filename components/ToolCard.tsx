"use client";
import { useState } from "react";
import { ArrowUpLeft, Sparkles } from "lucide-react";
import { categories, logoUrlForTool, type Tool } from "@/lib/tools";

export default function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (t: Tool) => void }) {
  const [failedLogo, setFailedLogo] = useState<string>();
  const logoUrl = logoUrlForTool(tool);
  const free = tool.plans.some((p) => !p.custom && p.monthly === 0);

  return (
    <button onClick={() => onOpen(tool)} className={`tool-card accent-${tool.category}`} aria-label={`تفاصيل ${tool.name}`}>
      <div className="card-top">
        <div className="tool-logo-box" aria-hidden="true">
          {logoUrl && failedLogo !== logoUrl ? (
            <img src={logoUrl} alt="" loading="lazy" onError={() => setFailedLogo(logoUrl)} />
          ) : (
            <span className="tool-logo-fallback">{tool.logo}</span>
          )}
        </div>
        <span className="category-label">{categories.find((c) => c.id === tool.category)?.label}</span>
      </div>

      <div className="card-name">
        <h3 dir="ltr" title={tool.name}>{tool.name}</h3>
        {tool.featured && <Sparkles size={16} aria-label="مختارة" />}
      </div>
      <div className="card-vendor">{tool.vendor}</div>
      <p>{tool.hook}</p>
      <div className="card-bottom">
        <span>{free ? "خطة مجانية متاحة" : `${tool.plans.length} خطط للاطلاع`}</span>
        <span className="card-arrow"><ArrowUpLeft size={18} /></span>
      </div>
    </button>
  );
}
