/**
 * التحقّق قبل البناء. صفر تبعيات — تحقّق يدوي صريح بدل Zod.
 * يفشل البناء عند أي خطأ حاجب (exit 1).
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJSON, SLUG_RE, L } from './lib/util.mjs';

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const config = readJSON('site.config.json');
const langs = config.languages.map((l) => l.code);

/* ---------- site.config.json ---------- */
if (!/^https?:\/\/[^\s/]+/.test(config.baseUrl || '')) err('site.config: baseUrl غير صالح.');
if (!langs.includes(config.defaultLang)) err('site.config: defaultLang غير موجود في languages.');
for (const lang of config.languages) {
  if (!['rtl', 'ltr'].includes(lang.dir)) err(`site.config: dir غير صالح للغة ${lang.code}.`);
  if (!lang.locale) err(`site.config: locale مفقود للغة ${lang.code}.`);
}

const wa = config.contact?.whatsapp;
if (wa?.enabled) {
  if (!/^[1-9]\d{7,14}$/.test(wa.number || '')) {
    err('site.config: رقم واتساب يجب أن يكون أرقاماً دولية فقط بلا + ولا 00 ولا مسافات (E.164).');
  }
  if (!wa.display) err('site.config: contact.whatsapp.display مفقود.');
}
const fb = config.contact?.facebook;
if (fb?.enabled) {
  if (!/^https:\/\//.test(fb.messenger || '')) err('site.config: facebook.messenger يجب أن يبدأ بـ https://');
  if (!/^https:\/\//.test(fb.profile || '')) err('site.config: facebook.profile يجب أن يبدأ بـ https://');
}
for (const key of ['hours', 'response_time']) {
  for (const lang of langs) {
    if (!config.contact?.[key]?.[lang]) warn(`site.config: contact.${key}.${lang} مفقود.`);
  }
}

/* ---------- i18n ---------- */
const dicts = {};
for (const lang of langs) {
  const file = `i18n/${lang}.json`;
  if (!fs.existsSync(path.join(ROOT, file))) { err(`ملف الترجمة مفقود: ${file}`); continue; }
  dicts[lang] = readJSON(file);
}
const baseKeys = Object.keys(dicts[config.defaultLang] || {});
for (const lang of langs) {
  if (lang === config.defaultLang) continue;
  const missing = baseKeys.filter((k) => dicts[lang]?.[k] === undefined);
  if (missing.length) warn(`i18n/${lang}.json: ${missing.length} مفتاحاً ناقصاً — ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''}`);
}

/* ---------- content ---------- */
const contentDir = path.join(ROOT, 'content');
const files = fs.existsSync(contentDir)
  ? fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'))
  : [];
if (!files.length) err('مجلد content فارغ: لا توجد أدوات لبنائها.');

const seen = new Set();
let publishedCount = 0;

const bilingual = (field, label, where) => {
  if (!field) { err(`${where}: ${label} مفقود.`); return; }
  for (const lang of langs) {
    if (!field[lang]) warn(`${where}: ${label}.${lang} مفقود — سيُستخدم بديل اللغة الافتراضية.`);
  }
};

for (const file of files) {
  const where = `content/${file}`;
  let tool;
  try {
    tool = readJSON(`content/${file}`);
  } catch (e) {
    err(`${where}: JSON غير صالح — ${e.message}`);
    continue;
  }

  if (!SLUG_RE.test(tool.slug || '')) err(`${where}: slug غير صالح (يُسمح a-z 0-9 وشرطة فقط).`);
  if (tool.slug !== path.basename(file, '.json')) err(`${where}: اسم الملف لا يطابق slug (${tool.slug}).`);
  if (seen.has(tool.slug)) err(`${where}: slug مكرّر (${tool.slug}).`);
  seen.add(tool.slug);

  bilingual(tool.name, 'name', where);
  bilingual(tool.tagline, 'tagline', where);
  bilingual(tool.summary, 'summary', where);
  bilingual(tool.verdict, 'verdict', where);

  if (!tool.category) err(`${where}: category مفقود.`);
  else for (const lang of langs) {
    if (dicts[lang]?.[`category.${tool.category}`] === undefined) {
      warn(`${where}: لا توجد ترجمة للفئة category.${tool.category} في ${lang}.`);
    }
  }

  for (const lang of langs) {
    const seo = tool.seo?.[lang];
    if (!seo?.title) warn(`${where}: seo.${lang}.title مفقود.`);
    else if (seo.title.length > 65) warn(`${where}: seo.${lang}.title أطول من 65 حرفاً (${seo.title.length}).`);
    if (!seo?.description) warn(`${where}: seo.${lang}.description مفقود.`);
    else if (seo.description.length > 160) warn(`${where}: seo.${lang}.description أطول من 160 حرفاً (${seo.description.length}).`);
  }

  for (const shot of tool.media?.screenshots || []) {
    if (!shot.url) err(`${where}: لقطة بلا url.`);
    if (!shot.width || !shot.height) err(`${where}: لقطة ${shot.id} بلا width/height — يسبّب CLS.`);
    for (const lang of langs) {
      if (!shot.alt?.[lang]) warn(`${where}: alt.${lang} مفقود للقطة ${shot.id}.`);
    }
  }

  /* ===== الأسعار: القواعد الحاجبة ===== */
  const pricing = tool.pricing;
  if (!pricing) { err(`${where}: pricing مفقود بالكامل.`); continue; }
  if (pricing.source !== 'manual') err(`${where}: pricing.source يجب أن تكون "manual" دائماً.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pricing.updated_at || '')) err(`${where}: pricing.updated_at مفقود أو بصيغة خاطئة (YYYY-MM-DD).`);

  const plans = pricing.plans || [];
  if (!plans.length) err(`${where}: لا توجد أي خطة.`);

  const ids = new Set();
  for (const plan of plans) {
    const w = `${where} → plan "${plan.id}"`;
    if (!plan.id) err(`${where}: خطة بلا id.`);
    if (ids.has(plan.id)) err(`${where}: id خطة مكرّر (${plan.id}).`);
    ids.add(plan.id);

    bilingual(plan.name, 'name', w);
    bilingual(plan.best_for, 'best_for', w);

    const amount = plan.price?.amount;
    const contact = plan.contact_for_price === true;

    // القاعدة المحورية
    if ((amount === null || amount === undefined) !== contact) {
      err(`${w}: يجب أن يكون price.amount = null إذا وفقط إذا كان contact_for_price = true.`);
    }
    if (!contact) {
      if (typeof amount !== 'number' || Number.isNaN(amount)) err(`${w}: price.amount يجب أن يكون رقماً.`);
      if (!plan.price?.currency) err(`${w}: price.currency مفقود.`);
      if (plan.is_free === true && amount !== 0) err(`${w}: is_free = true يستوجب amount = 0.`);
      if (plan.is_free !== true && amount === 0) err(`${w}: amount = 0 يستوجب is_free = true.`);
      const annual = plan.price?.annual_amount;
      if (annual !== null && annual !== undefined) {
        if (typeof annual !== 'number') err(`${w}: annual_amount يجب أن يكون رقماً أو null.`);
        else if (amount > 0 && annual > amount * 12) err(`${w}: annual_amount (${annual}) أكبر من amount×12 (${amount * 12}).`);
      }
      if (!plan.cta?.url) warn(`${w}: خطة بسعر رقمي بلا cta.url — لن يظهر زر الاشتراك.`);
    }

    const g = plan.what_you_get;
    if (!g) { err(`${w}: what_you_get مفقود — هذا القسم إلزامي في كل خطة.`); continue; }
    bilingual(g.headline, 'what_you_get.headline', w);
    if (!(g.quotas?.length || g.unlocked_features?.length)) {
      err(`${w}: what_you_get يحتاج quotas أو unlocked_features على الأقل.`);
    }
    for (const q of g.quotas || []) {
      if (!q.label || q.value === undefined || q.value === null) err(`${w}: حصّة بلا label أو value.`);
    }
    if (typeof g.commercial_use !== 'boolean') warn(`${w}: commercial_use غير محدّد (true/false).`);
    if (typeof g.data_used_for_training !== 'boolean') warn(`${w}: data_used_for_training غير محدّد.`);
  }

  if (pricing.admin_offer?.enabled) {
    bilingual(pricing.admin_offer.name, 'admin_offer.name', where);
    bilingual(pricing.admin_offer.headline, 'admin_offer.headline', where);
    if (!pricing.admin_offer.disclaimer) err(`${where}: admin_offer يحتاج disclaimer يوضّح أنه ليس خطة رسمية من المورّد.`);
    if (!wa?.enabled && !fb?.enabled) err(`${where}: admin_offer مفعّل لكن لا قناة تواصل مفعّلة في site.config.`);
  }

  for (const row of pricing.comparison_rows || []) {
    for (const id of Object.keys(row.values || {})) {
      if (!ids.has(id)) warn(`${where}: صف مقارنة يشير إلى خطة غير موجودة (${id}).`);
    }
  }

  const status = tool.meta?.status;
  if (!['draft', 'published'].includes(status)) err(`${where}: meta.status يجب أن تكون draft أو published.`);
  if (status === 'published') {
    publishedCount += 1;
    if (!tool.meta?.last_verified) err(`${where}: أداة منشورة بلا meta.last_verified.`);
    if (!(tool.meta?.sources || []).length) warn(`${where}: أداة منشورة بلا أي مصدر في meta.sources.`);
  }
  if (pricing.verify_required) warn(`${where}: الأسعار مُعلَّمة verify_required — سيظهر بانر تحذير للزوار حتى تراجعها.`);
}

if (!publishedCount) warn('لا توجد أي أداة بحالة published — الموسوعة ستكون فارغة.');

/* ---------- التقرير ---------- */
for (const w of warnings) console.warn(`\x1b[33m⚠  ${w}\x1b[0m`);
for (const e of errors) console.error(`\x1b[31m✖  ${e}\x1b[0m`);

console.log(
  `\n${errors.length ? '\x1b[31m✖ فشل التحقّق\x1b[0m' : '\x1b[32m✔ التحقّق ناجح\x1b[0m'}` +
  ` — ${files.length} ملف محتوى، ${publishedCount} منشور، ${errors.length} خطأ، ${warnings.length} تحذير.\n`
);

process.exit(errors.length ? 1 : 0);
