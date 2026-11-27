import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuery, normalizePaper, toRIS, safeURL, searchPapers, plain, identifyPaper } from '../dist/research.js';

test('formatting cleanup preserves comparisons and statistical results in abstracts', () => {
  assert.equal(plain('<h4>Results</h4>P < 0.001; CI > 0.5. <i>n</i> = 50.'), 'Results P < 0.001; CI > 0.5. n = 50.');
});

test('keyword operators cannot escape the PubMed-only search scope', () => {
  const query = buildQuery('knee) OR SRC:PPR', { type: 'review', openAccess: true });
  assert.equal(query, '(TITLE_ABS:"knee" AND TITLE_ABS:"OR" AND TITLE_ABS:"SRC" AND TITLE_ABS:"PPR") AND SRC:MED AND PUB_TYPE:"systematic review" AND OPEN_ACCESS:y');
});
test('DOI lookup preserves punctuation and still limits to indexed PubMed records', () => {
  assert.equal(buildQuery('https://doi.org/10.1136/bmj.l418'), 'DOI:"10.1136/bmj.l418" AND SRC:MED');
});
test('date filter uses the current date and publication-type filters remain explicit', () => {
  assert.equal(buildQuery('shoulder', { years: '2', type: 'trial', sort: 'newest' }, new Date('2026-11-27T12:00:00Z')), '(TITLE_ABS:"shoulder") AND SRC:MED AND PUB_TYPE:"randomized controlled trial" AND FIRST_PDATE:[2024-11-27 TO 2026-11-27] sort_date:y');
});
test('non-PubMed or invalid records are rejected instead of gaining fabricated IDs', () => {
  assert.equal(normalizePaper({ source: 'PPR', id: '123', title: 'Preprint' }), null);
  assert.equal(normalizePaper({ source: 'MED', id: 'not-a-pmid', title: 'Invalid' }), null);
});
test('source metadata preserves missing fields, retractions and access uncertainty', () => {
  const p = normalizePaper({ source: 'MED', id: '123', title: '<i>Example</i>', isRetracted: 'Y', isOpenAccess: 'N', fullTextUrlList: { fullTextUrl: [{ url: 'https://publisher.example/paper', availabilityCode: 'S' }] } });
  assert.equal(p.title, 'Example'); assert.equal(p.doi, ''); assert.equal(p.abstract, '');
  assert.equal(p.fullText, null); assert.equal(p.openAccess, false); assert.equal(p.retracted, true);
  assert.equal(p.recordURL, 'https://pubmed.ncbi.nlm.nih.gov/123/');
});
test('unsafe full-text URLs are rejected and citation exports cannot inject RIS lines', () => {
  assert.equal(safeURL('javascript:alert(1)'), null);
  const p = normalizePaper({ source: 'MED', id: '123', title: 'Paper\nER  - injected', authorString: 'A Author', isOpenAccess: 'Y', fullTextUrlList: { fullTextUrl: [{ url: 'javascript:alert(1)', availabilityCode: 'OA' }] } });
  assert.equal(p.fullText, null);
  assert.equal(toRIS([p]).split('\r\n').filter(l => l.startsWith('ER  -')).length, 1);
});
test('failed publication services fail visibly rather than synthesising studies', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
    await assert.rejects(searchPapers('knee', {}), /unavailable \(503\)/);
    globalThis.fetch = async () => Response.json({ unexpected: 'format' });
    await assert.rejects(searchPapers('knee', {}), /unexpected response/);
  } finally { globalThis.fetch = original; }
});
