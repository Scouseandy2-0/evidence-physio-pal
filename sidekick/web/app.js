import { newStudySet, cardFromNotes, saveStudyCard, rateStudyCard, studyMarkdown } from './study.js';
import { newTeachingPlan, teachingSource, teachingMarkdown, suggestedAgenda, readingLabels } from './teaching.js';
import { loadOriginalAbstract, applyOriginalAbstract } from './paper-details.js';
import { newAppraisal, appraisalFields, basisLabels, reflectionFromAppraisal, appraisalMarkdown } from './appraisal.js';
import { WorkspaceSync } from './sync.js';
import { validateWorkspace, emptyWorkspace, hasRecords } from './workspace-data.js';
import { searchPapers, citation, toRIS, defaultFilters } from './research.js';
import { resources, questions, teachingTopics } from './content.js';

const icons = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  research: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  learn: '<path d="m2 8 10-5 10 5-10 5L2 8Z"/><path d="M6 10v7c4 3 8 3 12 0v-7M22 8v8"/>',
  practice: '<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V3h8v3m-4 5v6m-3-3h6"/>',
  cpd: '<path d="M8 3H5a2 2 0 0 0-2 2v15a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2h-3"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m8 13 3 3 5-6"/>',
  fcp: '<path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4Z"/><path d="m8 12 3 3 5-6"/>',
  library: '<path d="M6 3h12v19l-6-4-6 4V3Z"/>',
  book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',
  anatomy: '<circle cx="12" cy="4" r="2"/><path d="M8 9h8m-4-3v8m-4 7 4-7 4 7M8 9l-3 5m11-5 3 5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = document.querySelector('main');
