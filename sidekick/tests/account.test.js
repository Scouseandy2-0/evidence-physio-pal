import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { workspaceAPI } from '../worker/api.js';
import { emptyWorkspace, validateWorkspace, mergeWorkspaces } from '../web/workspace-data.js';
import { WorkspaceSync } from '../web/sync.js';

const reflection = (id = 'reflection-1', learning = 'Example learning') => ({ id, title: 'Software test reflection', date: '2026-11-27', minutes: 15, kind: 'Teaching', learning, action: 'Review source', source: '' });
const paper = (notes = '') => ({ id: 'MED:123', pmid: '123', title: 'Example paper', authorList: [], types: [], notes });
function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('drizzle').filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync(`drizzle/${file}`, 'utf8'));
  return { prepare(sql) { return { bind(...args) { return { async first() { return sqlite.prepare(sql).get(...args) || null; } }; } }; } };
}
function req(owner, method = 'GET', body, headers = {}) {
  return new Request('https://app.example/api/workspace', { method, headers: { ...(owner ? { 'oai-authenticated-user-id': owner, 'oai-authenticated-user-email': `${owner}@example.invalid` } : {}), 'origin': 'https://app.example', 'content-type': 'application/json', ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
test('account API requires identity, origin and a bounded validated workspace', async () => {
  const env = { DB: database() };
  assert.equal((await workspaceAPI(req(null), env)).status, 401);
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 0, workspace: emptyWorkspace() }, { origin: 'https://other.example' }), env)).status, 403);
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 0, workspace: { saved: [{ id: 'bad' }], reflections: [] } }), env)).status, 400);
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 0, workspace: emptyWorkspace() }, { 'content-length': '3000000' }), env)).status, 413);
});
test('owner-scoped rows isolate accounts and body owner fields cannot select another account', async () => {
  const env = { DB: database() }, workspace = { ...emptyWorkspace(), reflections: [reflection()] };
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 0, workspace, ownerId: 'b' }), env)).status, 200);
  const a = await (await workspaceAPI(req('a'), env)).json();
  const b = await (await workspaceAPI(req('b'), env)).json();
  assert.equal(a.workspace.reflections.length, 1); assert.equal(b.workspace.reflections.length, 0); assert.equal(b.revision, 0);
});
test('simultaneous devices cannot overwrite a newer revision', async () => {
  const env = { DB: database() };
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 0, workspace: emptyWorkspace() }), env)).status, 200);
  const newer = { ...emptyWorkspace(), reflections: [reflection()] };
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 1, workspace: newer }), env)).status, 200);
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 1, workspace: emptyWorkspace() }), env)).status, 409);
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 0, workspace: emptyWorkspace() }), env)).status, 409);
  const stored = await (await workspaceAPI(req('a'), env)).json(); assert.equal(stored.revision, 2); assert.equal(stored.workspace.reflections.length, 1);
});
test('imports canonicalise paper URLs, reject executable links and preserve conflicting notes/reflections', () => {
  const a = { ...emptyWorkspace(), saved: [paper('Remote note')], reflections: [reflection()] };
  const b = { ...emptyWorkspace(), saved: [paper('Device note')], reflections: [reflection('reflection-1', 'Different learning')] };
  const merged = mergeWorkspaces(a, b, () => 'new-reflection');
  assert.equal(merged.saved.length, 1); assert.match(merged.saved[0].notes, /Remote note.*Device note/s); assert.equal(merged.reflections.length, 2);
  assert.equal(merged.saved[0].recordURL, 'https://pubmed.ncbi.nlm.nih.gov/123/');
  assert.throws(() => validateWorkspace({ ...emptyWorkspace(), saved: [{ ...paper(), fullText: 'javascript:alert(1)' }] }), /Invalid full-text/);
});
const memory = () => { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) }; };
function syncEnvironment() {
  const env = { DB: database() }, storage = memory();
  const fetcher = async (url, options = {}) => workspaceAPI(new Request('https://app.example/api/workspace', { ...options, headers: { ...options.headers, 'origin': 'https://app.example', 'oai-authenticated-user-id': 'a', 'oai-authenticated-user-email': 'a@example.invalid' } }), env);
  const create = (extra = {}) => { let data; const sync = new WorkspaceSync({ storage, fetcher, onData: d => { data = d; }, onStatus: () => {}, delay: 10000, ...extra }); return { sync, get data() { return data; } }; };
  return { create, storage, fetcher };
}
test('one device saves and a second device loads the same account records', async () => {
  const { create } = syncEnvironment(); const a = create(), b = create();
  await a.sync.init(); a.sync.queue({ ...emptyWorkspace(), reflections: [reflection()] }); await a.sync.flush();
  await b.sync.init(); assert.equal(b.data.reflections.length, 1); assert.equal(a.sync.status, 'saved');
});
test('client keeps a conflicting pending version until explicit combination', async () => {
  const { create } = syncEnvironment(); const a = create(), b = create();
  await a.sync.init(); await b.sync.init();
  a.sync.queue({ ...emptyWorkspace(), reflections: [reflection('first')] }); await a.sync.flush();
  b.sync.queue({ ...emptyWorkspace(), reflections: [reflection('second')] }); await b.sync.flush();
  assert.equal(b.sync.status, 'conflict'); assert.equal(b.sync.pending.reflections[0].id, 'second');
  await b.sync.combine(); assert.equal(b.sync.status, 'saved'); assert.equal(b.data.reflections.length, 2);
});
test('legacy device records remain unuploaded until an import is requested', async () => {
  const { create } = syncEnvironment(); const legacy = { ...emptyWorkspace(), reflections: [reflection()] };
  const a = create({ legacy }); await a.sync.init();
  assert.equal(a.sync.needsImport, true); assert.equal(a.data.reflections.length, 0);
  const b = create(); await b.sync.init(); assert.equal(b.data.reflections.length, 0);
  await a.sync.combine(legacy, true); assert.equal(a.sync.needsImport, false);
  await b.sync.refresh(); assert.equal(b.data.reflections.length, 1);
});
test('pending edits made during an in-flight save are saved in a second revision', async () => {
  const { create, fetcher } = syncEnvironment(); let release, started;
  const didStart = new Promise(resolve => { started = resolve; });
  const gate = new Promise(resolve => { release = resolve; }); let writes = 0;
  const a = create({ fetcher: async (url, options) => { if (options?.method === 'PUT' && ++writes === 1) { started(); await gate; } return fetcher(url, options); } });
  await a.sync.init(); a.sync.queue({ ...emptyWorkspace(), reflections: [reflection('first')] });
  const saving = a.sync.flush(); await didStart;
  a.sync.queue({ ...emptyWorkspace(), reflections: [reflection('first'), reflection('second')] });
  release(); await saving;
  const b = create(); await b.sync.init(); assert.equal(b.data.reflections.length, 2); assert.equal(a.sync.revision, 2); assert.equal(a.sync.pending, null);
});
test('cached pending data is recovered only after its account identity is confirmed', async () => {
  const { create, storage } = syncEnvironment();
  storage.setItem('physiosidekick.account.other', JSON.stringify({ revision: 0, pending: { ...emptyWorkspace(), reflections: [reflection('private-other')] } }));
  const a = create(); await a.sync.init(); assert.equal(a.data.reflections.length, 0);
  storage.setItem('physiosidekick.account.a', JSON.stringify({ revision: 0, pending: { ...emptyWorkspace(), reflections: [reflection('recovered')] } }));
  const b = create(); await b.sync.init(); assert.equal(b.data.reflections[0].id, 'recovered'); assert.equal(b.sync.status, 'saved');
});
test('an invalid oversized edit remains exportable and cannot trigger a destructive refresh', async () => {
  const { create } = syncEnvironment(); const a = create(); await a.sync.init();
  const invalid = { ...emptyWorkspace(), reflections: [{ ...reflection(), date: '2026-02-31' }] };
  assert.equal(a.sync.queue(invalid), false); assert.equal(a.sync.status, 'error');
  await a.sync.refresh(); assert.deepEqual(a.sync.invalidPending, invalid);
  const b = create(); await b.sync.init(); assert.equal(b.sync.status, 'error'); assert.deepEqual(b.sync.invalidPending, invalid);
});

