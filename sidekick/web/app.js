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
let learnTab = 'appraisal';
let quizIndex = 0;
let quizAnswered = false;
let libraryFilter = '';
let cpdFormOpen = false;
let reflectionEditing = null;
let reflectionDraft = null;
let activeAppraisal = null;
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
function openDialog(html) { document.querySelector('#dialog-content').innerHTML = `<div class="dialog-body">${html}</div>`; if (!dialog.open) dialog.showModal(); }
function navigate(next) { if (location.hash === `#${next}`) render(); else location.hash = next; }
function updateNav() {
  document.querySelector('#desktop-nav').innerHTML = nav.map(([id, label]) => `<a href="#${id}" class="nav-item ${route === id ? 'active' : ''}" ${route === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span>${id === 'fcp' ? '<span class="premium">PREVIEW</span>' : ''}${id === 'library' ? `<span class="count">${workspace.saved.length}</span>` : ''}</a>`).join('');
  const mobile = [['home', 'Home'], ['research', 'Research'], ['learn', 'Learn'], ['cpd', 'CPD'], ['fcp', 'FCP']];
  document.querySelector('#mobile-nav').innerHTML = mobile.map(([id, label]) => `<a href="#${id}" class="${route === id ? 'active' : ''}" ${route === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span></a>`).join('');
  document.querySelector('#breadcrumb').textContent = nav.find(([id]) => route === id)?.[1] || (route === 'appraisal' ? 'Paper appraisal' : 'Overview');
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
  <p class="paper-abstract">${esc(p.abstract || 'No abstract is available in this index record. Open the original source to investigate further.')}</p>
  <div class="paper-actions"><button class="text-button" data-detail="${esc(p.id)}">Read record</button><a href="${esc(p.recordURL)}" target="_blank" rel="noopener noreferrer">PubMed</a>${p.fullText ? `<a class="full-text-link" href="${esc(p.fullText)}" target="_blank" rel="noopener noreferrer">Read free full text</a>` : ''}${p.doi ? `<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">Publisher / DOI</a>` : ''}<button class="save-button ${saved ? 'saved' : ''}" data-save="${esc(p.id)}" aria-label="${saved ? 'Remove saved paper' : 'Save paper'}: ${esc(p.title)}">${icon('library')}${saved ? 'Saved' : 'Save'}</button></div>
  ${savedView ? `<div class="saved-extra"><div class="button-row"><button class="button secondary" data-appraise="${esc(p.id)}">${workspace.appraisals.some(a => a.paperId === p.id) ? 'Continue appraisal' : 'Appraise this paper'}</button></div><div class="saved-grid"><div class="field"><label for="collection-${p.pmid}">Collection</label><input id="collection-${p.pmid}" value="${esc(p.collection || '')}" data-collection="${esc(p.id)}" placeholder="e.g. Shoulder assignment" maxlength="80" list="collection-options"></div><div class="field"><label>Reference</label><button class="button secondary" data-copy="${esc(p.id)}">Copy citation</button></div></div><div class="field"><label for="note-${p.pmid}">Your notes</label><textarea id="note-${p.pmid}" data-note="${esc(p.id)}" maxlength="10000" placeholder="What did you learn? No identifiable patient information.">${esc(p.notes || '')}</textarea></div><button class="button secondary" data-save-notes="${esc(p.id)}">Save collection & notes</button></div>` : ''}</article>`;
}
function paperDetail(id) {
  const p = paperMap.get(id); if (!p) return;
  openDialog(`<span class="eyebrow">ORIGINAL PUBLICATION RECORD</span><h2 id="dialog-title">${esc(p.title)}</h2><p class="paper-meta">${esc(p.authors)}<br>${esc(p.journal)} · ${esc(p.year)}</p>
  ${p.retracted ? '<div class="notice error">This record is marked as a retracted publication. Investigate the retraction notice before using its findings.</div>' : ''}
  <div class="identifier">PMID: ${esc(p.pmid)}${p.doi ? `<br>DOI: ${esc(p.doi)}` : ''}</div><div class="button-row"><a class="button" href="${esc(p.recordURL)}" target="_blank" rel="noopener noreferrer">Open PubMed record</a>${p.fullText ? `<a class="button secondary" href="${esc(p.fullText)}" target="_blank" rel="noopener noreferrer">Open free full text</a>` : p.doi ? `<a class="button secondary" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">Check publisher access</a>` : ''}</div>
  <section class="access-panel"><h3>Get the full paper</h3>${p.fullText ? `<p>A free full-text link is listed by the index. The provider controls access and the version available.</p><div class="button-row">${(p.fullTextLinks?.length ? p.fullTextLinks : [{ url: p.fullText, style: 'full text', provider: 'Indexed source' }]).map(l => `<a class="button secondary" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.style === 'pdf' ? 'PDF' : l.style === 'html' ? 'Full text' : l.style)} · ${esc(l.provider.replaceAll('_', ' '))}</a>`).join('')}</div>` : `<p>A free full-text link is not confirmed here. That does not necessarily mean the paper is paywalled.</p><ol><li>Open the publisher/DOI or PubMed record and check its full-text links.</li><li>If asked to pay, try your university, NHS or employer library’s institutional sign-in.</li><li>Ask your library about document supply or an authorised author manuscript.</li></ol>`}</section><h3>Indexed abstract</h3><p class="abstract-full">${esc(p.abstract || 'The index does not provide an abstract for this paper.')}</p><div class="notice">This is publication metadata and an indexed abstract, not an AI summary or a quality assessment. Full text may contain important methods, results and limitations omitted here.</div>
  <div class="button-row"><button class="button" data-appraise="${esc(p.id)}">Appraise this paper</button></div><h3>Before applying the findings</h3><ul><li>Does the population and setting match your question?</li><li>How was the study designed, and what could bias its findings?</li><li>How large and uncertain are the effects, and were harms reported?</li><li>Have you read the full text, or only the abstract?</li></ul>
  <div class="button-row"><button class="button secondary" data-save="${esc(p.id)}">${icon('library')}${workspace.saved.some(s => s.id === id) ? 'Remove from saved papers' : 'Save to my papers'}</button><button class="button secondary" data-copy="${esc(p.id)}">Copy citation</button></div><p class="subtle" style="margin-top:20px">Record retrieved ${esc(new Date(p.retrievedAt).toLocaleDateString('en-GB'))}. <a href="${esc(p.indexedURL)}" target="_blank" rel="noopener noreferrer">View Europe PMC record</a>. Bibliographic details may be updated by the source.</p>`);
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
  main.innerHTML = `${intro('LEARN WITH INTENTION', 'Understand more. Keep questioning.', 'Build the habits that connect anatomy, evidence and thoughtful practice.')}<div class="tabs" role="tablist" aria-label="Learning areas">${[['appraisal', 'Critical appraisal'], ['anatomy', 'Anatomy'], ['sources', 'Research sources']].map(([id, label]) => `<button class="tab ${learnTab === id ? 'active' : ''}" role="tab" aria-selected="${learnTab === id}" data-learn-tab="${id}" id="tab-${id}" aria-controls="learning-content">${label}</button>`).join('')}</div><section id="learning-content" role="tabpanel" aria-labelledby="tab-${learnTab}"></section>`;
  const area = document.querySelector('#learning-content');
  if (learnTab === 'anatomy') area.innerHTML = `<div class="anatomy-placeholder">${icon('anatomy')}<div><span class="eyebrow">ANATOMY WORKSPACE</span><h2>Start with the foundations.</h2><p>An integrated 3D anatomy viewer is planned. It is not included in this prototype: the model accuracy, licence and mobile performance need checking first.</p></div></div><div class="resource-grid">${resources.filter(r => r.area === 'anatomy').map(resourceCard).join('')}<article class="card resource-card"><span class="badge">Connect the learning</span><h3>From structure to research</h3><p>Explore papers about shoulder anatomy and biomechanics, then keep useful findings in a collection.</p><button class="text-button" data-search="Shoulder anatomy biomechanics">Find shoulder anatomy papers</button></article></div>`;
  else if (learnTab === 'sources') area.innerHTML = `<div class="resource-grid">${resources.filter(r => r.area === 'research').map(resourceCard).join('')}</div>`;
  else { area.innerHTML = `<div class="two-col"><section class="card" id="quiz-area"></section><article class="card resource-card"><span class="badge">Start a useful habit</span><h3>Read. Question. Reflect.</h3><p>A summary is a starting point. Check the original source, write down what remains uncertain and decide what you need to learn next.</p><a href="#cpd" class="text-button">Capture a reflection</a><div class="notice">These short learning checks are introductory exercises, not accredited training or a clinical competency assessment.</div><a class="text-button" href="${resources[3].url}" target="_blank" rel="noopener noreferrer">Explore CASP appraisal checklists</a></article></div>`; renderQuiz(); }
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
  main.innerHTML = `${intro('FIRST CONTACT PRACTICE', 'Teach with a purpose.', 'A dedicated space for FCP learning, reflection and team teaching.')}<section class="fcp-banner"><span class="eyebrow">SPECIALIST AREA · PROTOTYPE PREVIEW</span><h2 style="margin-top:12px">Your next teaching session starts here.</h2><p>Build a discussion plan, add a verified source and make the learning practical. The future premium curriculum and pricing have not been set.</p></section><div class="resource-grid">${teachingTopics.map((t, i) => `<article class="card resource-card"><span class="badge">Teaching framework · 15 minutes</span><h3>${t.title}</h3><p>${t.summary}</p><button class="text-button" data-teaching="${i}">Create teaching outline</button></article>`).join('')}<article class="card resource-card"><span class="badge">Source shelf</span><h3>Start from the current guidance</h3><p>Use the original recommendation, check its scope and add your local pathway before delivering a session.</p><a class="text-button" href="#practice">Open practice resources</a></article></div><div class="notice">These are editable planning frameworks, not reviewed clinical teaching packs, prescribing advice, accredited training or competency sign-off. Clinical teaching content needs professional review before use.</div>`;
}
function teaching(index) {
  const t = teachingTopics[index]; if (!t) return;
  openDialog(`<span class="eyebrow">FCP TEACHING PLANNER</span><h2 id="dialog-title">${t.title}</h2><form id="teaching-form"><div class="field"><label for="teaching-title">Session title</label><input id="teaching-title" name="title" value="${t.title}" maxlength="180" required></div><div class="field"><label for="teaching-objectives">Learning objectives</label><textarea id="teaching-objectives" name="objectives" required maxlength="4000">${t.objectives}</textarea></div><div class="field"><label for="teaching-source">Verified source to discuss</label><input id="teaching-source" name="source" value="${t.source}" maxlength="1000" required></div><div class="field"><label for="teaching-case">Fictional case or discussion question</label><textarea id="teaching-case" name="discussion" placeholder="Add a fictional case or general question. No identifiable patient information." maxlength="6000" required></textarea></div><div class="outline"><h3>Suggested 15-minute structure</h3><ol><li>2 minutes: agree the question and objectives.</li><li>5 minutes: examine the source and its limitations.</li><li>5 minutes: discuss the fictional case or question.</li><li>3 minutes: agree takeaways, uncertainty and a learning action.</li></ol></div><div class="notice">Review and complete the outline before teaching. The app does not verify the clinical accuracy of what you enter.</div><button class="button" type="submit">${icon('download')}Download teaching outline</button></form>`);
  document.querySelector('#teaching-form').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)); download('physiosidekick-teaching-outline.md', `# ${d.title}\n\nStatus: editable teaching framework; requires professional review.\n\n## Objectives\n${d.objectives}\n\n## Source\n${d.source}\n\n## Fictional case / question\n${d.discussion}\n\n## 15-minute agenda\n- 2 min: question and objectives\n- 5 min: source and limitations\n- 5 min: discussion\n- 3 min: takeaways, uncertainty and a learning action\n\n## Facilitator preparation\n- Read and check the original source and its currency.\n- Check any applicable local pathway.\n- Review all clinical content.\n- Record what remains uncertain.\n\n## Takeaways and next action\n[Complete during the session]\n`, 'text/markdown'); toast('Teaching outline downloaded'); };
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
  openDialog(`<span class="eyebrow">YOUR ACCOUNT WORKSPACE</span><h2 id="dialog-title">Your data & privacy</h2><p>Your papers, notes, saved searches, appraisals and reflections are stored in the app’s account database, tied to your signed-in identity. The app keeps an account-specific device copy of pending changes so interrupted saves can be recovered.</p><p>Open the same private app on your iPhone or Mac and sign in with the same account. Data loads when you open the app; “Refresh from account” fetches newer changes. This is not live simultaneous editing.</p><p>Research keywords pass through the app server to Europe PMC, with PubMed (NCBI) as a backup. Publication metadata may be cached for five minutes. Your account identity is not forwarded to either research service. External resources use their own privacy policies, and fonts load from Google Fonts. Keep identifiable patient information out of this educational prototype.</p><div class="button-row"><button class="button" id="export-workspace">${icon('download')}Export workspace backup</button><label class="button secondary" for="import-workspace">Import a backup</label><input id="import-workspace" type="file" accept="application/json,.json" class="file-input"></div><p class="subtle" style="margin-top:15px">Import shows a summary before combining records. It does not replace the account workspace. Conflicting notes are kept together and conflicting reflections become separate entries.</p>${sync?.pending ? '<div class="notice">This device has changes not yet confirmed by the account server. The export includes your current version.</div>' : ''}<p><a href="/signout-with-chatgpt?return_to=%2F" target="_top">Sign out of this app</a></p>`);
  document.querySelector('#export-workspace').onclick = () => download('physiosidekick-workspace.json', JSON.stringify({ version: 4, exportedAt: new Date().toISOString(), workspace: sync.invalidPending || sync.pending || workspace }, null, 2), 'application/json');
  document.querySelector('#import-workspace').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { if (file.size > 2 * 1024 * 1024) throw new Error('Use a workspace export no larger than 2 MB.'); const raw = JSON.parse(await file.text()); reviewImport(validateWorkspace(raw.workspace || raw), false); }
    catch (error) { toast(`Import not started: ${error.message}`); }
  };
}
function reviewImport(data, legacy = false) {
  if (cpdFormOpen) { toast('Save or cancel your reflection before importing records.'); return; }
  openDialog(`<span class="eyebrow">REVIEW IMPORT</span><h2 id="dialog-title">Bring your records into your account</h2><p>This ${legacy ? 'browser' : 'backup'} contains <strong>${data.saved.length} papers, ${data.reflections.length} reflections and ${data.searches.length} searches and ${data.appraisals.length} appraisals</strong>.</p><p>These will be combined with your account records. Duplicate papers stay as one paper; different notes are kept together. Conflicting reflections and appraisals become separate entries. Different collection names are recorded in the paper’s notes.</p><p>The original ${legacy ? 'browser records' : 'backup file'} will remain intact. Imports may restore a record you previously removed from the account.</p><button class="button" id="confirm-import" ${!sync?.account || sync?.inflight ? 'disabled' : ''}>Combine with my account records</button>`);
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
  openDialog(`<h2 id="dialog-title">Keep both versions safe</h2><p>Your device has pending changes and the account has a newer version. No automatic overwrite has taken place.</p><p>You can combine both sets of records. Different notes are kept together and different versions of a reflection or appraisal become separate entries. Removed records may return during a merge.</p><div class="button-row"><button class="button" id="merge-conflict">Combine both versions</button><button class="button secondary" id="export-pending">Export this device’s version</button></div>`);
  document.querySelector('#merge-conflict').onclick = async () => { dialog.close(); await sync.combine(); };
  document.querySelector('#export-pending').onclick = () => download('physiosidekick-pending-changes.json', JSON.stringify({ version: 4, workspace: sync.pending || workspace }, null, 2), 'application/json');
}
function accountDialog() {
  openDialog(`<h2 id="dialog-title">Account saving</h2><p><strong>${esc(document.querySelector('#sync-status').textContent)}</strong>${sync.updatedAt ? ` · last confirmed ${esc(new Date(sync.updatedAt).toLocaleString('en-GB'))}` : ''}</p><p>Changes save automatically after a short pause. Open this same private app with the same account on another device, then refresh its account copy.</p><div class="button-row"><button class="button" id="refresh-account" ${!sync.account || sync.inflight ? 'disabled' : ''}>${sync.pending ? 'Retry pending save' : 'Refresh from account'}</button><button class="button secondary" id="account-privacy">Backups & privacy</button></div>`);
  document.querySelector('#refresh-account').onclick = async () => { dialog.close(); if (sync.status === 'conflict') conflictDialog(); else if (sync.pending) await sync.flush(); else if (!cpdFormOpen) await sync.refresh(); else toast('Save or cancel your reflection before refreshing account records.'); };
  document.querySelector('#account-privacy').onclick = privacy;
}
function about() { openDialog('<span class="eyebrow">FROM STUDY TO PRACTICE</span><h2 id="dialog-title">A first chapter for PhysioSidekick.</h2><p>This is a private working prototype of a career companion for physiotherapists and students.</p><h3>Working now</h3><ul><li>Live publication search from Europe PMC’s indexed PubMed records.</li><li>Original paper links, indexed abstracts and source access information.</li><li>Saved papers, notes, collections and reference exports.</li><li>Structured paper appraisals linked to editable CPD reflections.</li><li>Personal learning reflections and editable FCP teaching outlines.</li><li>Account saving across devices, backup import and conflict recovery.</li></ul><h3>Still to build and validate</h3><p>Licensed 3D anatomy, reviewed clinical tools, source-grounded explanations, a premium FCP curriculum and the signed iPhone app.</p><p>PhysioSidekick is a working name pending trademark clearance. This prototype is for product testing, not patient-specific decision support.</p>'); }
function render() {
  route = (location.hash.slice(1) === 'appraisal' || nav.some(([id]) => id === location.hash.slice(1))) ? location.hash.slice(1) : 'home';
  updateNav(); ({ home, research, library, learn, practice, cpd, fcp, appraisal }[route])();
  document.title = `${(nav.find(([id]) => id === route)?.[1] || 'Paper appraisal')} · PhysioSidekick`;
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-appraise],[data-open-appraisal],[data-save],[data-save-notes],[data-delete-reflection],[data-edit-reflection],[data-remove-search],#save-search,#new-reflection,#first-reflection');
  if (el && (!sync?.account || sync.combining || sync.status === 'loading')) { e.preventDefault(); e.stopImmediatePropagation(); toast('Wait for the account connection before editing records.'); }
}, true);
document.addEventListener('submit', e => {
  if (e.target.id === 'reflection-form' && (!sync?.account || sync.combining)) { e.preventDefault(); e.stopImmediatePropagation(); toast('Connect to your account before saving a reflection.'); }
}, true);
document.addEventListener('click', e => {
  if (e.target.closest('[data-all-appraisals]')) activeAppraisal = null;
  const target = e.target.closest('button'); if (!target) return;
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
