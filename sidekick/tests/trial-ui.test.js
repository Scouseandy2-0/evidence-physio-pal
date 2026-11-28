// Rendered app events with fictional records. Browser QA is recorded separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {readFileSync} from 'node:fs';
import {trialRecordsKey} from '../web/trial.js';
const tick=()=>new Promise(r=>setImmediate(r));
test('anonymous visitor explicitly starts a trial, saves a reflection locally and sees accurate storage/privacy wording',async()=>{
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8'));
 const keys=['window','document','location','localStorage','fetch','FormData','requestAnimationFrame'],prior=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 let calls=0,currentHash='#cpd';
 Object.assign(globalThis,{window,document,location:{get hash(){return currentHash;},set hash(v){currentHash=v.startsWith('#')?v:'#'+v;}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},fetch:async()=>{calls++;return Response.json({error:'Sign in to use your account workspace.'},{status:401});},requestAnimationFrame:fn=>setTimeout(fn,0),FormData:class{constructor(form){this.form=form;}*[Symbol.iterator](){for(const el of this.form.querySelectorAll('[name]'))yield[el.name,el.value];}}});
 window.sessionStorage=storage;window.HTMLElement.prototype.focus=function(){};window.matchMedia=()=>({matches:false});window.scrollTo=()=>{};
 const selects=new WeakMap();Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return selects.get(this)??this.querySelector('option[selected]')?.getAttribute('value')??this.querySelector('option')?.getAttribute('value')??this.querySelector('option')?.textContent??'';},set(v){selects.set(this,String(v));}});
 const dialog=document.querySelector('dialog');dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 try{
  await import('../web/app.js?trial-workflow-ui');await tick();assert.ok(document.querySelector('#start-trial'));assert.equal(values.size,0);
  document.querySelector('#start-trial').click();await tick();assert.equal(document.querySelector('#sync-status').textContent,'Trial saved in this tab');assert.match(document.querySelector('#sync-banner').textContent,/No trial records are uploaded/);
  document.querySelector('#new-reflection').click();
  for(const [id,value]of Object.entries({'reflection-title':'Fictional trial reflection','reflection-date':'2026-11-28','reflection-minutes':'12','reflection-learning':'Fictional QA learning','reflection-action':'Check original source','reflection-followup':'2026-11-29'}))document.querySelector('#'+id).value=value;
  document.querySelector('#reflection-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,650));
  const row=JSON.parse(storage.getItem(trialRecordsKey));assert.equal(row.workspace.reflections[0].title,'Fictional trial reflection');assert.equal(row.workspace.reflections[0].minutes,12);assert.equal(calls,1);
  document.querySelector('#data-button').click();assert.match(document.querySelector('.dialog-body').textContent,/kept only in this tab/);assert.ok(document.querySelector('#trial-export'));assert.doesNotMatch(document.querySelector('.dialog-body').textContent,/stored in the app’s account database/);
 }finally{for(const k of keys){if(prior[k]===undefined)delete globalThis[k];else globalThis[k]=prior[k];}}
});