test('appraisals persist with linked CPD and an old app tab cannot silently strip them', async () => {
  const env = { DB: database() };
  const { newAppraisal, reflectionFromAppraisal } = await import('../web/appraisal.js');
  const a = { ...newAppraisal(paper(), 'appraisal-1'), basis: 'abstract', findings: 'Software test notes', nextStep: 'Check source' };
  const workspace = { ...emptyWorkspace(), appraisals: [a], reflections: [{ ...reflection('linked-reflection'), ...reflectionFromAppraisal(a) }] };
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 0, workspace }), env)).status, 200);
  const stored = await (await workspaceAPI(req('a'), env)).json();
  assert.equal(stored.workspace.appraisals[0].findings, 'Software test notes');
  assert.equal(stored.workspace.reflections[0].appraisalId, a.id);
  const legacy = { saved: [], reflections: [], searches: [] };
  assert.equal((await workspaceAPI(req('a', 'PUT', { revision: 1, workspace: legacy }), env)).status, 409);
  assert.equal((await (await workspaceAPI(req('a'), env)).json()).workspace.appraisals.length, 1);
});

test('older tabs retain original-abstract provenance when resaving unchanged text', async () => {
  const env = { DB: database() };
  const saved = { ...paper('Keep my note'), abstract: 'Indexed example abstract.', abstractSource: 'PubMed (NCBI)', abstractStatus: 'available', abstractRetrievedAt: '2026-11-27T12:00:00.000Z', abstractCopyright: 'Example publisher copyright.' };
  const w = { ...emptyWorkspace(), saved: [saved] };
  assert.equal((await workspaceAPI(req('a','PUT',{revision:0,workspace:w}),env)).status,200);
  const oldPaper = { ...saved }; for (const key of ['abstractSource','abstractStatus','abstractRetrievedAt','abstractCopyright']) delete oldPaper[key];
  assert.equal((await workspaceAPI(req('a','PUT',{revision:1,workspace:{...emptyWorkspace(),saved:[oldPaper]}}),env)).status,200);
  const stored = await (await workspaceAPI(req('a'),env)).json();
  assert.equal(stored.workspace.saved[0].abstractSource,'PubMed (NCBI)');
  assert.equal(stored.workspace.saved[0].abstractCopyright,'Example publisher copyright.');
  assert.equal(stored.workspace.saved[0].notes,'Keep my note');
});

