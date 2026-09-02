import { esc, escAttr, L, urlFor, waHref, money } from './util.mjs';
import { icon, hasIcon } from './icons.mjs';
import { renderLayout } from './layout.mjs';

const yn = (value, t, lang) =>
  value === true
    ? `<b class="ok">${icon('check')}${esc(t(lang, 'tool.yes'))}</b>`
    : `<b class="no">${icon('x')}${esc(t(lang, 'tool.no'))}</b>`;

function renderPlan(ctx, lang, tool, plan, pageUrl) {
  const { config, t, languages, defaultLang } = ctx;
  const locale = languages.find((l) => l.code === lang).locale;
  const wa = config.contact.whatsapp;
  const fb = config.contact.facebook;
  const g = plan.what_you_get || {};
  const hasPrice = plan.contact_for_price !== true && plan.price?.amount !== null && plan.price?.amount !== undefined;

  const annualPerMonth = plan.price?.annual_amount ? Math.round((plan.price.annual_amount / 12) * 100) / 100 : null;
  const savePct = plan.price?.amount && plan.price.annual_amount
    ? Math.round((1 - plan.price.annual_amount / (plan.price.amount * 12)) * 100)
    : 0;

  let priceBlock;
  if (plan.is_free) {
    priceBlock = `<div class="plan-price"><span class="price-value">${esc(t(lang, 'pricing.free'))}</span></div>`;
  } else if (hasPrice) {
    priceBlock = `<div class="plan-price">
          <div class="price-row">
            <span class="price-value" data-price
                  data-monthly="${escAttr(plan.price.amount)}"
                  data-annual="${escAttr(annualPerMonth ?? plan.price.amount)}"
                  data-currency="${escAttr(plan.price.currency)}">${esc(money(plan.price.amount, plan.price.currency, locale))}</span>
            <span class="price-cycle">${esc(t(lang, 'pricing.perMonth'))}</span>
          </div>
          <span class="price-note" data-price-note
                data-monthly-note="${escAttr(t(lang, 'pricing.monthlyNote'))}"
                data-annual-note="${escAttr(t(lang, 'pricing.annualNote', { total: money(plan.price.annual_amount ?? 0, plan.price.currency, locale) }))}">${esc(t(lang, 'pricing.monthlyNote'))}</span>
          ${plan.price.note ? `<span class="price-note">${esc(L(plan.price.note, lang))}</span>` : ''}
          ${savePct > 0 ? `<span class="badge badge-success">${esc(t(lang, 'pricing.save', { p: savePct }))}</span>` : ''}
        </div>`;
  } else {
    const text = t(lang, 'contact.waTemplate', {
      plan: L(plan.name, lang),
      tool: L(tool.name, lang),
      url: pageUrl
    });
    priceBlock = `<div class="plan-price">
          <div class="contact-block">
            <span class="badge badge-warning">${icon('chat')}${esc(t(lang, 'pricing.contactBadge'))}</span>
            <strong>${esc(t(lang, 'pricing.contactHeadline'))}</strong>
            <p>${esc(t(lang, 'pricing.contactDesc'))}</p>
            ${wa.enabled ? `<a class="btn btn-wa btn-block" href="${escAttr(waHref({ number: wa.number, text }))}" target="_blank" rel="noopener noreferrer" aria-label="${escAttr(`${t(lang, 'pricing.btnWhatsapp')} — ${L(plan.name, lang)} — ${t(lang, 'common.external')}`)}">${icon('whatsapp')}${esc(t(lang, 'pricing.btnWhatsapp'))}</a>` : ''}
            ${fb.enabled ? `<a class="btn btn-fb btn-block" href="${escAttr(fb.messenger)}" target="_blank" rel="noopener noreferrer" aria-label="${escAttr(`${t(lang, 'pricing.btnMessenger')} — ${t(lang, 'common.external')}`)}">${icon('facebook')}${esc(t(lang, 'pricing.btnMessenger'))}</a>` : ''}
          </div>
        </div>`;
  }

  const quotas = (g.quotas || []).map((q) => `<div class="quota">
            <span class="quota-label">${esc(L(q.label, lang))}</span>
            <span class="quota-value">${esc(L(q.value, lang))} <span class="quota-unit">${esc(L(q.unit, lang))}</span>
              ${q.overage ? `<span class="quota-over">${esc(L(q.overage, lang))}</span>` : ''}
            </span>
          </div>`).join('\n          ');

  const list = (items, cls, iconName) => (items || []).length
    ? `<ul class="plan-list ${cls}">${items.map((i) => `<li>${icon(iconName)}<span>${esc(L(i, lang))}</span></li>`).join('')}</ul>`
    : '';

  const facts = [
    ['tool.commercial', g.commercial_use],
    ['tool.privacyMode', g.privacy_mode],
    ['tool.api', g.api_access]
  ].map(([key, value]) => `<div class="plan-fact"><span>${esc(t(lang, key))}</span>${yn(value === true, t, lang)}</div>`).join('');

  const trainingFact = `<div class="plan-fact"><span>${esc(t(lang, 'tool.training'))}</span>${
    g.data_used_for_training === true
      ? `<b class="no">${icon('check')}${esc(t(lang, 'tool.yes'))}</b>`
      : `<b class="ok">${icon('x')}${esc(t(lang, 'tool.no'))}</b>`
  }</div>`;

  const textFacts = [
    ['tool.speed', g.speed_and_priority],
    ['tool.support', g.support],
    ['tool.storage', g.storage],
    ['tool.collab', g.collaboration]
  ].filter(([, v]) => v).map(([key, value]) =>
    `<div class="plan-fact"><span>${esc(t(lang, key))}</span><b>${esc(L(value, lang))}</b></div>`).join('');

  return `<article class="plan spot reveal${plan.highlight ? ' is-highlight' : ''}">
        ${plan.highlight ? `<span class="plan-flag">${esc(t(lang, 'tool.mostPopular'))}</span>` : ''}
        <div>
          <h3 class="plan-name">${esc(L(plan.name, lang))}</h3>
          <p class="plan-best">${esc(t(lang, 'tool.bestFor'))}: ${esc(L(plan.best_for, lang))}</p>
        </div>
        ${priceBlock}
        ${g.headline ? `<p class="plan-headline">${esc(L(g.headline, lang))}</p>` : ''}
        ${quotas ? `<div class="plan-block"><h4>${esc(t(lang, 'tool.quotas'))}</h4><div class="quotas">${quotas}</div></div>` : ''}
        ${g.unlocked_features?.length ? `<div class="plan-block"><h4>${esc(t(lang, 'tool.unlocked'))}</h4>${list(g.unlocked_features, 'is-yes', 'check')}</div>` : ''}
        ${g.limits_and_caps?.length ? `<div class="plan-block"><h4>${esc(t(lang, 'tool.limits'))}</h4>${list(g.limits_and_caps, 'is-up', 'info')}</div>` : ''}
        ${plan.not_included?.length ? `<div class="plan-block"><h4>${esc(t(lang, 'tool.notIncluded'))}</h4>${list(plan.not_included, 'is-no', 'x')}</div>` : ''}
        ${plan.upgrade_triggers?.length ? `<div class="plan-block"><h4>${esc(t(lang, 'tool.upgradeWhen'))}</h4>${list(plan.upgrade_triggers, 'is-up', 'arrow')}</div>` : ''}
        ${g.models_access?.length ? `<div class="plan-block"><h4>${esc(t(lang, 'tool.models'))}</h4><div class="chips">${g.models_access.map((m) => `<span class="badge">${esc(m)}</span>`).join('')}</div></div>` : ''}
        <div class="plan-block"><h4>${esc(t(lang, 'tool.limits'))}</h4><div class="plan-facts">${facts}${trainingFact}${textFacts}${g.sla ? `<div class="plan-fact"><span>${esc(t(lang, 'tool.sla'))}</span><b>${esc(g.sla)}</b></div>` : ''}</div></div>
        ${plan.value_verdict ? `<p class="plan-verdict"><strong>${esc(t(lang, 'tool.verdictPlan'))}</strong>${esc(L(plan.value_verdict, lang))}</p>` : ''}
        ${hasPrice && plan.cta?.url ? `<div class="plan-cta"><a class="btn btn-primary btn-block" href="${escAttr(plan.cta.url)}" target="_blank" rel="noopener noreferrer">${esc(t(lang, 'pricing.btnDirect'))}${icon('external')}<span class="sr-only"> — ${esc(t(lang, 'common.external'))}</span></a></div>` : ''}
      </article>`;
}

