// Publication metadata comes only from Europe PMC's indexed PubMed records.
export const API = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
export function plain(value = '') {
  return String(value).replace(/<\/?[a-z][a-z0-9]*(?:\s[^<>]*)?\s*\/?>/gi, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => Number(n) <= 0x10ffff ? String.fromCodePoint(Number(n)) : '').replace(/\s+/g, ' ').trim();
}
export function safeURL(value) {
  try { const u = new URL(value); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
}
export function buildQuery(term, filters = {}, now = new Date()) {
  // Plain keyword search, not an advanced query editor. Keep operators controlled.
  const words = term.replace(/[^\p{L}\p{N}\s-]/gu, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 35);
  if (!words.length) throw new Error('Enter a topic, author or DOI to search.');
  const doi = term.trim().match(/^(?:https:\/\/doi\.org\/)?(10\.\d{4,9}\/\S+)$/i);
  let query = doi ? `DOI:"${doi[1].replace(/["\\]/g, '')}" AND SRC:MED` : `(${words.map(w => `"${w}"`).join(' AND ')}) AND SRC:MED`;
  if (filters.type === 'review') query += ' AND PUB_TYPE:"systematic review"';
  if (filters.type === 'trial') query += ' AND PUB_TYPE:"randomized controlled trial"';
  if (filters.openAccess) query += ' AND OPEN_ACCESS:y';
  if (filters.years && Number.isInteger(Number(filters.years))) {
    query += ` AND FIRST_PDATE:[${now.getFullYear() - Number(filters.years)}-01-01 TO ${now.toISOString().slice(0, 10)}]`;
  }
  if (filters.sort === 'newest') query += ' sort_date:y';
  return query;
}
export function normalizePaper(p) {
  if (p.source !== 'MED' || !/^\d+$/.test(String(p.id)) || !p.title) return null;
  const links = (p.fullTextUrlList?.fullTextUrl || []).filter(l => l.availabilityCode === 'OA' && safeURL(l.url));
  const fullText = links.find(l => l.documentStyle === 'html') || links[0];
  return {
    id: `MED:${p.id}`, pmid: String(p.id), title: plain(p.title), authors: plain(p.authorString || ''),
    authorList: (p.authorList?.author || []).map(a => plain(a.fullName)).filter(Boolean),
    journal: plain(p.journalInfo?.journal?.title || p.journalTitle || ''),
    year: plain(p.pubYear || ''), date: plain(p.firstPublicationDate || ''),
    volume: plain(p.journalInfo?.volume || ''), issue: plain(p.journalInfo?.issue || ''), pages: plain(p.pageInfo || ''),
    doi: /^10\.\d{4,9}\/\S+$/i.test(p.doi || '') ? p.doi : '',
    abstract: plain(p.abstractText || ''), types: (p.pubTypeList?.pubType || []).map(plain),
    openAccess: p.isOpenAccess === 'Y', fullText: fullText ? safeURL(fullText.url) : null,
    retracted: p.isRetracted === 'Y' || (p.pubTypeList?.pubType || []).some(t => /retracted publication/i.test(t)),
    recordURL: `https://pubmed.ncbi.nlm.nih.gov/${p.id}/`,
    indexedURL: `https://europepmc.org/article/MED/${p.id}`,
    retrievedAt: new Date().toISOString()
  };
}
export async function searchPapers(term, filters, cursor = '*', signal) {
  const url = new URL(API);
  const params = { query: buildQuery(term, filters), format: 'json', resultType: 'core', pageSize: '12', cursorMark: cursor };
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url, { signal, credentials: 'omit' });
  if (!response.ok) throw new Error(`The publication service is unavailable (${response.status}). Please try again.`);
  const data = await response.json();
  if (!Number.isFinite(data.hitCount) || !Array.isArray(data.resultList?.result)) throw new Error('The publication service returned an unexpected response. Please try again.');
  return { papers: data.resultList.result.map(normalizePaper).filter(Boolean), total: data.hitCount, nextCursor: data.nextCursorMark };
}
export function citation(p) {
  return `${p.authors || '[Authors unavailable]'} (${p.year || 'date unavailable'}). ${p.title} ${p.journal || '[Journal unavailable]'}${p.volume ? `, ${p.volume}` : ''}${p.pages ? `, ${p.pages}` : ''}. ${p.doi ? `https://doi.org/${p.doi}` : p.recordURL}`;
}
export function toRIS(papers) {
  const clean = v => String(v || '').replace(/[\r\n]/g, ' ');
  return papers.map(p => ['TY  - JOUR', `TI  - ${clean(p.title)}`, ...(p.authorList?.length ? p.authorList : [p.authors]).filter(Boolean).map(a => `AU  - ${clean(a)}`), `JO  - ${clean(p.journal)}`, `PY  - ${clean(p.year)}`, ...(p.doi ? [`DO  - ${clean(p.doi)}`] : []), `UR  - ${p.recordURL}`, `AN  - ${p.pmid}`, 'ER  - '].join('\r\n')).join('\r\n\r\n') + '\r\n';
}
