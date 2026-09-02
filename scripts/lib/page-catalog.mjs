import { esc, escAttr, L, urlFor } from './util.mjs';
import { icon } from './icons.mjs';
import { renderLayout } from './layout.mjs';

export function renderCatalog(ctx, lang, tools) {
  const { config, t, defaultLang } = ctx;

  const priceTag = (tool) => {
    const plans = tool.pricing?.plans || [];
    const tags = [];
    if (plans.some((p) => p.is_free)) tags.push('free');
    if (plans.some((p) => p.contact_for_price !== true && p.price?.amount)) tags.push('paid');
    if (plans.some((p) => p.contact_for_price === true) || tool.pricing?.admin_offer?.enabled) tags.push('contact');
    return tags.join(' ');
  };

  const cards = tools.map((tool) => {
    const href = urlFor(lang, defaultLang, `tools/${tool.slug}.html`);
    const searchable = [L(tool.name, lang), L(tool.tagline, lang), t(lang, `category.${tool.category}`), tool.slug]
      .join(' ').toLowerCase();
    const logo = tool.media?.logo?.url;

    return `<article class="card spot tool-card reveal"
        data-search="${escAttr(searchable)}"
        data-price="${escAttr(priceTag(tool))}">
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

  const filters = ['all', 'free', 'paid', 'contact']
    .map((key) => `<button class="chip" type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${esc(t(lang, `catalog.${key}`))}</button>`)
    .join('\n          ');

  const main = `
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">${esc(t(lang, 'nav.catalog'))}</p>
      <h1>${esc(t(lang, 'catalog.title'))}</h1>
      <p class="lead">${esc(t(lang, 'catalog.lead'))}</p>
    </div>

    <div class="catalog-toolbar reveal">
      <div class="search-field">
        ${icon('search')}
        <label class="sr-only" for="catalog-search">${esc(t(lang, 'catalog.searchLabel'))}</label>
        <input id="catalog-search" type="search" data-search
               placeholder="${escAttr(t(lang, 'catalog.searchPh'))}"
               autocomplete="off" enterkeyhint="search">
      </div>
      <div class="chips" role="group" aria-label="${escAttr(t(lang, 'catalog.filterPrice'))}">
          ${filters}
      </div>
      <p class="result-count" data-count data-template="${escAttr(t(lang, 'catalog.count'))}" aria-live="polite">${esc(t(lang, 'catalog.count', { n: tools.length }))}</p>
    </div>

    <div class="tool-grid" data-tool-grid>
      ${cards}
    </div>

    <div class="empty-state" data-empty>
      <p>${esc(t(lang, 'catalog.empty'))}</p>
      <button class="btn btn-ghost" type="button" data-reset style="margin-block-start:var(--s-16)">${esc(t(lang, 'catalog.reset'))}</button>
    </div>
  </div>
</section>`;

  return renderLayout(ctx, {
    lang,
    relPath: 'catalog.html',
    navId: 'catalog',
    entry: 'entry-catalog.js',
    title: `${t(lang, 'catalog.title')} | ${L(config.siteName, lang)}`,
    description: t(lang, 'catalog.desc'),
    main,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t(lang, 'catalog.title'),
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: L(tool.name, lang),
        url: config.baseUrl + urlFor(lang, defaultLang, `tools/${tool.slug}.html`)
      }))
    }
  });
}
