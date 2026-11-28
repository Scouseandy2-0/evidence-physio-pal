import { publicationAccess } from './publication-access.js';
const cache = new Map(), pending = new Map();
const json = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff' } });
// NLM's tagged PubMed format: AB is the English abstract; CI is publisher copyright.
// Only documented tag lines and six-space continuation lines are accepted.
export function parsePubmedRecord(text, pmid) {
  const fields = new Map(); let current;
  for (const line of text.replaceAll('\r\n', '\n').split('\n')) {
    const tag = line.match(/^([A-Z0-9]{2,4})\s*- (.*)$/);
    if (tag) {
      current = { tag: tag[1], parts: [tag[2]] };
      const values = fields.get(current.tag) || []; values.push(current); fields.set(current.tag, values);
    } else if (/^ {6}/.test(line) && current) current.parts.push(line.slice(6));
    else if (line.trim()) throw new Error('Unexpected PubMed record format.');
  }
  const get = tag => (fields.get(tag) || []).map(f => f.parts.join(' ').trim());
  if (get('PMID').length !== 1 || get('PMID')[0] !== pmid || get('TI').length !== 1 || !get('TI')[0]) throw new Error('PubMed did not return the requested paper.');
  if (get('AB').length > 1) throw new Error('Unexpected PubMed abstract format.');
  const abstract = get('AB')[0] || '', copyright = get('CI').join('\n');
  if (abstract.length > 80000 || copyright.length > 10000) throw new Error('The indexed abstract exceeds this prototype’s record limit. Open PubMed to read it.');
  return { pmid, title: get('TI')[0], abstract, abstractStatus: abstract ? 'available' : 'notIndexed', abstractSource: 'PubMed (NCBI)', abstractURL: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, abstractCopyright: copyright, abstractRetrievedAt: new Date().toISOString(), retracted: get('PT').some(t => /^Retracted Publication$/i.test(t)) };
}
export async function retrievePubmedRecord(pmid, { fetcher = globalThis.fetch, timeoutMs = 12000 } = {}) {
  if (!/^[1-9]\d{0,8}$/.test(pmid)) throw new Error('Enter a valid PMID.');
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
  Object.entries({ db: 'pubmed', id: pmid, rettype: 'medline', retmode: 'text', tool: 'PhysioSidekick' }).forEach(([key, value]) => url.searchParams.set(key, value));
  const abort = new AbortController(); const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const response = await fetcher(url, { signal: abort.signal, credentials: 'omit', headers: { accept: 'text/plain' } });
    if (!response.ok) throw new Error('PubMed is temporarily unavailable.');
    const reader = response.body?.getReader(); if (!reader) throw new Error('Empty PubMed response.');
    const chunks = []; let bytes = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 512 * 1024) { await reader.cancel(); throw new Error('PubMed record is too large.'); } chunks.push(value); }
    const buffer = new Uint8Array(bytes); let offset = 0; for (const value of chunks) { buffer.set(value, offset); offset += value.length; }
    return parsePubmedRecord(new TextDecoder().decode(buffer), pmid);
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('PubMed took too long to return the abstract. Please retry.');
    throw error;
  } finally { clearTimeout(timer); }
}
export async function paperAPI(request) {
  const denied = publicationAccess(request); if (denied) return denied;
  if (request.method !== 'GET') return json({ error: 'Use GET.' }, 405);
  if (request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Use the app to load publication details.' }, 403);
  const pmid = new URL(request.url).searchParams.get('pmid') || '';
  if (!/^[1-9]\d{0,8}$/.test(pmid)) return json({ error: 'Enter a valid PMID.' }, 400);
  const cached = cache.get(pmid);
  if (cached?.expires > Date.now()) return json(cached.record);
  try {
    if (!pending.has(pmid)) pending.set(pmid, retrievePubmedRecord(pmid).then(record => {
      if (cache.size >= 50) cache.delete(cache.keys().next().value);
      cache.set(pmid, { record, expires: Date.now() + 5 * 60 * 1000 }); return record;
    }).finally(() => pending.delete(pmid)));
    return json(await pending.get(pmid));
  } catch { return json({ error: 'The original abstract could not be retrieved from PubMed. This does not mean no abstract exists. Retry or open the PubMed record.' }, 503); }
}
