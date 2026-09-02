const locale = () => document.documentElement.dataset.locale || 'en-US';

export function money(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat(locale(), {
      style: 'currency', currency, maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
