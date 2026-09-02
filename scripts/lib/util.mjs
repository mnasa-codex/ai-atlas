import fs from 'node:fs';
import path from 'node:path';

const SITE_CONFIG = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'site.config.json'), 'utf-8'));

export const ROOT = process.cwd();
export const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf-8'));

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** حماية إلزامية: كل نص يدخل HTML يمرّ من هنا. */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** لإدراج نص داخل سمة أو JSON-LD بأمان. */
export const escAttr = esc;
export const escJSON = (obj) =>
  JSON.stringify(obj).replace(/</g, '\\u003C').replace(/>/g, '\\u003E').replace(/&/g, '\\u0026');

/** حقل ثنائي اللغة: يعود للغة الافتراضية عند النقص. */
export function L(field, lang, fallbackLang = 'ar') {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string' || typeof field === 'number') return String(field);
  return field[lang] ?? field[fallbackLang] ?? '';
}

export function makeT(dicts, defaultLang) {
  return (lang, key, vars) => {
    let text = dicts[lang]?.[key];
    if (text === undefined) text = dicts[defaultLang]?.[key];
    if (text === undefined) return key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    return text;
  };
}

/** مسار الصفحة لكل لغة: اللغة الافتراضية في الجذر، الباقي ببادئة. */
export function publicUrlFor(lang, defaultLang, rel, basePath = SITE_CONFIG.basePath || '') {
  const clean = rel.replace(/^\/+/, '');
  const prefix = String(basePath || '').replace(/\/+$/, '');
  const localePath = lang === defaultLang ? `/${clean}` : `/${lang}/${clean}`;
  return `${prefix}${localePath}`;
}

export function urlFor(lang, defaultLang, rel, basePath = SITE_CONFIG.basePath || '') {
  return publicUrlFor(lang, defaultLang, rel, basePath);
}

export function filePathFor(lang, defaultLang, rel) {
  const clean = rel.replace(/^\/+/, '');
  return lang === defaultLang ? `/${clean}` : `/${lang}/${clean}`;
}

export function waHref({ number, text }) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function money(amount, currency, locale) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency, maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function rmDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

export function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}