function renderAdminOffer(ctx, lang, tool, offer, pageUrl) {
  const { config, t } = ctx;
  const wa = config.contact.whatsapp;
  const fb = config.contact.facebook;
  const text = t(lang, 'contact.waTemplate', {
    plan: L(offer.name, lang),
    tool: L(tool.name, lang),
    url: pageUrl
  });

  return `<article class="plan is-admin spot reveal">
        <div>
          <h3 class="plan-name">${esc(L(offer.name, lang))}</h3>
          <p class="plan-best">${esc(t(lang, 'tool.bestFor'))}: ${esc(L(offer.best_for, lang))}</p>
        </div>
        <div class="plan-price">
          <div class="contact-block">
            <span class="badge badge-warning">${icon('chat')}${esc(t(lang, 'pricing.contactBadge'))}</span>
            <strong>${esc(L(offer.headline, lang))}</strong>
            <p>${esc(t(lang, 'pricing.contactDesc'))}</p>
            ${wa.enabled ? `<a class="btn btn-wa btn-block" href="${escAttr(waHref({ number: wa.number, text }))}" target="_blank" rel="noopener noreferrer" aria-label="${escAttr(`${t(lang, 'pricing.btnWhatsapp')} — ${L(offer.name, lang)} — ${t(lang, 'common.external')}`)}">${icon('whatsapp')}${esc(t(lang, 'pricing.btnWhatsapp'))}</a>` : ''}
            ${fb.enabled ? `<a class="btn btn-fb btn-block" href="${escAttr(fb.messenger)}" target="_blank" rel="noopener noreferrer">${icon('facebook')}${esc(t(lang, 'pricing.btnMessenger'))}</a>` : ''}
          </div>
        </div>
        ${offer.includes?.length ? `<div class="plan-block"><h4>${esc(t(lang, 'tool.unlocked'))}</h4><ul class="plan-list is-yes">${offer.includes.map((i) => `<li>${icon('check')}<span>${esc(L(i, lang))}</span></li>`).join('')}</ul></div>` : ''}
        <p class="plan-verdict"><strong>${esc(t(lang, 'pricing.adminOffer'))}</strong>${esc(L(offer.disclaimer, lang))}</p>
      </article>`;
}