const dialog = document.querySelector('dialog');
const KEY = 'physiosidekick.workspace.v1';
let storageFailed = false;
let legacyWorkspace = null;
try {
  const stored = JSON.parse(localStorage.getItem(KEY));
  if (stored) legacyWorkspace = validateWorkspace(stored);
} catch { storageFailed = true; }
let workspace = emptyWorkspace();
let sync;
let route = location.hash.slice(1) || 'home';
let paperMap = new Map(workspace.saved.map(p => [p.id, p]));
let filters = { ...defaultFilters };
let searchState = { term: '', papers: [], total: 0, nextCursor: '*', error: '', searched: false, loading: false };
let controller;
let requestNumber = 0;
const abstractRequests = new Map();
const abstractErrors = new Map();
let learnTab = 'revision';
let quizIndex = 0;
let quizAnswered = false;
let libraryFilter = '';
let cpdFormOpen = false;
let reflectionEditing = null;
let reflectionDraft = null;
let activeAppraisal = null;
let activeTeaching = null;
let activeStudy = null;
let studyPractice = null;
let studyDraft = null;
let toastTimer;
const nav = [['home', 'Overview'], ['research', 'Research'], ['learn', 'Learn & anatomy'], ['practice', 'Practice resources'], ['cpd', 'My CPD'], ['fcp', 'FCP workspace'], ['library', 'Saved papers']];
function persist() {
  if (!sync?.account) { toast('Connect to your account before saving.'); return false; }
  return sync.queue(workspace);
}
function toast(message) {
  clearTimeout(toastTimer); const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('toast-show');
  toastTimer = setTimeout(() => el.classList.remove('toast-show'), 4500);
}
function openDialog(html) { dialog.dataset.paperId = '';  document.querySelector('#dialog-content').innerHTML = `<div class="dialog-body">${html}</div>`; if (!dialog.open) dialog.showModal(); }
function navigate(next) { if (location.hash === `#${next}`) render(); else location.hash = next; }
function updateNav() {
  document.querySelector('#desktop-nav').innerHTML = nav.map(([id, label]) => `<a href="#${id}" class="nav-item ${route === id ? 'active' : ''}" ${route === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span>${id === 'fcp' ? '<span class="premium">PREVIEW</span>' : ''}${id === 'library' ? `<span class="count">${workspace.saved.length}</span>` : ''}</a>`).join('');
  const mobile = [['home', 'Home'], ['research', 'Research'], ['learn', 'Learn'], ['cpd', 'CPD'], ['fcp', 'FCP']];
  document.querySelector('#mobile-nav').innerHTML = mobile.map(([id, label]) => `<a href="#${id}" class="${route === id ? 'active' : ''}" ${route === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span></a>`).join('');
  document.querySelector('#breadcrumb').textContent = nav.find(([id]) => route === id)?.[1] || (route === 'appraisal' ? 'Paper appraisal' : route === 'teaching' ? 'Teaching session' : route === 'study' ? 'My revision' : 'Overview');
}
function intro(eyebrow, title, description, action = '') {
  return `<div class="page-intro"><span class="eyebrow">${eyebrow}</span><div class="title-row"><h1>${title}</h1>${action}</div><p>${description}</p></div>`;
}
function searchForm(id, value = '', hero = false) {
  return `<form id="${id}" class="${hero ? '' : 'searchbox research-search'}">${hero ? '<div class="searchbox">' : ''}${icon('research')}<input type="search" name="topic" aria-label="Search research papers" placeholder="${hero ? 'What are you curious about?' : 'Topic, author or DOI…'}" value="${esc(value)}" maxlength="250" ${hero ? 'required' : ''}><button class="button ${hero ? 'light' : ''}" type="submit">Search</button>${hero ? '</div>' : ''}</form>`;
}
function home() {
  const minutes = workspace.reflections.reduce((sum, r) => sum + Number(r.minutes || 0), 0);
  main.innerHTML = `${intro('YOUR KNOWLEDGE, CONNECTED', 'A little curiosity. A lot of possibility.', 'Your space to learn, explore the evidence and grow as a physio.', `<span class="date-pill">${icon('calendar')}${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(new Date())}</span>`)}
  <section class="hero" aria-labelledby="hero-title"><div><span class="eyebrow">START WITH A QUESTION</span><h2 id="hero-title">Good practice starts<br>with better questions.</h2><p>Find real research. Follow the original paper. Build your own understanding.</p>${searchForm('home-search', '', true)}<div class="suggestions"><span>Explore a topic</span>${['Rotator cuff exercise', 'Knee osteoarthritis', 'Low back pain'].map(t => `<button data-search="${t}">${t}</button>`).join('')}</div></div><div class="hero-icon">${icon('book')}</div></section>
  <div class="section-heading"><h2>Make it your sidekick</h2><span class="subtle">From study to practice</span></div>
  <section class="cards" aria-label="Explore your workspace">
  <a href="#learn" class="card feature-card"><span class="tile-icon">${icon('learn')}</span><h3>Build your understanding</h3><p>Critical appraisal, learning checks and anatomy resources.</p><span class="mini-label">LEARN SOMETHING NEW</span></a>
  <a href="#library" class="card feature-card"><span class="tile-icon blue">${icon('library')}</span><h3>A library that’s yours</h3><p>Keep papers, collections and your own notes together.</p><span class="mini-label">${workspace.saved.length} SAVED ${workspace.saved.length === 1 ? 'PAPER' : 'PAPERS'}</span></a>
  <a href="#cpd" class="card feature-card"><span class="tile-icon gold">${icon('cpd')}</span><h3>Make learning count</h3><p>Capture a reflection and decide what you’ll do next.</p><span class="mini-label">${workspace.reflections.length} REFLECTIONS · ${minutes} MIN LOGGED</span></a></section>
  <div class="two-col"><section><div class="section-heading"><h2>Follow your curiosity</h2><a href="#research" class="text-button">Explore research</a></div><div class="card topic-list">${[['Shoulder & upper limb', 'Rotator cuff rehabilitation', 'Rotator cuff exercise'], ['Knee & lower limb', 'Exercise and osteoarthritis', 'Knee osteoarthritis exercise'], ['Spine & pain', 'Understanding low back pain', 'Low back pain physiotherapy']].map(([title, sub, query]) => `<div class="topic-item"><span class="topic-symbol">${icon('research')}</span><div><strong>${title}</strong><small>${sub}</small></div><button class="text-button" data-search="${query}">Find papers</button></div>`).join('')}</div></section>
  <section class="card fcp-card" style="margin-top:30px"><span class="eyebrow">FOR FIRST CONTACT PHYSIOS</span><h3>A space for your<br>next teaching session.</h3><p>Turn a learning question into a structured team discussion.</p><a href="#fcp" class="button secondary">Explore the FCP workspace</a></section></div>
  ${storageFailed ? '<div class="notice error">Browser storage could not be read. Use “Your data & privacy” to export changes before closing this page.</div>' : ''}`;
  document.querySelector('#home-search').addEventListener('submit', e => { e.preventDefault(); startSearch(new FormData(e.currentTarget).get('topic')); });
}
function research() {
  main.innerHTML = `${intro('FOLLOW THE SOURCE', 'Real papers. Clear starting points.', 'Find a paper by topic, title, author, DOI or PMID. Follow the source and decide what the evidence means.')}${searchForm('research-search', searchState.term)}
  <details class="search-options" ${filters.author || filters.match !== 'all' || filters.field !== 'titleAbstract' ? 'open' : ''}><summary>Search options · words, phrases & authors</summary><div class="search-option-fields"><div class="field"><label for="match-mode">Match</label><select id="match-mode"><option value="all">All words</option><option value="any">Any word</option><option value="phrase">Exact phrase</option></select></div><div class="field"><label for="search-field">Search within</label><select id="search-field"><option value="titleAbstract">Title & abstract</option><option value="title">Title only</option><option value="all">All indexed fields</option></select></div><div class="field"><label for="author-filter">Author (optional)</label><input id="author-filter" maxlength="100" value="${esc(filters.author)}" placeholder="e.g. Hopewell S"></div></div><p class="subtle">Paste a DOI, PMID or PubMed link for an exact paper lookup. Discovery filters are ignored for exact lookups. Use “Search” after entering an author.</p></details>
  <div id="saved-searches"></div>
  <div class="research-layout"><aside class="card filter-panel" aria-label="Research filters"><h2>Refine your search</h2>
  <div class="field"><label for="study-type">Publication type</label><select id="study-type"><option value="all">All publications</option><option value="review">Systematic reviews</option><option value="trial">Randomised trials</option></select></div>
  <div class="field"><label for="year-filter">Publication date</label><select id="year-filter"><option value="">Any date</option><option value="5">Last 5 years</option><option value="2">Last 2 years</option></select></div>
  <div class="field"><label for="sort-filter">Sort results</label><select id="sort-filter"><option value="relevance">Relevance</option><option value="newest">Newest first</option></select></div>
  <label class="check-field"><input type="checkbox" id="open-access"> Open access only</label><button class="text-button" id="reset-filters">Reset search options</button><p class="subtle">Publication type and access labels come from the index. They do not establish study quality.</p></aside><section aria-label="Search results"><div id="results" aria-live="polite"></div></section></div>`;
  [['study-type', 'type'], ['year-filter', 'years'], ['sort-filter', 'sort'], ['match-mode', 'match'], ['search-field', 'field']].forEach(([id, key]) => {
    document.getElementById(id).value = filters[key];
    document.getElementById(id).addEventListener('change', e => { filters[key] = e.target.value; if (searchState.searched) runSearch(document.querySelector('#research-search input').value); });
  });
  document.querySelector('#author-filter').addEventListener('input', e => { filters.author = e.target.value; });
  document.querySelector('#author-filter').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); runSearch(document.querySelector('#research-search input').value); } });
  document.querySelector('#open-access').checked = filters.openAccess;
  document.querySelector('#open-access').addEventListener('change', e => { filters.openAccess = e.target.checked; if (searchState.searched) runSearch(document.querySelector('#research-search input').value); });
  document.querySelector('#research-search').addEventListener('submit', e => { e.preventDefault(); runSearch(String(new FormData(e.currentTarget).get('topic'))); });
  document.querySelector('#reset-filters').onclick = () => { const term = document.querySelector('#research-search input').value; filters = { ...defaultFilters }; searchState.term = term; research(); if (searchState.searched) runSearch(term); };
  renderSavedSearches(); renderResults();
}
function renderSavedSearches() {
  const area = document.querySelector('#saved-searches'); if (!area) return;
  area.innerHTML = workspace.searches.length ? `<div class="saved-search-bar"><span class="field-label">Your saved searches</span><div class="saved-search-list">${workspace.searches.map((s, i) => `<span class="saved-search-chip"><button data-run-search="${i}" title="${esc(searchDescription(s.filters))}">${esc(s.term || s.filters.author)}</button><button data-remove-search="${i}" aria-label="Remove saved search: ${esc(s.term || s.filters.author)}">×</button></span>`).join('')}</div></div>` : '';
}
function searchDescription(f) {
  return `${f.match === 'phrase' ? 'Exact phrase' : f.match === 'any' ? 'Any word' : 'All words'} · ${f.field === 'title' ? 'title only' : f.field === 'all' ? 'all indexed fields' : 'title & abstract'}${f.author ? ` · author: ${f.author}` : ''}${f.type !== 'all' ? ` · ${f.type === 'review' ? 'systematic reviews' : 'randomised trials'}` : ''}${f.years ? ` · last ${f.years} years` : ''}${f.openAccess ? ' · open access' : ''}`;
}
function startSearch(term) { filters = { ...defaultFilters }; searchState.term = term; navigate('research'); if (route === 'research') research(); runSearch(term); }
async function runSearch(term, more = false) {
  term = term.trim();
  controller?.abort(); controller = new AbortController(); const current = ++requestNumber;
  const usedFilters = { ...(more ? searchState.usedFilters : filters) };
  searchState = { ...searchState, term, loading: true, searched: true, error: '', usedFilters, ...(more ? {} : { papers: [], total: 0, nextCursor: '*', query: '', identifier: null, provider: '', note: '' }) };
  if (route === 'research') { const input = document.querySelector('#research-search input'); if (input) input.value = term; renderResults(); }
  try {
    const data = await searchPapers(term, usedFilters, more ? searchState.nextCursor : '*', controller.signal);
    if (current !== requestNumber) return;
    const all = more ? [...searchState.papers, ...data.papers] : data.papers;
    searchState = { ...searchState, papers: [...new Map(all.map(p => [p.id, p])).values()], total: data.total, nextCursor: data.papers.length ? data.nextCursor : null, loading: false, query: data.query, provider: data.provider, note: data.note, identifier: data.identifier, searchedAt: new Date().toISOString() };
    data.papers.forEach(p => paperMap.set(p.id, p));
  } catch (e) { if (current !== requestNumber || e.name === 'AbortError') return; searchState.loading = false; searchState.error = e.message || 'Search failed. Please try again.'; }
  if (route === 'research') renderResults();
}
function renderResults() {
  const el = document.querySelector('#results'); if (!el) return;
  if (!searchState.searched) { el.innerHTML = `<div class="empty">${icon('research')}<h3>Your next discovery starts here</h3><p>Search a topic or paper title, or paste a DOI, PMID or PubMed link. Use search options to narrow the words and author.</p><button class="button secondary" data-search="Knee osteoarthritis exercise">Try knee osteoarthritis</button></div>`; return; }
  if (searchState.loading && !searchState.papers.length) { el.innerHTML = '<div class="loading"><span class="spinner"></span>Searching real publication records…</div>'; return; }
  const exact = searchState.identifier;
  const f = searchState.usedFilters || filters;
  el.innerHTML = `${searchState.error ? `<div class="notice error">${esc(searchState.error)} <button class="text-button" id="retry-search">Retry search</button></div>` : ''}
  ${exact ? `<div class="notice">Exact ${exact.kind} lookup: <strong>${esc(exact.value)}</strong>. Keyword, author, date, publication-type and access filters were ignored so they cannot hide this paper.</div>` : ''}
  ${searchState.note ? `<div class="notice">${esc(searchState.note)}</div>` : ''}
  ${searchState.query ? `<div class="result-toolbar"><strong>${searchState.total.toLocaleString()} indexed ${searchState.total === 1 ? 'result' : 'results'}</strong><span>${esc(searchState.provider || 'Europe PMC / PubMed')}<br>Relevance is not evidence quality</span></div>` : ''}
  ${searchState.query ? `<div class="search-tools"><button class="button secondary" id="save-search">${icon('library')}Save this search</button><button class="text-button" id="export-search">Export search record</button></div><details class="query-details"><summary>How this search was run</summary><p>${exact ? `Exact ${exact.kind} lookup` : esc(searchDescription(f))}. Sorted by ${f.sort === 'newest' && !exact ? 'newest first' : 'relevance'}.</p><code>${esc(searchState.query)}</code><p>Run ${esc(new Date(searchState.searchedAt).toLocaleString('en-GB'))}. This is a discovery search, not a comprehensive systematic-review strategy.</p></details>` : ''}
  ${!searchState.papers.length && !searchState.error ? `<div class="empty">${icon('research')}<h3>${exact ? 'No indexed record found for this identifier' : 'No matching papers found'}</h3><p>${exact ? 'Check the identifier and try PubMed directly. This does not prove that the paper does not exist.' : 'Try fewer words, “Any word”, all indexed fields or reset the filters.'}</p>${exact ? `<a class="button secondary" href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(exact.value)}" target="_blank" rel="noopener noreferrer">Check PubMed</a>` : '<button class="button secondary" id="broaden-search">Broaden this search</button>'}</div>` : ''}
  <div class="paper-list">${searchState.papers.map(p => paperCard(p)).join('')}</div>
  ${searchState.nextCursor && searchState.papers.length < searchState.total && searchState.papers.length ? `<button id="load-more" class="button secondary" style="margin-top:20px" ${searchState.loading ? 'disabled' : ''}>${searchState.loading ? 'Loading…' : 'Load more papers'}</button>` : ''}`;
  document.querySelector('#retry-search')?.addEventListener('click', () => runSearch(searchState.term));
  document.querySelector('#load-more')?.addEventListener('click', () => runSearch(searchState.term, true));
  document.querySelector('#broaden-search')?.addEventListener('click', () => { filters = { ...defaultFilters, match: 'any', field: 'all' }; research(); runSearch(searchState.term); });
  document.querySelector('#save-search')?.addEventListener('click', () => {
    const entry = { term: searchState.term, filters: { ...searchState.usedFilters }, savedAt: new Date().toISOString() };
    if (workspace.searches.some(s => s.term === entry.term && JSON.stringify(s.filters) === JSON.stringify(entry.filters))) { toast('This search is already saved'); return; }
    if (workspace.searches.length >= 20) { toast('You have 20 saved searches. Remove one before adding another.'); return; }
    workspace.searches.unshift(entry); if (persist()) toast('Search added to your account workspace'); renderSavedSearches();
  });
  document.querySelector('#export-search')?.addEventListener('click', () => download('physiosidekick-search-record.txt', `PhysioSidekick research search\nSource: ${searchState.provider}\nRun: ${searchState.searchedAt}\nEntered search: ${searchState.term || '[author only]'}\nOptions: ${exact ? 'Exact identifier lookup; discovery filters ignored' : searchDescription(f)}\nQuery: ${searchState.query}\nSource note: ${searchState.note || 'None'}\nResults reported at search time: ${searchState.total}\n\nDiscovery search only; not a comprehensive systematic-review strategy.\n`, 'text/plain'));
}
function paperCard(p, savedView = false) {
  const saved = workspace.saved.some(s => s.id === p.id);
  const type = p.types?.find(t => /systematic review|meta-analysis|randomized controlled trial/i.test(t)) || p.types?.[0] || 'Indexed publication';
  return `<article class="card paper-card" data-paper="${esc(p.id)}"><div class="paper-tags"><span class="badge neutral">${esc(type)}</span><span class="badge ${p.openAccess ? 'oa' : ''}">${p.fullText ? 'Free full-text link indexed' : p.openAccess ? 'Open access indexed · link unavailable' : 'Free access not confirmed'}</span>${p.retracted ? '<span class="badge" style="background:#ffe9e2;color:#a03f28">Retracted publication</span>' : ''}</div>
  <h3><button class="paper-title" data-detail="${esc(p.id)}">${esc(p.title)}</button></h3><div class="paper-meta">${esc(p.authors || 'Authors not supplied')}<br>${esc(p.journal || 'Journal not supplied')} · ${esc(p.year || 'Date not supplied')}</div>
  <p class="paper-abstract">${esc(p.abstract || (p.abstractStatus === 'notIndexed' ? 'No English abstract is indexed in the retrieved PubMed record. Open the original source for details.' : 'Abstract not loaded in these search results. Open the record to check the original indexed abstract.'))}</p>
  <div class="paper-actions"><button class="text-button" data-detail="${esc(p.id)}">Read record</button><a href="${esc(p.recordURL)}" target="_blank" rel="noopener noreferrer">PubMed</a>${p.fullText ? `<a class="full-text-link" href="${esc(p.fullText)}" target="_blank" rel="noopener noreferrer">Read free full text</a>` : ''}${p.doi ? `<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">Publisher / DOI</a>` : ''}<button class="save-button ${saved ? 'saved' : ''}" data-save="${esc(p.id)}" aria-label="${saved ? 'Remove saved paper' : 'Save paper'}: ${esc(p.title)}">${icon('library')}${saved ? 'Saved' : 'Save'}</button></div>
  ${savedView ? `<div class="saved-extra"><div class="button-row"><button class="button secondary" data-appraise="${esc(p.id)}">${workspace.appraisals.some(a => a.paperId === p.id) ? 'Continue appraisal' : 'Appraise this paper'}</button></div><div class="saved-grid"><div class="field"><label for="collection-${p.pmid}">Collection</label><input id="collection-${p.pmid}" value="${esc(p.collection || '')}" data-collection="${esc(p.id)}" placeholder="e.g. Shoulder assignment" maxlength="80" list="collection-options"></div><div class="field"><label>Reference</label><button class="button secondary" data-copy="${esc(p.id)}">Copy citation</button></div></div><div class="field"><label for="note-${p.pmid}">Your notes</label><textarea id="note-${p.pmid}" data-note="${esc(p.id)}" maxlength="10000" placeholder="What did you learn? No identifiable patient information.">${esc(p.notes || '')}</textarea></div><button class="button secondary" data-save-notes="${esc(p.id)}">Save collection & notes</button></div>` : ''}</article>`;
}
function paperDetail(id) {
  const p = workspace.saved.find(p => p.id === id) || paperMap.get(id); if (!p) return;
  openDialog(`<span class="eyebrow">ORIGINAL PUBLICATION RECORD</span><h2 id="dialog-title">${esc(p.title)}</h2><p class="paper-meta">${esc(p.authors)}<br>${esc(p.journal)} · ${esc(p.year)}</p>
  ${p.retracted ? '<div class="notice error">This record is marked as a retracted publication. Investigate the retraction notice before using its findings.</div>' : ''}
  <div class="identifier">PMID: ${esc(p.pmid)}${p.doi ? `<br>DOI: ${esc(p.doi)}` : ''}</div><div class="button-row"><a class="button" href="${esc(p.recordURL)}" target="_blank" rel="noopener noreferrer">Open PubMed record</a>${p.fullText ? `<a class="button secondary" href="${esc(p.fullText)}" target="_blank" rel="noopener noreferrer">Open free full text</a>` : p.doi ? `<a class="button secondary" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">Check publisher access</a>` : ''}</div>
  <section class="access-panel"><h3>Get the full paper</h3>${p.fullText ? `<p>A free full-text link is listed by the index. The provider controls access and the version available.</p><div class="button-row">${(p.fullTextLinks?.length ? p.fullTextLinks : [{ url: p.fullText, style: 'full text', provider: 'Indexed source' }]).map(l => `<a class="button secondary" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.style === 'pdf' ? 'PDF' : l.style === 'html' ? 'Full text' : l.style)} · ${esc(l.provider.replaceAll('_', ' '))}</a>`).join('')}</div>` : `<p>A free full-text link is not confirmed here. That does not necessarily mean the paper is paywalled.</p><ol><li>Open the publisher/DOI or PubMed record and check its full-text links.</li><li>If asked to pay, try your university, NHS or employer library’s institutional sign-in.</li><li>Ask your library about document supply or an authorised author manuscript.</li></ol>`}</section><h3>Indexed abstract</h3><p class="abstract-full">${esc(p.abstract || (p.abstractStatus === 'notIndexed' ? 'No English abstract is indexed in the retrieved PubMed record. The paper may have other-language material; check its original record.' : 'An abstract was not supplied with these search results. You can check the original PubMed record below.'))}</p>${p.abstractSource ? `<p class="subtle">Abstract source: ${esc(p.abstractSource)} · Retrieved ${esc(new Date(p.abstractRetrievedAt).toLocaleString('en-GB'))}. <a href="${esc(p.recordURL)}" target="_blank" rel="noopener noreferrer">Verify at PubMed</a></p>${p.abstractCopyright ? `<p class="subtle">${esc(p.abstractCopyright)}</p>` : ''}` : ''}${!p.abstract ? `<button class="button secondary" data-load-abstract="${esc(id)}" ${abstractRequests.has(id) ? 'disabled' : ''}>${abstractRequests.has(id) ? 'Loading original abstract…' : p.abstractStatus === 'notIndexed' ? 'Recheck PubMed abstract' : 'Load original PubMed abstract'}</button>` : ''}${abstractErrors.has(id) ? `<div class="notice error">${esc(abstractErrors.get(id))}</div>` : ''}<div class="notice">This is publication metadata and an indexed abstract, not an AI summary or a quality assessment. Full text may contain important methods, results and limitations omitted here.</div>
  <div class="button-row"><button class="button" data-appraise="${esc(p.id)}">Appraise this paper</button></div><h3>Before applying the findings</h3><ul><li>Does the population and setting match your question?</li><li>How was the study designed, and what could bias its findings?</li><li>How large and uncertain are the effects, and were harms reported?</li><li>Have you read the full text, or only the abstract?</li></ul>
  <div class="button-row"><button class="button secondary" data-save="${esc(p.id)}">${icon('library')}${workspace.saved.some(s => s.id === id) ? 'Remove from saved papers' : 'Save to my papers'}</button><button class="button secondary" data-copy="${esc(p.id)}">Copy citation</button></div><p class="subtle" style="margin-top:20px">Record retrieved ${esc(new Date(p.retrievedAt).toLocaleDateString('en-GB'))}. <a href="${esc(p.indexedURL)}" target="_blank" rel="noopener noreferrer">View Europe PMC record</a>. Bibliographic details may be updated by the source.</p>`);
  dialog.dataset.paperId = id;
}
async function retrieveAbstract(id) {
  const p = workspace.saved.find(p => p.id === id) || paperMap.get(id); if (!p || abstractRequests.has(id)) return;
  abstractErrors.delete(id);
  const request = loadOriginalAbstract(p.pmid); abstractRequests.set(id, request); paperDetail(id);
  try {
    const record = await request;
    // Apply only abstract metadata to the latest saved paper, preserving notes edited while loading.
    const latest = workspace.saved.find(paper => paper.id === id) || paperMap.get(id) || p;
    const updated = applyOriginalAbstract(latest, record); paperMap.set(id, updated);
    const saved = workspace.saved.find(paper => paper.id === id);
    if (saved) { Object.assign(saved, updated); persist(); }
    searchState.papers = searchState.papers.map(paper => paper.id === id ? applyOriginalAbstract(paper, record) : paper);
  } catch (error) { abstractErrors.set(id, error.message); }
  finally {
    abstractRequests.delete(id);
    if (dialog.open && dialog.dataset.paperId === id) paperDetail(id);
  }
}
function toggleSave(id) {
  const p = paperMap.get(id); if (!p) return;
  const at = workspace.saved.findIndex(s => s.id === id);
  if (at >= 0) {
    const old = workspace.saved[at];
    if (old.notes || old.collection) {
      openDialog(`<h2 id="dialog-title">Remove this saved paper?</h2><p>Your collection assignment and paper notes will also be removed from your account workspace. Appraisals and linked CPD reflections are kept separately.</p><button class="button" id="confirm-unsave">Remove saved paper and notes</button>`);
      document.querySelector('#confirm-unsave').onclick = () => { workspace.saved = workspace.saved.filter(s => s.id !== id); finishSave('Paper removed'); dialog.close(); }; return;
    }
    workspace.saved.splice(at, 1); finishSave('Paper removed');
  } else { workspace.saved.unshift({ ...p, collection: '', notes: '', savedAt: new Date().toISOString() }); finishSave('Paper saved to your library'); }
  if (dialog.open) paperDetail(id);
}
function finishSave(message) {
  const ok = persist(); updateNav(); if (route === 'library') library(); else if (route === 'research') renderResults(); if (ok) toast(message);
}
function library() {
  const collections = [...new Set(workspace.saved.map(p => p.collection).filter(Boolean))].sort();
  const papers = workspace.saved.filter(p => `${p.title} ${p.authors} ${p.collection || ''} ${p.notes || ''}`.toLowerCase().includes(libraryFilter.toLowerCase()));
  main.innerHTML = `${intro('KEEP WHAT MATTERS', 'Your saved papers.', 'Build collections for a module, a clinical question or your next teaching session.')}<div class="library-header"><button class="button secondary" id="export-ris" ${!papers.length ? 'disabled' : ''}>${icon('download')}Export ${papers.length} references (.ris)</button><button class="text-button" id="export-citations" ${!papers.length ? 'disabled' : ''}>Download citations</button><span class="subtle">Imports into reference managers</span></div><div class="collection-bar"><input aria-label="Filter saved papers" id="library-search" placeholder="Search your papers, collections and notes…" value="${esc(libraryFilter)}"><span class="subtle">${papers.length} ${papers.length === 1 ? 'paper' : 'papers'}</span></div>
  <div class="button-row" style="margin-bottom:20px"><a class="button secondary" href="#appraisal" data-all-appraisals>My appraisals (${workspace.appraisals.length})</a></div>${collections.length ? `<div class="pill-list"><button class="pill ${!libraryFilter ? 'active' : ''}" data-library-filter="">All papers</button>${collections.map(c => `<button class="pill ${libraryFilter === c ? 'active' : ''}" data-library-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}<datalist id="collection-options">${collections.map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist>
  <div class="paper-list">${papers.length ? papers.map(p => paperCard(p, true)).join('') : `<div class="empty">${icon('library')}<h3>${workspace.saved.length ? 'No matching saved papers' : 'Your library starts with one good paper'}</h3><p>${workspace.saved.length ? 'Try another keyword or clear your filter.' : 'Save a research result, add it to a collection and make a note in your own words.'}</p><a class="button" href="#research">Find research</a></div>`}</div><div class="notice">Your papers and notes save to your signed-in account. On another device, open this same private app and use “Refresh from account” to load the latest saved version. Keep a workspace export as an additional copy.</div>`;
  document.querySelector('#library-search').addEventListener('input', e => { libraryFilter = e.target.value; const pos = e.target.selectionStart; library(); const input = document.querySelector('#library-search'); input.focus(); input.setSelectionRange?.(pos, pos); });
  document.querySelector('#export-ris').onclick = () => download('physiosidekick-references.ris', toRIS(papers), 'application/x-research-info-systems');
  document.querySelector('#export-citations').onclick = () => download('physiosidekick-citations.txt', papers.map(citation).join('\n\n'), 'text/plain');
}
function resourceCard(r) { return `<article class="card resource-card"><span class="badge">${r.label}</span><h3>${r.name}</h3><p>${r.description}</p><a class="text-button" href="${r.url}" target="_blank" rel="noopener noreferrer">Open original resource</a></article>`; }
function learn() {
  main.innerHTML = `${intro('LEARN WITH INTENTION', 'Understand more. Keep questioning.', 'Build the habits that connect anatomy, evidence and thoughtful practice.')}<div class="tabs" role="tablist" aria-label="Learning areas">${[['revision', 'My revision'], ['appraisal', 'Critical appraisal'], ['anatomy', 'Anatomy'], ['sources', 'Research sources']].map(([id, label]) => `<button class="tab ${learnTab === id ? 'active' : ''}" role="tab" aria-selected="${learnTab === id}" data-learn-tab="${id}" id="tab-${id}" aria-controls="learning-content">${label}</button>`).join('')}</div><section id="learning-content" role="tabpanel" aria-labelledby="tab-${learnTab}"></section>`;
  const area = document.querySelector('#learning-content');
  if (learnTab === 'revision') { renderStudySets(area); }
  else if (learnTab === 'anatomy') area.innerHTML = `<div class="anatomy-placeholder">${icon('anatomy')}<div><span class="eyebrow">ANATOMY WORKSPACE</span><h2>Start with the foundations.</h2><p>An integrated 3D anatomy viewer is planned. It is not included in this prototype: the model accuracy, licence and mobile performance need checking first.</p></div></div><div class="resource-grid">${resources.filter(r => r.area === 'anatomy').map(resourceCard).join('')}<article class="card resource-card"><span class="badge">Connect the learning</span><h3>From structure to research</h3><p>Explore papers about shoulder anatomy and biomechanics, then keep useful findings in a collection.</p><button class="text-button" data-search="Shoulder anatomy biomechanics">Find shoulder anatomy papers</button></article></div>`;
  else if (learnTab === 'sources') area.innerHTML = `<div class="resource-grid">${resources.filter(r => r.area === 'research').map(resourceCard).join('')}</div>`;
  else { area.innerHTML = `<div class="two-col"><section class="card" id="quiz-area"></section><article class="card resource-card"><span class="badge">Start a useful habit</span><h3>Read. Question. Reflect.</h3><p>A summary is a starting point. Check the original source, write down what remains uncertain and decide what you need to learn next.</p><a href="#cpd" class="text-button">Capture a reflection</a><div class="notice">These short learning checks are introductory exercises, not accredited training or a clinical competency assessment.</div><a class="text-button" href="${resources[3].url}" target="_blank" rel="noopener noreferrer">Explore CASP appraisal checklists</a></article></div>`; renderQuiz(); }
}
function renderStudySets(area) {
  area.innerHTML = `<div class="card"><div class="split-heading"><h2>Your revision sets</h2><button class="button" data-new-study>New study set</button></div><p>Turn your reading into questions you can practise. Answers are your own notes; check the original paper before relying on them.</p>${workspace.studySets.length ? workspace.studySets.map(set => `<article class="teaching-summary"><h3>${esc(set.title || 'Untitled study set')}</h3><p class="subtle">${set.cards.length} ${set.cards.length === 1 ? 'card' : 'cards'} · ${set.cards.filter(c => c.rating === 'again').length} marked for another look</p><button class="button secondary" data-open-study="${esc(set.id)}">Open study set</button></article>`).join('') : '<p class="subtle">Create a set, choose a saved paper and write a question and answer. You can also bring in your own appraisal notes.</p>'}</div>`;
}
function studyEditor() {
  const set = workspace.studySets.find(set => set.id === activeStudy);
  if (!set) { learnTab = 'revision'; learn(); return; }
  if (studyPractice?.setId === set.id) { renderStudyPractice(set); return; }
  main.innerHTML = `${intro('FROM READING TO RECALL', 'Make the learning stick.', 'Create your own source-linked questions. Set titles and practice ratings save automatically; use Save card to keep a new or edited card.')}<div class="button-row" style="margin-bottom:20px"><a class="text-button" href="#learn">All study sets</a><button class="button secondary" id="export-study">Export study set</button></div><section class="card"><div class="field"><label for="study-title">Study set title</label><input id="study-title" maxlength="180" value="${esc(set.title)}"></div><div class="button-row"><button class="button" id="new-study-card">Add revision card</button><button class="button secondary" id="practise-study" ${set.cards.length ? '' : 'disabled'}>Practise all cards</button><button class="text-button" id="practise-again" ${set.cards.some(c => c.rating === 'again') ? '' : 'disabled'}>Practise cards marked again</button></div><p class="subtle">${set.cards.length} ${set.cards.length === 1 ? 'card' : 'cards'} · ${set.cards.filter(c => c.rating === 'unrated').length} unrated · ${set.cards.filter(c => c.rating === 'again').length} marked again · ${set.cards.filter(c => c.rating === 'recalled').length} recalled on last attempt</p></section><div id="study-card-form"></div><div class="paper-list">${set.cards.map(card => `<article class="card"><span class="badge">${card.rating === 'again' ? 'Another look' : card.rating === 'recalled' ? 'Recalled · self-rated' : 'Not rated'}</span><h2>${esc(card.question)}</h2><details><summary>Show my saved answer</summary><p class="reflection-content">${esc(card.answer)}</p></details><p class="subtle">Source: ${esc(card.source.title)} · ${esc(readingLabels[card.source.readingBasis])}</p>${card.source.retracted ? '<div class="notice error">Source marked as retracted. Check the retraction notice.</div>' : ''}<div class="button-row"><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(card.source.pmid)}/" target="_blank" rel="noopener noreferrer">Open original paper record</a><button class="text-button" data-edit-card="${esc(card.id)}">Edit card</button><button class="danger-button" data-remove-card="${esc(card.id)}">Remove card</button></div></article>`).join('')}</div><div class="notice">Recall ratings are self-reported and apply to these personal notes. They do not verify the answer or assess clinical competence. No study time is automatically added to CPD.</div><button class="danger-button" id="remove-study">Remove study set</button>`;
  const editable = () => sync?.account && !sync.combining && sync.status !== 'loading';
  document.querySelector('#study-title').oninput = e => { if (!editable()) return; set.title = e.target.value; set.updatedAt = new Date().toISOString(); persist(); };
  document.querySelector('#new-study-card').onclick = () => { if (!editable()) return; if (set.cards.length >= 100) { toast('A study set can hold up to 100 cards.'); return; } if (studyDraft?.dirty) { toast('Save or cancel the current card first.'); return; } studyDraft = { setId: set.id, question: '', answer: '', sourceId: '', dirty: false }; renderStudyCardForm(set); };
  document.querySelector('#export-study').onclick = () => download('physiosidekick-study-set.md', studyMarkdown(set), 'text/markdown');
  const practise = onlyAgain => { if (studyDraft?.dirty) { toast('Save or cancel the current card before practising.'); return; } studyPractice = { setId: set.id, ids: set.cards.filter(c => !onlyAgain || c.rating === 'again').map(c => c.id), at: 0, revealed: false }; studyEditor(); };
  document.querySelector('#practise-study').onclick = () => practise(false); document.querySelector('#practise-again').onclick = () => practise(true);
  document.querySelectorAll('[data-edit-card]').forEach(button => button.onclick = () => {
    if (!editable()) return; if (studyDraft?.dirty) { toast('Save or cancel the current card first.'); return; }
    const c = set.cards.find(c => c.id === button.dataset.editCard); studyDraft = { setId: set.id, cardId: c.id, question: c.question, answer: c.answer, sourceId: `MED:${c.source.pmid}`, dirty: false }; renderStudyCardForm(set);
  });
  document.querySelectorAll('[data-remove-card]').forEach(button => button.onclick = () => {
    if (!editable()) return;
    openDialog('<h2 id="dialog-title">Remove this revision card?</h2><p>The card and its recall rating will be removed. Its saved paper and appraisal remain.</p><button class="button" id="confirm-card-remove">Remove card</button>');
    document.querySelector('#confirm-card-remove').onclick = () => { if (!editable()) return; set.cards = set.cards.filter(c => c.id !== button.dataset.removeCard); set.updatedAt = new Date().toISOString(); persist(); dialog.close(); studyDraft = null; studyEditor(); };
  });
  document.querySelector('#remove-study').onclick = () => {
    if (!editable()) return;
    openDialog('<h2 id="dialog-title">Remove this study set?</h2><p>This removes its cards and recall ratings from your account workspace. Export it first to keep a copy. Papers, appraisals and CPD records remain.</p><button class="button" id="confirm-study-remove">Remove study set</button>');
    document.querySelector('#confirm-study-remove').onclick = () => { if (!editable()) return; workspace.studySets = workspace.studySets.filter(s => s.id !== set.id); activeStudy = null; studyDraft = null; persist(); dialog.close(); learnTab = 'revision'; navigate('learn'); };
  };
  if (studyDraft?.setId === set.id) renderStudyCardForm(set);
}
function renderStudyCardForm(set) {
  const d = studyDraft, existing = set.cards.find(c => c.id === d.cardId);
  const oldSourceMissing = existing && !workspace.saved.some(p => p.pmid === existing.source.pmid);
  document.querySelector('#study-card-form').innerHTML = `<form id="revision-card-form" class="card form-card" style="margin-top:20px"><h2>${existing ? 'Edit revision card' : 'Write a revision card'}</h2><p>Write an answer you have checked. Bringing in appraisal notes creates an editable draft, not an AI answer.</p><div class="field"><label for="revision-source">Source paper</label><select id="revision-source" required><option value="">Choose a saved paper</option>${oldSourceMissing ? `<option value="MED:${esc(existing.source.pmid)}">${esc(existing.source.title)} · retained source snapshot</option>` : ''}${workspace.saved.map(p => `<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('')}</select></div><div class="button-row"><button class="button secondary" type="button" id="notes-to-card">Use my appraisal notes</button><a class="text-button" href="#research">Find papers</a></div><div class="field"><label for="revision-question">Question</label><textarea id="revision-question" maxlength="1000" required>${esc(d.question)}</textarea></div><div class="field"><label for="revision-answer">Answer in your own words</label><textarea id="revision-answer" maxlength="6000" required>${esc(d.answer)}</textarea></div><p class="subtle">Editing a question, answer or source resets its last recall rating. Your previous review count is retained.</p><div class="button-row"><button class="button" type="submit">Save card</button><button class="button secondary" type="button" id="cancel-study-card">Cancel card edit</button></div></form>`;
  document.querySelector('#revision-source').value = d.sourceId;
  const capture = () => { d.question = document.querySelector('#revision-question').value; d.answer = document.querySelector('#revision-answer').value; d.sourceId = document.querySelector('#revision-source').value; d.dirty = true; };
  document.querySelector('#revision-card-form').oninput = capture;
  document.querySelector('#revision-source').onchange = capture;
  document.querySelector('#notes-to-card').onclick = () => {
    const sourceId = document.querySelector('#revision-source').value;
    const a = workspace.appraisals.filter(a => a.paperId === sourceId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (document.querySelector('#revision-answer').value.trim() || document.querySelector('#revision-question').value.trim()) { toast('This card already has text. Start a new card to bring in appraisal notes.'); return; }
    try { const notes = cardFromNotes(a); document.querySelector('#revision-question').value = notes.question; document.querySelector('#revision-answer').value = notes.answer; capture(); } catch(e) { toast(e.message); }
  };
  document.querySelector('#cancel-study-card').onclick = () => { studyDraft = null; document.querySelector('#study-card-form').innerHTML = ''; };
  document.querySelector('#revision-card-form').onsubmit = e => {
    e.preventDefault(); if (!sync?.account || sync.combining || sync.status === 'loading') return; capture();
    const paper = workspace.saved.find(p => p.id === d.sourceId);
    const a = workspace.appraisals.filter(a => a.paperId === d.sourceId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    try {
      const source = existing && d.sourceId === `MED:${existing.source.pmid}` ? existing.source : undefined;
      const card = saveStudyCard({ question: d.question, answer: d.answer, paper, appraisal: a, source, existing });
      if (existing) set.cards = set.cards.map(c => c.id === existing.id ? card : c); else set.cards.push(card);
      set.updatedAt = new Date().toISOString(); persist(); studyDraft = null; studyEditor(); toast('Revision card queued for saving');
    } catch(e) { toast(e.message); }
  };
  document.querySelector('#revision-source').focus();
}
function renderStudyPractice(set) {
  const session = studyPractice, card = set.cards.find(c => c.id === session.ids[session.at]);
  main.innerHTML = `${intro('TRY BEFORE YOU REVEAL', 'Recall in your own words.', 'Think of your answer first, then reveal your saved notes and rate your recall.')}<button class="text-button" id="end-study-practice">Back to study set</button><section class="card recall-card" style="margin-top:20px">${card ? `${card.source.retracted ? '<div class="notice error">Source marked as retracted. Check the original record before studying these notes.</div>' : ''}<span class="eyebrow">CARD ${session.at+1} OF ${session.ids.length}</span><h2>${esc(card.question)}</h2>${session.revealed ? `<h3>Your saved answer</h3><p class="reflection-content">${esc(card.answer)}</p><p class="subtle">${esc(card.source.title)} · ${esc(readingLabels[card.source.readingBasis])}</p><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(card.source.pmid)}/" target="_blank" rel="noopener noreferrer">Check original source</a>${card.source.retracted ? '<div class="notice error">Source marked as retracted. Investigate the retraction notice.</div>' : ''}<div class="button-row" style="margin-top:20px"><button class="button secondary" id="rate-again">Needs another look</button><button class="button" id="rate-recalled">I recalled it</button></div>` : '<button class="button" id="reveal-study-answer">Reveal my answer</button>'}` : '<h2>This round is complete.</h2><p>Your recall ratings have been queued for account saving. You can return to cards marked for another look.</p>'}</section><div class="notice">This compares your recall with your own notes. It does not verify the answer, establish competence or log CPD time.</div>`;
  document.querySelector('#end-study-practice').onclick = () => { studyPractice = null; studyEditor(); };
  document.querySelector('#reveal-study-answer')?.addEventListener('click', () => { session.revealed = true; renderStudyPractice(set); });
  const rate = rating => {
    if (!session.revealed || !card || !sync?.account || sync.combining || sync.status === 'loading') return;
    set.cards = set.cards.map(c => c.id === card.id ? rateStudyCard(c, rating) : c); set.updatedAt = new Date().toISOString(); persist(); session.at++; session.revealed = false; renderStudyPractice(set);
  };
  document.querySelector('#rate-again')?.addEventListener('click', () => rate('again'));
  document.querySelector('#rate-recalled')?.addEventListener('click', () => rate('recalled'));
}

function renderQuiz() {
  quizAnswered = false; const q = questions[quizIndex];
  document.querySelector('#quiz-area').innerHTML = `<span class="eyebrow">A MOMENT TO THINK · ${quizIndex + 1} OF ${questions.length}</span><h2 style="margin:18px 0;font-size:1.2rem;line-height:1.5">${q.question}</h2><div>${q.options.map((o, i) => `<button class="quiz-option" data-answer="${i}">${o}</button>`).join('')}</div><div id="quiz-feedback" aria-live="polite"></div><button class="text-button" id="next-question" hidden>Next learning check</button>`;
  document.querySelector('#next-question').onclick = () => { quizIndex = (quizIndex + 1) % questions.length; renderQuiz(); };
}
function practice() {
  main.innerHTML = `${intro('PRACTICE RESOURCES', 'Go straight to the source.', 'A starting shelf of original professional resources. Always check scope, currency and local pathways.')}<div class="resource-grid">${resources.filter(r => r.area === 'practice').map(resourceCard).join('')}<article class="card resource-card"><span class="badge">Research in context</span><h3>Find the evidence behind a question</h3><p>Look up original publications, examine their limitations and save the ones relevant to your learning.</p><a class="text-button" href="#research">Search research</a></article></div><div class="notice">Validated outcome measures and assessment resources will be added after their exact versions, scoring methods and permissions are verified. No generic assessment scores are used here.</div>`;
}
function beginAppraisal(paperId) {
  const p = workspace.saved.find(p => p.id === paperId) || paperMap.get(paperId); if (!p) return;
  if (!sync?.account || sync.combining) { toast('Connect to your account before starting an appraisal.'); return; }
  let a = workspace.appraisals.filter(a => a.paperId === paperId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (!a) {
    a = newAppraisal(p); workspace.appraisals.unshift(a);
    if (!workspace.saved.some(saved => saved.id === paperId)) workspace.saved.unshift({ ...p, notes: '', collection: '', savedAt: new Date().toISOString() });
    persist();
  }
  activeAppraisal = a.id; if (dialog.open) dialog.close(); navigate('appraisal');
}
function appraisal() {
  const a = workspace.appraisals.find(a => a.id === activeAppraisal);
  if (!a) {
    main.innerHTML = `${intro('READ. QUESTION. REFLECT.', 'Your paper appraisals.', 'Keep your reasoning beside the source, then decide what you want to learn next.')}<div class="button-row"><a class="button secondary" href="#library">Saved papers</a><a class="button" href="#research">Find a paper</a></div><div class="paper-list">${workspace.appraisals.length ? workspace.appraisals.map(entry => `<article class="card"><span class="badge">${esc(basisLabels[entry.basis])}</span><h2>${esc(entry.title)}</h2><p class="subtle">PMID ${esc(entry.pmid)} · Last edited ${esc(new Date(entry.updatedAt).toLocaleString('en-GB'))}</p><button class="button secondary" data-open-appraisal="${esc(entry.id)}">Open appraisal</button></article>`).join('') : '<div class="empty"><h2>Start with a real paper</h2><p>Open a paper record or a saved paper and choose “Appraise this paper”.</p></div>'}</div>`;
    return;
  }
  main.innerHTML = `${intro('YOUR REASONING, BESIDE THE SOURCE', 'Appraise this paper.', 'Notes save as you type to your account. Use the account status above to check whether saving has completed.')}<div class="button-row" style="margin-bottom:20px"><button class="text-button" id="all-appraisals">All appraisals</button><a class="text-button" href="#library">Saved papers</a></div><article class="card appraisal-source"><h2>${esc(a.title)}</h2><p>${esc(a.citation)}</p><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(a.pmid)}/" target="_blank" rel="noopener noreferrer">Open original PubMed record</a>${paperMap.get(a.paperId)?.retracted ? '<div class="notice error">This indexed paper is marked as retracted. Investigate the retraction notice before using its findings.</div>' : ''}</article><form id="appraisal-form" class="card form-card" style="margin-top:20px"><h2>What have you reviewed?</h2><div class="form-row"><div class="field"><label for="appraisal-basis">Reading basis</label><select id="appraisal-basis" data-appraisal-field="basis">${Object.entries(basisLabels).map(([key,label]) => `<option value="${key}" ${key === a.basis ? 'selected' : ''}>${label}</option>`).join('')}</select></div><div class="field"><label for="appraisal-design">Study design (your assessment)</label><input id="appraisal-design" data-appraisal-field="design" maxlength="200" value="${esc(a.design)}" placeholder="e.g. Trial, review, cohort; unsure is fine"></div></div><div class="notice" id="appraisal-basis-note"></div>${appraisalFields.map(([key,label,hint]) => `<div class="field"><label for="appraisal-${key}">${label}</label><p class="subtle" id="hint-${key}">${hint}</p><textarea id="appraisal-${key}" data-appraisal-field="${key}" maxlength="5000" aria-describedby="hint-${key}">${esc(a[key])}</textarea></div>`).join('')}<div class="notice">These are general learning prompts, not a validated appraisal instrument or an automatic quality score. Use a study-specific checklist when appropriate. Keep patient information out of your notes.</div><div class="button-row"><button class="button" type="button" id="appraisal-reflect">${workspace.reflections.some(r => r.appraisalId === a.id) ? 'Open linked CPD reflection' : 'Create CPD reflection'}</button><button class="button secondary" type="button" id="export-appraisal">Export appraisal</button></div></form>`;
  const basisNote = () => { document.querySelector('#appraisal-basis-note').textContent = a.basis === 'abstract' ? 'Abstract only: important methods, harms and limitations may be missing. Record those gaps and read the full text before drawing conclusions that need it.' : a.basis === 'fullText' ? 'Full text recorded as read. Consider the methods, results, harms, uncertainty and relevance; reading the full text does not itself establish quality.' : 'Not yet read. Keep questions here as a draft; record what you have actually read before creating a CPD reflection.'; };
  basisNote();
  document.querySelector('#appraisal-form').onsubmit = e => e.preventDefault();
  document.querySelector('#appraisal-form').addEventListener('input', e => {
    const key = e.target.dataset.appraisalField; if (!key) return;
    if (!sync?.account || sync.combining || sync.status === 'loading') return;
    a[key] = e.target.value; a.updatedAt = new Date().toISOString(); persist(); if (key === 'basis') basisNote();
  });
  document.querySelector('#all-appraisals').onclick = () => { activeAppraisal = null; appraisal(); };
  document.querySelector('#export-appraisal').onclick = () => download(`physiosidekick-appraisal-${a.pmid}.md`, appraisalMarkdown(a), 'text/markdown');
  document.querySelector('#appraisal-reflect').onclick = () => {
    try {
      const existing = workspace.reflections.find(r => r.appraisalId === a.id);
      reflectionDraft = existing ? null : reflectionFromAppraisal(a); reflectionEditing = existing?.id || null;
      cpdFormOpen = true; navigate('cpd');
    } catch (e) { toast(e.message); }
  };
}

function cpd() {
  const total = workspace.reflections.reduce((sum, r) => sum + Number(r.minutes || 0), 0);
  main.innerHTML = `${intro('YOUR DEVELOPMENT', 'Give your learning a next step.', 'Record what you learned, why it matters and what you intend to do with it.', '<button class="button" id="new-reflection">'+icon('plus')+'Add reflection</button>')}<div class="card"><div class="split-heading"><h2>Your learning record</h2><button class="text-button" id="export-cpd" ${!workspace.reflections.length ? 'disabled' : ''}>Export reflections</button></div><div class="stat-line"><div><strong>${workspace.reflections.length}</strong><span>Reflections recorded</span></div><div><strong>${total}</strong><span>Learning minutes logged</span></div></div></div>
  <div class="notice">This is your personal learning log. Time logged does not establish accreditation or fulfilment of regulatory requirements. Keep entries free of identifiable patient information.</div><div class="button-row" style="margin-bottom:20px"><a class="button secondary" href="#appraisal" data-all-appraisals>My paper appraisals</a></div><div id="reflection-form-area"></div><div class="paper-list">${workspace.reflections.length ? workspace.reflections.map(r => `<article class="card"><div class="reflection-meta"><span>${esc(r.date)}</span><span>· ${Number(r.minutes)} minutes</span><span class="badge">${esc(r.kind)}</span></div><h3>${esc(r.title)}</h3><p class="reflection-content">${esc(r.learning)}</p><h3>My next step</h3><p class="reflection-content">${esc(r.action)}</p>${r.source ? `<p class="identifier">Source: ${esc(r.source)}</p>` : ''}${r.appraisalId ? `<p class="subtle">Reading basis at reflection: ${esc(basisLabels[r.basis] || 'Not recorded')}</p><button class="text-button" data-open-appraisal="${esc(r.appraisalId)}">Open linked appraisal</button>` : ''}<div class="reflection-actions"><button class="text-button" data-edit-reflection="${esc(r.id)}">Edit reflection</button><button class="danger-button" data-delete-reflection="${esc(r.id)}">Remove</button></div></article>`).join('') : `<div class="empty">${icon('cpd')}<h3>A useful thought is worth keeping</h3><p>Start with a paper, a teaching session or a question that changed your understanding.</p><button class="button secondary" id="first-reflection">Write your first reflection</button></div>`}</div>`;
  document.querySelector('#new-reflection').onclick = () => { reflectionEditing = null; reflectionDraft = null; cpdFormOpen = true; renderReflectionForm(); };
  document.querySelector('#first-reflection')?.addEventListener('click', () => { reflectionEditing = null; reflectionDraft = null; cpdFormOpen = true; renderReflectionForm(); });
  document.querySelector('#export-cpd').onclick = () => download('physiosidekick-reflections.md', '# My learning reflections\n\n' + workspace.reflections.map(r => `## ${r.title}\n${r.date} · ${r.minutes} minutes · ${r.kind}\n\n${r.learning}\n\n### Next step\n${r.action}\n\nSource: ${r.source || 'Not recorded'}${r.appraisalId ? `\nAppraisal ID: ${r.appraisalId}\nReading basis at reflection: ${basisLabels[r.basis] || 'Not recorded'}` : ''}`).join('\n\n---\n\n'), 'text/markdown');
  if (cpdFormOpen) renderReflectionForm();
}
function renderReflectionForm() {
  const r = reflectionDraft || workspace.reflections.find(r => r.id === reflectionEditing) || {};
  const area = document.querySelector('#reflection-form-area');
  area.innerHTML = `<form id="reflection-form" class="card form-card" style="margin-bottom:20px"><h2>${r.id ? 'Edit your reflection' : 'Capture a reflection'}</h2>${r.appraisalId ? `<div class="notice">Draft from your own appraisal notes · ${esc(basisLabels[r.basis] || 'Reading basis not recorded')}. Check the wording and enter the time actually spent before saving. Later appraisal edits do not rewrite this reflection.</div>` : ''}<div class="field"><label for="reflection-title">Learning title</label><input id="reflection-title" name="title" value="${esc(r.title || '')}" maxlength="180" required></div><div class="form-row"><div class="field"><label for="reflection-date">Date</label><input id="reflection-date" name="date" type="date" value="${esc(r.date || new Date().toISOString().slice(0, 10))}" required></div><div class="field"><label for="reflection-minutes">Learning time in minutes</label><input id="reflection-minutes" name="minutes" type="number" min="1" max="1440" value="${r.appraisalId ? esc(r.minutes || '') : Number(r.minutes || 15)}" required></div></div><div class="field"><label for="reflection-kind">Activity</label><select id="reflection-kind" name="kind"><option>Research reading</option><option>Teaching</option><option>Course or learning</option><option>Professional reflection</option></select></div><div class="field"><label for="reflection-learning">What did you learn, and why does it matter?</label><textarea id="reflection-learning" name="learning" maxlength="10000" required>${esc(r.learning || '')}</textarea></div><div class="field"><label for="reflection-action">What will you do next?</label><textarea id="reflection-action" name="action" maxlength="10000" required>${esc(r.action || '')}</textarea></div><div class="field"><label for="reflection-source">Source or reference (optional)</label><input id="reflection-source" name="source" value="${esc(r.source || '')}" maxlength="1000" placeholder="Paper DOI, guideline or session title"></div><div class="button-row"><button class="button" type="submit">Save reflection</button><button class="button secondary" type="button" id="cancel-reflection">Cancel</button></div></form>`;
  if (r.kind) document.querySelector('#reflection-kind').value = r.kind;
  document.querySelector('#reflection-form').addEventListener('input', e => {
    const data = Object.fromEntries(new FormData(e.currentTarget));
    reflectionDraft = { ...r, ...data, ...(r.id ? { id: r.id } : {}) };
  });
  document.querySelector('#cancel-reflection').onclick = () => { cpdFormOpen = false; reflectionEditing = null; reflectionDraft = null; area.innerHTML = ''; };
  document.querySelector('#reflection-form').onsubmit = e => {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!data.title.trim() || !data.learning.trim() || !data.action.trim()) { toast('Please complete the title, learning and next step.'); return; }
    const entry = { ...data, ...(r.appraisalId ? { appraisalId: r.appraisalId, paperId: r.paperId, basis: r.basis } : {}), id: r.id || crypto.randomUUID(), minutes: Number(data.minutes) };
    workspace.reflections = r.id ? workspace.reflections.map(old => old.id === r.id ? entry : old) : [entry, ...workspace.reflections];
    const ok = persist(); cpdFormOpen = false; reflectionEditing = null; reflectionDraft = null; cpd(); if (ok) toast('Reflection added to your workspace');
  };
  document.querySelector('#reflection-title').focus();
}
function fcp() {
  main.innerHTML = `${intro('FIRST CONTACT PRACTICE', 'Teach with a purpose.', 'A dedicated space for FCP learning, reflection and team teaching.')}<section class="fcp-banner"><span class="eyebrow">SPECIALIST AREA · PROTOTYPE PREVIEW</span><h2 style="margin-top:12px">Your next teaching session starts here.</h2><p>Build a discussion plan, add a verified source and make the learning practical. The future premium curriculum and pricing have not been set.</p></section><section class="card" style="margin-bottom:20px"><div class="split-heading"><h2>Your teaching sessions</h2><button class="button" data-new-teaching>New session</button></div><p>Plans and paper references save to your account. Return here to continue or adapt a session.</p>${workspace.teachingPlans.length ? workspace.teachingPlans.map(t => `<article class="teaching-summary"><h3>${esc(t.title || 'Untitled teaching session')}</h3><p class="subtle">${esc(t.audience || 'Audience not recorded')} · ${t.minutes} minutes · ${t.sources.length} attached papers · Draft</p><div class="button-row"><button class="text-button" data-open-teaching="${esc(t.id)}">Open session</button><button class="text-button" data-copy-teaching="${esc(t.id)}">Duplicate session</button></div></article>`).join('') : '<p class="subtle">Start a blank session or use one of the frameworks below.</p>'}</section><div class="resource-grid">${teachingTopics.map((t, i) => `<article class="card resource-card"><span class="badge">Teaching framework · 15 minutes</span><h3>${t.title}</h3><p>${t.summary}</p><button class="text-button" data-teaching="${i}">Create teaching outline</button></article>`).join('')}<article class="card resource-card"><span class="badge">Source shelf</span><h3>Start from the current guidance</h3><p>Use the original recommendation, check its scope and add your local pathway before delivering a session.</p><a class="text-button" href="#practice">Open practice resources</a></article></div><div class="notice">These are editable planning frameworks, not reviewed clinical teaching packs, prescribing advice, accredited training or competency sign-off. Clinical teaching content needs professional review before use.</div>`;
}
function teaching(index) {
  const topic = teachingTopics[index]; if (!topic) return;
  createTeaching(topic);
}
function createTeaching(topic) {
  if (!sync?.account || sync.combining || sync.status === 'loading') { toast('Connect to your account before creating a session.'); return; }
  const plan = newTeachingPlan(topic); workspace.teachingPlans.unshift(plan); activeTeaching = plan.id; persist(); navigate('teaching');
}
function teachingEditor() {
  const t = workspace.teachingPlans.find(t => t.id === activeTeaching);
  if (!t) { fcp(); return; }
  const fields = [['objectives','Learning objectives','What should learners be able to explain, question or do after the session?'],['agenda','Agenda','Check that the timings in your edited agenda fit the planned session length.'],['discussion','Fictional case or discussion question','Use a fictional scenario or general question. Do not enter identifiable patient information.'],['preparation','Facilitator preparation','What do you need to read, check or prepare before teaching?'],['takeaways','Takeaways and next action','What should the group take away, and what uncertainty or follow-up remains?'],['guidance','Guidance or other references to check','Record guideline titles, versions, URLs and any local pathway you need to verify.']];
  main.innerHTML = `${intro('FROM EVIDENCE TO TEACHING', 'Build a useful session.', 'Your plan saves as you type. Check the account status above for confirmation.')}<div class="button-row" style="margin-bottom:20px"><a class="text-button" href="#fcp">All teaching sessions</a><button class="button secondary" id="export-teaching">Export teaching plan</button></div><div class="notice">Draft planning workspace. Source attachment does not verify clinical content or establish study quality. Review the original papers and complete the plan before delivery.</div><form id="saved-teaching-form" class="card form-card"><div class="field"><label for="session-title">Session title</label><input id="session-title" data-session-field="title" maxlength="180" value="${esc(t.title)}"></div><div class="form-row"><div class="field"><label for="session-audience">Audience</label><input id="session-audience" data-session-field="audience" maxlength="120" value="${esc(t.audience)}" placeholder="e.g. FCP team or student journal club"></div><div class="field"><label for="session-minutes">Planned duration in minutes</label><input id="session-minutes" data-session-field="minutes" type="number" min="5" max="480" value="${t.minutes}" aria-describedby="session-time-hint"><p class="subtle" id="session-time-hint">5–480 minutes. Learning time is not automatically added to CPD.</p></div></div>${fields.map(([key,label,hint]) => `<div class="field"><label for="session-${key}">${label}</label><p class="subtle" id="session-hint-${key}">${hint}</p><textarea id="session-${key}" data-session-field="${key}" maxlength="6000" aria-describedby="session-hint-${key}">${esc(t[key])}</textarea></div>`).join('')}</form><section class="card" style="margin-top:20px"><h2>Attach real paper references</h2><p>Choose a paper saved in your library. Citations and original links are retained with this plan, even if you later remove the paper from your library.</p><div class="field"><label for="session-paper">Saved paper</label><select id="session-paper"><option value="">Choose a saved paper</option>${workspace.saved.map(p => `<option value="${esc(p.id)}">${esc(p.title)} · PMID ${esc(p.pmid)}</option>`).join('')}</select></div><div class="button-row"><button class="button secondary" id="attach-session-paper" ${workspace.saved.length ? '' : 'disabled'}>Attach selected paper</button><a class="text-button" href="#research">Find more papers</a></div><div id="session-sources"></div></section><div class="button-row" style="margin-top:20px"><button class="danger-button" id="remove-teaching">Remove this session</button></div>`;
  document.querySelector('#saved-teaching-form').onsubmit = e => e.preventDefault();
  document.querySelector('#saved-teaching-form').addEventListener('input', e => {
    const key = e.target.dataset.sessionField; if (!key || !sync?.account || sync.combining || sync.status === 'loading') return;
    if (key === 'minutes') {
      const minutes = Number(e.target.value); if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) { e.target.setCustomValidity('Use 5 to 480 minutes.'); return; }
      e.target.setCustomValidity('');
      if (t.agenda === suggestedAgenda(t.minutes)) { t.agenda = suggestedAgenda(minutes); document.querySelector('#session-agenda').value = t.agenda; }
      t.minutes = minutes;
    } else t[key] = e.target.value;
    t.updatedAt = new Date().toISOString(); persist();
  });
  document.querySelector('#export-teaching').onclick = () => {
    if (!document.querySelector('#session-minutes').reportValidity()) return;
    download('physiosidekick-teaching-plan.md', teachingMarkdown(t), 'text/markdown');
  };
  document.querySelector('#attach-session-paper').onclick = () => {
    if (!sync?.account || sync.combining || sync.status === 'loading') return;
    const paper = workspace.saved.find(p => p.id === document.querySelector('#session-paper').value);
    if (!paper) { toast('Choose a saved paper first.'); return; }
    if (t.sources.some(s => s.pmid === paper.pmid)) { toast('That paper is already attached.'); return; }
    if (t.sources.length >= 20) { toast('A session can have up to 20 attached papers.'); return; }
    const appraisal = workspace.appraisals.filter(a => a.paperId === paper.id).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    t.sources.push(teachingSource(paper, appraisal)); t.updatedAt = new Date().toISOString(); persist(); renderTeachingSources(t);
  };
  document.querySelector('#remove-teaching').onclick = () => {
    openDialog('<h2 id="dialog-title">Remove this teaching session?</h2><p>The session plan and its attached reference snapshots will be removed from your account workspace. Saved papers, appraisals and CPD reflections remain. Export a copy first if you want to keep it.</p><button class="button" id="confirm-remove-teaching">Remove session</button>');
    document.querySelector('#confirm-remove-teaching').onclick = () => {
      if (!sync?.account || sync.combining || sync.status === 'loading') return;
      workspace.teachingPlans = workspace.teachingPlans.filter(p => p.id !== t.id); activeTeaching = null; persist(); dialog.close(); navigate('fcp');
    };
  };
  renderTeachingSources(t);
}
function renderTeachingSources(t) {
  const area = document.querySelector('#session-sources');
  area.innerHTML = t.sources.length ? t.sources.map(s => `<article class="teaching-summary"><h3>${esc(s.title)}</h3><p>${esc(s.citation)}</p><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(s.pmid)}/" target="_blank" rel="noopener noreferrer">Open original PubMed record</a>${s.retracted ? '<div class="notice error">Marked as retracted in the attached index record. Investigate the retraction notice before teaching from it.</div>' : ''}<div class="field" style="margin-top:15px"><label for="session-basis-${s.pmid}">Reading basis for this session</label><select id="session-basis-${s.pmid}" data-session-basis="${esc(s.pmid)}">${Object.entries(readingLabels).map(([key,label]) => `<option value="${key}" ${key === s.readingBasis ? 'selected' : ''}>${label}</option>`).join('')}</select><p class="subtle">Initially copied from the latest saved appraisal when present. Confirm what you actually reviewed. This is your declaration, not an app quality check.</p></div><button class="text-button" data-remove-source="${esc(s.pmid)}">Detach reference</button></article>`).join('') : '<p class="subtle" style="margin-top:20px">No papers attached yet.</p>';
  area.onchange = e => {
    if (!sync?.account || sync.combining || sync.status === 'loading') return;
    const source = t.sources.find(s => s.pmid === e.target.dataset.sessionBasis); if (!source) return;
    source.readingBasis = e.target.value; t.updatedAt = new Date().toISOString(); persist();
  };
  area.onclick = e => {
    if (!sync?.account || sync.combining || sync.status === 'loading') return;
    const button = e.target.closest('[data-remove-source]'); if (!button) return;
    t.sources = t.sources.filter(s => s.pmid !== button.dataset.removeSource); t.updatedAt = new Date().toISOString(); persist(); renderTeachingSources(t);
  };
}

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function copyCitation(id) {
  const p = paperMap.get(id); if (!p) return;
  try { await navigator.clipboard.writeText(citation(p)); toast('Citation copied · check your required referencing style'); }
  catch { openDialog(`<h2 id="dialog-title">Copy this citation</h2><p>${esc(citation(p))}</p><p class="subtle">Check against your university or publisher’s required referencing style.</p>`); }
}
function privacy() {
  openDialog(`<span class="eyebrow">YOUR ACCOUNT WORKSPACE</span><h2 id="dialog-title">Your data & privacy</h2><p>Your papers, notes, saved searches, appraisals, teaching plans, revision sets and reflections are stored in the app’s account database, tied to your signed-in identity. The app keeps an account-specific device copy of pending changes so interrupted saves can be recovered.</p><p>Open the same private app on your iPhone or Mac and sign in with the same account. Data loads when you open the app; “Refresh from account” fetches newer changes. This is not live simultaneous editing.</p><p>Research keywords pass through the app server to Europe PMC, with PubMed (NCBI) as a backup. Publication metadata may be cached for five minutes. Opening a missing abstract can request that paper’s PMID from PubMed; a retrieved abstract and its source are kept when you save the paper. Your account identity is not forwarded to either research service. External resources use their own privacy policies, and fonts load from Google Fonts. Keep identifiable patient information out of this educational prototype.</p><div class="button-row"><button class="button" id="export-workspace">${icon('download')}Export workspace backup</button><label class="button secondary" for="import-workspace">Import a backup</label><input id="import-workspace" type="file" accept="application/json,.json" class="file-input"></div><p class="subtle" style="margin-top:15px">Import shows a summary before combining records. It does not replace the account workspace. Conflicting notes are kept together and conflicting reflections become separate entries.</p>${sync?.pending ? '<div class="notice">This device has changes not yet confirmed by the account server. The export includes your current version.</div>' : ''}<p><a href="/signout-with-chatgpt?return_to=%2F" target="_top">Sign out of this app</a></p>`);
  document.querySelector('#export-workspace').onclick = () => download('physiosidekick-workspace.json', JSON.stringify({ version: 6, exportedAt: new Date().toISOString(), workspace: sync.invalidPending || sync.pending || workspace }, null, 2), 'application/json');
  document.querySelector('#import-workspace').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { if (file.size > 2 * 1024 * 1024) throw new Error('Use a workspace export no larger than 2 MB.'); const raw = JSON.parse(await file.text()); reviewImport(validateWorkspace(raw.workspace || raw), false); }
    catch (error) { toast(`Import not started: ${error.message}`); }
  };
}
function reviewImport(data, legacy = false) {
  if (cpdFormOpen) { toast('Save or cancel your reflection before importing records.'); return; }
  openDialog(`<span class="eyebrow">REVIEW IMPORT</span><h2 id="dialog-title">Bring your records into your account</h2><p>This ${legacy ? 'browser' : 'backup'} contains <strong>${data.saved.length} papers, ${data.reflections.length} reflections and ${data.searches.length} searches and ${data.appraisals.length} appraisals and ${data.teachingPlans.length} teaching plans and ${data.studySets.length} study sets</strong>.</p><p>These will be combined with your account records. Duplicate papers stay as one paper; different notes are kept together. Conflicting reflections, appraisals, teaching plans and study sets become separate entries. Different collection names are recorded in the paper’s notes.</p><p>The original ${legacy ? 'browser records' : 'backup file'} will remain intact. Imports may restore a record you previously removed from the account.</p><button class="button" id="confirm-import" ${!sync?.account || sync?.inflight ? 'disabled' : ''}>Combine with my account records</button>`);
  document.querySelector('#confirm-import').onclick = async () => { dialog.close(); await sync.combine(data, legacy); };
}
function syncStatus(state) {
  document.querySelectorAll('[data-note],[data-collection]').forEach(el => { el.readOnly = state.status === 'loading' || state.combining; });
  const labels = { loading: 'Connecting…', saved: 'Account saved', pending: 'Changes pending', saving: 'Saving…', offline: 'Save interrupted', conflict: 'Changes need review', unavailable: 'Account unavailable', error: 'Save needs attention' };
  document.querySelector('#sync-status').textContent = labels[state.status] || state.status;
  const banner = document.querySelector('#sync-banner');
  let html = '';
  if (state.status === 'unavailable') html = `<div class="notice error">${esc(state.error)} No account records are shown until your identity is confirmed. <a href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in</a> <button class="text-button" id="retry-account">Retry connection</button></div>`;
  else if (state.status === 'conflict') html = `<div class="notice error">${esc(state.error)} <button class="text-button" id="review-conflict">Review recovery options</button></div>`;
  else if (['offline', 'error'].includes(state.status)) html = `<div class="notice error">${esc(state.error)} <button class="text-button" id="retry-account">Retry saving</button></div>`;
  else if (state.needsImport) html = '<div class="notice">You have records saved by an earlier version in this browser. <button class="text-button" id="review-local-import">Review and import them</button></div>';
  if (state.cacheFailed) html += '<div class="notice error">This browser cannot retain a recovery copy. Export your workspace if account saving is interrupted.</div>';
  banner.innerHTML = html;
  document.querySelector('#review-local-import')?.addEventListener('click', () => reviewImport(legacyWorkspace, true));
  document.querySelector('#review-conflict')?.addEventListener('click', conflictDialog);
  document.querySelector('#retry-account')?.addEventListener('click', () => state.account ? state.pending ? state.flush() : state.refresh() : state.init());
  if (state.account) document.querySelector('.profile strong').textContent = state.account.name;
}
function conflictDialog() {
  openDialog(`<h2 id="dialog-title">Keep both versions safe</h2><p>Your device has pending changes and the account has a newer version. No automatic overwrite has taken place.</p><p>You can combine both sets of records. Different notes are kept together and different versions of reflections, appraisals, teaching plans and study sets become separate entries. Removed records may return during a merge.</p><div class="button-row"><button class="button" id="merge-conflict">Combine both versions</button><button class="button secondary" id="export-pending">Export this device’s version</button></div>`);
  document.querySelector('#merge-conflict').onclick = async () => { dialog.close(); await sync.combine(); };
  document.querySelector('#export-pending').onclick = () => download('physiosidekick-pending-changes.json', JSON.stringify({ version: 6, workspace: sync.pending || workspace }, null, 2), 'application/json');
}
function accountDialog() {
  openDialog(`<h2 id="dialog-title">Account saving</h2><p><strong>${esc(document.querySelector('#sync-status').textContent)}</strong>${sync.updatedAt ? ` · last confirmed ${esc(new Date(sync.updatedAt).toLocaleString('en-GB'))}` : ''}</p><p>Changes save automatically after a short pause. Open this same private app with the same account on another device, then refresh its account copy.</p><div class="button-row"><button class="button" id="refresh-account" ${!sync.account || sync.inflight ? 'disabled' : ''}>${sync.pending ? 'Retry pending save' : 'Refresh from account'}</button><button class="button secondary" id="account-privacy">Backups & privacy</button></div>`);
  document.querySelector('#refresh-account').onclick = async () => { dialog.close(); if (sync.status === 'conflict') conflictDialog(); else if (sync.pending) await sync.flush(); else if (!cpdFormOpen) await sync.refresh(); else toast('Save or cancel your reflection before refreshing account records.'); };
  document.querySelector('#account-privacy').onclick = privacy;
}
function about() { openDialog('<span class="eyebrow">FROM STUDY TO PRACTICE</span><h2 id="dialog-title">A first chapter for PhysioSidekick.</h2><p>This is a private working prototype of a career companion for physiotherapists and students.</p><h3>Working now</h3><ul><li>Live publication search from Europe PMC’s indexed PubMed records.</li><li>Original paper links, indexed abstracts and source access information.</li><li>Saved papers, notes, collections and reference exports.</li><li>Source-linked revision cards with self-test practice and saved recall ratings.</li><li>Saved teaching sessions with attached paper references and editable exports.</li><li>Structured paper appraisals linked to editable CPD reflections.</li><li>Personal learning reflections and editable FCP teaching outlines.</li><li>Account saving across devices, backup import and conflict recovery.</li></ul><h3>Still to build and validate</h3><p>Licensed 3D anatomy, reviewed clinical tools, source-grounded explanations, a premium FCP curriculum and the signed iPhone app.</p><p>PhysioSidekick is a working name pending trademark clearance. This prototype is for product testing, not patient-specific decision support.</p>'); }
function render() {
  route = (['appraisal','teaching','study'].includes(location.hash.slice(1)) || nav.some(([id]) => id === location.hash.slice(1))) ? location.hash.slice(1) : 'home';
  updateNav(); ({ home, research, library, learn, practice, cpd, fcp, appraisal, teaching: teachingEditor, study: studyEditor }[route])();
  document.title = `${(nav.find(([id]) => id === route)?.[1] || (route === 'teaching' ? 'Teaching session' : route === 'study' ? 'My revision' : 'Paper appraisal'))} · PhysioSidekick`;
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-new-study],[data-open-study],[data-new-teaching],[data-copy-teaching],[data-open-teaching],[data-teaching],[data-appraise],[data-open-appraisal],[data-save],[data-save-notes],[data-delete-reflection],[data-edit-reflection],[data-remove-search],#save-search,#new-reflection,#first-reflection');
  if (el && (!sync?.account || sync.combining || sync.status === 'loading')) { e.preventDefault(); e.stopImmediatePropagation(); toast('Wait for the account connection before editing records.'); }
}, true);
document.addEventListener('submit', e => {
  if (e.target.id === 'reflection-form' && (!sync?.account || sync.combining)) { e.preventDefault(); e.stopImmediatePropagation(); toast('Connect to your account before saving a reflection.'); }
}, true);
document.addEventListener('click', e => {
  if (e.target.closest('[data-all-appraisals]')) activeAppraisal = null;
  const target = e.target.closest('button'); if (!target) return;
  if ((('newStudy' in target.dataset) || target.dataset.openStudy) && studyDraft?.dirty) { activeStudy = studyDraft.setId; navigate('study'); toast('Save or cancel the current card first.'); return; }
  if ('newStudy' in target.dataset) { const set = newStudySet(); workspace.studySets.unshift(set); activeStudy = set.id; studyPractice = null; studyDraft = null; persist(); navigate('study'); }
  if (target.dataset.openStudy) { activeStudy = target.dataset.openStudy; studyPractice = null; studyDraft = null; navigate('study'); }
  if ('newTeaching' in target.dataset) createTeaching();
  if (target.dataset.openTeaching) { activeTeaching = target.dataset.openTeaching; navigate('teaching'); }
  if (target.dataset.copyTeaching) {
    const source = workspace.teachingPlans.find(t => t.id === target.dataset.copyTeaching);
    if (source) { const copy = structuredClone(source); copy.id = crypto.randomUUID(); copy.title = (source.title + ' (copy)').slice(0,180); copy.updatedAt = new Date().toISOString(); workspace.teachingPlans.unshift(copy); activeTeaching = copy.id; persist(); navigate('teaching'); }
  }
  if (target.dataset.loadAbstract) retrieveAbstract(target.dataset.loadAbstract);
  if (target.dataset.appraise) beginAppraisal(target.dataset.appraise);
  if (target.dataset.openAppraisal) { activeAppraisal = target.dataset.openAppraisal; navigate('appraisal'); }
  if (target.dataset.search) startSearch(target.dataset.search);
  if ('runSearch' in target.dataset) {
    const entry = workspace.searches[Number(target.dataset.runSearch)];
    if (entry) { filters = { ...defaultFilters, ...entry.filters }; searchState.term = entry.term; research(); runSearch(entry.term); }
  }
  if ('removeSearch' in target.dataset) {
    workspace.searches.splice(Number(target.dataset.removeSearch), 1); persist(); renderSavedSearches();
  }
  if (target.dataset.detail) paperDetail(target.dataset.detail);
  if (target.dataset.save) toggleSave(target.dataset.save);
  if (target.dataset.copy) copyCitation(target.dataset.copy);
  if (target.dataset.saveNotes) {
    const card = target.closest('[data-paper]');
    const p = workspace.saved.find(p => p.id === target.dataset.saveNotes);
    if (p) {
      p.collection = card.querySelector('[data-collection]').value.trim();
      p.notes = card.querySelector('[data-note]').value;
      paperMap.set(p.id, p);
      if (persist()) toast('Collection and notes queued for saving');
    }
  }
  if ('libraryFilter' in target.dataset) { libraryFilter = target.dataset.libraryFilter; library(); }
  if (target.dataset.learnTab) { learnTab = target.dataset.learnTab; learn(); document.querySelector(`#tab-${learnTab}`).focus(); }
  if ('answer' in target.dataset && !quizAnswered) {
    quizAnswered = true; const q = questions[quizIndex]; const answer = Number(target.dataset.answer);
    document.querySelectorAll('[data-answer]').forEach((b, i) => { b.disabled = true; if (i === q.correct) b.classList.add('correct'); else if (i === answer) b.classList.add('incorrect'); });
    document.querySelector('#quiz-feedback').innerHTML = `<div class="notice">${answer === q.correct ? 'That’s right. ' : 'A useful distinction: '}${q.explanation}</div>`;
    document.querySelector('#next-question').hidden = false;
  }
  if ('teaching' in target.dataset) teaching(Number(target.dataset.teaching));
  if (target.dataset.editReflection) { reflectionDraft = null; reflectionEditing = target.dataset.editReflection; cpdFormOpen = true; renderReflectionForm(); }
  if (target.dataset.deleteReflection) {
    const id = target.dataset.deleteReflection; openDialog('<h2 id="dialog-title">Remove this reflection?</h2><p>This removes the reflection from your account workspace. Export a copy first if you want to keep it.</p><button class="button" id="confirm-delete">Remove reflection</button>');
    document.querySelector('#confirm-delete').onclick = () => { workspace.reflections = workspace.reflections.filter(r => r.id !== id); const ok = persist(); dialog.close(); cpd(); if (ok) toast('Reflection removed'); };
  }
});
document.addEventListener('input', e => {
  const id = e.target.dataset.note || e.target.dataset.collection; if (!id) return;
  const p = workspace.saved.find(p => p.id === id); if (!p) return;
  if ('note' in e.target.dataset) p.notes = e.target.value;
  if ('collection' in e.target.dataset) p.collection = e.target.value.trim();
  paperMap.set(id, p); persist();
});
document.querySelector('.dialog-close').onclick = () => dialog.close();
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
document.querySelector('#about-button').onclick = about;
document.querySelector('#data-button').onclick = privacy;
document.querySelector('#open-library').innerHTML = icon('library');
document.querySelector('#open-library').onclick = () => navigate('library');
window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); render(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); });
document.querySelector('#sync-status').onclick = accountDialog;
render();
sync = new WorkspaceSync({
  legacy: legacyWorkspace,
  onData: data => { workspace = data; workspace.saved.forEach(p => paperMap.set(p.id, p)); render(); },
  onStatus: syncStatus
});
syncStatus(sync);
sync.init();
window.addEventListener('online', () => { if (sync.account && sync.pending && sync.status !== 'conflict') sync.flush(); });

window.addEventListener('beforeunload', e => { if (studyDraft?.dirty) { e.preventDefault(); e.returnValue = ''; } });
