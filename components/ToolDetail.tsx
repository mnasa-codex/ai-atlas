"use client";
import Link from "next/link";
import { useCatalog } from "./CatalogProvider";
import { categories, demoSettings, logoUrlForTool } from "@/lib/tools";
import { ArrowRight, ExternalLink, MessageCircle } from "lucide-react";

export default function ToolDetail({ id }: { id: string }) {
  const { tools, loading, error } = useCatalog();
  const tool = tools.find((t) => t.id === id);
  if (!tool && loading) return <div className="workspace" role="status">جارٍ تحميل الأداة…</div>;
  if (!tool) return <div className="workspace"><h1 className="text-3xl font-bold">الأداة غير متاحة</h1><p className="text-muted mt-3">{error || "ربما تغيّر رابطها أو أُزيلت من الدليل."}</p><Link className="tool-permalink" href="/tools">العودة إلى المكتبة</Link></div>;
  const logoUrl = logoUrlForTool(tool);
  return (
    <div className="workspace">
      <Link href="/tools" className="tool-permalink mb-8"><ArrowRight size={18} /> مكتبة الأدوات</Link>
      {error && <p className="catalog-notice">{error}</p>}
      <header className="detail-heading">
        <div className={`tool-monogram accent-${tool.category} overflow-hidden`}>{logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-contain p-2" /> : tool.logo}</div>
        <div><div className="eyebrow">{tool.vendor} · {categories.find((c) => c.id === tool.category)?.label}</div><h1 dir="auto">{tool.name}</h1></div>
      </header>
      <p className="detail-description">{tool.description}</p>
      <div className="flex flex-wrap gap-3 mt-7">
        <a href={tool.website} target="_blank" rel="noopener noreferrer" className="primary-button">الموقع الرسمي <ExternalLink size={17} /></a>
        <a className="tool-permalink" href={`https://wa.me/${demoSettings.whatsappNumber}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن ${tool.name}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> استفسر عن الأداة</a>
      </div>
      <section className="detail-plans" aria-label="الخطط والأسعار">
        {tool.plans.map((p) => <article key={p.name} className="detail-plan glass"><h2>{p.name}</h2><p className="price">{p.custom ? "سعر مخصص" : p.monthly === 0 ? "مجاني" : p.monthly == null ? "السعر غير مؤكد" : `$${p.monthly} / شهر`}</p>{p.annual != null && <p className="text-sm text-muted">${Number(p.annual.toFixed(2))} شهرياً عند الدفع السنوي — ${(p.annual * 12).toFixed(2)} للسنة</p>}<p className="text-muted mt-3">{p.bestFor}</p><ul>{p.features.map((f, i) => <li key={i}>{f}</li>)}</ul>{p.limits && <p className="text-sm text-muted mb-4">{p.limits}</p>}<p className="text-sm text-muted mb-3">{p.verified}</p><a href={p.source} target="_blank" rel="noopener noreferrer">راجع المصدر الرسمي ↗</a></article>)}
      </section>
      {!tool.plans.length && <p className="catalog-notice mt-8">لم تُوثّق خطط هذه الأداة بعد. راجع موقعها الرسمي.</p>}
    </div>
  );
}
