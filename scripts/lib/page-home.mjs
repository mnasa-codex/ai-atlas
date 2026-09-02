import { esc, escAttr, L, bidi, urlFor, money } from './util.mjs';
import { icon } from './icons.mjs';
import { renderLayout } from './layout.mjs';

function renderLedgerRow(ctx, lang, tool) {
  const { t, defaultLang, languages } = ctx;
  const locale = languages.find((l) => l.code === lang)?.locale || 'ar-SA';
  const href = urlFor(lang, defaultLang, `tools/${tool.slug}.html`);
  const plans = [...(tool.pricing?.plans || [])].sort((a,b)=>(a.order??0)-(b.order??0));
  const logo = tool.media?.logo?.url;

  const priceOf = plan => {
    if (plan.is_free) return { text:t(lang,'pricing.free'), contact:false };
    if (plan.contact_for_price === true || plan.price?.amount == null) return { text:t(lang,'pricing.contactBadge'), contact:true };
    return { text:money(plan.price.amount, plan.price.currency, locale), contact:false };
  };

  const tiers = plans.map(plan => {
    const p=priceOf(plan);
    const headline=plan.what_you_get?.headline ? L(plan.what_you_get.headline,lang) : '';
    return `<li class="tier${p.contact?' tier--contact':''}">
      <span class="tier__name">${esc(L(plan.name,lang))}</span>
      <span class="tier__price">${esc(p.text)}</span>
      <span class="tier__cycle">${p.contact?'':esc(t(lang,'pricing.perMonth'))}</span>
      ${headline?`<p class="tier__gist">${bidi(headline,lang)}</p>`:''}
    </li>`;
  }).join('\n');

  const detail = plans.map(plan => {
    const p=priceOf(plan), g=plan.what_you_get||{};
    const quotas=(g.quotas||[]).slice(0,3).map(q=>`<div class="expand__quota"><span>${esc(L(q.label,lang))}</span><b>${esc(L(q.value,lang))} ${esc(L(q.unit,lang))}</b></div>`).join('');
    const yes=(g.unlocked_features||[]).slice(0,3).map(x=>`<li>${icon('check')}<span>${bidi(L(x,lang),lang)}</span></li>`).join('');
    const no=(plan.not_included||[]).slice(0,2).map(x=>`<li>${icon('x')}<span>${bidi(L(x,lang),lang)}</span></li>`).join('');
    return `<div class="expand__tier">
      <h4>${esc(L(plan.name,lang))}<span>${esc(p.text)}</span></h4>
      ${quotas?`<span class="expand__label">${esc(t(lang,'tool.quotas'))}</span>${quotas}`:''}
      ${yes?`<span class="expand__label">${esc(t(lang,'tool.unlocked'))}</span><ul class="expand__list is-yes">${yes}</ul>`:''}
      ${no?`<span class="expand__label">${esc(t(lang,'tool.notIncluded'))}</span><ul class="expand__list is-no">${no}</ul>`:''}
    </div>`;
  }).join('\n');

  return `<article class="ledger__row spot reveal">
    <header class="ledger__head">
      <span class="ledger__logo">${logo?`<img src="${escAttr(logo)}" alt="" width="30" height="30" loading="lazy" decoding="async">`:`<span class="monogram" aria-hidden="true">${esc(L(tool.name,lang).trim().charAt(0))}</span>`}</span>
      <div class="ledger__id"><h3><a href="${escAttr(href)}">${esc(L(tool.name,lang))}</a></h3><p class="ledger__tag">${bidi(L(tool.tagline,lang),lang)}</p></div>
      <div class="ledger__marks">
        <span class="badge badge-accent">${esc(t(lang,`category.${tool.category}`))}</span>
        ${tool.ratings?.overall?`<span class="badge badge-success"><span class="u-mono">${esc(tool.ratings.overall)}</span> / 5</span>`:''}
      </div>
    </header>
    <ol class="tiers">${tiers}</ol>
    <details class="ledger__more">
      <summary>${esc(t(lang,'tool.pricing'))}${icon('chevron')}</summary>
      <div class="expand">${detail}</div>
      <a class="btn btn-ghost btn-sm u-mt-16" href="${escAttr(href)}">${esc(t(lang,'catalog.open'))}${icon('arrow','btn-arrow')}</a>
    </details>
  </article>`;
}

export function renderHome(ctx, lang, tools) {
  const { config, t, defaultLang } = ctx;
  const planCount=tools.reduce((sum,tool)=>sum+(tool.pricing?.plans?.length||0),0);
  const featured=[...tools].sort((a,b)=>(b.ratings?.overall??0)-(a.ratings?.overall??0)).slice(0,6);
  const steps=[1,2,3].map(n=>`<article class="card step-card spot reveal"><h3>${esc(t(lang,`home.how${n}t`))}</h3><p>${esc(t(lang,`home.how${n}d`))}</p></article>`).join('\n');

  const main=`
<section class="hero">
  <div class="hero-bg" aria-hidden="true"><div class="dotfield"></div></div>
  <div class="container hero__grid">
    <div class="hero-inner">
      <p class="eyebrow">${esc(L(config.siteName,lang))}</p>
      <h1><span>${esc(t(lang,'home.heroA'))}</span><span class="grad-text">${esc(t(lang,'home.heroB'))}</span></h1>
      <p class="lead">${esc(t(lang,'home.lead'))}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#ledger">${esc(t(lang,'home.ctaExplore'))}${icon('arrow','btn-arrow')}</a>
        <a class="btn btn-ghost" href="${escAttr(urlFor(lang,defaultLang,'contact.html'))}">${icon('chat')}${esc(t(lang,'home.ctaContact'))}</a>
      </div>
    </div>
    <div class="figure-slot" aria-hidden="true"><canvas data-morph-figure></canvas></div>
  </div>
  <div class="container"><div class="stats">
    <div class="stat reveal"><b>${tools.length}</b><span>${esc(t(lang,'home.statTools'))}</span></div>
    <div class="stat reveal"><b>${planCount}</b><span>${esc(t(lang,'home.statPlans'))}</span></div>
    <div class="stat reveal"><b>2</b><span>${esc(t(lang,'home.statLangs'))}</span></div>
  </div></div>
</section>

<section class="section" id="ledger"><div class="container">
  <div class="section-head reveal"><p class="eyebrow">${esc(t(lang,'nav.catalog'))}</p><h2>${esc(t(lang,'home.featured'))}</h2><p class="muted">${esc(t(lang,'home.featuredLead'))}</p></div>
  <div class="ledger">${featured.map(tool=>renderLedgerRow(ctx,lang,tool)).join('\n')}</div>
  ${tools.length>featured.length?`<a class="btn btn-ghost u-mt-32" href="${escAttr(urlFor(lang,defaultLang,'catalog.html'))}">${esc(t(lang,'catalog.title'))}${icon('arrow','btn-arrow')}</a>`:''}
</div></section>

<section class="section"><div class="container">
  <div class="section-head reveal"><p class="eyebrow">${icon('list')}</p><h2>${esc(t(lang,'home.how'))}</h2><p class="muted">${esc(t(lang,'home.howLead'))}</p></div>
  <div class="steps">${steps}</div>
</div></section>`;

  return renderLayout(ctx,{lang,relPath:'index.html',navId:'home',entry:'entry-home.js',title:t(lang,'home.title'),description:t(lang,'home.desc'),main,jsonLd:{'@context':'https://schema.org','@type':'WebSite',name:L(config.siteName,lang),url:config.baseUrl+urlFor(lang,defaultLang,'index.html'),inLanguage:lang,description:t(lang,'home.desc')}});
}
