import test from 'node:test';
import assert from 'node:assert/strict';
import { newTeachingPlan, suggestedAgenda, teachingSource, teachingMarkdown } from '../web/teaching.js';
import { emptyWorkspace, validateWorkspace, mergeWorkspaces, hasRecords } from '../web/workspace-data.js';
const paper = { id:'MED:123', pmid:'123', title:'Software-test publication', authors:'Example Author', year:'2025', recordURL:'https://pubmed.ncbi.nlm.nih.gov/123/', retracted:true };
const plan = () => ({ ...newTeachingPlan({},'session-1',new Date('2026-11-27')), title:'Fictional software QA session', objectives:'Discuss the original reference', sources:[teachingSource(paper,{basis:'abstract'})] });
test('suggested agendas account for the entire valid session duration', () => {
  for (const minutes of [5,10,15,30,45,60,480]) {
    const values = suggestedAgenda(minutes).split('\n').map(line => Number(line.match(/^\d+/)[0]));
    assert.equal(values.reduce((a,b)=>a+b,0),minutes); assert.ok(values.every(n=>n>0));
  }
  assert.deepEqual(suggestedAgenda(15).split('\n').map(line=>Number(line.match(/^\d+/)[0])),[2,5,5,3]);
  assert.throws(()=>suggestedAgenda(0)); assert.throws(()=>suggestedAgenda(12.5));
});
test('a new teaching plan does not log learning time or claim reviewed clinical content', () => {
  const p=newTeachingPlan({title:'Journal club',objectives:'Appraise a source',source:'Reference to check'},'plan');
  assert.equal(p.minutes,15); assert.deepEqual(p.sources,[]); assert.equal(p.guidance,'Reference to check');
  const w=validateWorkspace({...emptyWorkspace(),teachingPlans:[p]});
  assert.equal(w.reflections.length,0); assert.equal(hasRecords(w),true);
  assert.match(teachingMarkdown(p),/Draft teaching plan/);
});
test('source snapshots retain canonical paper links, actual declared basis and retraction warnings after library removal', () => {
  const p=plan(), text=teachingMarkdown(p);
  assert.match(text,/https:\/\/pubmed.ncbi.nlm.nih.gov\/123\//); assert.match(text,/Abstract only/); assert.match(text,/retracted/);
  assert.equal(teachingSource(paper).readingBasis,'notRecorded');
  const restored=validateWorkspace(JSON.parse(JSON.stringify({...emptyWorkspace(),saved:[],teachingPlans:[p]})));
  assert.equal(restored.teachingPlans[0].sources[0].title,paper.title);
});
test('conflicting teaching plans keep both complete versions and their own source lists', () => {
  const a=plan(), b={...a,discussion:'Different device discussion',sources:[]};
  const merged=mergeWorkspaces({...emptyWorkspace(),teachingPlans:[a]},{...emptyWorkspace(),teachingPlans:[b]},()=> 'device-copy');
  assert.equal(merged.teachingPlans.length,2); assert.equal(merged.teachingPlans.find(t=>t.id==='device-copy').sources.length,0);
  assert.equal(merged.teachingPlans.find(t=>t.id==='session-1').sources[0].pmid,'123');
  assert.equal(mergeWorkspaces({...emptyWorkspace(),teachingPlans:[a]},{...emptyWorkspace(),teachingPlans:[a]}).teachingPlans.length,1);
});
test('legacy workspaces remain loadable and invalid source lists, durations and oversized notes are rejected', () => {
  assert.deepEqual(validateWorkspace({saved:[],reflections:[]}).teachingPlans,[]);
  for(const bad of [{minutes:0},{minutes:481},{minutes:15.5},{objectives:'x'.repeat(6001)},{updatedAt:'invalid'},{sources:[{...plan().sources[0],pmid:'javascript:bad'}]},{sources:[...plan().sources,...plan().sources]}]) assert.throws(()=>validateWorkspace({...emptyWorkspace(),teachingPlans:[{...plan(),...bad}]}));
});
