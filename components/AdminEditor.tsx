"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  RotateCcw,
  Search,
  Loader2,
  Check,
} from "lucide-react";
import AIImporter from "./AIImporter";
import { useCatalog } from "./CatalogProvider";
import { supabase } from "@/lib/supabase";
import { validCatalog } from "@/lib/validate";
import { seedTools, type Tool, type PricingPlan } from "@/lib/tools";
import { searchLogoCandidates, type LogoResult } from "@/lib/logo-search";

const KEY = "atlas-tools-preview-v1";
const emptyPlan = (): PricingPlan => ({
  name: "خطة جديدة",
  bestFor: "",
  features: [],
  verified: "تحتاج مراجعة",
  source: "",
});

export default function Admin() {
  const catalog = useCatalog();
  const initialized = useRef(false);
  const [revision, setRevision] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");
  const [tools, setTools] = useState<Tool[]>(seedTools);
  const [selected, setSelected] = useState<string>(seedTools[0].id);
  const [saved, setSaved] = useState(false);

  const [logoQuery, setLogoQuery] = useState("");
  const [logoResults, setLogoResults] = useState<LogoResult[]>([]);
  const [logoLoading, setLogoLoading] = useState(false);

  useEffect(() => {
    if (catalog.loading || initialized.current) return;
    initialized.current = true;
    setTools(catalog.tools);
    setSelected(catalog.tools[0].id);
    setRevision(catalog.revision);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (validCatalog(draft.tools) && draft.revision === catalog.revision) {
          setTools(draft.tools);
          setSelected(draft.tools[0].id);
          setNotice("تمت استعادة مسودتك المحفوظة على هذا الجهاز.");
        } else
          setNotice(
            "توجد مسودة قديمة على هذا الجهاز. عُرض المحتوى المنشور لتجنب استبدال تحديث أحدث.",
          );
      }
    } catch {
      setNotice("تعذّر استعادة المسودة المحلية.");
    }
  }, [catalog.loading, catalog.tools, catalog.revision]);
  const publish = async () => {
    if (!supabase || publishing) return;
    if (!validCatalog(tools)) {
      setNotice("صحح بيانات الأدوات والأسعار والروابط قبل النشر.");
      return;
    }
    setPublishing(true);
    setNotice("");
    try {
      const { data, error } = await supabase.rpc("publish_atlas_catalog", {
        document: tools,
        expected_revision: revision,
      });
      if (error) {
        setNotice(
          error.message.includes("CATALOG_CONFLICT")
            ? "نُشرت نسخة أحدث. صدّر مسودتك للاحتفاظ بها، ثم أعد تحميل الصفحة وادمج تعديلاتك."
            : "تعذّر النشر. تحقق من اتصال الإدارة وتجهيز قاعدة البيانات.",
        );
        return;
      }
      setRevision(Number(data));
      try {
        localStorage.removeItem(KEY);
      } catch {}
      await catalog.refresh();
      setNotice("تم النشر. أصبحت التعديلات متاحة في الدليل.");
    } catch {
      setNotice(
        "تعذّر الاتصال أثناء النشر. أعد تحميل الدليل للتحقق قبل إعادة المحاولة.",
      );
    } finally {
      setPublishing(false);
    }
  };

  const current = useMemo(
    () => tools.find((t) => t.id === selected) || tools[0],
    [tools, selected],
  );

  useEffect(() => {
    setLogoQuery(current?.name ?? "");
    setLogoResults([]);
  }, [selected]);

  const update = (patch: Partial<Tool>) =>
    setTools((xs) =>
      xs.map((t) => (t.id === selected ? { ...t, ...patch } : t)),
    );
  const save = () => {
    if (!validCatalog(tools)) {
      alert(
        "تحقق من البيانات: الروابط يجب أن تبدأ بـ https والأسعار غير سالبة وأسماء الخطط غير مكررة.",
      );
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ tools, revision }));
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    } catch {
      alert("تعذر الحفظ في المتصفح. يمكنك تصدير الملف.");
    }
  };
  const download = () => {
    if (!validCatalog(tools)) {
      alert("صحح البيانات والروابط قبل التصدير.");
      return;
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(tools, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalog.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const add = () => {
    const id = `custom-${Date.now()}`;
    const t: Tool = {
      id,
      name: "أداة جديدة",
      vendor: "شركة جديدة",
      category: "chat",
      logo: "AI",
      hook: "وصف قصير يجذب المستخدم",
      description: "وصف الأداة وتفاصيل استخدامها.",
      website: "https://example.com",
      featured: false,
      plans: [],
    };
    setTools((xs) => [t, ...xs]);
    setSelected(id);
  };
  const remove = () => {
    if (tools.length <= 1 || !confirm("حذف هذه الأداة من المسودة؟")) return;
    const next = tools.filter((t) => t.id !== selected);
    setTools(next);
    setSelected(next[0].id);
  };
  const reset = () => {
    if (!confirm("استعادة المحتوى المنشور وإلغاء المسودة؟")) return;
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setTools(catalog.tools);
    setSelected(catalog.tools[0].id);
    setRevision(catalog.revision);
  };

  const searchLogo = async () => {
    if (!logoQuery.trim()) return;
    setLogoLoading(true);
    try {
      setLogoResults(await searchLogoCandidates(logoQuery));
    } catch {
      setLogoResults([]);
    }
    setLogoLoading(false);
  };

  // ==== عمليات الخطط السعرية ====
  const updatePlan = (idx: number, patch: Partial<PricingPlan>) =>
    setTools((xs) =>
      xs.map((t) =>
        t.id !== selected
          ? t
          : {
              ...t,
              plans: t.plans.map((p, i) =>
                i === idx ? { ...p, ...patch } : p,
              ),
            },
      ),
    );
  const addPlan = () =>
    setTools((xs) =>
      xs.map((t) =>
        t.id !== selected ? t : { ...t, plans: [...t.plans, emptyPlan()] },
      ),
    );
  const removePlan = (idx: number) =>
    setTools((xs) =>
      xs.map((t) =>
        t.id !== selected
          ? t
          : { ...t, plans: t.plans.filter((_, i) => i !== idx) },
      ),
    );

  if (!current || (catalog.loading && !initialized.current))
    return (
      <div className="workspace" role="status">
        جارٍ تحميل الدليل…
      </div>
    );

  return (
    <div className="admin-main mx-auto max-w-7xl px-5 md:px-8 pt-32 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
        <div>
          <div className="text-xs tracking-[.18em] text-gold">ATLAS STUDIO</div>
          <h1 className="mt-2 text-4xl font-extrabold">إدارة أطلس</h1>
          <p className="mt-2 text-sm text-muted">
            ابحث عن أدوات جديدة، راجع المحتوى، ثم انشر التحديثات في الدليل.
            الحفظ المحلي يحتفظ بمسودة على هذا الجهاز.
          </p>
        </div>
        <div className="admin-toolbar">
          <button
            disabled={publishing || !!catalog.error}
            onClick={publish}
            className="primary-button"
          >
            {publishing ? "جارٍ النشر…" : "نشر التعديلات"}
          </button>
          <button
            onClick={download}
            className="px-4 py-3 rounded-2xl bg-white/5"
          >
            تصدير نسخة
          </button>
          <button
            aria-label="إضافة أداة"
            onClick={add}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10"
          >
            <Plus size={17} />
          </button>
          <button
            aria-label="استعادة المحتوى"
            onClick={reset}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10"
          >
            <RotateCcw size={17} />
          </button>
          <button
            onClick={save}
            className="px-5 py-3 rounded-2xl bg-gold text-[#090A0F] font-bold"
          >
            <Save size={17} className="inline ml-1" />{" "}
            {saved ? "تم الحفظ" : "حفظ محلي"}
          </button>
        </div>
      </div>

      {(notice || catalog.error) && (
        <p className="admin-status" role="status">
          {notice || catalog.error}
        </p>
      )}
      <fieldset disabled={publishing} className="min-w-0">
        <AIImporter
          existing={tools}
          onAdd={(tool) => {
            setTools((xs) => [tool, ...xs]);
            setSelected(tool.id);
            setNotice(
              "أُضيفت الأداة إلى المسودة. راجع الخطط ومصادرها ثم انشر التعديلات.",
            );
          }}
        />
        <div className="grid lg:grid-cols-[300px_1fr] gap-5">
          <aside className="glass rounded-3xl p-3 h-fit">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full text-right rounded-2xl px-4 py-3 mb-1 flex items-center gap-3 ${t.id === selected ? "bg-gold text-[#090A0F] font-bold" : "hover:bg-white/5 text-muted"}`}
              >
                <span className="h-7 w-7 rounded-lg overflow-hidden grid place-items-center bg-white/10 text-xs shrink-0">
                  {t.logoUrl ? (
                    <img
                      src={t.logoUrl}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    t.logo
                  )}
                </span>
                {t.name}
              </button>
            ))}
          </aside>

          <section className="space-y-5">
            {/* ===== الشعار ===== */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold mb-4">شعار الأداة</h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 rounded-2xl overflow-hidden grid place-items-center bg-white/5 border border-white/10 shrink-0 text-lg font-bold">
                  {current.logoUrl ? (
                    <img
                      src={current.logoUrl}
                      alt={current.name}
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    current.logo
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-muted">
                    رابط الشعار الحالي (يمكن تعديله يدويًا أيضًا)
                  </span>
                  <input
                    value={current.logoUrl ?? ""}
                    onChange={(e) => update({ logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="mt-2 w-full rounded-2xl border border-white/8 bg-black/20 p-3 text-sm outline-none focus:border-gold/30"
                  />
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  value={logoQuery}
                  onChange={(e) => setLogoQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchLogo()}
                  placeholder="اكتب اسم المنصة أو الشركة..."
                  className="flex-1 rounded-2xl border border-white/8 bg-black/20 p-3 text-sm outline-none focus:border-gold/30"
                />
                <button
                  onClick={searchLogo}
                  disabled={logoLoading}
                  className="px-5 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center gap-2 text-sm shrink-0"
                >
                  {logoLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}{" "}
                  بحث تلقائي
                </button>
              </div>
              {logoResults.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {logoResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => update({ logoUrl: r.logoUrl })}
                      className={`relative rounded-2xl border p-3 grid place-items-center gap-1 hover:border-gold/40 transition ${current.logoUrl === r.logoUrl ? "border-gold" : "border-white/10"}`}
                    >
                      {current.logoUrl === r.logoUrl && (
                        <Check
                          size={12}
                          className="absolute top-1.5 left-1.5 text-gold"
                        />
                      )}
                      <img
                        src={r.logoUrl}
                        alt={r.name}
                        className="h-9 w-9 object-contain"
                      />
                      <span className="text-xs text-muted truncate w-full text-center">
                        {r.domain}
                      </span>
                      {r.source === "guess" && (
                        <span className="text-xs text-gold/80">
                          تخمين — تحقق منه
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-muted">
                البحث يعرض نطاقات الأدوات المدرجة في الدليل فقط. يمكن إضافة رابط
                شعار HTTPS يدويًا.
              </p>
            </div>

            {/* ===== بيانات الأداة ===== */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold mb-4">بيانات الأداة</h3>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  ["name", "اسم الأداة"],
                  ["vendor", "الشركة"],
                  ["logo", "الأحرف الاحتياطية (تظهر إذا ما في شعار)"],
                  ["website", "الرابط الرسمي"],
                  ["hook", "الجملة القصيرة"],
                  ["description", "الوصف"],
                ].map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-xs text-muted">{label}</span>
                    {key === "description" ? (
                      <textarea
                        value={String(current[key as keyof Tool] ?? "")}
                        onChange={(e) =>
                          update({ [key]: e.target.value } as Partial<Tool>)
                        }
                        className="mt-2 min-h-28 w-full rounded-2xl border border-white/8 bg-black/20 p-3 outline-none focus:border-gold/30"
                      />
                    ) : (
                      <input
                        value={String(current[key as keyof Tool] ?? "")}
                        onChange={(e) =>
                          update({ [key]: e.target.value } as Partial<Tool>)
                        }
                        className="mt-2 w-full rounded-2xl border border-white/8 bg-black/20 p-3 outline-none focus:border-gold/30"
                      />
                    )}
                  </label>
                ))}
                <label>
                  التصنيف
                  <select
                    value={current.category}
                    onChange={(e) =>
                      update({ category: e.target.value as Tool["category"] })
                    }
                    className="block w-full bg-black/20 p-3"
                  >
                    {[
                      "chat",
                      "image",
                      "video",
                      "code",
                      "research",
                      "audio",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                  <input
                    type="checkbox"
                    checked={current.featured}
                    onChange={(e) => update({ featured: e.target.checked })}
                  />
                  <span>عرض الأداة ضمن الأدوات المميزة</span>
                </label>
                <div className="flex justify-end">
                  <button
                    onClick={remove}
                    className="px-4 py-3 rounded-2xl text-red-300 bg-red-400/5 hover:bg-red-400/10"
                  >
                    <Trash2 size={16} className="inline ml-1" /> حذف الأداة
                  </button>
                </div>
              </div>
            </div>

            {/* ===== الخطط السعرية ===== */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">الخطط والأسعار</h3>
                <button
                  onClick={addPlan}
                  className="text-sm px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10"
                >
                  <Plus size={14} className="inline ml-1" /> إضافة خطة
                </button>
              </div>
              <div className="space-y-4">
                {current.plans.map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/8 p-4"
                  >
                    <div className="grid md:grid-cols-4 gap-3 mb-3">
                      <label className="block">
                        <span className="text-xs text-muted">اسم الخطة</span>
                        <input
                          value={p.name}
                          onChange={(e) =>
                            updatePlan(idx, { name: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-muted">
                          السعر الشهري ($)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={p.monthly ?? ""}
                          onChange={(e) =>
                            updatePlan(idx, {
                              monthly:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-muted">
                          السعر عند الدفع السنوي ($/شهر)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={p.annual ?? ""}
                          onChange={(e) =>
                            updatePlan(idx, {
                              annual:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                        />
                      </label>
                      <label className="flex items-center gap-2 mt-5">
                        <input
                          type="checkbox"
                          checked={!!p.popular}
                          onChange={(e) =>
                            updatePlan(idx, { popular: e.target.checked })
                          }
                        />
                        <span className="text-xs">شارة "الأكثر طلبًا"</span>
                      </label>
                    </div>
                    <label className="block mb-3">
                      <span className="text-xs text-muted">
                        لمن تناسب هذه الخطة
                      </span>
                      <input
                        value={p.bestFor}
                        onChange={(e) =>
                          updatePlan(idx, { bestFor: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                      />
                    </label>
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <label className="block">
                        <span className="text-xs text-muted">
                          المزايا (سطر لكل ميزة)
                        </span>
                        <textarea
                          value={p.features.join("\n")}
                          onChange={(e) =>
                            updatePlan(idx, {
                              features: e.target.value
                                .split("\n")
                                .filter(Boolean),
                            })
                          }
                          className="mt-1 min-h-24 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-muted">
                          تطبيقات/أدوات مرفقة (سطر لكل عنصر)
                        </span>
                        <textarea
                          value={(p.included ?? []).join("\n")}
                          onChange={(e) =>
                            updatePlan(idx, {
                              included: e.target.value
                                .split("\n")
                                .filter(Boolean),
                            })
                          }
                          className="mt-1 min-h-24 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                        />
                      </label>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <label className="block md:col-span-2">
                        <span className="text-xs text-muted">
                          رابط مصدر السعر الرسمي
                        </span>
                        <input
                          value={p.source}
                          onChange={(e) =>
                            updatePlan(idx, { source: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-muted">
                          تاريخ آخر تحقق
                        </span>
                        <input
                          value={p.verified}
                          onChange={(e) =>
                            updatePlan(idx, { verified: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-white/8 bg-black/20 p-2.5 text-sm outline-none focus:border-gold/30"
                        />
                      </label>
                    </div>
                    <label className="flex gap-2 items-center mb-3">
                      <input
                        type="checkbox"
                        checked={!!p.custom}
                        onChange={(e) =>
                          updatePlan(idx, { custom: e.target.checked })
                        }
                      />{" "}
                      سعر مخصص
                    </label>
                    <div className="flex justify-end">
                      <button
                        onClick={() => removePlan(idx)}
                        className="text-xs px-3 py-2 rounded-xl text-red-300 bg-red-400/5 hover:bg-red-400/10"
                      >
                        <Trash2 size={13} className="inline ml-1" /> حذف الخطة
                      </button>
                    </div>
                  </div>
                ))}
                {current.plans.length === 0 && (
                  <p className="text-sm text-muted">
                    ما في خطط مضافة لهذه الأداة بعد.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </fieldset>
    </div>
  );
}
