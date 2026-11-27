import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupPublications, pubmedQuery, researchAPI } from '../worker/research.js';
const record = { uid: '123', title: 'Knee study', authors: [{ name: 'Author A' }], fulljournalname: 'Journal', pubdate: '2025 Jan', articleids: [{ idtype: 'doi', value: '10.1234/study' }], pubtype: ['Randomized Controlled Trial'] };
function backupMock(calls, { empty = false } = {}) {
  return async (url, options) => {
    calls.push(String(url));
    assert.deepEqual(Object.keys(options.headers), ['accept']);
    assert.equal(options.credentials, 'omit');
    if (url.hostname === 'www.ebi.ac.uk') throw new Error('offline');
    if (url.pathname.endsWith('esearch.fcgi')) return Response.json({ esearchresult: { count: empty ? '0' : '20', idlist: empty ? [] : ['123'] } });
    return Response.json({ result: { uids: ['123'], 123: record } });
  };
}
test('primary failures fall back to authentic PubMed metadata, without invented abstracts or access labels', async () => {
  const calls = [];
  const result = await lookupPublications({ term: 'knee osteoarthritis' }, { fetcher: backupMock(calls) });
  assert.equal(calls.length, 3);
  assert.equal(result.provider, 'PubMed (NCBI backup)');
  assert.equal(result.resultList.result[0].id, '123');
  assert.equal(result.resultList.result[0].abstractText, undefined);
  assert.equal(result.resultList.result[0].isOpenAccess, undefined);
  assert.equal(result.resultList.result[0].doi, '10.1234/study');
  assert.equal(result.nextCursorMark, 'ncbi:1');
  assert.match(result.executedQuery, /Title\/Abstract/);
});
test('backup pagination stays on PubMed; primary pagination failures do not mix sources', async () => {
  const calls = [];
  await lookupPublications({ term: 'knee', cursor: 'ncbi:8' }, { fetcher: backupMock(calls) });
  assert.equal(calls.length, 2);
  assert.equal(new URL(calls[0]).searchParams.get('retstart'), '8');
  await assert.rejects(lookupPublications({ term: 'knee', cursor: 'primary-cursor' }, { fetcher: async () => { throw new Error(); } }), /could not load this page/);
});
test('OA discovery filters are never silently widened by a backup search', async () => {
  const calls = [];
  await assert.rejects(lookupPublications({ term: 'knee', filters: { openAccess: true } }, { fetcher: backupMock(calls) }), /untick/);
  assert.equal(calls.length, 1);
});
test('a stalled primary is bounded and a genuine zero is distinct from provider failure', async () => {
  const mock = backupMock([], { empty: true });
  const fetcher = (url, options) => url.hostname === 'www.ebi.ac.uk' ? new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('timeout')))) : mock(url, options);
  const data = await lookupPublications({ term: 'knee' }, { fetcher, primaryTimeout: 5 });
  assert.equal(data.hitCount, 0);
  assert.equal(data.nextCursorMark, null);
  await assert.rejects(lookupPublications({ term: 'knee' }, { fetcher: async () => Response.json({ error: 'failure' }) }));
});
test('backup queries preserve words, author, publication type, dates and exact identifiers', () => {
  assert.match(pubmedQuery('rotator cuff', { match: 'any', field: 'title', author: 'Hopewell S', type: 'trial', years: '2' }, new Date('2026-11-27')), /\("rotator"\[Title\] OR "cuff"\[Title\]\).*Hopewell S.*randomized controlled trial.*2024-11-27/);
  assert.equal(pubmedQuery('123', { type: 'trial', years: '2' }), '123[UID]');
  assert.equal(pubmedQuery('10.1234/example'), '10.1234/example[DOI]');
});
test('proxy requires platform identity, same origin, bounded JSON and validated input', async () => {
  const req = (body, headers = {}) => new Request('https://example.org/api/research', { method: 'POST', headers: { origin: 'https://example.org', 'content-type': 'application/json', 'oai-authenticated-user-id': 'test', 'oai-authenticated-user-email': 'test@example.invalid', ...headers }, body });
  assert.equal((await researchAPI(req('{}', { 'oai-authenticated-user-id': '' }))).status, 401);
  assert.equal((await researchAPI(req('{}', { origin: 'https://elsewhere.example' }))).status, 403);
  assert.equal((await researchAPI(req(JSON.stringify({ term: 'x'.repeat(9000) })))).status, 413);
  assert.equal((await researchAPI(req(JSON.stringify({ term: 'https://malicious.example' })))).status, 400);
});
