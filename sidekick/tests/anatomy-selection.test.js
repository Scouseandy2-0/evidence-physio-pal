// DOM/event regression checks, not browser rendering, WebGL, or physical-device QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {muscleDetails,structureDetails} from '../web/anatomy-details.js';
import {emptyWorkspace} from '../web/workspace-data.js';

test('real application pickers show reference fields, keep gaps visible, and open compact-screen details in view',async()=>{
 const {window,document}=parseHTML(readFileSync('web/index.html','utf8'));
 const old={window:globalThis.window,document:globalThis.document,location:globalThis.location,localStorage:globalThis.localStorage,fetch:globalThis.fetch,requestAnimationFrame:globalThis.requestAnimationFrame};
 Object.assign(globalThis,{window,document,location:{hash:'#learn'},localStorage:{getItem(){return null},setItem(){},removeItem(){}},requestAnimationFrame:fn=>setTimeout(fn,0)});
 // Linkedom has no layout/focus engine and omits the native select-value setter.
 const selectValues=new WeakMap();Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return selectValues.get(this)||'';},set(v){selectValues.set(this,String(v));}});
 window.HTMLElement.prototype.focus=function(){};window.scrollTo=()=>{};window.matchMedia=()=>({matches:true});
 globalThis.fetch=async()=>new Response(JSON.stringify({account:{id:'selection-test'},revision:0,workspace:emptyWorkspace()}),{headers:{'content-type':'application/json'}});
 const change=(selector,value)=>{const node=document.querySelector(selector);node.value=value;node.dispatchEvent(new window.Event('change',{bubbles:true}));};
 try{
  await import('../web/app.js?anatomy-selection-regression');await new Promise(resolve=>setImmediate(resolve));
  document.querySelector('[data-learn-tab="anatomy"]').click();
  change('#anatomy-system','muscles');
  assert.match(document.querySelector('#anatomy-selection').textContent,/Deltoid/);
  assert.match(document.querySelector('#anatomy-quick-select option[value="frontalis"]').textContent,/reference missing/);
  assert.equal(document.querySelector('#anatomy-quick-select').options.length,178,'uncovered structures must not be hidden');
  for(const id of Object.keys(muscleDetails)){
   change('#anatomy-quick-select',id);const panel=document.querySelector('#anatomy-selection');
   assert.equal(panel.hidden,false);assert.equal(document.querySelector('#anatomy-inspector-title').textContent,structureDetails('muscles',id).name);
   assert.deepEqual([...panel.querySelectorAll('dt')].map(n=>n.textContent),['Origin','Insertion','Actions','Nerve supply']);
   assert.ok([...panel.querySelectorAll('dd')].every(n=>n.textContent.trim()));
  }
  const bench=document.querySelector('#anatomy-workbench');assert.ok(bench.classList.contains('is-expanded'));assert.equal(document.body.style.overflow,'hidden');
  document.querySelector('#hide-anatomy-details').click();assert.equal(document.querySelector('#anatomy-selection').hidden,true);
  change('#anatomy-quick-select','trapezius');assert.equal(document.querySelector('#anatomy-selection').hidden,false);assert.match(document.querySelector('#anatomy-selection').textContent,/Spinal accessory/);
  change('#anatomy-structure','biceps-brachii');assert.match(document.querySelector('#anatomy-selection').textContent,/Musculocutaneous/);
  change('#anatomy-quick-select','frontalis');assert.match(document.querySelector('#anatomy-selection').textContent,/REFERENCE CONTENT MISSING/);assert.equal(document.querySelectorAll('#anatomy-selection dd').length,0);
  document.querySelector('#close-expanded-anatomy').click();assert.ok(!bench.classList.contains('is-expanded'));assert.notEqual(document.body.style.overflow,'hidden');
  change('#anatomy-system','skeleton');change('#anatomy-quick-select','right-femur');assert.match(document.querySelector('#anatomy-selection').textContent,/Key landmarks/);assert.match(document.querySelector('#anatomy-selection').textContent,/Articulations/);
  // Navigating away must restore the background and body after automatic expansion.
  document.querySelector('[data-learn-tab="revision"]').click();assert.notEqual(document.body.style.overflow,'hidden');assert.ok(!document.querySelector('main').inert);
 }finally{for(const [key,value]of Object.entries(old)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
