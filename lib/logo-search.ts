export type LogoResult = { name: string; domain: string; logoUrl: string; source: 'match' | 'guess' };

export async function searchLogoCandidates(query: string): Promise<LogoResult[]> {
  const q = query.trim();
  if (!q) return [];
  const results: LogoResult[] = [];
  try {
    const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(q)}`, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = (await res.json()) as { name: string; domain: string; logo?: string }[];
      for (const item of data.slice(0, 6)) if (item?.domain) results.push({ name: item.name || q, domain: item.domain, logoUrl: item.logo || `https://logo.clearbit.com/${item.domain}`, source: 'match' });
    }
  } catch {}
  if (!results.length) {
    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (slug) for (const tld of ['com', 'ai', 'io']) {
      const domain = `${slug}.${tld}`;
      results.push({ name: q, domain, logoUrl: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`, source: 'guess' });
    }
  }
  return results;
}
