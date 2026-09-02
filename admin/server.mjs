/**
 * لوحة أدمن محلية — 127.0.0.1 فقط، لا تُنشَر أبداً.
 * الحماية: توكن + فحص Origin/Host (منع CSRF من أي صفحة يفتحها متصفحك).
 * ★ الأسعار لا تُكتَب من الموديل إطلاقاً: تُدمَج من الملف القديم أو تُترك بحالة "تواصل".
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const HOST = '127.0.0.1';
const PORT = 5174;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BODY = 32 * 1024;

/* ---------- .env ---------- */
function loadEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const API_KEY = process.env.GEMINI_API_KEY;
const TOKEN = process.env.ADMIN_TOKEN || crypto.randomBytes(24).toString('hex');

/* ---------- سجل تدقيق + سقف تكلفة ---------- */
const LOG = path.join(ROOT, 'admin', 'audit.log');
const audit = (event, data = {}) => {
  fs.appendFileSync(LOG, `${JSON.stringify({ at: new Date().toISOString(), event, ...data })}\n`);
};
const DAILY_CAP = 25;
const usage = { day: new Date().toDateString(), count: 0 };
const withinCap = () => {
  const today = new Date().toDateString();
  if (usage.day !== today) { usage.day = today; usage.count = 0; }
  return usage.count < DAILY_CAP;
};

/* ---------- البرومبت: يمنع الأسعار صراحةً ---------- */
function buildPrompt(toolName, langs, today) {
  return `أنت محلّل منتجات تقنية ومحرّر تقني متعدّد اللغات.
المهمة: أخرِج كائن JSON واحداً فقط عن الأداة: "${toolName}".
اللغات المطلوبة في كل حقل نصّي: ${langs.join(', ')}. التاريخ المرجعي: ${today}.

قواعد غير قابلة للتفاوض:
1. JSON صالح فقط. بلا Markdown، بلا تعليقات، بلا نص قبله أو بعده.
2. ★ ممنوع تماماً كتابة أي سعر أو مبلغ أو عملة أو نسبة خصم. لكل خطة:
   price.amount = null، price.annual_amount = null، contact_for_price = true، is_free = false.
   الأسعار يُدخلها الأدمن يدوياً بعد ذلك. يُسمح لك باقتراح أسماء الخطط وبنية what_you_get النصّية فقط.
3. الحصص الرقمية (quotas) اذكرها فقط إن كانت موثّقة رسمياً، وإلا اجعل value = null
   وأضِف مسار الحقل إلى meta.needs_review.
4. ممنوع اختراع ميزات أو خطط غير موجودة. المجهول = null + needs_review.
5. اذكر بصراحة في كل خطة: commercial_use و data_used_for_training و privacy_mode و api_access (true/false/null).
6. اكتب limitations و not_good_for بصدق تام بلا تجميل — هذا موقع مرجعي لا إعلاني.
7. المصادر: الموقع الرسمي والوثائق الرسمية فقط. ممنوع مقالات "أفضل 10 أدوات" والمحتوى التابع.
8. العربية: فصحى معاصرة واضحة بلا حشو وبلا ترجمة حرفية، والمصطلح التقني بالإنجليزية بين قوسين عند أول ذكر.
   الإنجليزية: مباشرة بصوت فعّال بلا مبالغة تسويقية. النسختان متكافئتان معنى لا حرفاً.
9. verdict يحمل حُكماً صريحاً (اشترِ / جرّب / تجنّب) لا جملة محايدة.
10. اضبط meta.confidence بصدق، وmeta.status = "draft" دائماً.
11. slug بأحرف إنجليزية صغيرة وشرطات فقط.

بنية المخرَج (اتبعها حرفياً — كل حقل نصّي كائن لغات):
{
  "slug": "", "name": {}, "vendor": { "name": "", "country": {}, "founded": 0 },
  "tagline": {}, "category": "", "subcategories": [], "maturity": "stable|beta|deprecated",
  "platforms": [], "arabic_support": { "ui": false, "prompt_quality": "good|fair|poor", "note": {} },
  "summary": {}, "long_description": {}, "what_it_does": [{}], "how_it_works": {},
  "key_features": [{ "title": {}, "description": {}, "icon": "", "tier_required": "", "impact": "high|medium|low" }],
  "use_cases": [{ "persona": {}, "scenario": {}, "outcome": {}, "time_saved": {} }],
  "how_to_start": [{ "step": 1, "title": {}, "detail": {} }],
  "pro_tips": [{}], "strengths": [{}], "limitations": [{}], "not_good_for": [{}],
  "pricing": {
    "source": "manual", "verify_required": true, "updated_at": "${today}", "updated_by": "ai-draft", "note": {},
    "plans": [{
      "id": "", "name": {}, "order": 1, "highlight": false,
      "price": { "amount": null, "currency": "USD", "cycle": "monthly", "annual_amount": null, "note": {} },
      "is_free": false, "contact_for_price": true, "best_for": {},
      "what_you_get": {
        "headline": {}, "quotas": [{ "label": {}, "value": null, "unit": {}, "overage": null }],
        "unlocked_features": [{}], "models_access": [], "speed_and_priority": {},
        "limits_and_caps": [{}], "storage": {}, "collaboration": {}, "support": {},
        "commercial_use": null, "data_used_for_training": null, "privacy_mode": null,
        "api_access": null, "sla": null
      },
      "not_included": [{}], "upgrade_triggers": [{}], "value_verdict": {},
      "cta": { "type": "contact", "url": null }
    }],
    "comparison_rows": [{ "label": {}, "values": {} }]
  },
  "integrations": [], "api": { "available": null, "docs_url": null, "rate_limits": {} },
  "privacy_security": { "retention": {}, "opt_out_training": null, "gdpr": null, "soc2": null, "region_hosting": {}, "note": {} },
  "ratings": { "ease_of_use": 0, "output_quality": 0, "value_for_money": 0, "arabic_quality": 0, "learning_curve": 0, "overall": 0 },
  "verdict": {}, "alternatives": [],
  "media": { "logo": { "url": null, "dominant_color": null }, "screenshots": [], "og_image": {} },
  "links": { "website": "", "pricing": null, "docs": null, "changelog": null },
  "faq": [{ "q": {}, "a": {} }],
  "seo": { "ar": { "title": "", "description": "", "keywords": [] }, "en": { "title": "", "description": "", "keywords": [] } },
  "meta": { "confidence": 0, "sources": [], "generated_at": "${today}", "model": "gemini", "needs_review": [], "status": "draft", "last_verified": null }
}`;
}

