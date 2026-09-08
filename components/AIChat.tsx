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
      if (typeof data?.answer !== "string" || !data.answer.trim())
        throw new Error("عاد رد غير مكتمل من المساعد.");
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer.trim() },
      ].slice(-8));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "تعذر تشغيل المساعد الآن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace ai-chat" aria-labelledby="atlas-ai-title">
      <div className="ai-chat-shell">
        <div className="ai-chat-header">
          <div className="flex items-center gap-3">
            <div className="ai-chat-icon"><Bot size={23} /></div>
            <div>
              <div className="eyebrow">ATLAS INTELLIGENCE</div>
              <h2 id="atlas-ai-title">اسأل أطلس</h2>
            </div>
          </div>
          <span className="ai-model-badge"><Sparkles size={13} /> GLM-5.3-Flash</span>
        </div>

        <div className="ai-chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`ai-bubble ${message.role === "user" ? "user" : "assistant"}`}>
              {message.content}
            </div>
          ))}
          {busy && <div className="ai-bubble assistant"><Loader2 size={16} className="inline animate-spin ml-2" /> جارٍ التفكير…</div>}
        </div>

        {error && <div className="ai-chat-error" role="alert">{error}</div>}

        <form onSubmit={send} className="ai-chat-form">
          <input
            aria-label="اكتب سؤالك لأطلس"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثلاً: شو أفضل أداة للبرمجة؟"
            maxLength={1600}
            disabled={busy || !apiUrl}
          />
          <button type="submit" disabled={busy || !input.trim() || !apiUrl} aria-label="إرسال">
            {busy ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}
          </button>
        </form>
        <p className="ai-chat-note">يعمل عبر API من جهة الخادم، ومفتاح المزود لا يظهر في المتصفح.</p>
      </div>
    </section>
  );
}
