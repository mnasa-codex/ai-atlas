import { esc, escAttr, L, urlFor } from './util.mjs';
import { icon } from './icons.mjs';
import { renderLayout } from './layout.mjs';

export function renderHome(ctx, lang, tools) {
  const { config, t, defaultLang } = ctx;
  const planCount = tools.reduce((sum, tool) => sum + (tool.pricing?.plans?.length || 0), 0);

  const cards = tools.slice(0, 6).map((tool) => {
    const href = urlFor(lang, defaultLang, `tools/${tool.slug}.html`);
    const logo = tool.media?.logo?.url;
    return `<article class="card spot tool-card reveal">
        <div class="tool-card-head">
          <span class="tool-logo">${logo
            ? `<img src="${escAttr(logo)}" alt="" width="30" height="30" loading="lazy" decoding="async">`
            : `<span class="monogram" aria-hidden="true">${esc(L(tool.name, lang).trim().charAt(0))}</span>`}</span>
          <div>
            <h3>${esc(L(tool.name, lang))}</h3>
            <p class="muted" style="font-size:var(--fs-xs)">${esc(t(lang, `category.${tool.category}`))}</p>
          </div>
        </div>
        <p>${esc(L(tool.tagline, lang))}</p>
        <div class="tool-card-foot">
          <span class="badge">${esc(t(lang, 'ratings.overall'))} ${esc(tool.ratings?.overall ?? '—')}</span>
          <a class="tool-card-link" href="${escAttr(href)}">${esc(t(lang, 'catalog.open'))}${icon('arrow', 'btn-arrow')}</a>
        </div>
      </article>`;
  }).join('\n      ');

  const steps = [1, 2, 3].map((n) => `<article class="card step-card spot reveal">
        <h3>${esc(t(lang, `home.how${n}t`))}</h3>
        <p>${esc(t(lang, `home.how${n}d`))}</p>
      </article>`).join('\n      ');

  const main = `
<section class="hero">
  <div class="hero-bg" aria-hidden="true">
    <canvas data-hero-canvas></canvas>
    <div class="hero-bg-fallback"></div>
  </div>
  <div class="container hero-inner">
    <p class="eyebrow">${esc(L(config.siteName, lang))}</p>
    <h1>
      <span>${esc(t(lang, 'home.heroA'))}</span>
      <span class="grad-text">${esc(t(lang, 'home.heroB'))}</span>
    </h1>
    <p class="lead">${esc(t(lang, 'home.lead'))}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${escAttr(urlFor(lang, defaultLang, 'catalog.html'))}">${esc(t(lang, 'home.ctaExplore'))}${icon('arrow', 'btn-arrow')}</a>
      <a class="btn btn-ghost" href="${escAttr(urlFor(lang, defaultLang, 'contact.html'))}">${icon('chat')}${esc(t(lang, 'home.ctaContact'))}</a>
    </div>
    <div class="stats">
      <div class="stat reveal"><b>${tools.length}</b><span>${esc(t(lang, 'home.statTools'))}</span></div>
      <div class="stat reveal"><b>${planCount}</b><span>${esc(t(lang, 'home.statPlans'))}</span></div>
      <div class="stat reveal"><b>2</b><span>${esc(t(lang, 'home.statLangs'))}</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">${esc(t(lang, 'nav.catalog'))}</p>
      <h2>${esc(t(lang, 'home.featured'))}</h2>
      <p class="muted">${esc(t(lang, 'home.featuredLead'))}</p>
    </div>
    <div class="tool-grid">
      ${cards}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">${icon('list')}</p>
      <h2>${esc(t(lang, 'home.how'))}</h2>
      <p class="muted">${esc(t(lang, 'home.howLead'))}</p>
    </div>
    <div class="steps">
      ${steps}
    </div>
  </div>
</section>`;

  return renderLayout(ctx, {
    lang,
    relPath: 'index.html',
    navId: 'home',
    entry: 'entry-home.js',
    title: t(lang, 'home.title'),
    description: t(lang, 'home.desc'),
    main,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: L(config.siteName, lang),
      url: config.baseUrl + urlFor(lang, defaultLang, 'index.html'),
      inLanguage: lang,
      description: t(lang, 'home.desc')
    }
  });
}
