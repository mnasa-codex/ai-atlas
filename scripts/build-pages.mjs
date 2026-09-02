import fs from "node:fs";
import path from "node:path";

const config = JSON.parse(fs.readFileSync("site.config.json", "utf-8"));
const arI18n = JSON.parse(fs.readFileSync("i18n/ar.json", "utf-8"));
const enI18n = JSON.parse(fs.readFileSync("i18n/en.json", "utf-8"));
const dictionaries = { ar: arI18n, en: enI18n };

function t(lang, k) { return dictionaries[lang]?.[k] || dictionaries["ar"]?.[k] || k; }

function renderToolPage(tool, lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const otherLang = lang === "ar" ? "en" : "ar";
  const flipHref = lang === "ar" ? "/en/tools/" + tool.slug + ".html" : "/tools/" + tool.slug + ".html";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tool.seo[lang].title} | ${config.siteName[lang]}</title>
  <link rel="stylesheet" href="/src/styles/tokens.css">
  <link rel="stylesheet" href="/src/styles/base.css">
  <link rel="stylesheet" href="/src/styles/components/pricing.css">
  <link rel="stylesheet" href="/src/styles/components/contact.css">
</head>
<body>
  <header style="border-block-end: 1px solid var(--border); padding-block: 16px; background: var(--surface);">
    <div class="site-container" style="display:flex; justify-content:space-between; align-items:center;">
      <a href="/" style="font-weight:800; font-size:1.25rem; color:var(--fg);">⚡ ${config.siteName[lang]}</a>
      <a href="${flipHref}" class="lang-flip-btn">${otherLang.toUpperCase()}</a>
    </div>
  </header>

  <main class="site-container" style="padding-block: 64px;">
    <h1 style="font-size: 3rem; margin-block-end: 16px;">${tool.name[lang]}</h1>
    <p style="font-size: 1.25rem; color: var(--fg-muted); margin-block-end: 32px;">${tool.tagline[lang]}</p>

    <section class="pricing-section">
      <div class="pricing-header">
        <h2 class="pricing-title">${t(lang, "tool.pricingHeading")}</h2>
        <p style="color: var(--fg-muted);">${t(lang, "tool.pricingSubheading")}</p>
      </div>

      <div class="pricing-grid">
        ${tool.pricing.plans.map(plan => {
          const hasPrice = !plan.contact_for_price && plan.price.amount !== null;
          const waUrl = "https://wa.me/" + config.contact.whatsapp.number + "?text=" + encodeURIComponent("مرحباً، أود الاستفسار عن سعر خطة " + plan.name[lang] + " في " + tool.name[lang]);
          return `
            <div class="plan-card ${plan.highlight ? 'highlight' : ''}">
              <div>
                <h3 class="plan-name">${plan.name[lang]}</h3>
                <p style="font-size:0.875rem; color:var(--fg-muted); margin-block: 8px;">${plan.best_for[lang]}</p>
                
                <div class="plan-price-wrapper">
                  ${hasPrice ? `
                    <span class="price-amount">$${plan.price.amount}</span>
                    <span style="color:var(--fg-muted)">${t(lang, "tool.perMonth")}</span>
                  ` : `
                    <div class="contact-pricing-block">
                      <span class="contact-badge">${t(lang, "pricing.contactPriceBadge")}</span>
                      <div style="font-weight:700;">${t(lang, "pricing.contactHeadline")}</div>
                      <div style="font-size:0.8125rem; color:var(--fg-muted)">${t(lang, "pricing.contactDesc")}</div>
                      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-contact btn-whatsapp">💬 ${t(lang, "pricing.btnWhatsapp")}</a>
                      <a href="${config.contact.facebook.messenger}" target="_blank" rel="noopener noreferrer" class="btn-contact btn-messenger">✉️ ${t(lang, "pricing.btnMessenger")}</a>
                    </div>
                  `}
                </div>

                <div style="background:var(--surface-2); padding:12px; border-radius:8px; font-size:0.8125rem; margin-block-end:16px;">
                  💡 ${plan.what_you_get.headline[lang]}
                </div>
              </div>

              ${hasPrice ? `<a href="${plan.cta.url}" target="_blank" rel="noopener noreferrer" class="btn-direct-cta">${t(lang, "pricing.btnDirect")} ↗</a>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </section>
  </main>
</body>
</html>`;
}

fs.mkdirSync("tools", { recursive: true });
fs.mkdirSync("en/tools", { recursive: true });
fs.mkdirSync("data", { recursive: true });

const contentFiles = fs.readdirSync("content").filter(f => f.endsWith(".json"));
const searchIndex = [];

for (const file of contentFiles) {
  const tool = JSON.parse(fs.readFileSync(path.join("content", file), "utf-8"));
  fs.writeFileSync(path.join("tools", tool.slug + ".html"), renderToolPage(tool, "ar"), "utf-8");
  fs.writeFileSync(path.join("en/tools", tool.slug + ".html"), renderToolPage(tool, "en"), "utf-8");
  searchIndex.push({ slug: tool.slug, name: tool.name, tagline: tool.tagline, category: tool.category, logo: tool.media.logo.url });
}

fs.writeFileSync("data/index.json", JSON.stringify(searchIndex, null, 2), "utf-8");
console.log("📄 تم توليد الصفحات الثابتة وفهرس البحث بنجاح!");