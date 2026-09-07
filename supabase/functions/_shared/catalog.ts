export type Category =
  "chat" | "image" | "video" | "code" | "research" | "audio";

export type PricingPlan = {
  name: string;
  monthly?: number; // فارغ = مجاني أو سعر مخصص
  annual?: number; // السعر الشهري الفعلي عند الدفع السنوي (إن وجد خصم سنوي)
  custom?: boolean; // خطط Enterprise بدون سعر ثابت
  bestFor: string; // لمن تناسب هذه الخطة تحديدًا
  included?: string[]; // تطبيقات/أدوات مرفقة ضمن الخطة (Flow, NotebookLM, Sora...)
  features: string[]; // أبرز المزايا العملية
  limits?: string; // وصف حدود الاستخدام إن وجدت
  popular?: boolean; // شارة "الأكثر طلبًا"
  verified: string; // تاريخ آخر تحقق يدوي
  source: string; // رابط صفحة التسعير الرسمية
};

export type Tool = {
  id: string;
  name: string;
  vendor: string;
  category: Category;
  hook: string;
  description: string;
  website: string;
  logo: string;
  logoUrl?: string;
  featured: boolean;
  plans: PricingPlan[];
};

export function isHttps(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" && !!u.hostname && !u.username && !u.password
    );
  } catch {
    return false;
  }
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 10000;
const list = (v: unknown) =>
  Array.isArray(v) && v.length <= 100 && v.every(text);
const amount = (v: unknown) =>
  v === undefined || (typeof v === "number" && Number.isFinite(v) && v >= 0);
const optionalBoolean = (v: unknown) =>
  v === undefined || typeof v === "boolean";
export function validCatalog(value: unknown): value is Tool[] {
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > 500 ||
    JSON.stringify(value).length > 2000000
  )
    return false;
  const ids = new Set<string>();
  return value.every((t) => {
    if (
      !record(t) ||
      !text(t.id) ||
      !/^[a-z0-9][a-z0-9-]{0,99}$/.test(t.id) ||
      ids.has(t.id)
    )
      return false;
    ids.add(t.id);
    if (
      !["name", "vendor", "logo", "hook", "description"].every((k) =>
        text(t[k]),
      ) ||
      !String(t.name).trim()
    )
      return false;
    if (
      !["chat", "image", "video", "code", "research", "audio"].includes(
        String(t.category),
      ) ||
      typeof t.featured !== "boolean"
    )
      return false;
    if (
      !isHttps(t.website) ||
      (t.logoUrl !== undefined && t.logoUrl !== "" && !isHttps(t.logoUrl))
    )
      return false;
    if (!Array.isArray(t.plans) || t.plans.length > 30) return false;
    const names = new Set<string>();
    return t.plans.every((p) => {
      if (!record(p) || !text(p.name) || !p.name.trim() || names.has(p.name))
        return false;
      names.add(p.name);
      return (
        text(p.bestFor) &&
        text(p.verified) &&
        isHttps(p.source) &&
        list(p.features) &&
        (p.included === undefined || list(p.included)) &&
        (p.limits === undefined || text(p.limits)) &&
        optionalBoolean(p.custom) &&
        optionalBoolean(p.popular) &&
        amount(p.monthly) &&
        amount(p.annual)
      );
    });
  });
}
