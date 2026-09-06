import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';
import { seedTools } from '@/lib/tools';

export default function Pricing() {
  const rows = seedTools.flatMap(t => t.plans.map(p => ({
    tool: t.name,
    plan: p.name,
    popular: !!p.popular,
    bestFor: p.bestFor,
    price: p.custom ? 'مخصص' : p.monthly != null ? `$${p.monthly}` : 'مجاني',
    annual: p.annual != null ? `$${p.annual}` : '—',
    features: p.features.slice(0, 3).join(' • '),
    verified: p.verified,
    source: p.source
  })));

  return <div className="mx-auto max-w-7xl px-5 md:px-8 pt-36 pb-24">
    <SectionHeading eyebrow="مقارنة الأسعار" title="شوف الخطط في مكان واحد" desc="اضغط على أي أداة من صفحة الأدوات لتشوف كل تفاصيل خطتها والتطبيقات المرفقة معها. الجدول هنا للمقارنة السريعة فقط." />
    <div className="glass rounded-[28px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-white/5"><tr>
            <th className="p-4">الأداة</th>
            <th className="p-4">الخطة</th>
            <th className="p-4">شهري</th>
            <th className="p-4">سنوي (شهر)</th>
            <th className="p-4">لمن تناسب</th>
            <th className="p-4">أبرز المزايا</th>
            <th className="p-4">التحقق</th>
            <th className="p-4">المصدر</th>
          </tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-white/5">
            <td className="p-4 font-bold">{r.tool}</td>
            <td className="p-4">{r.plan}{r.popular && <span className="mr-2 text-[10px] text-gold bg-gold/10 border border-gold/25 rounded-full px-2 py-0.5">الأكثر طلبًا</span>}</td>
            <td className="p-4 font-mono text-gold">{r.price}</td>
            <td className="p-4 font-mono text-muted">{r.annual}</td>
            <td className="p-4 text-muted min-w-[200px]">{r.bestFor}</td>
            <td className="p-4 text-muted min-w-[260px]">{r.features}</td>
            <td className="p-4 text-xs text-muted min-w-[140px]">{r.verified}</td>
            <td className="p-4"><a href={r.source} target="_blank" rel="noreferrer" className="text-cyan hover:underline">الرابط الرسمي</a></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
    <div className="mt-8 text-center text-xs text-muted">للاستفسار أو المساعدة في التفعيل <Link href="/contact" className="text-gold hover:underline">تواصل معنا</Link></div>
  </div>;
}
