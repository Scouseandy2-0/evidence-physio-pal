import test from 'node:test';
import assert from 'node:assert/strict';
import {learningPacks,teachingFromPack,learningPackMarkdown} from '../web/learning-packs.js';
import {emptyWorkspace,validateWorkspace} from '../web/workspace-data.js';
test('a supplied learning draft makes a complete valid independent teaching copy with source/version and pending-review status',()=>{
 const pack=learningPacks[0],plan=teachingFromPack(pack,'pack-copy',new Date('2026-11-27T18:00:00Z'));
 assert.equal(plan.minutes,30);assert.ok(plan.discussion.includes('Fictional'));assert.ok(plan.guidance.includes(pack.version));assert.match(plan.guidance,/clinical review pending/);
 assert.equal(plan.sources.length,0);assert.deepEqual(validateWorkspace({...emptyWorkspace(),teachingPlans:[plan]}).teachingPlans[0],plan);
 plan.objectives='My own teaching objective';assert.notEqual(pack.objectives,plan.objectives);assert.throws(()=>teachingFromPack({...pack}));
});
test('pack agenda totals planned time and export retains source map, discussion, facilitator notes and review limits',()=>{
 for(const pack of learningPacks){const total=pack.agenda.split('\n').reduce((sum,line)=>sum+Number(line.match(/^(\d+) min:/)?.[1]||0),0);assert.equal(total,pack.minutes);const md=learningPackMarkdown(pack);for(const field of ['objectives','agenda','discussion','preparation','takeaways'])assert.ok(md.includes(pack[field]));for(const source of pack.sources)assert.ok(md.includes(source.url));assert.match(md,/clinical review pending/);assert.doesNotMatch(md,/Reviewed and approved/);}
});

test('every supplied pack produces a schema-valid independent plan preserving its source map and self-check material',()=>{
 const ids=new Set();
 for(const pack of learningPacks){assert.ok(!ids.has(pack.id));ids.add(pack.id);const plan=teachingFromPack(pack,`copy-${pack.id}`,new Date('2026-11-27T18:00:00Z'));assert.deepEqual(validateWorkspace({...emptyWorkspace(),teachingPlans:[plan]}).teachingPlans[0],plan);for(const source of pack.sources)assert.ok(plan.guidance.includes(source.url));for(const check of pack.checks||[]){assert.ok(pack.sources[check.sourceIndex]);assert.ok(plan.preparation.includes(check.question));assert.ok(plan.preparation.includes(check.points));assert.ok(learningPackMarkdown(pack).includes(check.points));}assert.equal(pack.review.state,'pending');assert.equal(pack.review.reviewer,'');}
});
