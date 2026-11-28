import { safeURL, defaultFilters } from './research.js';
export const emptyWorkspace = () => ({ saved: [], reflections: [], searches: [], appraisals: [], teachingPlans: [], studySets: [] });
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
    if (p.abstractSource) {
      if (p.abstractSource !== 'PubMed (NCBI)' || !['available', 'notIndexed'].includes(p.abstractStatus) || !Number.isFinite(Date.parse(p.abstractRetrievedAt)) || (p.abstractStatus === 'available') !== Boolean(paper.abstract.trim())) fail('Invalid abstract provenance.');
      Object.assign(paper, { abstractSource: p.abstractSource, abstractStatus: p.abstractStatus, abstractRetrievedAt: str(p.abstractRetrievedAt, 100, 'abstract retrieval time'), abstractCopyright: str(p.abstractCopyright, 10000, 'abstract copyright') });
    }
    return paper;
  });
  const reflections = list(input.reflections, 1000, 'reflections').map(r => {
    if (!r || !/^[a-zA-Z0-9_-]{1,100}$/.test(r.id)) fail('Invalid reflection identifier.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || !Number.isFinite(Date.parse(r.date)) || new Date(r.date).toISOString().slice(0, 10) !== r.date) fail('Invalid reflection date.');
    if (r.followUpDate && (!/^\d{4}-\d{2}-\d{2}$/.test(r.followUpDate) || !Number.isFinite(Date.parse(r.followUpDate)) || new Date(r.followUpDate).toISOString().slice(0,10) !== r.followUpDate || r.followUpDate < r.date)) fail('Choose a valid review date on or after the activity date.');
    if (!Number.isInteger(r.minutes) || r.minutes < 1 || r.minutes > 1440) fail('Invalid learning time.');
    if (r.appraisalId && (!/^[a-zA-Z0-9_-]{1,100}$/.test(r.appraisalId) || !/^MED:\d{1,9}$/.test(r.paperId) || !['abstract', 'fullText'].includes(r.basis))) fail('Invalid linked appraisal reflection.');
    return { id: r.id, date: r.date, minutes: r.minutes, title: str(r.title, 180, 'reflection title', true), kind: str(r.kind, 100, 'activity', true), learning: str(r.learning, 10000, 'learning', true), action: str(r.action, 10000, 'next step', true), source: str(r.source, 1000, 'source'), outcome: str(r.outcome, 6000, 'follow-up outcome'), followUpDate: str(r.followUpDate, 10, 'follow-up date'), ...(r.appraisalId ? { appraisalId: str(r.appraisalId, 100, 'linked appraisal'), paperId: str(r.paperId, 100, 'linked paper'), basis: str(r.basis, 30, 'reflection reading basis') } : {}) };
  });
  const appraisals = list(input.appraisals || [], 1000, 'appraisals').map(a => {
    if (!a || !/^[a-zA-Z0-9_-]{1,100}$/.test(a.id) || !/^\d{1,9}$/.test(a.pmid) || a.paperId !== `MED:${a.pmid}`) fail('Invalid appraisal identifier.');
    if (!Number.isFinite(Date.parse(a.updatedAt))) fail('Invalid appraisal time.');
    if (!['notRead', 'abstract', 'fullText'].includes(a.basis)) fail('Invalid appraisal reading basis.');
    const result = { id: a.id, paperId: a.paperId, pmid: a.pmid, sourceRetracted: a.sourceRetracted === true || saved.some(p => p.id === a.paperId && p.retracted), basis: a.basis, title: str(a.title, 4000, 'appraisal paper title', true), citation: str(a.citation, 20000, 'appraisal citation'), design: str(a.design, 200, 'study design'), updatedAt: str(a.updatedAt, 100, 'appraisal time') };
    for (const key of ['question', 'findings', 'strengths', 'limitations', 'applicability', 'uncertainties', 'nextStep']) result[key] = str(a[key], 5000, 'appraisal notes');
    return result;
  });
  const teachingPlans = list(input.teachingPlans || [], 200, 'teaching plans').map(t => {
    if (!t || !/^[a-zA-Z0-9_-]{1,100}$/.test(t.id) || !Number.isFinite(Date.parse(t.updatedAt))) fail('Invalid teaching plan identifier or time.');
    if (!Number.isInteger(t.minutes) || t.minutes < 5 || t.minutes > 480) fail('Invalid session length; use 5 to 480 minutes.');
    const plan = { id: t.id, title: str(t.title, 180, 'session title'), audience: str(t.audience, 120, 'session audience'), minutes: t.minutes, updatedAt: str(t.updatedAt, 100, 'session time') };
    for (const key of ['objectives', 'discussion', 'agenda', 'preparation', 'takeaways', 'guidance']) plan[key] = str(t[key], 6000, 'teaching plan notes');
    plan.sources = unique(list(t.sources || [], 20, 'session sources').map(source => {
      if (!source || !/^[1-9]\d{0,8}$/.test(source.pmid) || !['notRead', 'notRecorded', 'abstract', 'fullText'].includes(source.readingBasis) || !Number.isFinite(Date.parse(source.attachedAt))) fail('Invalid teaching source.');
      return { pmid: source.pmid, title: str(source.title, 4000, 'source title', true), citation: str(source.citation, 20000, 'source citation', true), readingBasis: source.readingBasis, retracted: source.retracted === true, attachedAt: str(source.attachedAt, 100, 'source attachment time') };
    }), source => source.pmid, 'session sources');
    return plan;
  });
  const studySets = list(input.studySets || [], 100, 'study sets').map(set => {
    if (!set || !/^[a-zA-Z0-9_-]{1,100}$/.test(set.id) || !Number.isFinite(Date.parse(set.updatedAt))) fail('Invalid study set identifier or time.');
    const cards = unique(list(set.cards || [], 100, 'revision cards').map(card => {
      if (!card || !/^[a-zA-Z0-9_-]{1,100}$/.test(card.id) || !Number.isFinite(Date.parse(card.updatedAt)) || !['unrated', 'again', 'recalled'].includes(card.rating) || !Number.isInteger(card.reviews) || card.reviews < 0 || card.reviews > 1000000) fail('Invalid revision card.');
      if (card.rating !== 'unrated' && !Number.isFinite(Date.parse(card.reviewedAt))) fail('Invalid card review time.');
      const source = card.source;
      if (!source || !/^[1-9]\d{0,8}$/.test(source.pmid) || !['notRead', 'notRecorded', 'abstract', 'fullText'].includes(source.readingBasis) || !Number.isFinite(Date.parse(source.attachedAt))) fail('Invalid revision source.');
      return { id: card.id, question: str(card.question, 1000, 'revision question', true), answer: str(card.answer, 6000, 'revision answer', true), updatedAt: str(card.updatedAt, 100, 'card edit time'), rating: card.rating, reviewedAt: str(card.reviewedAt, 100, 'review time'), reviews: card.reviews, source: { pmid: source.pmid, title: str(source.title, 4000, 'card source title', true), citation: str(source.citation, 20000, 'card citation', true), readingBasis: source.readingBasis, retracted: source.retracted === true, attachedAt: str(source.attachedAt, 100, 'card source time') } };
    }), card => card.id, 'revision cards');
    return { id: set.id, title: str(set.title, 180, 'study set title'), updatedAt: str(set.updatedAt, 100, 'study edit time'), cards };
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
  return { saved: unique(saved, p => p.id, 'papers'), reflections: unique(reflections, r => r.id, 'reflections'), searches, appraisals: unique(appraisals, a => a.id, 'appraisals'), teachingPlans: unique(teachingPlans, t => t.id, 'teaching plans'), studySets: unique(studySets, set => set.id, 'study sets') };
}
export function hasRecords(w) { return w.saved.length + w.reflections.length + (w.searches.length + (w.appraisals?.length || 0) + (w.teachingPlans?.length || 0) + (w.studySets?.length || 0)) > 0; }
export function mergeWorkspaces(remote, device, newId = () => crypto.randomUUID()) {
  const a = validateWorkspace(remote), b = validateWorkspace(device);
  const papers = new Map(a.saved.map(p => [p.id, p]));
  for (const p of b.saved) {
    const existing = papers.get(p.id);
    if (!existing) papers.set(p.id, p);
    else {
      existing.retracted ||= p.retracted;
      if (!existing.abstract && p.abstractSource) {
        for (const key of ['abstract', 'abstractSource', 'abstractStatus', 'abstractRetrievedAt', 'abstractCopyright']) existing[key] = p[key];
        existing.retracted ||= p.retracted;
      }
      if (p.notes && p.notes !== existing.notes && !existing.notes.endsWith(`\n\n[Device note]\n${p.notes}`)) existing.notes = existing.notes ? `${existing.notes}\n\n[Device note]\n${p.notes}` : p.notes;
      if (!existing.collection) existing.collection = p.collection;
      else if (p.collection && p.collection !== existing.collection) existing.notes += `\n\n[Device collection] ${p.collection}`;
    }
  }
  const appraisals = new Map(a.appraisals.map(entry => [entry.id, entry]));
  const remapped = new Map();
  for (const entry of b.appraisals) {
    const existing = appraisals.get(entry.id);
    if (!existing) appraisals.set(entry.id, entry);
    else if (JSON.stringify(existing) !== JSON.stringify(entry)) {
      const copy = { ...entry, id: newId() }; appraisals.set(copy.id, copy); remapped.set(entry.id, copy.id);
    }
  }
  const reflections = new Map(a.reflections.map(r => [r.id, r]));
  for (const original of b.reflections) {
    const r = remapped.has(original.appraisalId) ? { ...original, appraisalId: remapped.get(original.appraisalId) } : original;
    if (!reflections.has(r.id)) reflections.set(r.id, r);
    else if (JSON.stringify(reflections.get(r.id)) !== JSON.stringify(r)) { const copy = { ...r, id: newId() }; reflections.set(copy.id, copy); }
  }
  const teachingPlans = new Map(a.teachingPlans.map(t => [t.id, t]));
  for (const t of b.teachingPlans) {
    if (!teachingPlans.has(t.id)) teachingPlans.set(t.id, t);
    else if (JSON.stringify(teachingPlans.get(t.id)) !== JSON.stringify(t)) { const copy = { ...t, id: newId() }; teachingPlans.set(copy.id, copy); }
  }
  const studySets = new Map(a.studySets.map(set => [set.id, set]));
  for (const set of b.studySets) {
    if (!studySets.has(set.id)) studySets.set(set.id, set);
    else if (JSON.stringify(studySets.get(set.id)) !== JSON.stringify(set)) { const copy = { ...set, id: newId() }; studySets.set(copy.id, copy); }
  }
  const searches = new Map([...a.searches, ...b.searches].map(s => [JSON.stringify([s.term, s.filters]), s]));
  return validateWorkspace({ saved: [...papers.values()], reflections: [...reflections.values()], searches: [...searches.values()], appraisals: [...appraisals.values()], teachingPlans: [...teachingPlans.values()], studySets: [...studySets.values()] });
}
