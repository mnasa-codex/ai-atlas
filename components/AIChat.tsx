"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const initialMessage: Message = {
  role: "assistant",
  content:
    "مرحباً، أنا Atlas Intelligence. اسألني عن أدوات الذكاء الاصطناعي، الاستخدامات، أو أي أداة موجودة داخل أطلس.",
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return base ? `${base}/functions/v1/atlas-chat` : "";
  }, []);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy || !apiUrl) return;
    const next = [...messages, { role: "user" as const, content: text }].slice(-8);
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "تعذر الحصول على رد من المساعد.");
      if (typeof data?.answer !== "string" || !data.answer.trim()) throw new Error("عاد رد غير مكتمل من المساعد.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer.trim() }].slice(-8));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "تعذر تشغيل المساعد الآن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8" aria-labelledby="atlas-ai-title">
      <div className="glass overflow-hidden rounded-[2rem] border border-white/10">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between md:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/10 text-gold"><Bot size={23} /></div>
            <div>
              <div className="eyebrow">ATLAS INTELLIGENCE</div>
              <h2 id="atlas-ai-title" className="mt-1 text-2xl font-extrabold md:text-3xl">اسأل أطلس</h2>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-2 text-xs text-gold"><Sparkles size={13} /> GLM-5.3-Flash</span>
        </div>

        <div className="min-h-72 space-y-4 bg-black/10 p-5 md:min-h-80 md:p-7" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 md:max-w-[78%] ${message.role === "user" ? "mr-auto bg-gold/10 text-ink" : "ml-auto border border-white/10 bg-white/[.035] text-muted"}`}>
              {message.content}
            </div>
          ))}
          {busy && <div className="ml-auto max-w-[78%] rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm text-muted"><Loader2 size={16} className="inline animate-spin ml-2" /> جارٍ التفكير…</div>}
        </div>

        {error && <div className="mx-5 mb-4 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200 md:mx-7" role="alert">{error}</div>}

        <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-4 md:p-5">
          <input aria-label="اكتب سؤالك لأطلس" value={input} onChange={(e) => setInput(e.target.value)} placeholder="مثلاً: شو أفضل أداة للبرمجة؟" maxLength={1600} disabled={busy || !apiUrl} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none transition focus:border-gold/40" />
          <button type="submit" disabled={busy || !input.trim() || !apiUrl} aria-label="إرسال" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold text-[#090A0F] disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}
          </button>
        </form>
        <p className="px-5 pb-5 text-center text-xs text-muted md:px-7">يعمل عبر API من جهة الخادم، ومفتاح مزود الذكاء لا يظهر في المتصفح.</p>
      </div>
    </section>
  );
}