async function generate(toolName) {
  if (!API_KEY) throw new Error('GEMINI_API_KEY غير موجود في .env');
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf-8'));
  const langs = config.languages.map((l) => l.code);
  const today = new Date().toISOString().slice(0, 10);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(toolName, langs, today) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    }
  );

  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('استجابة فارغة من الموديل.');
  return JSON.parse(text);
}

/** ★ الحاجز: يمحو أي سعر من مخرجات الموديل ويستعيد أسعارك اليدوية. */
function sanitize(data, existing) {
  if (!SLUG_RE.test(data.slug || '')) throw new Error(`slug غير صالح من الموديل: ${data.slug}`);

  data.meta = { ...(data.meta || {}), status: 'draft' };

  if (existing?.pricing) {
    data.pricing = existing.pricing;                      // أسعارك اليدوية مقدّسة
    data.pricing.updated_by = existing.pricing.updated_by || 'admin';
  } else {
    const p = data.pricing || {};
    p.source = 'manual';
    p.verify_required = true;
    p.updated_at = new Date().toISOString().slice(0, 10);
    p.updated_by = 'ai-draft';
    p.plans = (p.plans || []).map((plan, index) => ({
      ...plan,
      order: plan.order ?? index + 1,
      is_free: false,
      contact_for_price: true,
      price: { amount: null, currency: plan.price?.currency || 'USD', cycle: plan.price?.cycle || 'monthly', annual_amount: null, note: plan.price?.note || null },
      cta: { type: 'contact', url: null }
    }));
    data.pricing = p;
  }
  return data;
}

