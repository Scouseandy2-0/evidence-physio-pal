import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePubmedRecord, retrievePubmedRecord, paperAPI } from '../worker/paper.js';
import { loadOriginalAbstract, applyOriginalAbstract } from '../web/paper-details.js';
import { emptyWorkspace, validateWorkspace, mergeWorkspaces } from '../web/workspace-data.js';
const medline = 'PMID- 123\nTI  - Example paper\nAB  - METHODS: We assessed p < 0.05 and 95% CI.\n      RESULTS: Difference -2 (95% CI -4 to 0), ≥ 10 participants.\nCI  - Example copyright statement.\nPT  - Retracted Publication\n';
const record = () => parsePubmedRecord(medline, '123');
const paper = () => ({ id: 'MED:123', pmid: '123', title: 'Example paper', notes: 'My own note', collection: 'Assignment' });
test('the PubMed parser preserves indexed text, continuation lines, statistical symbols and copyright separately', () => {
  const r = record();
  assert.match(r.abstract, /p < 0.05/); assert.match(r.abstract, /RESULTS: Difference -2/); assert.match(r.abstract, /≥ 10/);
  assert.equal(r.abstractCopyright, 'Example copyright statement.');
  assert.doesNotMatch(r.abstract, /copyright/); assert.equal(r.retracted, true);
  assert.equal(r.abstractURL, 'https://pubmed.ncbi.nlm.nih.gov/123/');
});
test('no abstract is declared only after a valid matching record; errors, mismatches and multiple records fail', () => {
  assert.equal(parsePubmedRecord('PMID- 123\nTI  - Example paper\n', '123').abstractStatus, 'notIndexed');
  for (const text of ['error: unavailable', medline.replace('PMID- 123','PMID- 456'), medline + medline, 'PMID- 123\n', medline.replace('METHODS:', 'x'.repeat(80001))]) assert.throws(() => parsePubmedRecord(text, '123'));
});
test('upstream details requests use a fixed endpoint, only one PMID and no account credentials', async () => {
  const r = await retrievePubmedRecord('123', { fetcher: async (url, options) => {
    assert.equal(url.hostname, 'eutils.ncbi.nlm.nih.gov'); assert.equal(url.searchParams.get('id'), '123');
    assert.equal(url.searchParams.get('rettype'), 'medline'); assert.equal(options.credentials, 'omit');
    assert.deepEqual(Object.keys(options.headers), ['accept']); return new Response(medline);
  }});
  assert.equal(r.abstractStatus, 'available');
  await assert.rejects(retrievePubmedRecord('123,456'), /valid PMID/);
});
test('provider failure, timeout and oversized responses never become a missing-abstract record', async () => {
  await assert.rejects(retrievePubmedRecord('123', { fetcher: async () => new Response('', { status: 503 }) }));
  await assert.rejects(retrievePubmedRecord('123', { fetcher: async () => new Response('x'.repeat(524289)) }), /large/);
  await assert.rejects(retrievePubmedRecord('123', { timeoutMs: 5, fetcher: (url,{signal}) => new Promise((resolve,reject) => signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')))) }), /too long/);
});
test('detail API enforces identity, one numeric PMID and same-site access', async () => {
  const req = (query, headers = {}, method = 'GET') => new Request(`https://app.example/api/paper?pmid=${query}`, { method, headers: { 'oai-authenticated-user-id': 'test', 'oai-authenticated-user-email': 'test@example.invalid', ...headers } });
  assert.equal((await paperAPI(req('123', { 'oai-authenticated-user-id': '' }))).status, 401);
  assert.equal((await paperAPI(req('123', { 'sec-fetch-site': 'cross-site' }))).status, 403);
  assert.equal((await paperAPI(req('123,456'))).status, 400);
  assert.equal((await paperAPI(req('123', {}, 'PUT'))).status, 405);
});
test('client rejects mismatched or fabricated source responses and keeps user notes when enriching a paper', async () => {
  const r = await loadOriginalAbstract('123', { fetcher: async (url, options) => { assert.equal(url, '/api/paper?pmid=123'); assert.equal(options.credentials, 'same-origin'); return Response.json(record()); } });
  const p = applyOriginalAbstract(paper(), r); assert.equal(p.notes, 'My own note'); assert.equal(p.collection, 'Assignment');
  assert.throws(() => applyOriginalAbstract(paper(), { ...r, pmid: '456' }));
  await assert.rejects(loadOriginalAbstract('123', { fetcher: async () => Response.json({ ...r, abstractSource: 'AI generated' }) }), /unexpected/);
});
test('backups and conflict merges preserve retrieved abstract provenance and copyright without replacing notes', () => {
  const saved = applyOriginalAbstract(paper(), record());
  const w = validateWorkspace({ ...emptyWorkspace(), saved: [saved] });
  assert.equal(w.saved[0].abstractCopyright, 'Example copyright statement.');
  const merged = mergeWorkspaces({ ...emptyWorkspace(), saved: [paper()] }, w);
  assert.match(merged.saved[0].abstract, /METHODS/); assert.equal(merged.saved[0].notes, 'My own note');
  assert.equal(merged.saved[0].abstractSource, 'PubMed (NCBI)');
});
