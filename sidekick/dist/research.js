// Publication metadata comes only from Europe PMC's indexed PubMed records.
export const API = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
export function plain(value = '') {
  return String(value).replace(/<\/?[a-z][a-z0-9]*(?:\s[^<>]*)?\s*\/?>/gi, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => Number(n) <= 0x10ffff ? String.fromCodePoint(Number(n)) : '').replace(/\s+/g, ' ').trim();
}
export function safeURL(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch { return null; }
}
export function identifyPaper(term = '') {
  const text = term.trim();
  const pmid = text.match(/^(?:PMID\s*:\s*)?(\d{1,9})$/i);
  if (pmid) return { kind: 'PMID', value: pmid[1] };
  const doi = text.match(/^(?:DOI\s*:\s*|https:\/\/(?:dx\.)?doi\.org\/)?(10\.\d{4,9}\/[^\s"<>\\]+)$/i);
  if (doi) return { kind: 'DOI', value: doi[1] };
  try {
    const u = new URL(text);
    if (u.protocol === 'https:' && u.hostname === 'pubmed.ncbi.nlm.nih.gov' && /^\/\d{1,9}\/?$/.test(u.pathname)) return { kind: 'PMID', value: u.pathname.replaceAll('/', '') };
  } catch { /* Ordinary keywords are not URLs. */ }
  return null;
}
export const defaultFilters = { type: 'all', years: '', openAccess: false, sort: 'relevance', match: 'all', field: 'titleAbstract', author: '' };
const wordsFor = text => String(text).normalize('NFKC').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').trim().split(/\s+/).filter(Boolean);
export function buildQuery(term, filters = {}, now = new Date()) {
  if (term.length > 250) throw new Error('Use up to 250 characters for your search.');
  const identifier = identifyPaper(term);
  // Exact lookups intentionally bypass discovery filters so a known paper is not hidden.
  if (identifier) return identifier.kind === 'PMID' ? `EXT_ID:${identifier.value} AND SRC:MED` : `DOI:"${identifier.value}" AND SRC:MED`;
  if (/^(https?:\/\/|doi\s*:|pmid\s*:|10\.\d{4,9}\/)/i.test(term.trim())) throw new Error('Enter a complete DOI, PMID or HTTPS PubMed link. For topics, use keywords instead of a website address.');
  const words = wordsFor(term);
  const author = wordsFor(filters.author || '').join(' ');
  if (!words.length && !author) throw new Error('Enter a topic, paper title, author, DOI or PMID.');
  if (words.length > 35 || author.length > 100) throw new Error('Please shorten your keywords or author name.');
  const prefix = filters.field === 'title' ? 'TITLE:' : filters.field === 'all' ? '' : 'TITLE_ABS:';
  const expression = filters.match === 'phrase' ? `${prefix}"${words.join(' ')}"` : words.map(w => `${prefix}"${w}"`).join(filters.match === 'any' ? ' OR ' : ' AND ');
  let query = `${words.length ? `(${expression}) AND ` : ''}SRC:MED`;
  if (author) query += ` AND AUTH:"${author}"`;
  if (filters.type === 'review') query += ' AND PUB_TYPE:"systematic review"';
  if (filters.type === 'trial') query += ' AND PUB_TYPE:"randomized controlled trial"';
  if (filters.openAccess) query += ' AND OPEN_ACCESS:y';
  if (['2', '5'].includes(String(filters.years))) {
    const since = new Date(now); since.setUTCFullYear(now.getUTCFullYear() - Number(filters.years));
    query += ` AND FIRST_PDATE:[${since.toISOString().slice(0, 10)} TO ${now.toISOString().slice(0, 10)}]`;
  }
  if (filters.sort === 'newest') query += ' sort_date:y';
  return query;
}
export function normalizePaper(p) {
  if (p.source !== 'MED' || !/^\d+$/.test(String(p.id)) || !p.title) return null;
  const links = (p.fullTextUrlList?.fullTextUrl || []).filter(l => l.availabilityCode === 'OA' && safeURL(l.url));
  const uniqueLinks = [...new Map(links.map(l => [safeURL(l.url), { url: safeURL(l.url), style: l.documentStyle || 'full text', provider: plain(l.site || 'Indexed source') }])).values()];
  const fullText = uniqueLinks.find(l => l.style === 'html') || uniqueLinks[0];
  return {
    id: `MED:${p.id}`, pmid: String(p.id), title: plain(p.title), authors: plain(p.authorString || ''),
    authorList: (p.authorList?.author || []).map(a => plain(a.fullName)).filter(Boolean),
    journal: plain(p.journalInfo?.journal?.title || p.journalTitle || ''),
    year: plain(p.pubYear || ''), date: plain(p.firstPublicationDate || ''),
    volume: plain(p.journalInfo?.volume || ''), issue: plain(p.journalInfo?.issue || ''), pages: plain(p.pageInfo || ''),
    doi: /^10\.\d{4,9}\/\S+$/i.test(p.doi || '') ? p.doi : '',
    abstract: plain(p.abstractText || ''), types: (p.pubTypeList?.pubType || []).map(plain),
    openAccess: p.isOpenAccess === 'Y', fullText: fullText?.url || null, fullTextLinks: uniqueLinks,
    retracted: p.isRetracted === 'Y' || (p.pubTypeList?.pubType || []).some(t => /retracted publication/i.test(t)),
    recordURL: `https://pubmed.ncbi.nlm.nih.gov/${p.id}/`,
    indexedURL: `https://europepmc.org/article/MED/${p.id}`,
    retrievedAt: new Date().toISOString()
  };
}
export async function searchPapers(term, filters, cursor = '*', signal, { timeoutMs = 25000 } = {}) {
  const url = new URL(API);
  const params = { query: buildQuery(term, filters), format: 'json', resultType: 'core', pageSize: '12', cursorMark: cursor };
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const request = new AbortController();
  let timedOut = false;
  const cancel = () => request.abort();
  if (signal?.aborted) request.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; request.abort(); }, timeoutMs);
  try {
    const response = await fetch(url, { signal: request.signal, credentials: 'omit' });
    if (!response.ok) throw new Error(`The publication service is unavailable (${response.status}). Please try again.`);
    const data = await response.json();
    if (!Number.isFinite(data.hitCount) || !Array.isArray(data.resultList?.result)) throw new Error('The publication service returned an unexpected response. Please try again.');
    return { papers: data.resultList.result.map(normalizePaper).filter(Boolean), total: data.hitCount, nextCursor: data.nextCursorMark, query: params.query, identifier: identifyPaper(term) };
  } catch (error) {
    if (timedOut) throw new Error('The publication service took too long. Try again or use fewer keywords.');
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
}
export function citation(p) {
  return `${p.authors || '[Authors unavailable]'} (${p.year || 'date unavailable'}). ${p.title} ${p.journal || '[Journal unavailable]'}${p.volume ? `, ${p.volume}` : ''}${p.pages ? `, ${p.pages}` : ''}. ${p.doi ? `https://doi.org/${p.doi}` : p.recordURL}`;
}
export function toRIS(papers) {
  const clean = v => String(v || '').replace(/[\r\n]/g, ' ');
  return papers.map(p => ['TY  - JOUR', `TI  - ${clean(p.title)}`, ...(p.authorList?.length ? p.authorList : [p.authors]).filter(Boolean).map(a => `AU  - ${clean(a)}`), `JO  - ${clean(p.journal)}`, `PY  - ${clean(p.year)}`, ...(p.doi ? [`DO  - ${clean(p.doi)}`] : []), `UR  - ${p.recordURL}`, `AN  - ${p.pmid}`, 'ER  - '].join('\r\n')).join('\r\n\r\n') + '\r\n';
}
