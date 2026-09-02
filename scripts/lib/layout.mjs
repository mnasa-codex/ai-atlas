import { esc, escAttr, escJSON, L, urlFor, waHref } from './util.mjs';
import { icon } from './icons.mjs';

/**
 * القالب الأم لكل الصفحات: هيدر واحد وفوتر واحد ومصدر حقيقة واحد.
 * page: { lang, title, description, relPath, bodyClass, entry, main, noindex, jsonLd, hreflang }
 */
export function renderLayout(ctx, page) {
  const { config, t, defaultLang, languages } = ctx;
  const { lang } = page;
  const meta = languages.find((l) => l.code === lang);
  const other = languages.filter((l) => l.code !== lang);
  const flip = other[0];

  const canonical = `${config.baseUrl}${urlFor(lang, defaultLang, page.relPath)}`;
  const alternates = languages
    .map((l) => `  <link rel="alternate" hreflang="${l.code}" href="${escAttr(config.baseUrl + urlFor(l.code, defaultLang, page.relPath))}">`)
    .join('\n');

  const wa = config.contact.whatsapp;
  const fb = config.contact.facebook;
  const genericWa = waHref({ number: wa.number, text: t(lang, 'contact.waGeneric') });

  const navItems = [
    { href: urlFor(lang, defaultLang, 'catalog.html'), key: 'nav.catalog', id: 'catalog' },
    { href: urlFor(lang, defaultLang, 'contact.html'), key: 'nav.contact', id: 'contact' }
  ];

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${meta.dir}" data-locale="${escAttr(meta.locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${escAttr(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
<link rel="canonical" href="${escAttr(canonical)}">
<link rel="alternate" hreflang="x-default" href="${escAttr(config.baseUrl + urlFor(defaultLang, defaultLang, page.relPath))}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:locale" content="${escAttr(meta.locale)}">
<meta property="og:site_name" content="${escAttr(L(config.siteName, lang))}">
<meta property="og:title" content="${escAttr(page.title)}">
<meta property="og:description" content="${escAttr(page.description)}">
<meta property="og:url" content="${escAttr(canonical)}">
${page.ogImage ? `<meta property="og:image" content="${escAttr(page.ogImage)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#07080b">
<link rel="stylesheet" href="/css/app.css">
<script src="/js/theme-init.js"></script>
${page.jsonLd ? `<script type="application/ld+json">${escJSON(page.jsonLd)}</script>` : ''}
</head>
<body class="${escAttr(page.bodyClass || '')}">
<a class="skip-link" href="#main">${esc(t(lang, 'common.skip'))}</a>
<div class="read-progress" aria-hidden="true"></div>

<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${escAttr(urlFor(lang, defaultLang, 'index.html'))}">
      <span class="brand-mark">${icon('bolt')}</span>
      <span>${esc(L(config.siteName, lang))}</span>
    </a>
    <nav class="header-nav" aria-label="${escAttr(L(config.siteName, lang))}">
      ${navItems.map((item) => `<a href="${escAttr(item.href)}"${page.navId === item.id ? ' aria-current="page"' : ''}>${esc(t(lang, item.key))}</a>`).join('\n      ')}
    </nav>
    <div class="header-actions">
      <button class="icon-btn" type="button" data-theme-toggle aria-pressed="false" aria-label="${escAttr(t(lang, 'common.themeAria'))}">
        ${icon('sun')}${icon('moon')}
      </button>
      <a class="lang-flip" href="${escAttr(urlFor(flip.code, defaultLang, page.relPath))}" data-lang="${escAttr(flip.code)}" lang="${escAttr(flip.code)}" hreflang="${escAttr(flip.code)}" aria-label="${escAttr(t(lang, 'common.langAria', { label: flip.label }))}">
        <span>${esc(flip.short)}</span>
      </a>
    </div>
  </div>
</header>

<main id="main">
${page.main}
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <h3>${esc(L(config.siteName, lang))}</h3>
        <p>${esc(t(lang, 'footer.tagline'))}</p>
      </div>
      <div>
        <h3>${esc(t(lang, 'nav.catalog'))}</h3>
        <div class="footer-list">
          ${navItems.map((item) => `<a href="${escAttr(item.href)}">${esc(t(lang, item.key))}</a>`).join('\n          ')}
        </div>
      </div>
      <div>
        <h3>${esc(t(lang, 'contact.title'))}</h3>
        <div class="footer-list">
          ${wa.enabled ? `<a href="${escAttr(genericWa)}" target="_blank" rel="noopener noreferrer">${esc(t(lang, 'contact.whatsapp'))}: <span dir="ltr">${esc(wa.display)}</span></a>
          <button class="badge" type="button" data-copy="${escAttr(wa.display)}" data-copied-msg="${escAttr(t(lang, 'contact.numberCopied'))}">${icon('copy')}${esc(t(lang, 'contact.copyNumber'))}</button>` : ''}
          ${fb.enabled ? `<a href="${escAttr(fb.profile)}" target="_blank" rel="noopener noreferrer">${esc(t(lang, 'contact.facebook'))}</a>` : ''}
          <span>${esc(t(lang, 'contact.hoursLabel'))}: ${esc(L(config.contact.hours, lang))}</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-disclaimer">${esc(t(lang, 'footer.disclaimer'))}</p>
      <p>© ${new Date().getFullYear()} ${esc(L(config.siteName, lang))} — ${esc(t(lang, 'footer.rights'))}</p>
    </div>
  </div>
</footer>

<a class="icon-btn to-top" href="#main" aria-label="${escAttr(t(lang, 'common.toTop'))}">${icon('up')}</a>

<div class="fab">
  <div class="fab-panel" role="group" aria-label="${escAttr(t(lang, 'contact.fabAria'))}" hidden>
    <p>${esc(L(config.contact.response_time, lang))}</p>
    ${wa.enabled ? `<a class="btn btn-wa btn-block" href="${escAttr(genericWa)}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}<span>${esc(t(lang, 'contact.whatsapp'))}</span><span class="sr-only"> — ${esc(t(lang, 'common.external'))}</span></a>` : ''}
    ${fb.enabled ? `<a class="btn btn-fb btn-block" href="${escAttr(fb.messenger)}" target="_blank" rel="noopener noreferrer">${icon('facebook')}<span>${esc(t(lang, 'contact.messenger'))}</span><span class="sr-only"> — ${esc(t(lang, 'common.external'))}</span></a>` : ''}
  </div>
  <button class="fab-trigger" type="button" aria-expanded="false" aria-label="${escAttr(t(lang, 'contact.fabAria'))}">${icon('chat')}</button>
</div>

<script type="module" src="/js/${escAttr(page.entry)}"></script>
</body>
</html>`;
}