test('saved teaching sessions reload with source snapshots and reject old tabs omitting them', async () => {
  const env={DB:database()};
  const {newTeachingPlan,teachingSource}=await import('../web/teaching.js');
  const session=newTeachingPlan({},'session-1');session.sources=[teachingSource(paper())];
  const workspace={...emptyWorkspace(),teachingPlans:[session]};
  assert.equal((await workspaceAPI(req('a','PUT',{revision:0,workspace}),env)).status,200);
  const loaded=await (await workspaceAPI(req('a'),env)).json();
  assert.equal(loaded.workspace.teachingPlans[0].sources[0].pmid,'123');
  const old={...workspace};delete old.teachingPlans;
  assert.equal((await workspaceAPI(req('a','PUT',{revision:1,workspace:old}),env)).status,409);
  assert.equal((await (await workspaceAPI(req('a'),env)).json()).workspace.teachingPlans.length,1);
});

test('study cards and recall ratings reload from accounts and old tabs cannot omit them',async()=>{
 const env={DB:database()};const {newStudySet,saveStudyCard,rateStudyCard}=await import('../web/study.js');
 const study=newStudySet('set-1');study.cards=[rateStudyCard(saveStudyCard({question:'QA question',answer:'QA answer',paper:paper(),id:'card-1'}),'again')];
 const workspace={...emptyWorkspace(),studySets:[study]};
 assert.equal((await workspaceAPI(req('a','PUT',{revision:0,workspace}),env)).status,200);
 const data=await(await workspaceAPI(req('a'),env)).json();assert.equal(data.workspace.studySets[0].cards[0].rating,'again');
 const old={...workspace};delete old.studySets;assert.equal((await workspaceAPI(req('a','PUT',{revision:1,workspace:old}),env)).status,409);
 assert.equal((await(await workspaceAPI(req('a'),env)).json()).workspace.studySets.length,1);
});

test('follow-up outcomes survive account reload and older tabs without the new fields',async()=>{
 const env={DB:database()};const record={...reflection(),outcome:'Software test follow-up',followUpDate:'2026-12-01'};
 assert.equal((await workspaceAPI(req('a','PUT',{revision:0,workspace:{...emptyWorkspace(),reflections:[record]}}),env)).status,200);
 const old={...record};delete old.outcome;delete old.followUpDate;
 assert.equal((await workspaceAPI(req('a','PUT',{revision:1,workspace:{...emptyWorkspace(),reflections:[old]}}),env)).status,200);
 const data=await(await workspaceAPI(req('a'),env)).json();assert.equal(data.workspace.reflections[0].outcome,'Software test follow-up');assert.equal(data.workspace.reflections[0].followUpDate,'2026-12-01');
 assert.equal((await workspaceAPI(req('a','PUT',{revision:2,workspace:{...emptyWorkspace(),reflections:[{...old,date:'2026-12-02'}]}}),env)).status,409);
});
