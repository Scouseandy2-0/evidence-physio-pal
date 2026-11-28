// Actual app DOM/events with fictional metadata; no iPhone/VoiceOver claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {readFileSync} from 'node:fs';
import {emptyWorkspace} from '../web/workspace-data.js';
const tick=()=>new Promise(r=>setImmediate(r));
const payload=ids=>({hitCount:ids.length,resultList:{result:ids.map(id=>({source:'MED',id,title:`Fictional paper ${id}`,authorString:'QA Author'}))}});
let serial=0;
async function app(hash,publicationFetch,run){
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8'));
 const keys=['window','document','location','localStorage','fetch','FormData','requestAnimationFrame'],old=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 let currentHash=hash,focus=null,scrolled=null;const calls=[];
 const location={get hash(){return currentHash;},set hash(value){currentHash=value.startsWith('#')?value:'#'+value;queueMicrotask(()=>window.dispatchEvent(new window.Event('hashchange')));}};
 Object.assign(globalThis,{window,document,location,FormData:class{constructor(form){this.form=form;}get(name){return this.form.querySelector(`[name="${name}"]`)?.value;}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},requestAnimationFrame:fn=>setTimeout(fn,0)});
 window.scrollY=420;window.scrollTo=(x,y)=>{scrolled=y;};window.matchMedia=()=>({matches:false});window.HTMLElement.prototype.focus=function(){focus=this;};Object.defineProperty(document,'activeElement',{get(){return focus;}});
 const selected=new WeakMap();Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return selected.get(this)??this.querySelector('option[selected]')?.getAttribute('value')??this.querySelector('option')?.getAttribute('value')??'';},set(v){selected.set(this,String(v));}});
 const dialog=document.querySelector('dialog');dialog.open=false;dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 globalThis.fetch=async(url,options={})=>{if(url==='/api/workspace')return Response.json({account:{id:'qa'},revision:0,workspace:emptyWorkspace()});calls.push({url,options});return publicationFetch(url,options);};
 const follow=async link=>{link.click();location.hash=link.getAttribute('href');await tick();};
 try{await import(`../web/app.js?paper-pages-${serial++}`);await tick();await tick();await run({window,document,location,calls,follow,get focus(){return focus;},get scrolled(){return scrolled;}});}
 finally{for(const key of keys){if(old[key]===undefined)delete globalThis[key];else globalThis[key]=old[key];}}
}
test('five distinct paper titles open native pages, retain search state and return focus to the matching result',async()=>{
 const ids=['123','124','125','126','127'];
 await app('#research',async()=>Response.json(payload(ids)),async ctx=>{
  const {document,window}=ctx;document.querySelector('#research-search input').value='fictional topic';document.querySelector('#research-search').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();await tick();
  for(const id of ids){
   const title=[...document.querySelectorAll('.paper-title')].find(a=>a.dataset.detail===`MED:${id}`);assert.equal(title.tagName,'A');assert.equal(title.getAttribute('aria-haspopup'),null);
   await ctx.follow(title);assert.equal(ctx.location.hash,`#paper/${id}`);assert.equal(document.querySelector('dialog').open,false);assert.equal(document.querySelector('#paper-heading').textContent,`Fictional paper ${id}`);assert.equal(ctx.focus.id,'paper-heading');
   const source=[...document.querySelectorAll('.paper-record a')].find(a=>a.textContent==='Open PubMed record (new tab)');assert.equal(source.getAttribute('href'),`https://pubmed.ncbi.nlm.nih.gov/${id}/`);assert.equal(source.getAttribute('target'),'_blank');
   await ctx.follow(document.querySelector('#paper-back'));assert.equal(ctx.location.hash,'#research');assert.equal(document.querySelectorAll('.paper-title').length,5);assert.equal(document.querySelector('#research-search input').value,'fictional topic');assert.equal(ctx.focus.dataset.detail,`MED:${id}`);assert.equal(ctx.scrolled,420);
  }
  assert.equal(ctx.calls.length,1);
 });
});
test('a directly opened paper URL retrieves only its exact PMID and remains unsaved',async()=>{
 await app('#paper/456',async(url,options)=>{assert.equal(url,'/api/research');assert.equal(JSON.parse(options.body).term,'456');return Response.json(payload(['456']));},async ctx=>{
  assert.equal(ctx.document.querySelector('#paper-heading').textContent,'Fictional paper 456');assert.equal(ctx.document.querySelector('dialog').open,false);assert.equal(ctx.calls.length,1);assert.match(ctx.document.querySelector('.paper-record').textContent,/Save to my papers/);
 });
});
test('a late paper lookup cannot send the user back after they leave the record page',async()=>{
 let release;
 await app('#paper/789',()=>new Promise(resolve=>{release=()=>resolve(Response.json(payload(['789'])));}),async ctx=>{
  assert.match(ctx.document.querySelector('main').textContent,/Loading/);ctx.location.hash='#home';await tick();release();await tick();await tick();assert.equal(ctx.location.hash,'#home');assert.equal(ctx.document.querySelector('[data-paper-record]'),null);assert.match(ctx.document.title,/Overview/);
 });
});
test('an absent indexed record has a retry and source link rather than a fabricated paper',async()=>{
 let attempt=0;
 await app('#paper/888',async()=>Response.json(payload(++attempt===1?[]:['888'])),async ctx=>{
  assert.match(ctx.document.querySelector('main').textContent,/No matching indexed record/);assert.ok(ctx.document.querySelector('#retry-paper-record'));ctx.document.querySelector('#retry-paper-record').click();await tick();await tick();assert.equal(ctx.document.querySelector('#paper-heading').textContent,'Fictional paper 888');assert.equal(ctx.calls.length,2);
 });
});
