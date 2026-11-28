import test from 'node:test';
import assert from 'node:assert/strict';
import { studentUnits, studentSources, studentUnitCounts, studentUnitMarkdown, studentRevisionPrompt } from '../web/student-units.js';
import { newStudySet, saveStudyCard } from '../web/study.js';
import { emptyWorkspace, validateWorkspace } from '../web/workspace-data.js';

test('five distinct starter units map every question to a locatable source and retain pending review',()=>{
 assert.deepEqual(studentUnitCounts(),{units:5,questions:25,reviewed:0});
 assert.deepEqual(studentUnits.map(u=>u.id),['finding-papers','study-design','interpreting-results','appraisal-uncertainty','anatomy-evidence']);
 const ids=new Set();
 for(const u of studentUnits){
  assert.equal(u.questions.length,5);assert.equal(u.review.state,'pending');assert.equal(u.review.reviewer,'');assert.equal(u.review.reviewedAt,'');
  assert.ok(u.objective && u.task && u.revisionPrompt);
  for(const q of u.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.question && q.explanation && q.location);const s=studentSources[q.sourceId];assert.ok(s);assert.ok(s.title && s.locatedAt);assert.ok(s.url.startsWith('https://') || s.url==='/anatomy-upstream-provenance.md');assert.equal(q.pmid,undefined);}
 }
});
test('unit exports retain explanations, source locations and the distinction between exercise and evidence',()=>{
 for(const u of studentUnits){const md=studentUnitMarkdown(u.id);assert.ok(md.includes(u.version));assert.match(md,/Independent content review pending/);assert.match(md,/fictional examples are not research findings/i);assert.match(md,/No accreditation, competency score or automatic CPD credit/);for(const q of u.questions){assert.ok(md.includes(q.question));assert.ok(md.includes(q.explanation));assert.ok(md.includes(q.location));assert.ok(md.includes(studentSources[q.sourceId].url));}}
 assert.throws(()=>studentUnitMarkdown('missing'));
});
test('revision bridge starts an independent empty-answer draft and still requires a real paper',()=>{
 for(const u of studentUnits){const prompt=studentRevisionPrompt(u.id),set=newStudySet(`unit-${u.id}`,new Date('2026-11-27T19:00:00Z'));set.title=prompt.title;
  assert.equal(prompt.answer,'');assert.equal(prompt.sourceId,'');assert.ok(prompt.question.includes(u.version));assert.ok(prompt.question.length<1000);assert.deepEqual(set.cards,[]);
  assert.deepEqual(validateWorkspace({...emptyWorkspace(),studySets:[set]}).studySets,[set]);
  assert.throws(()=>saveStudyCard({...prompt,answer:'My answer without a paper'}),/Choose a saved paper/);
  for(const q of u.questions)assert.ok(!prompt.question.includes(q.explanation));
 }
 assert.throws(()=>studentRevisionPrompt('missing'));
});
