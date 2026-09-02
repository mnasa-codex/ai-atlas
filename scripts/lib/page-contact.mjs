import { esc, escAttr, L, waHref } from './util.mjs';
import { icon } from './icons.mjs';
import { renderLayout } from './layout.mjs';

export function renderContact(ctx, lang) {
  const { config, t } = ctx;
  const wa = config.contact.whatsapp;
  const fb = config.contact.facebook;
  const generic = waHref({ number: wa.number, text: t(lang, 'contact.waGeneric') });

  const main = `
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">${esc(t(lang, 'nav.contact'))}</p>
      <h1>${esc(t(lang, 'contact.title'))}</h1>
      <p class="lead">${esc(t(lang, 'contact.lead'))}</p>
    </div>

    <div class="contact-cards">
      ${wa.enabled ? `<article class="card spot contact-card reveal">
        <h2 style="font-size:var(--fs-h3)">${icon('whatsapp')} ${esc(t(lang, 'contact.whatsapp'))}</h2>
        <p class="num" dir="ltr">${esc(wa.display)}</p>
        <a class="btn btn-wa btn-block" href="${escAttr(generic)}" target="_blank" rel="noopener noreferrer">${icon('chat')}${esc(t(lang, 'pricing.btnWhatsapp'))}<span class="sr-only"> — ${esc(t(lang, 'common.external'))}</span></a>
        <button class="btn btn-ghost btn-block" type="button" data-copy="${escAttr(wa.display)}" data-copied-msg="${escAttr(t(lang, 'contact.numberCopied'))}">${icon('copy')}${esc(t(lang, 'contact.copyNumber'))}</button>
      </article>` : ''}

      ${fb.enabled ? `<article class="card spot contact-card reveal">
        <h2 style="font-size:var(--fs-h3)">${icon('facebook')} ${esc(t(lang, 'contact.facebook'))}</h2>
        <p class="muted" style="font-size:var(--fs-sm)">${esc(t(lang, 'contact.lead'))}</p>
        <a class="btn btn-fb btn-block" href="${escAttr(fb.messenger)}" target="_blank" rel="noopener noreferrer">${icon('chat')}${esc(t(lang, 'pricing.btnMessenger'))}</a>
        <a class="btn btn-ghost btn-block" href="${escAttr(fb.profile)}" target="_blank" rel="noopener noreferrer">${icon('external')}${esc(t(lang, 'contact.facebook'))}</a>
      </article>` : ''}

      <article class="card spot contact-card reveal">
        <h2 style="font-size:var(--fs-h3)">${icon('clock')} ${esc(t(lang, 'contact.hoursLabel'))}</h2>
        <div class="contact-facts">
          <div><b>${esc(t(lang, 'contact.hoursLabel'))}:</b><span>${esc(L(config.contact.hours, lang))}</span></div>
          <div><b>${esc(t(lang, 'contact.responseLabel'))}:</b><span>${esc(L(config.contact.response_time, lang))}</span></div>
        </div>
        <p class="muted" style="font-size:var(--fs-xs)">${esc(t(lang, 'pricing.disclaimer'))}</p>
      </article>
    </div>
  </div>
</section>`;

  return renderLayout(ctx, {
    lang,
    relPath: 'contact.html',
    navId: 'contact',
    entry: 'entry-contact.js',
    title: `${t(lang, 'contact.title')} | ${L(config.siteName, lang)}`,
    description: t(lang, 'contact.desc'),
    main,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: L(config.siteName, lang),
      url: config.baseUrl,
      contactPoint: [{
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: `+${wa.number}`,
        availableLanguage: ['ar', 'en']
      }]
    }
  });
}