/* ---------- HTTP ---------- */
const json = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

const originOk = (req) => {
  const host = req.headers.host;
  if (host !== `${HOST}:${PORT}`) return false;
  const origin = req.headers.origin;
  return !origin || origin === `http://${HOST}:${PORT}`;
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(fs.readFileSync(path.join(ROOT, 'admin', 'index.html'), 'utf-8'));
    return;
  }
  if (req.method === 'GET' && url.pathname === '/admin.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    res.end(fs.readFileSync(path.join(ROOT, 'admin', 'admin.js'), 'utf-8'));
    return;
  }
  if (req.method === 'GET' && url.pathname === '/api/tools') {
    const dir = path.join(ROOT, 'content');
    const list = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => {
      const tool = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      return {
        slug: tool.slug,
        name: tool.name?.ar || tool.slug,
        status: tool.meta?.status,
        verify: Boolean(tool.pricing?.verify_required),
        plans: tool.pricing?.plans?.length || 0
      };
    });
    json(res, 200, { tools: list });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/generate') {
    if (!originOk(req)) { json(res, 403, { error: 'Origin مرفوض.' }); return; }
    if (req.headers['x-admin-token'] !== TOKEN) { json(res, 401, { error: 'توكن غير صحيح.' }); return; }
    if (!withinCap()) { json(res, 429, { error: `تجاوزت السقف اليومي (${DAILY_CAP} توليد).` }); return; }

    let body = '';
    let aborted = false;
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY) { aborted = true; req.destroy(); }
    });
    req.on('end', async () => {
      if (aborted) return;

      let toolName = '';
      try { toolName = String(JSON.parse(body).toolName || '').trim().slice(0, 80); } catch {}
      if (!toolName) { json(res, 400, { error: 'اسم الأداة مفقود.' }); return; }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

      try {
        usage.count += 1;
        audit('generate.start', { toolName });

        send({ step: 'الاتصال بالموديل وجمع المعلومات…' });
        const raw = await generate(toolName);

        send({ step: 'التحقّق من slug وحجب أي سعر مولَّد…' });
        const file = path.join(ROOT, 'content', `${raw.slug}.json`);
        if (!file.startsWith(path.join(ROOT, 'content'))) throw new Error('مسار ملف غير مسموح.');
        const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : null;

        if (existing) {
          const backupDir = path.join(ROOT, 'content', '.backups');
          fs.mkdirSync(backupDir, { recursive: true });
          fs.copyFileSync(file, path.join(backupDir, `${raw.slug}.${Date.now()}.json`));
          send({ step: 'نسخة احتياطية محفوظة، والأسعار اليدوية ستُستعاد كما هي.' });
        }

        const data = sanitize(raw, existing);
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
        send({ step: `تم حفظ content/${data.slug}.json (مسوّدة).` });

        send({ step: 'التحقّق وإعادة البناء…' });
        try {
          execFileSync(process.execPath, ['scripts/validate.mjs'], { cwd: ROOT, stdio: 'pipe' });
        } catch (e) {
          send({ step: `تحذير: التحقّق أبلغ عن مشاكل — ${String(e.stdout || e.message).slice(0, 300)}` });
        }
        execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, stdio: 'pipe' });

        audit('generate.done', { slug: data.slug });
        send({
          done: true,
          slug: data.slug,
          step: 'اكتمل. الخطوة التالية: افتح content/' + data.slug + '.json وأدخِل الأسعار يدوياً، ثم اضبط meta.status = "published".'
        });
      } catch (error) {
        audit('generate.error', { toolName, message: error.message });
        send({ error: error.message });
      } finally {
        res.end();
      }
    });
    return;
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`\n\x1b[36m▸ لوحة الأدمن:\x1b[0m http://${HOST}:${PORT}/?token=${TOKEN}`);
  console.log(`\x1b[33m  التوكن:\x1b[0m ${TOKEN}`);
  console.log(`\x1b[2m  محلي فقط (${HOST}) — لا تنشر هذا المجلد. سقف يومي: ${DAILY_CAP} توليد.\x1b[0m\n`);
});
