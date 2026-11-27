import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {assignReviewDate,localDay} from '../web/portfolio.js';
import {emptyWorkspace} from '../web/workspace-data.js';
test('assigning a review date changes only the selected reflection and rejects invalid or earlier dates',()=>{
 const records=[{id:'a',date:'2026-11-27',title:'Keep title',minutes:15,learning:'Keep learning',outcome:'Keep outcome'},{id:'b',date:'2026-11-26',followUpDate:'2026-12-01'}],before=JSON.stringify(records);
 const next=assignReviewDate(records,'a','2026-11-28');assert.equal(JSON.stringify(records),before);assert.deepEqual(next[0],{...records[0],followUpDate:'2026-11-28'});assert.equal(next[1],records[1]);
 for(const [id,date]of [['absent','2026-11-28'],['a','2026-02-30'],['a',''],['a','2026-11-26']])assert.throws(()=>assignReviewDate(records,id,date));
});
test('an undated reflection hidden by due filters can be assigned a future date, saved and made visible',async()=>{
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8')),keys=['window','document','location','localStorage','fetch','requestAnimationFrame'],prior=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const today=localDay(),tomorrowDate=new Date();tomorrowDate.setDate(tomorrowDate.getDate()+1);const tomorrow=localDay(tomorrowDate);
 let remote={...emptyWorkspace(),reflections:[{id:'a',date:today,title:'Hidden undated learning',minutes:15,kind:'Teaching',learning:'Keep this learning',action:'Keep next step',outcome:'Keep outcome',source:''}]},revision=1;
 let hash='#cpd';const location={get hash(){return hash;},set hash(value){hash=value.startsWith('#')?value:'#'+value;}};
 Object.assign(globalThis,{window,document,location,localStorage:{getItem(){return null},setItem(){},removeItem(){}},requestAnimationFrame:fn=>setTimeout(fn,0)});
 const values=new WeakMap();Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return values.get(this)??this.querySelector('option[selected]')?.getAttribute('value')??this.querySelector('option')?.getAttribute('value')??'';},set(value){values.set(this,String(value));}});
 window.HTMLElement.prototype.focus=function(){};window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});const dialog=document.querySelector('dialog');dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 globalThis.fetch=async(url,options={})=>{if(options.method==='PUT'){const body=JSON.parse(options.body);assert.equal(body.accountId,'qa');assert.equal(body.revision,revision);remote=body.workspace;return Response.json({revision:++revision,updatedAt:new Date().toISOString()});}return Response.json({account:{id:'qa'},workspace:remote,revision});};
 try{
  await import('../web/app.js?review-date-ui');await new Promise(r=>setImmediate(r));
  document.querySelector('#show-due-reviews').click();assert.equal(document.querySelectorAll('[data-reflection]').length,0);assert.match(document.querySelector('.empty').textContent,/without a review date/);
  document.querySelector('#set-review-date').click();assert.equal(document.querySelector('#review-reflection').value,'a');document.querySelector('#review-date-value').value=tomorrow;document.querySelector('#review-date-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(dialog.open,false);assert.equal(document.querySelector('#portfolio-review option[selected]').value,'upcoming');assert.match(document.querySelector('[data-reflection="a"]').textContent,/Hidden undated learning/);assert.match(document.querySelector('[data-reflection="a"]').textContent,new RegExp(tomorrow));
  await new Promise(r=>setTimeout(r,700));assert.equal(remote.reflections[0].followUpDate,tomorrow);assert.equal(remote.reflections[0].date,today);assert.equal(remote.reflections[0].minutes,15);assert.equal(remote.reflections[0].outcome,'Keep outcome');assert.equal(document.querySelector('#sync-status').textContent,'Account saved');
  document.querySelector('[data-set-review-date="a"]').click();document.querySelector('#review-date-value').value=today;document.querySelector('#review-date-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));assert.equal(document.querySelector('#portfolio-review option[selected]').value,'due');await new Promise(r=>setTimeout(r,700));assert.equal(remote.reflections[0].followUpDate,today);
 }finally{for(const k of keys){if(prior[k]===undefined)delete globalThis[k];else globalThis[k]=prior[k];}}
});
