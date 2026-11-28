// Actual app events using fictional records. Layout/device QA is recorded separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {emptyWorkspace} from '../web/workspace-data.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('failed next-page retry keeps earlier papers and uses the same cursor; stopped searches ignore late replies',async()=>{
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8'));
 const keys=['window','document','location','localStorage','fetch','requestAnimationFrame','FormData','Date'],prior=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 let currentHash='#research',focused=null,release,mode='first';const calls=[];
 const pageLocation={get hash(){return currentHash;},set hash(v){currentHash=v.startsWith('#')?v:'#'+v;}};
 Object.assign(globalThis,{window,document,location:pageLocation,localStorage:{getItem(){return null},setItem(){},removeItem(){}},requestAnimationFrame:fn=>setTimeout(fn,0),FormData:class{constructor(form){this.form=form;}get(name){return this.form.querySelector(`[name="${name}"]`)?.value;}}});
 const selected=new WeakMap();Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return selected.get(this)??this.querySelector('option[selected]')?.getAttribute('value')??this.querySelector('option')?.getAttribute('value')??'';},set(v){selected.set(this,String(v));}});
 Object.defineProperty(document,'activeElement',{get(){return focused;}});window.HTMLElement.prototype.focus=function(){focused=this;};window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});
 const dialog=document.querySelector('dialog');dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new window.Event('close'));};
 const payload=(id,next)=>({hitCount:16,resultList:{result:[{source:'MED',id,title:`Fictional paper ${id}`,authorString:'QA Author'}]},nextCursorMark:next});
 globalThis.fetch=async(url,options)=>{
  if(String(url)==='/api/workspace')return Response.json({account:{id:'qa'},revision:0,workspace:emptyWorkspace()});
  if(String(url)!=='/api/research')return Response.json({error:'Fixture outage'},{status:503});
  const body=JSON.parse(options.body);calls.push(body);
  if(mode==='first')return Response.json(payload('123','cursor-a'));
  if(mode==='fail')return Response.json({error:'Fixture outage'},{status:503});
  if(mode==='retry')return Response.json(payload('456','cursor-b'));
  return new Promise(resolve=>{release=()=>resolve(Response.json(payload('789','cursor-c')));});
 };
 const submit=()=>document.querySelector('#research-search').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 try{
  await import('../web/app.js?readiness-ten-ui');await tick();
  document.querySelector('#research-search input').value='knee';submit();await tick();await tick();
  assert.equal(document.querySelectorAll('.paper-list .paper-card').length,1);
  // Paper titles are real page links; opening no longer uses a popup.
  const paperTitle=document.querySelector('.paper-title'),originalRoute=location.hash;
  paperTitle.click();location.hash=paperTitle.getAttribute('href');window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(!!dialog.open,false);assert.equal(focused.id,'paper-heading');assert.equal(location.hash,'#paper/123');
  assert.match(document.querySelector('[data-paper-record]').textContent,/Fictional paper 123/);
  const back=document.querySelector('#paper-back');back.click();location.hash=back.getAttribute('href');window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(location.hash,originalRoute);assert.equal(focused,document.querySelector('.paper-title'));
  assert.equal(document.querySelector('.paper-title').tagName,'A');

  mode='fail';document.querySelector('#load-more').click();await tick();await tick();
  assert.ok(document.querySelector('#retry-search'));assert.match(document.querySelector('.paper-list').textContent,/123/);
  mode='retry';document.querySelector('#retry-search').click();await tick();await tick();
  assert.equal(calls[1].cursor,'cursor-a');assert.equal(calls[2].cursor,'cursor-a');assert.deepEqual(calls[2].filters,calls[0].filters);
  assert.match(document.querySelector('.paper-list').textContent,/123/);assert.match(document.querySelector('.paper-list').textContent,/456/);
  mode='held';document.querySelector('#load-more').click();assert.ok(document.querySelector('#cancel-search'));document.querySelector('#cancel-search').click();
  assert.equal(document.querySelector('#results').getAttribute('aria-busy'),'false');assert.match(document.querySelector('.paper-list').textContent,/123/);
  release();await tick();await tick();assert.doesNotMatch(document.querySelector('.paper-list').textContent,/789/);
  document.querySelector('#research-search input').value='new topic';submit();assert.ok(document.querySelector('#cancel-search'));document.querySelector('#cancel-search').click();release();await tick();
  assert.match(document.querySelector('#results').textContent,/No new result count/);assert.doesNotMatch(document.querySelector('#results').textContent,/No matching papers|0 indexed/);
  const opener=document.querySelector('#data-button');opener.focus();opener.click();assert.equal(focused.id,'dialog-title');document.querySelector('.dialog-close').click();assert.equal(focused,opener);
  opener.focus();opener.click();opener.remove();document.querySelector('.dialog-close').click();assert.equal(focused.id,'main');
  document.querySelector('#readiness-button').click();assert.equal(document.querySelector('#dialog-title').textContent,'Review this version');
  document.querySelector('#version-review-notes').value='One consolidated review note';document.querySelector('#version-review-form').dispatchEvent(new window.Event('input',{bubbles:true}));document.querySelector('[data-review-route="research"]').click();assert.equal(dialog.open,false);assert.ok(document.querySelector('#research-search'));
  document.querySelector('#readiness-button').click();assert.equal(document.querySelector('#version-review-notes').value,'One consolidated review note');document.querySelector('.dialog-close').click();

  const oldTimezone=process.env.TZ;process.env.TZ='Europe/London';
  try {
    const NativeDate=prior.Date;globalThis.Date=class extends NativeDate {constructor(...args){super(...(args.length?args:['2026-06-01T23:30:00Z']));}};
    location.hash='#cpd';window.dispatchEvent(new window.Event('hashchange'));document.querySelector('#new-reflection').click();
    assert.equal(document.querySelector('#reflection-date').value,'2026-06-02');assert.equal(document.querySelector('#reflection-minutes').value,'');document.querySelector('#cancel-reflection').click();
  } finally { if(oldTimezone===undefined)delete process.env.TZ;else process.env.TZ=oldTimezone;globalThis.Date=prior.Date; }

 }finally{for(const k of keys){if(prior[k]===undefined)delete globalThis[k];else globalThis[k]=prior[k];}}
});
