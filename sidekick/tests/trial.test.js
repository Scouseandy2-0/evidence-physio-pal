import test from 'node:test';
import assert from 'node:assert/strict';
import {TrialWorkspaceSync,trialRecordsKey} from '../web/trial.js';
import {WorkspaceSync} from '../web/sync.js';
import {emptyWorkspace} from '../web/workspace-data.js';
import {workspaceBackup,parseWorkspaceBackup} from '../web/backup.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
const reflection={id:'trial-1',title:'Fictional trial learning',date:'2026-11-28',minutes:12,kind:'Research reading',learning:'Fictional uncertain findings',action:'Recheck the original source',source:'',followUpDate:'2026-11-29'};
function setup(storage=memory()) {let records;const sync=new TrialWorkspaceSync({storage,delay:60000,onData:d=>{records=d;},onStatus:()=>{}});return {sync,storage,get records(){return records;}};}
test('trial saves and reloads only its tab storage, exports a valid backup, and never calls the account network',async()=>{
 const prior=globalThis.fetch;globalThis.fetch=()=>{throw new Error('No account request permitted');};
 try{
  const a=setup();await a.sync.init();assert.equal(a.sync.mode,'trial');assert.deepEqual(a.records,emptyWorkspace());
  a.sync.queue({...emptyWorkspace(),reflections:[reflection]});await a.sync.flush();assert.equal(a.sync.status,'saved');
  const b=setup(a.storage);await b.sync.init();assert.equal(b.records.reflections[0].minutes,12);assert.equal(b.records.reflections[0].followUpDate,'2026-11-29');
  const c=setup();await c.sync.init();assert.equal(c.records.reflections.length,0);
  const backup=parseWorkspaceBackup(workspaceBackup(b.records));assert.equal(backup.reflections[0].title,reflection.title);
 }finally{globalThis.fetch=prior;}
});
test('trial ignores private account and legacy caches; signing into an account does not upload trial records',async()=>{
 const storage=memory();storage.setItem('physiosidekick.account.private',JSON.stringify({revision:0,pending:{...emptyWorkspace(),reflections:[reflection]}}));storage.setItem('physiosidekick.workspace.v1',JSON.stringify({...emptyWorkspace(),reflections:[reflection]}));
 const a=setup(storage);await a.sync.init();assert.equal(a.records.reflections.length,0);assert.equal(a.sync.needsImport,undefined);
 a.sync.queue({...emptyWorkspace(),reflections:[reflection]});await a.sync.flush();let writes=0,records;
 const account=new WorkspaceSync({storage,onData:d=>records=d,onStatus:()=>{},fetcher:async(u,o)=>{if(o.method==='PUT')writes++;return Response.json({account:{id:'signed-in-user'},workspace:emptyWorkspace(),revision:0});}});
 await account.init();assert.equal(writes,0);assert.equal(records.reflections.length,0);assert.equal(storage.getItem('physiosidekick.workspace.v1')!==null,true);
});
test('quota failure retains pending trial work and never reports a successful save',async()=>{
 const storage=memory(),a=setup(storage);await a.sync.init();const write=storage.setItem;storage.setItem=(key,value)=>{if(key===trialRecordsKey)throw Error('quota');write(key,value);};
 a.sync.queue({...emptyWorkspace(),reflections:[reflection]});await a.sync.flush();assert.equal(a.sync.status,'offline');assert.equal(a.sync.pending.reflections.length,1);assert.equal(storage.getItem(trialRecordsKey),null);
});
test('corrupt trial records are not overwritten and invalid pending data stays recoverable',async()=>{
 const storage=memory();storage.setItem(trialRecordsKey,'{bad');const a=setup(storage);await a.sync.init();assert.equal(a.sync.status,'unavailable');assert.equal(a.sync.account,null);assert.equal(storage.getItem(trialRecordsKey),'{bad');
 storage.removeItem(trialRecordsKey);const b=setup(storage);await b.sync.init();assert.equal(b.sync.queue({...emptyWorkspace(),reflections:[{...reflection,date:'2026-02-31'}]}),false);assert.ok(b.sync.invalidPending);const c=setup(storage);await c.sync.init();assert.equal(c.sync.recoveryRequired,true);assert.deepEqual(c.records,emptyWorkspace());
});
test('trial rejects stale writes and explicit clear leaves account caches unchanged',async()=>{
 const a=setup();await a.sync.init();const b=setup(a.storage);await b.sync.init();a.sync.queue({...emptyWorkspace(),reflections:[reflection]});await a.sync.flush();
 b.sync.queue({...emptyWorkspace(),reflections:[{...reflection,id:'other'}]});await b.sync.flush();assert.equal(b.sync.status,'conflict');assert.equal(b.sync.pending.reflections[0].id,'other');
 a.storage.setItem('physiosidekick.account.private','private-cache');
 const confirmation={revision:a.sync.revision,sequence:a.sync.sequence};assert.equal(await a.sync.replaceRecords('clear',confirmation),true);assert.deepEqual(a.records,emptyWorkspace());assert.equal(a.storage.getItem('physiosidekick.account.private'),'private-cache');
});
test('only explicit authentication rejection offers trial; provider outages remain outages',async()=>{
 for(const code of [401,503]){const sync=new WorkspaceSync({storage:memory(),onData:()=>{},onStatus:()=>{},fetcher:async()=>Response.json({error:'Fixture'}, {status:code})});await sync.init();assert.equal(sync.signInRequired,code===401);assert.equal(sync.account,null);}
});
