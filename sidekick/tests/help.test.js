import test from 'node:test';
import assert from 'node:assert/strict';
import {guideProgress,guideHidden,setGuideHidden,buildProblemReport,appRelease} from '../web/help.js';
test('guide progress reflects existing saved items and never treats notes as proof of reading',()=>{
 assert.equal(guideProgress({}).filter(s=>s.done).length,0);
 const progress=guideProgress({saved:[{}],appraisals:[],reflections:[{}]});assert.deepEqual(progress.map(s=>s.done),[true,false,true]);assert.equal(progress[1].route,'appraisal');
});
test('guide dismissal is reversible and handles unavailable or corrupt storage',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 assert.equal(guideHidden(storage),false);assert.ok(setGuideHidden(storage,true));assert.equal(guideHidden(storage),true);setGuideHidden(storage,false);assert.equal(guideHidden(storage),false);
 const blocked={getItem:()=>{throw new Error();},setItem:()=>{throw new Error();}};assert.equal(guideHidden(blocked),false);assert.equal(setGuideHidden(blocked,true),false);
});
test('problem reports include selected context but exclude account identity, notes, query and paper details',()=>{
 const report=buildProblemReport({category:'research',description:'The search stayed loading after I clicked Search.',device:'iPhone or iPad'}, {route:'research',syncStatus:'saved',pending:false,account:{id:'secret-account',email:'private@example.invalid'},query:'private-query',notes:'private-note',paperTitle:'private-title'},new Date('2026-11-27T17:30:00Z'));
 assert.match(report,/Page: research/);assert.match(report,/Device \(chosen by me\): iPhone/);assert.match(report,/Account save status: saved/);assert.ok(report.includes(appRelease));assert.match(report,/has not been sent/);
 for(const privateText of ['secret-account','private@example.invalid','private-query','private-note','private-title'])assert.ok(!report.includes(privateText));
});
test('invalid report categories, missing descriptions and excessive input fail without creating a misleading report',()=>{
 for(const input of [{category:'bad',description:'Description here'},{category:'other',description:'short'},{category:'other',description:'x'.repeat(2001)},{category:'other',description:'Description here',expected:'x'.repeat(1001)}])assert.throws(()=>buildProblemReport(input));
 const r=buildProblemReport({category:'other',description:'Description here',device:'private device string'}, {route:'https://private.invalid/query',syncStatus:'unknown-private-value'});assert.match(r,/Page: unknown/);assert.match(r,/Device \(chosen by me\): Not specified/);assert.ok(!r.includes('private.invalid'));
});

test('one-pass version review exports declared observations and release boundaries without inventing approval',async()=>{
 const {buildVersionReview,versionReviewSteps,appRelease}=await import('../web/help.js');
 const result=buildVersionReview({device:'iPhone or iPad',notes:'QA observation: date controls need checking'},new Date('2026-11-28T11:00:00Z'));
 assert.match(result,new RegExp(appRelease));assert.match(result,/QA observation/);assert.match(result,/not clinical approval/);assert.match(result,/not submitted automatically/);assert.equal(versionReviewSteps.length,6);
 assert.throws(()=>buildVersionReview({device:'invented',notes:''}),/device/);assert.throws(()=>buildVersionReview({notes:'x'.repeat(8001)}),/8,000/);
});
