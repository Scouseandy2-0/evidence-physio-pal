import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyWorkspace} from '../web/workspace-data.js';
import {searchWorkspace} from '../web/workspace-search.js';
import {normalizeReading,loadReading,saveReading,applyReading,readingDefaults} from '../web/reading.js';
const w=()=>({...emptyWorkspace(),saved:[{id:'MED:123',pmid:'123',title:'Knee exercise',authors:'Example Author',notes:'Résumé notes on knee strength',abstract:'Trial methods',collection:'Module 1'}],appraisals:[{id:'a',title:'QA appraisal',findings:'Knee exercise uncertain'}],reflections:[{id:'r',title:'QA CPD',date:'2026-11-27',kind:'Research reading',learning:'Knee exercise learning',outcome:'Checked with tutor'}],teachingPlans:[{id:'t',title:'QA teaching',minutes:15,objectives:'Knee exercise discussion',sources:[]}],studySets:[{id:'s',title:'QA revision set',cards:[{id:'c',question:'Knee exercise question?',answer:'My answer',source:{title:'Paper',citation:'Example source',pmid:'123'}}]}]});
test('one workspace query finds all saved record types and ranks title matches first',()=>{
 const result=searchWorkspace(w(),'knee exercise');
 assert.equal(result.total,5);assert.equal(result.results[0].type,'paper');
 assert.deepEqual(new Set(result.results.map(r=>r.type)),new Set(['paper','appraisal','reflection','teaching','revision']));
 const revision=result.results.find(r=>r.type==='revision');assert.equal(revision.id,'s');assert.equal(revision.childId,'c');
});
test('search supports accents, all-word matching, record-type filters and outcome text',()=>{
 assert.equal(searchWorkspace(w(),'resume strength').results[0].id,'MED:123');
 assert.equal(searchWorkspace(w(),'tutor',{type:'reflection'}).results[0].id,'r');
 assert.equal(searchWorkspace(w(),'knee',{type:'teaching'}).total,1);
 assert.equal(searchWorkspace(w(),'knee impossible-word').total,0);
});
test('bounded search reports the total accurately without mutating records or inventing results',()=>{
 const workspace=w(),before=JSON.stringify(workspace),result=searchWorkspace(workspace,'knee',{limit:2});
 assert.equal(result.total,5);assert.equal(result.results.length,2);assert.equal(JSON.stringify(workspace),before);
 assert.deepEqual(searchWorkspace(workspace,'   '),{total:0,results:[]});
 assert.throws(()=>searchWorkspace(workspace,'x'.repeat(251)));assert.throws(()=>searchWorkspace(workspace,'knee',{type:'secret'}));
});
test('reading preferences are bounded, apply relative sizes and survive device storage round trips',()=>{
 const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 const settings={size:'largest',spacing:'comfortable',motion:'reduced'};
 assert.equal(saveReading(settings,storage),true);assert.deepEqual(loadReading(storage),settings);
 const root={style:{},dataset:{}};applyReading(settings,root);assert.equal(root.style.fontSize,'125%');assert.equal(root.dataset.readingMotion,'reduced');
 assert.deepEqual(normalizeReading({size:'1000%',spacing:'bad',motion:'all'}),readingDefaults);
});
test('blocked or corrupt device storage gives safe defaults and a visible failure signal',()=>{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.deepEqual(loadReading(blocked),readingDefaults);assert.equal(saveReading(readingDefaults,blocked),false);
 assert.deepEqual(loadReading({getItem:()=>'{not-json'}),readingDefaults);
});
test('Home Screen manifest and opaque icons have correct local asset paths and dimensions',()=>{
 const manifest=JSON.parse(readFileSync('web/manifest.webmanifest','utf8'));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'/');assert.equal(manifest.start_url,'/#home');
 for(const size of [180,192,512]) {const png=readFileSync(`web/icon-${size}.png`);assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);assert.equal(png[25],2);}
 const html=readFileSync('web/index.html','utf8');assert.match(html,/apple-touch-icon/);assert.match(html,/manifest.webmanifest/);assert.doesNotMatch(html,/serviceWorker\.register/);
});
