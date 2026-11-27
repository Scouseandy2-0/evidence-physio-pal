import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuery, identifyPaper, normalizePaper, searchPapers, safeURL } from '../web/research.js';

test('all/any words, phrase and author searches have explicit, isolated scope', () => {
  assert.equal(buildQuery('rotator cuff', { match: 'any', field: 'title' }), '(TITLE:"rotator" OR TITLE:"cuff") AND SRC:MED');
  assert.equal(buildQuery('rotator cuff', { match: 'phrase', author: 'Hopewell S' }), '(TITLE_ABS:"rotator cuff") AND SRC:MED AND AUTH:"Hopewell S"');
  assert.equal(buildQuery('', { author: 'Hopewell S' }), 'SRC:MED AND AUTH:"Hopewell S"');
  assert.equal(buildQuery('knee exercise', { field: 'all' }), '("knee" AND "exercise") AND SRC:MED');
});
test('known-paper IDs accept common copy/paste forms and bypass discovery filters', () => {
  for (const value of ['31316228', 'PMID: 31316228', 'https://pubmed.ncbi.nlm.nih.gov/31316228/?from_term=test']) {
    assert.deepEqual(identifyPaper(value), { kind: 'PMID', value: '31316228' });
    assert.equal(buildQuery(value, { author: 'Wrong Author', years: '2', type: 'review', openAccess: true }), 'EXT_ID:31316228 AND SRC:MED');
  }
  assert.equal(buildQuery('DOI: 10.1136/bmj.l418', { openAccess: true, type: 'trial' }), 'DOI:"10.1136/bmj.l418" AND SRC:MED');
});
test('invalid URLs and invalid empty searches fail rather than silently broaden', () => {
  assert.throws(() => buildQuery('https://example.org/not-a-paper'), /complete DOI/);
  assert.throws(() => buildQuery('PMID: abc'), /complete DOI/);
  assert.throws(() => buildQuery('***'), /Enter a topic/);
  assert.throws(() => buildQuery('x'.repeat(251)), /250 characters/);
  assert.equal(identifyPaper('https://pubmed.ncbi.nlm.nih.gov.evil.example/31316228/'), null);
});
test('multiple free links preserve provenance, deduplicate and exclude unknown access', () => {
  const p = normalizePaper({ id: '123', source: 'MED', title: 'Example', fullTextUrlList: { fullTextUrl: [
    { availabilityCode: 'OA', documentStyle: 'pdf', site: 'Publisher', url: 'https://example.org/paper.pdf' },
    { availabilityCode: 'OA', documentStyle: 'html', site: 'Europe_PMC', url: 'https://europepmc.org/articles/PMC123' },
    { availabilityCode: 'OA', documentStyle: 'html', site: 'Europe_PMC', url: 'https://europepmc.org/articles/PMC123' },
    { availabilityCode: 'S', url: 'https://example.org/paywall' },
    { availabilityCode: 'OA', url: 'https://user:password@example.org/private' }
  ] } });
  assert.equal(p.fullTextLinks.length, 2);
  assert.equal(p.fullText, 'https://europepmc.org/articles/PMC123');
  assert.equal(p.fullTextLinks[0].provider, 'Publisher');
  assert.equal(safeURL('https://user:password@example.org/private'), null);
});
test('search exposes its exact query and cursor without dropping request cancellation', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url.searchParams.get('cursorMark'), 'next-page');
      assert.equal(options.credentials, 'omit');
      assert.ok(options.signal);
      return Response.json({ hitCount: 1, resultList: { result: [{ id: '123', source: 'MED', title: 'Example' }] }, nextCursorMark: 'done' });
    };
    const result = await searchPapers('123', {}, 'next-page');
    assert.equal(result.query, 'EXT_ID:123 AND SRC:MED');
    assert.equal(result.papers.length, 1);
    assert.equal(result.nextCursor, 'done');
  } finally { globalThis.fetch = original; }
});
test('a stalled provider times out with an actionable error', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    await assert.rejects(searchPapers('knee', {}, '*', undefined, { timeoutMs: 10 }), /took too long/);
  } finally { globalThis.fetch = original; }
});
test('a replacement search preserves AbortError so the UI can ignore stale requests', async () => {
  const original = globalThis.fetch;
  try {
    const abort = new AbortController();
    globalThis.fetch = (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    const request = searchPapers('knee', {}, '*', abort.signal);
    abort.abort();
    await assert.rejects(request, { name: 'AbortError' });
  } finally { globalThis.fetch = original; }
});
