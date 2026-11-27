// Application DOM/event checks; no real browser layout, VoiceOver or device claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {emptyWorkspace} from '../web/workspace-data.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const record={id:'private-record',title:'Private learning record',date:'2026-11-27',minutes:10,kind:'Teaching',learning:'Private learning text',action:'Review',source:''};
async function application(cached,run){
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8'));
 const keys=['window','document','location','localStorage','fetch','requestAnimationFrame'];const old=Object.fromEntries(keys.map(key=>[key,globalThis[key]]));
 const values=new Map(cached?[['physiosidekick.account.qa',JSON.stringify(cached)]]:[]);
 let workspace={...emptyWorkspace(),reflections:[record]},revision=1,writes=0;
 const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 Object.assign(globalThis,{window,document,location:{hash:'#home'},localStorage:storage,requestAnimationFrame:fn=>setTimeout(fn,0)});
 window.HTMLElement.prototype.focus=function(){};window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
 const modal=document.querySelector('dialog');modal.showModal=()=>{modal.open=true;};modal.close=()=>{modal.open=false;};
 globalThis.fetch=async(u,options={})=>{
  if(options.method==='PUT'){writes++;const body=JSON.parse(options.body);if(body.revision!==revision)return Response.json({error:'Changed elsewhere'},{status:409});workspace=body.workspace;revision++;return Response.json({revision,updatedAt:new Date().toISOString()});}
  return Response.json({account:{id:'qa',name:'QA'},revision,workspace});
 };
 try{await import(`../web/app.js?records-${cached?'conflict':'clear'}`);await tick();await run({window,document,storage,get workspace(){return workspace;},get writes(){return writes;}});}
 finally{for(const key of keys){if(old[key]===undefined)delete globalThis[key];else globalThis[key]=old[key];}}
}
test('clear UI requires review and exact confirmation, clears records, and returns to overview',async()=>{
 await application(null,async ctx=>{
  const {document,window}=ctx;document.querySelector('#data-button').click();assert.equal(document.querySelector('#clear-records').disabled,false);assert.match(document.querySelector('.dialog-body').textContent,/does not close your ChatGPT account/);
  document.querySelector('#clear-records').click();const input=document.querySelector('#clear-confirmation');const button=document.querySelector('#confirm-clear');assert.equal(button.disabled,true);assert.equal(ctx.writes,0);
  input.value='clear';input.dispatchEvent(new window.Event('input'));assert.equal(button.disabled,true);
  input.value='CLEAR';input.dispatchEvent(new window.Event('input'));assert.equal(button.disabled,false);
  button.click();await tick();await tick();assert.equal(ctx.writes,1);assert.deepEqual(ctx.workspace,emptyWorkspace());assert.equal(document.querySelector('dialog').open,false);assert.doesNotMatch(document.querySelector('main').textContent,/Private learning record/);assert.match(document.querySelector('#toast').textContent,/records cleared/);
 });
});
test('conflict UI offers explicit discard and loads the account without writing a merge',async()=>{
 await application({revision:0,pending:{...emptyWorkspace(),reflections:[{...record,id:'device-only',title:'Device only text'}]}},async ctx=>{
  const {document}=ctx;document.querySelector('#review-conflict').click();const review=[...document.querySelectorAll('.dialog-body button')].find(el=>el.textContent.includes('Review discarding'));assert.ok(review);review.click();
  assert.match(document.querySelector('.dialog-body').textContent,/Export this device/);document.querySelector('#confirm-discard').click();await tick();await tick();assert.equal(ctx.writes,0);assert.equal(document.querySelector('dialog').open,false);assert.equal(document.querySelector('#sync-status').textContent,'Account saved');assert.equal(JSON.parse(ctx.storage.getItem('physiosidekick.account.qa')).pending,null);
 });
});
