import { safeURL, defaultFilters } from './research.js';
export const emptyWorkspace = () => ({ saved: [], reflections: [], searches: [] });
const fail = message => { throw new Error(message); };
const str = (v, max, label, required = false) => {
  if (v == null && !required) return '';
  if (typeof v !== 'string' || v.length > max || (required && !v.trim())) fail(`Invalid ${label}.`);
  return v;
};
const list = (v, max, label) => { if (!Array.isArray(v) || v.length > max) fail(`Invalid ${label}; limit ${max}.`); return v; };
function unique(items, key, label) {
  if (new Set(items.map(key)).size !== items.length) fail(`Duplicate ${label}.`);
  return items;
}
export function validateWorkspace(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Invalid workspace.');
  const saved = list(input.saved, 500, 'saved papers').map(p => {
    if (!p || !/^\d{1,9}$/.test(p.pmid) || p.id !== `MED:${p.pmid}`) fail('Invalid paper identifier.');
    const doi = str(p.doi, 1000, 'DOI');
    if (doi && !/^10\.\d{4,9}\/[^\s"<>\\]+$/i.test(doi)) fail('Invalid DOI.');
    const link = url => { if (!safeURL(url)) fail('Invalid full-text URL.'); return safeURL(url); };
    const paper = {
      id: p.id, pmid: p.pmid, title: str(p.title, 4000, 'paper title', true), authors: str(p.authors, 12000, 'authors'),
      authorList: list(p.authorList || [], 1000, 'author names').map(a => str(a, 500, 'author name')),
      journal: str(p.journal, 2000, 'journal'), year: str(p.year, 20, 'year'), date: str(p.date, 30, 'date'),
      volume: str(p.volume, 100, 'volume'), issue: str(p.issue, 100, 'issue'), pages: str(p.pages, 100, 'pages'), doi,
      abstract: str(p.abstract, 80000, 'abstract'), types: list(p.types || [], 100, 'publication types').map(t => str(t, 200, 'publication type')),
      openAccess: p.openAccess === true, retracted: p.retracted === true,
      fullText: p.fullText ? link(p.fullText) : null,
      fullTextLinks: list(p.fullTextLinks || [], 50, 'full-text links').map(l => ({ url: link(l.url), style: str(l.style, 100, 'link style'), provider: str(l.provider, 200, 'link provider') })),
      recordURL: `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`, indexedURL: `https://europepmc.org/article/MED/${p.pmid}`,
      retrievedAt: str(p.retrievedAt, 100, 'retrieval time'), savedAt: str(p.savedAt, 100, 'saved time'),
      notes: str(p.notes, 20000, 'paper notes'), collection: str(p.collection, 80, 'collection')
    };
    return paper;
  });
  const reflections = list(input.reflections, 1000, 'reflections').map(r => {
    if (!r || !/^[a-zA-Z0-9_-]{1,100}$/.test(r.id)) fail('Invalid reflection identifier.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || !Number.isFinite(Date.parse(r.date)) || new Date(r.date).toISOString().slice(0, 10) !== r.date) fail('Invalid reflection date.');
    if (!Number.isInteger(r.minutes) || r.minutes < 1 || r.minutes > 1440) fail('Invalid learning time.');
    return { id: r.id, date: r.date, minutes: r.minutes, title: str(r.title, 180, 'reflection title', true), kind: str(r.kind, 100, 'activity', true), learning: str(r.learning, 10000, 'learning', true), action: str(r.action, 10000, 'next step', true), source: str(r.source, 1000, 'source') };
  });
  const searches = list(input.searches || [], 20, 'saved searches').map(s => {
    const f = s.filters || {};
    const filters = { ...defaultFilters };
    for (const [key, values] of Object.entries({ type: ['all', 'trial', 'review'], years: ['', '2', '5'], sort: ['relevance', 'newest'], match: ['all', 'any', 'phrase'], field: ['titleAbstract', 'title', 'all'] })) {
      if (f[key] != null && !values.includes(f[key])) fail('Invalid saved search option.');
      if (f[key] != null) filters[key] = f[key];
    }
    filters.openAccess = f.openAccess === true; filters.author = str(f.author, 100, 'search author');
    return { term: str(s.term, 250, 'search term'), filters, savedAt: str(s.savedAt, 100, 'search time') };
  });
  return { saved: unique(saved, p => p.id, 'papers'), reflections: unique(reflections, r => r.id, 'reflections'), searches };
}
export function hasRecords(w) { return w.saved.length + w.reflections.length + w.searches.length > 0; }
export function mergeWorkspaces(remote, device, newId = () => crypto.randomUUID()) {
  const a = validateWorkspace(remote), b = validateWorkspace(device);
  const papers = new Map(a.saved.map(p => [p.id, p]));
  for (const p of b.saved) {
    const existing = papers.get(p.id);
    if (!existing) papers.set(p.id, p);
    else {
      if (p.notes && p.notes !== existing.notes && !existing.notes.endsWith(`\n\n[Device note]\n${p.notes}`)) existing.notes = existing.notes ? `${existing.notes}\n\n[Device note]\n${p.notes}` : p.notes;
      if (!existing.collection) existing.collection = p.collection;
      else if (p.collection && p.collection !== existing.collection) existing.notes += `\n\n[Device collection] ${p.collection}`;
    }
  }
  const reflections = new Map(a.reflections.map(r => [r.id, r]));
  for (const r of b.reflections) {
    if (!reflections.has(r.id)) reflections.set(r.id, r);
    else if (JSON.stringify(reflections.get(r.id)) !== JSON.stringify(r)) { const copy = { ...r, id: newId() }; reflections.set(copy.id, copy); }
  }
  const searches = new Map([...a.searches, ...b.searches].map(s => [JSON.stringify([s.term, s.filters]), s]));
  return validateWorkspace({ saved: [...papers.values()], reflections: [...reflections.values()], searches: [...searches.values()] });
}
