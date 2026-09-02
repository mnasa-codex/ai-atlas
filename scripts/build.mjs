import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJSON, makeT, rmDir, writeFile, copyDir, urlFor, SLUG_RE, L } from './lib/util.mjs';
import { renderHome } from './lib/page-home.mjs';
import { renderTool } from './lib/page-tool.mjs';
import { renderCatalog } from './lib/page-catalog.mjs';
import { renderContact } from './lib/page-contact.mjs';

const DIST = path.join(ROOT, 'dist');
const config = readJSON('site.config.json');
const languages = config.languages;
const defaultLang = config.defaultLang;

const dicts = {};
for (const lang of languages) dicts[lang.code] = readJSON(`i18n/${lang.code}.json`);
const t = makeT(dicts, defaultLang);
const ctx = { config, t, dicts, languages, defaultLang };

/* ---------- تحميل المحتوى ---------- */
const contentDir = path.join(ROOT, 'content');
const all = fs.readdirSync(contentDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => readJSON(`content/${f}`))
  .filter((tool) => {
    if (!SLUG_RE.test(tool.slug || '')) {
      console.warn(`⚠  تخطّي ملف بـ slug غير صالح: ${tool.slug}`);
      return false;
    }
    return true;
  });

const published = all.filter((tool) => tool.meta?.status === 'published');
const drafts = all.filter((tool) => tool.meta?.status !== 'published');

/* ---------- بناء نظيف ---------- */
rmDir(DIST);

// أصول ثابتة تُنسخ كما هي (لا حزم، لا تحويل)
copyDir(path.join(ROOT, 'src', 'styles'), path.join(DIST, 'css', '_src'));
copyDir(path.join(ROOT, 'src', 'js'), path.join(DIST, 'js'));

/* ---------- دمج CSS في ملف واحد بالترتيب الصحيح ---------- */
const cssOrder = [
  'tokens.css',
  'base.css',
  'components/layout.css',
  'components/motion.css',
  'components/home.css',
  'components/tool.css',
  'components/pricing.css',
  'components/contact.css',
  'components/catalog.css'
];
const css = cssOrder
  .map((rel) => {
    const file = path.join(ROOT, 'src', 'styles', rel);
    if (!fs.existsSync(file)) throw new Error(`ملف CSS مفقود: src/styles/${rel}`);
    return `/* ===== ${rel} ===== */\n${fs.readFileSync(file, 'utf-8')}`;
  })
  .join('\n\n');
writeFile(path.join(DIST, 'css', 'app.css'), css);
rmDir(path.join(DIST, 'css', '_src'));

/* ---------- الصفحات ---------- */
let pageCount = 0;
const write = (lang, rel, html) => {
  const out = urlFor(lang, defaultLang, rel).replace(/^\//, '');
  writeFile(path.join(DIST, out), html);
  pageCount += 1;
};

for (const lang of languages.map((l) => l.code)) {
  write(lang, 'index.html', renderHome(ctx, lang, published));
  write(lang, 'catalog.html', renderCatalog(ctx, lang, published));
  write(lang, 'contact.html', renderContact(ctx, lang));
  for (const tool of all) {
    write(lang, `tools/${tool.slug}.html`, renderTool(ctx, lang, tool));
  }
}

/* ---------- فهرس البحث (للاستخدام المستقبلي والتصدير) ---------- */
writeFile(
  path.join(DIST, 'data', 'index.json'),
  JSON.stringify(
    published.map((tool) => ({
      slug: tool.slug,
      name: tool.name,
      tagline: tool.tagline,
      category: tool.category,
      overall: tool.ratings?.overall ?? null,
      logo: tool.media?.logo?.url ?? null,
      urls: Object.fromEntries(languages.map((l) => [l.code, urlFor(l.code, defaultLang, `tools/${tool.slug}.html`)]))
    })),
    null,
    2
  )
);

/* ---------- sitemap + robots ---------- */
const today = new Date().toISOString().slice(0, 10);
const entries = [];
for (const lang of languages.map((l) => l.code)) {
  for (const rel of ['index.html', 'catalog.html', 'contact.html']) entries.push({ lang, rel });
  for (const tool of published) entries.push({ lang, rel: `tools/${tool.slug}.html` });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(({ lang, rel }) => `  <url>
    <loc>${config.baseUrl}${urlFor(lang, defaultLang, rel)}</loc>
    <lastmod>${today}</lastmod>
${languages.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${config.baseUrl}${urlFor(l.code, defaultLang, rel)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${config.baseUrl}${urlFor(defaultLang, defaultLang, rel)}"/>
  </url>`).join('\n')}
</urlset>
`;
writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
writeFile(
  path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${config.baseUrl}/sitemap.xml\n`
);

/* ---------- ملف رؤوس للاستضافة (Netlify/Cloudflare) ---------- */
writeFile(
  path.join(DIST, '_headers'),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; style-src 'self'; script-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
`
);

console.log(
  `\x1b[32m✔ تم البناء\x1b[0m — ${pageCount} صفحة، ${published.length} أداة منشورة` +
  `${drafts.length ? `، ${drafts.length} مسوّدة (noindex)` : ''}، ${languages.length} لغة → dist/\n`
);
