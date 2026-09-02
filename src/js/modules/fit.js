import { $, $$ } from '../lib/dom.js';

const fmtNum = (n, locale) => new Intl.NumberFormat(locale).format(n);
const fmtMoney = (n, currency, locale) => {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: n < 1 ? 3 : 0 }).format(n); }
  catch { return `${n} ${currency}`; }
};

export function initFit() {
  const root = $('[data-fit]');
  const dataEl = $('#fit-data');
  if (!root || !dataEl) return { destroy() {} };
  let data;
  try { data = JSON.parse(dataEl.textContent); } catch { return { destroy() {} }; }
  const locale = document.documentElement.dataset.locale || 'en-US';
  const S = data.strings || {};
  const metric = data.metric || {};
  const range = $('[data-fit-range]', root);
  const readout = $('[data-fit-readout]', root);
  const eligibleOut = $('[data-fit-eligible]', root);
  const winnerBox = $('[data-fit-winner]', root);
  const rejectBox = $('[data-fit-rejected]', root);
  const resetBtn = $('[data-fit-reset]', root);
  const checks = $$('[data-fit-need]', root);
  if (!range || !readout || !winnerBox || !rejectBox) return { destroy() {} };
  const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
  const fill = (parent, ...nodes) => { parent.textContent = ''; parent.append(...nodes); };
  const tpl = (key, vars = {}) => Object.entries(vars).reduce((out, [k, v]) => out.replaceAll(`{${k}}`, String(v)), S[key] ?? key);
  const needs = () => Object.fromEntries(checks.map((box) => [box.dataset.fitNeed, box.checked]));
  const judge = (plan, volume, need) => {
    const reasons = [];
    if (need.privacy && plan.privacy !== true) reasons.push(S['fit.whyPrivacy']);
    if (need.commercial && plan.commercial !== true) reasons.push(S['fit.whyCommercial']);
    if (need.localPay && !plan.viaAdmin) reasons.push(S['fit.whyPayment']);
    if (!plan.unlimited && typeof plan.capacity === 'number' && plan.capacity < volume) reasons.push(tpl('fit.whyCapacity', { cap: fmtNum(plan.capacity, locale), gap: fmtNum(volume - plan.capacity, locale) }));
    const quotable = typeof plan.price === 'number';
    if (!quotable && !need.localPay && !plan.viaAdmin) reasons.push(S['fit.whyNoPrice']);
    return { plan, ok: reasons.length === 0, reasons, quotable };
  };
  const render = () => {
    const volume = Number(range.value); const need = needs();
    fill(readout, el('span', 'fit-num', fmtNum(volume, locale)), el('span', 'unit', metric.unit));
    const verdicts = data.plans.map((p) => judge(p, volume, need));
    const eligible = verdicts.filter((v) => v.ok); const rejected = verdicts.filter((v) => !v.ok);
    if (eligibleOut) eligibleOut.textContent = tpl('fit.eligible', { n: eligible.length, total: verdicts.length });
    const winner = eligible.filter((v) => v.quotable).sort((a, b) => a.plan.price - b.plan.price)[0] || eligible[0] || null;
    if (!winner) {
      winnerBox.classList.add('is-none');
      const nodes = [el('span', 'label', S['stance.label']), el('h3', null, S['fit.noneTitle']), el('p', 'muted', S['fit.noneDesc'])];
      if (data.adminHref) { const a = el('a', 'btn btn-wa', S['fit.askAdmin']); a.href = data.adminHref; a.target = '_blank'; a.rel = 'noopener noreferrer'; nodes.push(a); }
      fill(winnerBox, ...nodes);
    } else {
      winnerBox.classList.remove('is-none'); const p = winner.plan;
      const nodes = [el('span', 'label', S['fit.recommended']), el('h3', null, p.name)];
      const metrics = el('div', 'fit-metrics');
      const addMetric = (k, v) => { const m = el('div', 'fit-metric'); m.append(el('span', 'k', k), el('span', 'v', v)); metrics.append(m); };
      if (winner.quotable) { addMetric(S['fit.perMonthCost'], fmtMoney(p.price, p.currency, locale)); addMetric(S['fit.perUnit'], volume > 0 ? fmtMoney(p.price / volume, p.currency, locale) : '—'); }
      else addMetric(S['fit.perMonthCost'], S['fit.whyNoPrice']);
      addMetric(p.unlimited ? S['fit.unlimited'] : `${fmtNum(p.capacity ?? 0, locale)} ${metric.unit}`, p.unlimited ? S['fit.covers'] : tpl('fit.headroom', { n: fmtNum(Math.max(0, (p.capacity ?? 0) - volume), locale) }));
      nodes.push(metrics);
      if (!p.unlimited && typeof p.capacity === 'number' && p.capacity > 0) { const cap = el('div', 'cap'); const track = el('div', 'cap-track'); const bar = el('span', 'cap-fill'); bar.style.inlineSize = `${Math.min(100, (volume / p.capacity) * 100)}%`; track.append(bar); cap.append(track, el('span', 'cap-note', `${fmtNum(volume, locale)} / ${fmtNum(p.capacity, locale)} ${metric.unit}`)); nodes.push(cap); }
      if (p.href || data.adminHref) { const a = el('a', p.href ? 'btn btn-primary' : 'btn btn-wa', p.href ? p.ctaLabel : S['fit.askAdmin']); a.href = p.href || data.adminHref; a.target = '_blank'; a.rel = 'noopener noreferrer'; nodes.push(a); }
      fill(winnerBox, ...nodes);
    }
    const nodes = [el('span', null, S['fit.rejectedTitle'])];
    rejected.forEach((v) => { const row = el('div', 'fit-reject'); row.append(el('b', null, v.plan.name), el('span', null, v.reasons.filter(Boolean).join(' · '))); if (!v.plan.unlimited && typeof v.plan.capacity === 'number' && v.plan.capacity < volume && volume > 0) row.append(el('span'), el('span', null, tpl('fit.runsOut', { day: Math.max(1, Math.floor((v.plan.capacity / volume) * 30)) }))); nodes.push(row); });
    fill(rejectBox, ...(rejected.length ? nodes : []));
  };
  let raf = 0; const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };
  range.addEventListener('input', schedule); checks.forEach((box) => box.addEventListener('change', render));
  resetBtn?.addEventListener('click', () => { range.value = String(metric.default); checks.forEach((box) => { box.checked = false; }); render(); });
  render(); return { destroy() { cancelAnimationFrame(raf); } };
}
