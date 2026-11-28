import test from 'node:test';
import assert from 'node:assert/strict';
import { newStudySet, cardFromNotes, saveStudyCard, rateStudyCard, studyMarkdown } from '../web/study.js';
import { emptyWorkspace, validateWorkspace, mergeWorkspaces, hasRecords } from '../web/workspace-data.js';
const paper={pmid:'123',id:'MED:123',title:'Software-test source',authors:'Example Author',year:'2025',recordURL:'https://pubmed.ncbi.nlm.nih.gov/123/',retracted:true};
const card=()=>saveStudyCard({question:'Software QA question?',answer:'Software QA answer, not a clinical claim.',paper,appraisal:{basis:'abstract'},id:'card-1',now:new Date('2026-11-27')});
const set=()=>({...newStudySet('set-1',new Date('2026-11-27')),cards:[card()]});
test('revision cards retain real source links and reading/retraction labels through backup and library removal',()=>{
 const s=set(), w=validateWorkspace(JSON.parse(JSON.stringify({...emptyWorkspace(),studySets:[s]})));
 assert.equal(w.studySets[0].cards[0].source.pmid,'123');assert.equal(hasRecords(w),true);assert.equal(w.reflections.length,0);
 assert.match(studyMarkdown(s),/pubmed.ncbi.nlm.nih.gov\/123/);assert.match(studyMarkdown(s),/Abstract only/);assert.match(studyMarkdown(s),/retracted/);
});
test('appraisal seeding uses only the user’s findings/limitations/uncertainty and requires a reviewable draft',()=>{
 const draft=cardFromNotes({findings:'My findings',limitations:'My limitations',uncertainties:'Still uncertain'});
 assert.match(draft.answer,/My findings/);assert.match(draft.answer,/My limitations/);assert.match(draft.answer,/Still uncertain/);assert.equal(draft.id,undefined);
 assert.throws(()=>cardFromNotes(null),/findings/);assert.throws(()=>cardFromNotes({findings:'x'.repeat(6001)}),/exceed/);
});
test('self-ratings persist separately from content and editing an answer resets stale recall',()=>{
 const original=card(), rated=rateStudyCard(original,'recalled',new Date('2026-11-28'));
 assert.equal(original.rating,'unrated');assert.equal(rated.rating,'recalled');assert.equal(rated.reviews,1);
 const edited=saveStudyCard({question:rated.question,answer:'A corrected software-test answer',source:rated.source,existing:rated});
 assert.equal(edited.rating,'unrated');assert.equal(edited.reviewedAt,'');assert.equal(edited.reviews,1);
 const unchanged=saveStudyCard({question:rated.question,answer:rated.answer,source:rated.source,existing:rated});
 assert.equal(unchanged.rating,'recalled');assert.throws(()=>rateStudyCard(original,'competent'));
});
test('conflicting study sets preserve both card and rating versions rather than silently choosing one',()=>{
 const a=set(), b={...a,cards:[rateStudyCard(a.cards[0],'again')]};
 const merged=mergeWorkspaces({...emptyWorkspace(),studySets:[a]},{...emptyWorkspace(),studySets:[b]},()=> 'device-set');
 assert.equal(merged.studySets.length,2);assert.equal(merged.studySets.find(s=>s.id==='device-set').cards[0].rating,'again');
 assert.equal(merged.studySets.find(s=>s.id==='set-1').cards[0].rating,'unrated');
 assert.equal(mergeWorkspaces({...emptyWorkspace(),studySets:[a]},{...emptyWorkspace(),studySets:[a]}).studySets.length,1);
});
test('old workspaces load and invalid, oversized or source-less cards are rejected',()=>{
 assert.deepEqual(validateWorkspace({saved:[],reflections:[]}).studySets,[]);
 assert.throws(()=>saveStudyCard({question:'Q',answer:'A'}),/source/);
 for(const bad of [{answer:''},{question:'x'.repeat(1001)},{rating:'clinically verified'},{reviews:-1},{reviewedAt:'bad',rating:'recalled'},{source:{...card().source,pmid:'https://bad.example'}}]) assert.throws(()=>validateWorkspace({...emptyWorkspace(),studySets:[{...set(),cards:[{...card(),...bad}]}]}));
});
