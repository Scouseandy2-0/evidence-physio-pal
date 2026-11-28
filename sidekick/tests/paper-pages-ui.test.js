// Actual app DOM/events with fictional metadata; no iPhone/VoiceOver claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {readFileSync} from 'node:fs';
import {emptyWorkspace} from '../web/workspace-data.js';
import {WorkspaceSync} from '../web/sync.js';
const tick=()=>new Promise(r=>setImmediate(r));
const payload=ids=>({hitCount:ids.length,resultList:{result:ids.map(id=>({source:'MED',id,title:`Fictional paper ${id}`,authorString:'QA Author'}))}});
let serial=0;
async function app(hash,publicationFetch,run){
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8'));
 const keys=['window','document','location','localStorage','fetch','FormData','requestAnimationFrame'],old=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 let currentHash=hash,focus=null,scrolled=null,accountWorkspace=emptyWorkspace(),revision=0,workspaceWrites=0;const calls=[];
 const location={get hash(){return currentHash;},set hash(value){currentHash=value.startsWith('#')?value:'#'+value;queueMicrotask(()=>window.dispatchEvent(new window.Event('hashchange')));}};
 Object.assign(globalThis,{window,document,location,FormData:class{constructor(form){this.form=form;}get(name){return this.form.querySelector(`[name="${name}"]`)?.value;}*[Symbol.iterator](){for(const el of this.form.querySelectorAll("[name]"))yield[el.name,el.value];}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},requestAnimationFrame:fn=>setTimeout(fn,0)});
 window.scrollY=420;window.scrollTo=(x,y)=>{scrolled=y;};window.matchMedia=()=>({matches:false});window.HTMLElement.prototype.focus=function(){focus=this;};Object.defineProperty(document,'activeElement',{get(){return focus;}});
 const selected=new WeakMap();Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return selected.get(this)??this.querySelector('option[selected]')?.getAttribute('value')??this.querySelector('option')?.getAttribute('value')??'';},set(v){selected.set(this,String(v));}});
 const dialog=document.querySelector('dialog');dialog.open=false;dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 globalThis.fetch=async(url,options={})=>{if(url==='/api/workspace'){if(options.method==='PUT'){workspaceWrites++;const body=JSON.parse(options.body);accountWorkspace=body.workspace;revision=body.revision+1;return Response.json({revision,updatedAt:new Date().toISOString()});}return Response.json({account:{id:'qa'},revision,workspace:accountWorkspace});}calls.push({url,options});return publicationFetch(url,options);};
 const follow=async link=>{link.click();location.hash=link.getAttribute('href');await tick();await new Promise(r=>setTimeout(r,5));};
 try{await import(`../web/app.js?paper-pages-${serial++}`);await tick();await tick();await run({window,document,location,calls,follow,get focus(){return focus;},get scrolled(){return scrolled;},get workspaceWrites(){return workspaceWrites;},get stored(){return accountWorkspace;}});}
 finally{for(const key of keys){if(old[key]===undefined)delete globalThis[key];else globalThis[key]=old[key];}}
}
test('five distinct paper titles open native pages, retain search state and return focus to the matching result',async()=>{
 const ids=['123','124','125','126','127'];
 await app('#research',async()=>Response.json(payload(ids)),async ctx=>{
  const {document,window}=ctx;document.querySelector('#research-search input').value='fictional topic';document.querySelector('#research-search').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();await tick();
  for(const id of ids){
   const title=[...document.querySelectorAll('.paper-title')].find(a=>a.dataset.detail===`MED:${id}`);assert.equal(title.tagName,'A');assert.equal(title.getAttribute('aria-haspopup'),null);
   await ctx.follow(title);assert.equal(ctx.location.hash,`#paper/${id}`);assert.equal(document.querySelector('dialog').open,false);assert.equal(document.querySelector('#paper-heading').textContent,`Fictional paper ${id}`);assert.equal(ctx.focus.id,'paper-heading');assert.equal(document.querySelector('main').firstElementChild.getAttribute('data-paper-record'),`MED:${id}`);assert.equal(document.querySelector('main').lastElementChild.querySelector('a').id,'paper-back');
   const source=[...document.querySelectorAll('.paper-record a')].find(a=>a.textContent==='Open PubMed record (new tab)');assert.equal(source.getAttribute('href'),`https://pubmed.ncbi.nlm.nih.gov/${id}/`);assert.equal(source.getAttribute('target'),'_blank');
   await ctx.follow(document.querySelector('#paper-back'));assert.equal(ctx.location.hash,'#research');assert.equal(document.querySelectorAll('.paper-title').length,5);assert.equal(document.querySelector('#research-search input').value,'fictional topic');assert.equal(ctx.focus.dataset.detail,`MED:${id}`);assert.equal(ctx.scrolled,420);
  }
  assert.equal(ctx.calls.length,1);
  document.querySelector('#report-button').click();document.querySelector('#problem-description').value='Opening a paper returned unexpectedly.';
  document.querySelector('#problem-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  const report=document.querySelector('#problem-text').value;assert.match(report,/Activate paper-title on research/);assert.match(report,/Page research → paper/);assert.match(report,/Activate paper-return on paper/);assert.doesNotMatch(report,/Fictional paper|fictional topic|#paper\/123/);
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

const originalRecord=()=>({pmid:'456',title:'Fictional paper 456',abstract:'Fictional original-source abstract for software QA.',abstractStatus:'available',abstractSource:'PubMed (NCBI)',abstractURL:'https://pubmed.ncbi.nlm.nih.gov/456/',abstractRetrievedAt:new Date().toISOString(),abstractCopyright:'QA copyright',retracted:true});
test('abstract retrieval retains the paper heading, source link and reading position through loading and completion',async()=>{
 let release;
 await app('#paper/456',async(url)=>url==='/api/research'?Response.json(payload(['456'])):new Promise(resolve=>{release=()=>resolve(Response.json(originalRecord()));}),async ctx=>{
  const {document}=ctx,heading=document.querySelector('#paper-heading'),source=document.querySelector('.paper-record a'),warning=document.querySelector('#paper-source-warning');
  const button=document.querySelector('#paper-abstract-action');button.focus();button.click();assert.equal(document.querySelector('#paper-heading'),heading);assert.equal(document.querySelector('.paper-record a'),source);assert.match(document.querySelector('#paper-abstract-status').textContent,/Loading/);
  release();await tick();await tick();assert.equal(document.querySelector('#paper-heading'),heading);assert.equal(document.querySelector('.paper-record a'),source);assert.match(document.querySelector('.abstract-full').textContent,/Fictional original-source abstract/);assert.equal(warning.hidden,false);assert.equal(ctx.focus.id,'paper-abstract-heading');assert.equal(ctx.scrolled,null);
 });
});
test('failed abstract retrieval keeps the record in place and leaves an actionable retry',async()=>{
 await app('#paper/456',async url=>url==='/api/research'?Response.json(payload(['456'])):Response.json({error:'Fixture unavailable'},{status:503}),async ctx=>{
  const heading=ctx.document.querySelector('#paper-heading');ctx.document.querySelector('#paper-abstract-action').click();await tick();await tick();assert.equal(ctx.document.querySelector('#paper-heading'),heading);assert.ok(ctx.document.querySelector('#paper-abstract-action'));assert.match(ctx.document.querySelector('#paper-abstract-status').textContent,/unavailable|could not/i);assert.equal(ctx.location.hash,'#paper/456');
 });
});
test('save and unsave retain the same paper/button nodes, with queued work attempted on backgrounding',async()=>{
 await app('#paper/456',async()=>Response.json(payload(['456'])),async ctx=>{
  const {document,window}=ctx,heading=document.querySelector('#paper-heading'),button=document.querySelector('.paper-record [data-save]');button.focus();button.click();assert.equal(document.querySelector('#paper-heading'),heading);assert.equal(document.querySelector('.paper-record [data-save]'),button);assert.match(button.textContent,/Remove from saved/);assert.equal(ctx.focus,button);
  Object.defineProperty(document,'visibilityState',{value:'hidden'});document.dispatchEvent(new window.Event('visibilitychange'));await tick();await tick();assert.equal(ctx.workspaceWrites,1);assert.equal(ctx.stored.saved.length,1);
  button.click();assert.equal(document.querySelector('#paper-heading'),heading);assert.equal(document.querySelector('.paper-record [data-save]'),button);assert.match(button.textContent,/Save to my papers/);document.dispatchEvent(new window.Event('visibilitychange'));await tick();await tick();assert.equal(ctx.stored.saved.length,0);assert.equal(ctx.scrolled,null);
 });
});
test('closing and reopening a problem report retains its draft without uploading it',async()=>{
 await app('#home',async()=>{throw Error('No publication request expected');},async ctx=>{
  const {document,window}=ctx;document.querySelector('#report-button').click();document.querySelector('#problem-description').value='Fictional retained report details';document.querySelector('#problem-expected').value='Stay on the selected paper';document.querySelector('#problem-form').dispatchEvent(new window.Event('input',{bubbles:true}));document.querySelector('.dialog-close').click();document.querySelector('#report-button').click();assert.equal(document.querySelector('#problem-description').value,'Fictional retained report details');assert.equal(document.querySelector('#problem-expected').value,'Stay on the selected paper');assert.equal(ctx.workspaceWrites,0);assert.equal(ctx.calls.length,0);
 });
});

const submit=(ctx,id)=>ctx.document.querySelector(id).dispatchEvent(new ctx.window.Event('submit',{bubbles:true,cancelable:true}));
const input=(ctx,id,value,type='input')=>{const el=ctx.document.querySelector(id);el.value=value;el.dispatchEvent(new ctx.window.Event(type,{bubbles:true}));};
const flush=async ctx=>{ctx.window.dispatchEvent(new ctx.window.Event('pagehide'));await tick();await tick();};
async function revisionDraft(ctx){
 ctx.document.querySelector('.paper-record [data-save]').click();await flush(ctx);
 ctx.location.hash='#learn';await tick();ctx.document.querySelector('[data-learn-tab="revision"]').click();ctx.document.querySelector('[data-new-study]').click();await tick();
 ctx.document.querySelector('#new-study-card').click();input(ctx,'#revision-source','MED:456','change');input(ctx,'#revision-question','Fictional question?');input(ctx,'#revision-answer','Fictional verified answer');
}
test('skip link preserves the current page and focuses the workspace',async()=>{
 await app('#research',async()=>Response.json(payload([])),async ctx=>{const event=new ctx.window.Event('click',{bubbles:true,cancelable:true});ctx.document.querySelector('.skip').dispatchEvent(event);assert.equal(event.defaultPrevented,true);assert.equal(ctx.location.hash,'#research');assert.equal(ctx.focus.id,'main');assert.equal(ctx.scrolled,0);});
});
test('changed reflection drafts require discard confirmation and Keep editing retains values across a page visit',async()=>{
 await app('#cpd',async()=>Response.json(payload([])),async ctx=>{
  ctx.document.querySelector('#new-reflection').click();input(ctx,'#reflection-title','Fictional unfinished reflection');input(ctx,'#reflection-kind','Teaching','change');
  ctx.location.hash='#home';await tick();ctx.location.hash='#cpd';await tick();assert.equal(ctx.document.querySelector('#reflection-kind').value,'Teaching');ctx.document.querySelector('#cancel-reflection').click();assert.ok(ctx.document.querySelector('#keep-draft'));ctx.document.querySelector('#keep-draft').click();assert.equal(ctx.document.querySelector('#reflection-title').value,'Fictional unfinished reflection');
  ctx.document.querySelector('#cancel-reflection').click();ctx.document.querySelector('#discard-draft').click();assert.equal(ctx.document.querySelector('#reflection-form'),null);assert.equal(ctx.workspaceWrites,0);
 });
});
test('a refused reflection queue keeps the draft and a retry creates only one saved record',async()=>{
 await app('#cpd',async()=>Response.json(payload([])),async ctx=>{
  ctx.document.querySelector('#new-reflection').click();for(const [id,value] of [['title','Fictional reflection'],['date','2026-11-28'],['minutes','10'],['kind','Research reading'],['learning','Fictional learning'],['action','Fictional next step']])input(ctx,`#reflection-${id}`,value);
  const queue=WorkspaceSync.prototype.queue;try{WorkspaceSync.prototype.queue=()=>false;submit(ctx,'#reflection-form');}finally{WorkspaceSync.prototype.queue=queue;}
  assert.equal(ctx.document.querySelector('#reflection-learning').value,'Fictional learning');assert.match(ctx.document.querySelector('#toast').textContent,/could not be queued/);assert.equal(ctx.stored.reflections.length,0);
  submit(ctx,'#reflection-form');await flush(ctx);assert.equal(ctx.document.querySelector('#reflection-form'),null);assert.equal(ctx.stored.reflections.length,1);assert.equal(ctx.stored.reflections[0].title,'Fictional reflection');
  ctx.document.querySelector('[data-edit-reflection]').click();input(ctx,'#reflection-title','Changed title');
  try{WorkspaceSync.prototype.queue=()=>false;submit(ctx,'#reflection-form');}finally{WorkspaceSync.prototype.queue=queue;}
  assert.equal(ctx.document.querySelector('#reflection-title').value,'Changed title');await flush(ctx);assert.equal(ctx.stored.reflections[0].title,'Fictional reflection');
  submit(ctx,'#reflection-form');await flush(ctx);assert.equal(ctx.stored.reflections.length,1);assert.equal(ctx.stored.reflections[0].title,'Changed title');
 });
});
test('a refused revision queue retains text and retry does not duplicate the new card',async()=>{
 await app('#paper/456',async()=>Response.json(payload(['456'])),async ctx=>{
  await revisionDraft(ctx);const queue=WorkspaceSync.prototype.queue;try{WorkspaceSync.prototype.queue=()=>false;submit(ctx,'#revision-card-form');}finally{WorkspaceSync.prototype.queue=queue;}
  assert.equal(ctx.document.querySelector('#revision-answer').value,'Fictional verified answer');assert.match(ctx.document.querySelector('#toast').textContent,/could not be queued/);
  submit(ctx,'#revision-card-form');await flush(ctx);assert.equal(ctx.stored.studySets[0].cards.length,1);assert.equal(ctx.stored.studySets[0].cards[0].answer,'Fictional verified answer');
  ctx.document.querySelector('[data-edit-card]').click();input(ctx,'#revision-answer','Edited answer');try{WorkspaceSync.prototype.queue=()=>false;submit(ctx,'#revision-card-form');}finally{WorkspaceSync.prototype.queue=queue;}
  await flush(ctx);assert.equal(ctx.stored.studySets[0].cards[0].answer,'Fictional verified answer');assert.equal(ctx.document.querySelector('#revision-answer').value,'Edited answer');
  submit(ctx,'#revision-card-form');await flush(ctx);assert.equal(ctx.stored.studySets[0].cards.length,1);assert.equal(ctx.stored.studySets[0].cards[0].answer,'Edited answer');
 });
});
test('revision Markdown and deletion cannot silently omit or erase a dirty card draft',async()=>{
 await app('#paper/456',async()=>Response.json(payload(['456'])),async ctx=>{
  await revisionDraft(ctx);ctx.document.querySelector('#export-study').click();assert.match(ctx.document.querySelector('#toast').textContent,/before exporting/);assert.ok(ctx.document.querySelector('#revision-card-form'));
  ctx.document.querySelector('#remove-study').click();assert.match(ctx.document.querySelector('#toast').textContent,/before removing/);assert.equal(ctx.document.querySelector('dialog').open,false);
  ctx.document.querySelector('#cancel-study-card').click();assert.ok(ctx.document.querySelector('#keep-draft'));ctx.document.querySelector('#keep-draft').click();assert.equal(ctx.document.querySelector('#revision-question').value,'Fictional question?');
  ctx.document.querySelector('#cancel-study-card').click();ctx.document.querySelector('#discard-draft').click();assert.equal(ctx.document.querySelector('#revision-card-form'),null);await flush(ctx);assert.equal(ctx.stored.studySets[0].cards.length,0);
 });
});
