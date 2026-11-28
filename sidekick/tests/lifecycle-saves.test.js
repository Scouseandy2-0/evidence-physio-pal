import test from 'node:test';
import assert from 'node:assert/strict';
import {registerPendingSaveLifecycle} from '../web/lifecycle-saves.js';
import {TrialWorkspaceSync,trialRecordsKey} from '../web/trial.js';
import {emptyWorkspace} from '../web/workspace-data.js';
const tick=()=>new Promise(r=>setImmediate(r));
const workspace=()=>({...emptyWorkspace(),reflections:[{id:'qa',title:'Fictional learning',date:'2026-11-28',minutes:12,kind:'Teaching',learning:'Fictional software QA',action:'Review the source',source:''}]});
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
function lifecycle(sync){const document=Object.assign(new EventTarget(),{visibilityState:'visible'}),window=new EventTarget();return {document,window,cleanup:registerPendingSaveLifecycle({document,window,getSync:()=>sync})};}
test('backgrounding attempts already queued work before its delay and preserves a reloadable tab copy',async()=>{
 const storage=memory(),sync=new TrialWorkspaceSync({storage,onData:()=>{},onStatus:()=>{},delay:60000});await sync.init();sync.queue(workspace());
 const x=lifecycle(sync);x.document.visibilityState='hidden';x.document.dispatchEvent(new Event('visibilitychange'));x.window.dispatchEvent(new Event('pagehide'));await tick();
 assert.equal(sync.status,'saved');assert.equal(sync.pending,null);assert.equal(JSON.parse(storage.getItem(trialRecordsKey)).revision,1);
 let loaded;const other=new TrialWorkspaceSync({storage,onData:d=>loaded=d,onStatus:()=>{}});await other.init();assert.equal(loaded.reflections[0].minutes,12);x.cleanup();
});
test('failed background save keeps the pending recovery snapshot and does not claim confirmation',async()=>{
 const storage=memory(),sync=new TrialWorkspaceSync({storage,onData:()=>{},onStatus:()=>{},delay:60000});await sync.init();sync.queue(workspace());const write=storage.setItem;storage.setItem=(key,value)=>{if(key===trialRecordsKey)throw Error('quota');write(key,value);};
 const x=lifecycle(sync);x.window.dispatchEvent(new Event('pagehide'));await tick();assert.equal(sync.status,'offline');assert.ok(sync.pending);assert.equal(JSON.parse(storage.getItem(sync.key)).pending.reflections[0].id,'qa');x.cleanup();
});
test('lifecycle events never submit unqueued drafts, conflicts or invalid recovery data',()=>{
 let calls=0;const sync={account:{id:'qa'},pending:null,status:'saved',flush(){calls++;}};const x=lifecycle(sync);x.document.visibilityState='hidden';x.document.dispatchEvent(new Event('visibilitychange'));assert.equal(calls,0);
 sync.pending=workspace();sync.status='conflict';x.window.dispatchEvent(new Event('pagehide'));assert.equal(calls,0);sync.status='error';sync.invalidPending={};x.window.dispatchEvent(new Event('pagehide'));assert.equal(calls,0);
 x.cleanup();sync.invalidPending=null;sync.status='pending';x.window.dispatchEvent(new Event('pagehide'));assert.equal(calls,0);
});
