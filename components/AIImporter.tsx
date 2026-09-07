"use client";
import { useState, type FormEvent } from "react";
import { Sparkles, Search, Loader2, Plus, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validCatalog } from "@/lib/validate";
import type { Tool } from "@/lib/tools";
type Research = {
  tool: Tool;
  sources: { title: string; url: string }[];
  report: string;
  searchSuggestions?: string;
  searchedAt: string;
  provider?: string;
  requestedModel?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
};
export default function AIImporter({
  onAdd,
  existing,
}: {
  onAdd: (tool: Tool) => void;
  existing: Tool[];
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Research | null>(null);
  const [error, setError] = useState("");
  async function research(e: FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session)
        throw new Error("انتهت جلسة الدخول. سجّل الدخول مجدداً.");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/research-tool`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify({ name: query.trim() }),
          signal: AbortSignal.timeout(140000),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          data?.error ||
            "خدمة البحث غير متاحة حالياً. تحقق من تفعيلها ثم أعد المحاولة.",
        );
      if (!data || !validCatalog([data.tool]) || !Array.isArray(data.sources))
        throw new Error(
          "نتيجة البحث غير مكتملة. حاول باسم أو رابط أكثر تحديداً.",
        );
      setResult(data);
    } catch (issue) {
      setError(
        issue instanceof Error && issue.name === "TimeoutError"
          ? "استغرق البحث وقتاً طويلاً. أعد المحاولة."
          : issue instanceof Error
            ? issue.message
            : "تعذّر البحث.",
      );
    } finally {
      setBusy(false);
    }
  }
  const duplicate =
    result &&
    existing.some(
      (t) =>
        t.id === result.tool.id ||
        t.name.toLowerCase() === result.tool.name.toLowerCase(),
    );
  return (
    <section className="ai-import" aria-labelledby="ai-title">
      <h2 id="ai-title">
        <Sparkles className="text-purple" /> أضف أداة، بالذكاء الاصطناعي
      </h2>
      <p>
        اكتب اسم الأداة أو موقعها. يستخدم أطلس نماذج GLM عبر KiosAPI لإعداد
        مسودة عربية منظّمة؛ راجع الروابط والأسعار قبل النشر.
      </p>
      <form className="ai-input-row" onSubmit={research}>
        <input
          aria-label="اسم الأداة أو موقعها"
          required
          minLength={2}
          maxLength={160}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="مثلاً: Perplexity أو موقع الأداة الرسمي"
          disabled={busy}
        />
        <button
          className="primary-button"
          disabled={busy || query.trim().length < 2}
        >
          {busy ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}{" "}
          {busy ? "يبحث ويُعدّ البيانات…" : "ابحث وجهّز الأداة"}
        </button>
      </form>
      {busy && (
        <p className="ai-message" role="status">
          قد يستغرق الإعداد نحو دقيقتين عند الانتقال تلقائياً إلى نموذج احتياطي.
        </p>
      )}
      {error && (
        <p role="alert" className="ai-message">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold" dir="auto">
                {result.tool.name}
              </h3>
              <p className="text-muted mt-2">{result.tool.hook}</p>
            </div>
            <span className="category-label h-fit">مسودة تحتاج مراجعتك</span>
          </div>
          <p className="text-muted mt-4">{result.tool.description}</p>
          <p className="ai-message">
            {result.tool.plans.length} خطط • إعداد بتاريخ{" "}
            {result.searchedAt.slice(0, 10)} • الأسعار غير المؤكدة تُترك فارغة.
          </p>
          {result.modelUsed && (
            <p className="ai-message">
              النموذج المستخدم: <span dir="ltr">{result.modelUsed}</span>
              {result.fallbackUsed
                ? " (بديل تلقائي لأن النموذج الأساسي لم يكن متاحاً)"
                : ""}
            </p>
          )}
          <div className="ai-sources">
            {result.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title} <ExternalLink size={12} className="inline" />
              </a>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-purple">
              عرض ملخص البحث
            </summary>
            <p className="ai-report">{result.report}</p>
          </details>
          {result.searchSuggestions && (
            <iframe
              title="اقتراحات بحث Google"
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
              srcDoc={result.searchSuggestions}
              className="w-full border-0 mt-4 h-36 bg-white rounded-xl"
            />
          )}
          <button
            type="button"
            disabled={!!duplicate}
            className="primary-button mt-5"
            onClick={() => {
              onAdd(result.tool);
              setResult(null);
              setQuery("");
            }}
          >
            <Plus size={17} />
            {duplicate ? "الأداة موجودة في الدليل" : "أضف إلى المسودة وراجع"}
          </button>
        </div>
      )}
    </section>
  );
}