export function renderTool(ctx, lang, tool) {
  const { config, t, defaultLang, languages } = ctx;
  const locale = languages.find((l) => l.code === lang).locale;
  const relPath = `tools/${tool.slug}.html`;
  const pageUrl = config.baseUrl + urlFor(lang, defaultLang, relPath);
  const isDraft = tool.meta?.status !== 'published';
  const pricing = tool.pricing || {};
  const plans = [...(pricing.plans || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sections = [
    ['overview', 'tool.overview'],
    ['what-it-does', 'tool.whatItDoes'],
    ['features', 'tool.features'],
    ['use-cases', 'tool.useCases'],
    tool.media?.screenshots?.length ? ['gallery', 'tool.gallery'] : null,
    ['start', 'tool.start'],
    ['pricing', 'tool.pricing'],
    ['pros-cons', 'tool.prosCons'],
    ['privacy', 'tool.privacy'],
    ['ratings', 'tool.ratings'],
    tool.faq?.length ? ['faq', 'tool.faq'] : null,
    ['verdict', 'tool.verdict']
  ].filter(Boolean);

  const subnav = sections
    .map(([id, key]) => `<a href="#${id}">${esc(t(lang, key))}</a>`)
    .join('\n        ');

  const logo = tool.media?.logo?.url;

  const features = (tool.key_features || []).map((f) => `<article class="card feature-card spot reveal">
        <h3><span class="feature-icon">${icon(hasIcon(f.icon) ? f.icon : 'sparkles')}</span>${esc(L(f.title, lang))}</h3>
        <p>${esc(L(f.description, lang))}</p>
        ${f.impact ? `<span class="badge badge-accent">${esc(t(lang, 'tool.mostPopular'))}: ${esc(f.impact)}</span>` : ''}
      </article>`).join('\n      ');

  const useCases = (tool.use_cases || []).map((u) => `<article class="card spot reveal">
        <h3>${esc(L(u.persona, lang))}</h3>
        <p class="muted" style="font-size:var(--fs-sm)">${esc(L(u.scenario, lang))}</p>
        <ul class="icon-list" style="margin-block-start:var(--s-12)">
          <li>${icon('check', 'i-yes')}<span>${esc(L(u.outcome, lang))}</span></li>
          ${u.time_saved ? `<li>${icon('clock', 'i-dot')}<span>${esc(t(lang, 'tool.timeSaved'))}: ${esc(L(u.time_saved, lang))}</span></li>` : ''}
        </ul>
      </article>`).join('\n      ');

  const gallery = (tool.media?.screenshots || []).map((s) => `<figure>
          <button type="button" data-lightbox="${escAttr(s.url)}" data-alt="${escAttr(L(s.alt, lang))}" data-caption="${escAttr(L(s.caption, lang))}">
            <img src="${escAttr(s.url)}" alt="${escAttr(L(s.alt, lang))}" width="${escAttr(s.width)}" height="${escAttr(s.height)}" loading="lazy" decoding="async">
          </button>
          <figcaption>${esc(L(s.caption, lang))}</figcaption>
        </figure>`).join('\n        ');

  const timeline = (tool.how_to_start || []).map((s) => `<li>
          <h3>${esc(t(lang, 'tool.step'))} ${s.step} — ${esc(L(s.title, lang))}</h3>
          <p>${esc(L(s.detail, lang))}</p>
        </li>`).join('\n        ');

  const bullets = (items, iconName, cls) => (items || []).length
    ? `<ul class="icon-list">${items.map((i) => `<li>${icon(iconName, cls)}<span>${esc(L(i, lang))}</span></li>`).join('')}</ul>`
    : '';

  const ratings = Object.entries(tool.ratings || {}).map(([key, value]) => {
    const pct = Math.round((Number(value) / 5) * 100);
    return `<div class="rating-row">
          <span>${esc(t(lang, `ratings.${key}`))}</span>
          <b>${esc(value)}<span class="muted" style="font-size:var(--fs-xs)"> / 5</span></b>
          <span class="bar" data-bar="${pct}" role="img" aria-label="${escAttr(`${t(lang, `ratings.${key}`)}: ${value} / 5`)}"><i></i></span>
        </div>`;
  }).join('\n        ');

  const faq = (tool.faq || []).map((item) => `<details>
          <summary>${esc(L(item.q, lang))}${icon('chevron')}</summary>
          <p>${esc(L(item.a, lang))}</p>
        </details>`).join('\n        ');

  const compareTable = pricing.comparison_rows?.length ? `<div style="overflow-x:auto;margin-block-start:var(--s-32)">
        <table class="info-table">
          <thead><tr><th>${esc(t(lang, 'tool.pricing'))}</th>${plans.map((p) => `<th>${esc(L(p.name, lang))}</th>`).join('')}</tr></thead>
          <tbody>
            ${pricing.comparison_rows.map((row) => `<tr><th>${esc(L(row.label, lang))}</th>${plans.map((p) => `<td>${esc(L(row.values?.[p.id] ?? '—', lang))}</td>`).join('')}</tr>`).join('\n            ')}
          </tbody>
        </table>
      </div>` : '';

  const privacyRows = [
    ['tool.retention', L(tool.privacy_security?.retention, lang)],
    ['tool.optOut', tool.privacy_security?.opt_out_training === true ? t(lang, 'tool.yes') : t(lang, 'tool.no')],
    ['tool.gdpr', tool.privacy_security?.gdpr === true ? t(lang, 'tool.yes') : t(lang, 'tool.no')],
    ['tool.soc2', tool.privacy_security?.soc2 === true ? t(lang, 'tool.yes') : t(lang, 'tool.no')],
    ['tool.hosting', L(tool.privacy_security?.region_hosting, lang)],
    ['tool.api', tool.api?.available === true ? t(lang, 'tool.yes') : t(lang, 'tool.no')],
    ['tool.rateLimits', L(tool.api?.rate_limits, lang)]
  ].filter(([, v]) => v).map(([key, value]) =>
    `<tr><th>${esc(t(lang, key))}</th><td>${esc(value)}</td></tr>`).join('\n          ');

  const wa = config.contact.whatsapp;
  const bottomWa = waHref({
    number: wa.number,
    text: t(lang, 'contact.waTemplate', { plan: L(plans[0]?.name ?? { ar: '—', en: '—' }, lang), tool: L(tool.name, lang), url: pageUrl })
  });

  const main = `
<section class="tool-hero">
  <div class="hero-bg" aria-hidden="true"><div class="hero-bg-fallback"></div></div>
  <div class="container tool-hero-inner">
    ${isDraft ? `<div class="notice">${icon('alert')}<span>${esc(t(lang, 'tool.draft'))}</span></div>` : ''}
    <div class="tool-id">
      <span class="tool-logo">${logo
        ? `<img src="${escAttr(logo)}" alt="" width="42" height="42">`
        : `<span class="monogram" aria-hidden="true">${esc(L(tool.name, lang).trim().charAt(0))}</span>`}</span>
      <div>
        <h1>${esc(L(tool.name, lang))}</h1>
        <p class="muted" style="font-size:var(--fs-sm)">${esc(tool.vendor?.name)} · ${esc(L(tool.vendor?.country, lang))} · ${esc(tool.vendor?.founded)}</p>
      </div>
    </div>
    <p class="lead">${esc(L(tool.tagline, lang))}</p>
    <div class="tool-meta">
      <span class="badge badge-accent">${esc(t(lang, `category.${tool.category}`))}</span>
      <span class="badge">${esc(t(lang, 'tool.platforms'))}: ${esc((tool.platforms || []).join(' · '))}</span>
      <span class="badge">${esc(t(lang, 'tool.arabicPrompt'))}: ${esc(tool.arabic_support?.prompt_quality ?? '—')}</span>
      <span class="badge">${esc(t(lang, 'tool.verifiedAt'))}: ${esc(tool.meta?.last_verified ?? '—')}</span>
      <span class="badge badge-success score">${esc(tool.ratings?.overall ?? '—')}<small> / 5</small></span>
    </div>
    <div class="tool-hero-actions">
      ${tool.links?.website ? `<a class="btn btn-primary" href="${escAttr(tool.links.website)}" target="_blank" rel="noopener noreferrer">${esc(t(lang, 'tool.visit'))}${icon('external')}<span class="sr-only"> — ${esc(t(lang, 'common.external'))}</span></a>` : ''}
      ${tool.links?.docs ? `<a class="btn btn-ghost" href="${escAttr(tool.links.docs)}" target="_blank" rel="noopener noreferrer">${esc(t(lang, 'tool.docs'))}${icon('external')}</a>` : ''}
      <a class="btn btn-ghost" href="#pricing">${icon('list')}${esc(t(lang, 'tool.pricing'))}</a>
    </div>
  </div>
</section>

<nav class="subnav" aria-label="${escAttr(t(lang, 'tool.onThisPage'))}">
  <div class="container">
    <div class="subnav-scroll">
      ${subnav}
    </div>
  </div>
</nav>

<section class="section" id="overview">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.overview'))}</h2></div>
    <div class="prose reveal">
      <p>${esc(L(tool.summary, lang))}</p>
      ${L(tool.long_description, lang).split('\n\n').filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="what-it-does">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.whatItDoes'))}</h2></div>
    <div class="reveal">${bullets(tool.what_it_does, 'check', 'i-yes')}</div>
    ${tool.how_it_works ? `<div class="card spot reveal" style="margin-block-start:var(--s-32);max-inline-size:78ch">
      <h3 style="margin-block-end:var(--s-8)">${esc(t(lang, 'tool.howItWorks'))}</h3>
      <p class="muted" style="font-size:var(--fs-sm)">${esc(L(tool.how_it_works, lang))}</p>
    </div>` : ''}
  </div>
</section>

<section class="section" id="features">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.features'))}</h2></div>
    <div class="grid grid-3">
      ${features}
    </div>
  </div>
</section>

<section class="section" id="use-cases">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.useCases'))}</h2></div>
    <div class="grid grid-3">
      ${useCases}
    </div>
  </div>
</section>

${gallery ? `<section class="section" id="gallery">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.gallery'))}</h2></div>
    <div class="gallery">
        ${gallery}
    </div>
  </div>
</section>` : ''}

<section class="section" id="start">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.start'))}</h2></div>
    <ol class="timeline reveal">
        ${timeline}
    </ol>
    ${tool.pro_tips?.length ? `<div class="card spot reveal" style="margin-block-start:var(--s-32);max-inline-size:78ch">
      <h3 style="margin-block-end:var(--s-12)">${esc(t(lang, 'tool.tips'))}</h3>
      ${bullets(tool.pro_tips, 'sparkles', 'i-dot')}
    </div>` : ''}
  </div>
</section>

<section class="section" id="pricing" data-pricing data-cycle="monthly">
  <div class="container">
    <div class="pricing-head reveal">
      <div class="section-head" style="margin-block-end:0">
        <p class="eyebrow">${esc(t(lang, 'tool.pricing'))}</p>
        <h2>${esc(t(lang, 'tool.pricing'))}</h2>
        <p class="muted">${esc(t(lang, 'tool.pricingLead'))}</p>
      </div>
      ${pricing.verify_required ? `<div class="notice">${icon('alert')}<span>${esc(t(lang, 'pricing.verifyWarning'))}</span></div>` : ''}
      <div class="cycle-switch" role="group" aria-label="${escAttr(t(lang, 'tool.pricing'))}">
        <button type="button" data-cycle-btn="monthly" class="is-active" aria-pressed="true">${esc(t(lang, 'pricing.monthly'))}</button>
        <button type="button" data-cycle-btn="annual" aria-pressed="false">${esc(t(lang, 'pricing.annual'))}</button>
      </div>
    </div>

    <div class="plans">
      ${plans.map((plan) => renderPlan(ctx, lang, tool, plan, pageUrl)).join('\n      ')}
      ${pricing.admin_offer?.enabled ? renderAdminOffer(ctx, lang, tool, pricing.admin_offer, pageUrl) : ''}
    </div>

    ${compareTable}

    <div class="pricing-foot">
      <span>${esc(t(lang, 'pricing.updatedAt'))}: ${esc(pricing.updated_at ?? '—')}</span>
      ${pricing.note ? `<span>${esc(L(pricing.note, lang))}</span>` : ''}
      <span>${esc(t(lang, 'pricing.disclaimer'))}${tool.links?.pricing ? ` <a href="${escAttr(tool.links.pricing)}" target="_blank" rel="noopener noreferrer">${esc(t(lang, 'tool.docs'))}</a>` : ''}</span>
    </div>
  </div>
</section>

<section class="section" id="pros-cons">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.prosCons'))}</h2></div>
    <div class="two-col">
      <div class="card spot reveal">
        <h3 style="margin-block-end:var(--s-12)">${esc(t(lang, 'tool.strengths'))}</h3>
        ${bullets(tool.strengths, 'check', 'i-yes')}
      </div>
      <div class="card spot reveal">
        <h3 style="margin-block-end:var(--s-12)">${esc(t(lang, 'tool.limitations'))}</h3>
        ${bullets(tool.limitations, 'x', 'i-no')}
      </div>
    </div>
    ${tool.not_good_for?.length ? `<div class="card spot reveal" style="margin-block-start:var(--s-24)">
      <h3 style="margin-block-end:var(--s-12)">${esc(t(lang, 'tool.notGoodFor'))}</h3>
      ${bullets(tool.not_good_for, 'x', 'i-no')}
    </div>` : ''}
  </div>
</section>

<section class="section" id="privacy">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.privacy'))}</h2></div>
    <div class="card spot reveal" style="max-inline-size:78ch">
      <table class="info-table">
        <tbody>
          ${privacyRows}
        </tbody>
      </table>
      ${tool.privacy_security?.note ? `<p class="muted" style="font-size:var(--fs-sm);margin-block-start:var(--s-16)">${esc(L(tool.privacy_security.note, lang))}</p>` : ''}
    </div>
  </div>
</section>

<section class="section" id="ratings">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.ratings'))}</h2></div>
    <div class="ratings reveal">
        ${ratings}
    </div>
  </div>
</section>

${faq ? `<section class="section" id="faq">
  <div class="container">
    <div class="section-head reveal"><h2>${esc(t(lang, 'tool.faq'))}</h2></div>
    <div class="faq reveal">
        ${faq}
    </div>
  </div>
</section>` : ''}

<section class="section" id="verdict">
  <div class="container">
    <div class="verdict spot reveal">
      <h2 style="margin-block-end:var(--s-16)">${esc(t(lang, 'tool.verdict'))}</h2>
      <p>${esc(L(tool.verdict, lang))}</p>
    </div>
    <div class="cta-band reveal" style="margin-block-start:var(--s-32)">
      <div>
        <h3>${esc(t(lang, 'tool.ctaBottom'))}</h3>
        <p>${esc(t(lang, 'tool.ctaBottomLead'))}</p>
      </div>
      <div class="btn-row">
        ${wa.enabled ? `<a class="btn btn-wa" href="${escAttr(bottomWa)}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}${esc(t(lang, 'pricing.btnWhatsapp'))}</a>` : ''}
        ${config.contact.facebook.enabled ? `<a class="btn btn-fb" href="${escAttr(config.contact.facebook.messenger)}" target="_blank" rel="noopener noreferrer">${icon('facebook')}${esc(t(lang, 'pricing.btnMessenger'))}</a>` : ''}
      </div>
    </div>
  </div>
</section>

<dialog class="lightbox" id="lightbox" aria-label="${escAttr(t(lang, 'tool.gallery'))}">
  <figure style="margin:0">
    <img src="" alt="">
    <figcaption></figcaption>
  </figure>
  <button class="lightbox-close" type="button" aria-label="${escAttr(t(lang, 'common.toTop'))}">${icon('x')}</button>
</dialog>`;

  // JSON-LD: offers للخطط ذات السعر الرقمي فقط — لا سعر وهمي للخطط بالتواصل
  const offers = plans
    .filter((p) => p.contact_for_price !== true && p.price?.amount !== null && p.price?.amount !== undefined)
    .map((p) => ({
      '@type': 'Offer',
      name: L(p.name, lang),
      price: p.price.amount,
      priceCurrency: p.price.currency,
      availability: 'https://schema.org/InStock',
      url: p.cta?.url || tool.links?.pricing || tool.links?.website
    }));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: L(tool.name, lang),
      applicationCategory: 'MultimediaApplication',
      operatingSystem: (tool.platforms || []).join(', '),
      description: L(tool.summary, lang),
      inLanguage: lang,
      url: tool.links?.website,
      ...(offers.length ? { offers } : {}),
      ...(tool.ratings?.overall ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: tool.ratings.overall,
          bestRating: 5,
          ratingCount: 1,
          author: { '@type': 'Organization', name: L(config.siteName, lang) }
        }
      } : {})
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: L(config.siteName, lang), item: config.baseUrl + urlFor(lang, defaultLang, 'index.html') },
        { '@type': 'ListItem', position: 2, name: t(lang, 'nav.catalog'), item: config.baseUrl + urlFor(lang, defaultLang, 'catalog.html') },
        { '@type': 'ListItem', position: 3, name: L(tool.name, lang), item: pageUrl }
      ]
    }
  ];

  if (tool.faq?.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faq.map((item) => ({
        '@type': 'Question',
        name: L(item.q, lang),
        acceptedAnswer: { '@type': 'Answer', text: L(item.a, lang) }
      }))
    });
  }

  return renderLayout(ctx, {
    lang,
    relPath,
    navId: 'catalog',
    entry: 'entry-tool.js',
    title: `${L(tool.seo?.[lang]?.title ?? tool.name, lang) || L(tool.name, lang)} | ${L(config.siteName, lang)}`,
    description: tool.seo?.[lang]?.description || L(tool.summary, lang),
    ogImage: L(tool.media?.og_image, lang) || tool.media?.screenshots?.[0]?.url || null,
    noindex: isDraft,
    main,
    jsonLd
  });
}
