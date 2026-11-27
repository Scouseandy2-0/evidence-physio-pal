// Actual application DOM/events with fictional fixtures; no browser layout/device claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {emptyWorkspace} from '../web/workspace-data.js';
import {newStudySet,saveStudyCard,rateStudyCard} from '../web/study.js';
import {newAppraisal} from '../web/appraisal.js';
import {newTeachingPlan,teachingSource} from '../web/teaching.js';
test('learning screens expose real PDF/Word actions, card filters/practice work, and due-date actions select only due records',async()=>{
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8')),keys=['window','document','location','localStorage','fetch','requestAnimationFrame'],prior=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const paper={id:'MED:123',pmid:'123',title:'Fixture paper',authors:'Example Author'},set=newStudySet('s');set.cards=[saveStudyCard({question:'First question',answer:'My answer',paper,id:'c1'}),rateStudyCard(saveStudyCard({question:'Second question',answer:'Another answer',paper,id:'c2'}),'again')];
 const teaching=newTeachingPlan({},'t');teaching.sources=[teachingSource(paper)];
 const day=new Date(),today=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
 const base={date:today,minutes:15,kind:'Teaching',learning:'Fixture',action:'Review',source:''};
 const workspace={...emptyWorkspace(),saved:[paper],appraisals:[newAppraisal(paper,'a')],teachingPlans:[teaching],studySets:[set],reflections:[{...base,id:'due',title:'DUE QA record',followUpDate:today},{...base,id:'undated',title:'UNDATED QA record'}]};
 let currentHash='#home';const pageLocation={get hash(){return currentHash;},set hash(value){currentHash=value.startsWith('#')?value:'#'+value;}};
 Object.assign(globalThis,{window,document,location:pageLocation,localStorage:{getItem(){return null},setItem(){},removeItem(){}},requestAnimationFrame:fn=>setTimeout(fn,0)});
 const selects=new WeakMap();Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return selects.get(this)??this.querySelector('option[selected]')?.getAttribute('value')??this.querySelector('option')?.getAttribute('value')??'';},set(value){selects.set(this,String(value));}});
 window.HTMLElement.prototype.focus=function(){};window.scrollTo=()=>{};window.matchMedia=()=>({matches:false});const dialog=document.querySelector('dialog');dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 globalThis.fetch=async()=>Response.json({account:{id:'qa'},revision:0,workspace});
 const route=hash=>{location.hash=hash;window.dispatchEvent(new window.Event('hashchange'));};
 try{
  await import('../web/app.js?learning-five-ui');await new Promise(r=>setImmediate(r));
  document.querySelector('#home-due-followups').click();window.dispatchEvent(new window.Event('hashchange'));assert.ok(document.querySelector('.paper-list'),document.querySelector('main').textContent);assert.match(document.querySelector('.paper-list').textContent,/DUE QA/);assert.doesNotMatch(document.querySelector('.paper-list').textContent,/UNDATED QA/);
  route('#learn');document.querySelector('[data-learn-tab="revision"]').click();document.querySelector('[data-open-study="s"]').click();window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(document.querySelectorAll('.learning-exports [data-document-format]').length,2);
  document.querySelector('#study-filter-term').value='second';document.querySelector('#study-filter-rating').value='again';document.querySelector('#study-filters').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));assert.equal(document.querySelectorAll('[data-study-card]').length,1);assert.ok(document.querySelector('[data-study-card="c2"]'));
  document.querySelector('#new-study-card').click();document.querySelector('#revision-question').value='Unfinished draft stays';document.querySelector('#revision-card-form').dispatchEvent(new window.Event('input',{bubbles:true}));document.querySelector('#study-filters').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));assert.equal(document.querySelector('#revision-question').value,'Unfinished draft stays');document.querySelector('#cancel-study-card').click();
  document.querySelector('#practise-filtered').click();assert.match(document.querySelector('.recall-card').textContent,/Second question/);assert.match(document.querySelector('.recall-card').textContent,/CARD 1 OF 1/);document.querySelector('#end-study-practice').click();
  route('#appraisal');document.querySelector('[data-open-appraisal="a"]').click();window.dispatchEvent(new window.Event('hashchange'));assert.equal(document.querySelectorAll('.learning-exports [data-document-format]').length,2);
  route('#fcp');document.querySelector('[data-open-teaching="t"]').click();window.dispatchEvent(new window.Event('hashchange'));assert.equal(document.querySelectorAll('.learning-exports [data-document-format]').length,2);
 }finally{for(const k of keys){if(prior[k]===undefined)delete globalThis[k];else globalThis[k]=prior[k];}}
});
