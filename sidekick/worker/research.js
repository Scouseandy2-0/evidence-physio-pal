import { buildQuery, identifyPaper, europePMCSearchURL, validPublicationData } from '../web/research.js';
const PAGE_SIZE = 8;
const cache = new Map();
const pending = new Map();
const json = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff' } });
export function pubmedQuery(term, filters = {}, now = new Date()) {
  buildQuery(term, filters, now); // Share input validation and exact-identifier rules.
  const exact = identifyPaper(term);
  if (exact) return exact.kind === 'PMID' ? `${exact.value}[UID]` : `${exact.value}[DOI]`;
  const words = value => String(value || '').normalize('NFKC').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  const terms = words(term), author = words(filters.author).join(' ');
  const field = filters.field === 'title' ? 'Title' : filters.field === 'all' ? 'All Fields' : 'Title/Abstract';
  const expression = filters.match === 'phrase' ? `"${terms.join(' ')}"[${field}]` : terms.map(w => `"${w}"[${field}]`).join(filters.match === 'any' ? ' OR ' : ' AND ');
  const clauses = terms.length ? [`(${expression})`] : [];
  if (author) clauses.push(`"${author}"[Author]`);
  if (filters.type === 'review') clauses.push('"systematic review"[Publication Type]');
  if (filters.type === 'trial') clauses.push('"randomized controlled trial"[Publication Type]');
  if (['2', '5'].includes(String(filters.years))) {
    const since = new Date(now); since.setUTCFullYear(now.getUTCFullYear() - Number(filters.years));
    clauses.push(`("${since.toISOString().slice(0, 10)}"[Date - Publication] : "${now.toISOString().slice(0, 10)}"[Date - Publication])`);
  }
  return clauses.join(' AND ');
}
async function upstream(url, fetcher, ms) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), ms);
  try {
    // Do not forward account headers, cookies or identity to publication services.
    const response = await fetcher(url, { signal: abort.signal, headers: { accept: 'application/json' }, credentials: 'omit' });
    if (!response.ok) { console.warn('publication_upstream', JSON.stringify({host:new URL(url).hostname,status:response.status})); throw new Error('Publication provider unavailable'); }
    return await response.json();
  } catch (error) { console.warn('publication_connection', JSON.stringify({host:new URL(url).hostname,kind:abort.signal.aborted?'timeout':error.name==='SyntaxError'?'invalid_json':'connection_failed'})); throw error; } finally { clearTimeout(timer); }
}
export async function lookupPublications({ term, filters = {}, cursor = '*' }, { fetcher = globalThis.fetch, primaryTimeout = 15000, backupTimeout = 6000 } = {}) {
  const query = buildQuery(term, filters);
  const exact = identifyPaper(term);
  const isBackup = cursor.startsWith('ncbi:');
  if (!isBackup) {
    try {
      const url = europePMCSearchURL(term, filters, cursor);
      const data = await upstream(url, fetcher, primaryTimeout);
      if (!validPublicationData(data, term)) throw new Error('Invalid publication response');
      return { ...data, executedQuery: query, provider: 'Europe PMC / PubMed' };
    } catch {
      // Never mix provider pages, or substitute free-to-read for an OA licence filter.
      if (cursor !== '*' || (filters.openAccess && !exact)) throw new Error(filters.openAccess && !exact ? 'The open-access index is unavailable. Retry shortly, or untick “Open access only” to search PubMed.' : 'The publication service could not load this page. Please retry.');
    }
  }
  if (isBackup && !/^ncbi:\d{1,4}$/.test(cursor)) throw new Error('Invalid publication page. Start a new search.');
  if (isBackup && filters.openAccess && !exact) throw new Error('Start a new open-access search.');
  const offset = isBackup ? Number(cursor.slice(5)) : 0;
  if (offset > 9992) throw new Error('PubMed’s pagination limit has been reached. Narrow your search.');
  const executedQuery = pubmedQuery(term, filters);
  const searchURL = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  Object.entries({ db: 'pubmed', term: executedQuery, retmode: 'json', retmax: String(PAGE_SIZE), retstart: String(offset), sort: filters.sort === 'newest' && !exact ? 'pub date' : 'relevance', tool: 'PhysioSidekick' }).forEach(([k, v]) => searchURL.searchParams.set(k, v));
  const data = await upstream(searchURL, fetcher, backupTimeout);
  const result = data.esearchresult;
  if (data.error || result?.ERROR || result?.errorlist || !/^\d+$/.test(String(result?.count)) || !Array.isArray(result?.idlist) || result.idlist.length > PAGE_SIZE || new Set(result.idlist).size !== result.idlist.length || result.idlist.some(id => !/^[1-9]\d{0,8}$/.test(id))) throw new Error('Invalid PubMed search response');
  const count = Number(result.count), ids = result.idlist;
  if (count > offset && !ids.length) throw new Error('PubMed did not return the requested records');
  let records = [];
  if (ids.length) {
    const summaryURL = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
    Object.entries({ db: 'pubmed', id: ids.join(','), retmode: 'json', tool: 'PhysioSidekick' }).forEach(([k, v]) => summaryURL.searchParams.set(k, v));
    const summary = await upstream(summaryURL, fetcher, backupTimeout);
    records = ids.map(id => {
      const p = summary.result?.[id];
      if (!p || p.error || String(p.uid) !== id || !p.title) throw new Error('PubMed returned incomplete records');
      return { source: 'MED', id, title: p.title, authorString: (p.authors || []).map(a => a.name).join(', '), authorList: { author: (p.authors || []).map(a => ({ fullName: a.name })) }, journalTitle: p.fulljournalname || p.source, pubYear: p.pubdate?.match(/\d{4}/)?.[0] || '', journalInfo: { volume: p.volume, issue: p.issue }, pageInfo: p.pages, doi: (p.articleids || []).find(a => a.idtype === 'doi')?.value || '', pubTypeList: { pubType: p.pubtype || [] } };
    });
  }
  if (!validPublicationData({hitCount:count,resultList:{result:records}},term)) throw new Error('PubMed records do not match the requested publication.');
  return { hitCount: count, resultList: { result: records }, nextCursorMark: offset + ids.length < Math.min(count, 9993) ? `ncbi:${offset + ids.length}` : null, executedQuery, provider: 'PubMed (NCBI backup)', note: 'Europe PMC is unavailable. These records come directly from PubMed. Search results omit abstracts and open-access labels. Open a record to load its original PubMed abstract, or follow its source link.' };
}
export async function researchAPI(request) {
  if (!request.headers.get('oai-authenticated-user-id') || !request.headers.get('oai-authenticated-user-email')) return json({ error: 'Sign in to search research.' }, 401);
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Request origin does not match.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Expected JSON.' }, 415);
  let input;
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error();
    const chunks = []; let size = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 8192) { await reader.cancel(); return json({ error: 'Search request is too large.' }, 413); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    input = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof input.term !== 'string' || (input.filters != null && (typeof input.filters !== 'object' || Array.isArray(input.filters)))) throw new Error();
    input.filters ||= {}; input.cursor ??= '*';
    if (typeof input.cursor !== 'string' || !input.cursor || input.cursor.length > 2048) throw new Error();
    buildQuery(input.term, input.filters);
  } catch (e) { return json({ error: e.message || 'Invalid search request.' }, 400); }
  const key = JSON.stringify([buildQuery(input.term, input.filters), input.filters.sort, input.cursor]);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return json(cached.data);
  try {
    if (!pending.has(key)) {
      const task = lookupPublications(input).then(data => {
        if (cache.size >= 50) cache.delete(cache.keys().next().value);
        cache.set(key, { data, expires: Date.now() + 5 * 60 * 1000 }); return data;
      }).finally(() => pending.delete(key));
      pending.set(key, task);
    }
    return json(await pending.get(key));
  } catch (e) { return json({ error: e.message.startsWith('The ') || e.message.startsWith('PubMed') || e.message.startsWith('Start ') || e.message.startsWith('Invalid publication page') ? e.message : 'Both publication connections are unavailable. Your search has not returned a result count. Please retry shortly.' }, 503); }
}
