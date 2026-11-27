import test from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {learningSections} from '../web/learning-documents.js';
import {learningPDF,learningWord,portfolioSections} from '../src/portfolio-exports.js';
import {newAppraisal} from '../web/appraisal.js';
import {newTeachingPlan,teachingSource} from '../web/teaching.js';
import {newStudySet,saveStudyCard,filterStudyCards} from '../web/study.js';
import {filterReflections,followUpSummary,portfolioMarkdown,portfolioHTML} from '../web/portfolio.js';
import {emptyWorkspace} from '../web/workspace-data.js';
const now=new Date(2026,10,27,12),paper={id:'MED:123',pmid:'123',title:'Fixture evidence café α',authors:'Example Author',retracted:true};
function fixtures(){
 const appraisal={...newAppraisal(paper,'qa-appraisal',now),basis:'abstract',design:'My design note',findings:'My findings, with uncertainty',sourceRetracted:true};
 const teaching={...newTeachingPlan({},'qa-teaching',now),title:'Fixture teaching',objectives:'Fictional objective',guidance:'Pack v1: independent clinical review pending',sources:[teachingSource(paper,appraisal)]};
 const revision=newStudySet('qa-revision',now);revision.cards=[saveStudyCard({question:'Fixture question?',answer:'My answer <literal>',paper,appraisal,id:'c1',now})];
 return {appraisal,teaching,revision};
}
test('learning document sections retain source snapshots, reading basis and distinct educational boundaries',()=>{
 const records=fixtures();
 for(const kind of ['appraisal','teaching','revision']){
  const before=JSON.stringify(records[kind]),sections=learningSections(kind,records[kind],now),text=sections.map(s=>s.text).join('\n');
  assert.match(text,/WARNING.*retracted/);assert.match(text,/Abstract only/);assert.match(text,/https:\/\/pubmed.ncbi.nlm.nih.gov\/123\//);assert.equal(JSON.stringify(records[kind]),before);
 }
 assert.match(learningSections('appraisal',records.appraisal,now).map(s=>s.text).join('\n'),/My design note/);
 const teaching=learningSections('teaching',records.teaching,now).map(s=>s.text).join('\n');assert.match(teaching,/Planned duration/);assert.match(teaching,/independent clinical review pending/);assert.match(teaching,/not completed learning time/);
 const revision=learningSections('revision',records.revision,now).map(s=>s.text).join('\n');assert.match(revision,/full study set, including answers/);assert.match(revision,/not competency scores/);
 assert.throws(()=>learningSections('other',records.appraisal),/Choose/);assert.throws(()=>learningSections('appraisal',{...records.appraisal,pmid:'bad'}),/PMID/);
});
test('all three learning records generate genuine PDFs and editable Word documents with their own titles',async()=>{
 const records=fixtures();for(const kind of ['appraisal','teaching','revision']){
  const pdf=await learningPDF(kind,records[kind],now);assert.equal(Buffer.from(pdf).subarray(0,5).toString(),'%PDF-');
  const word=await learningWord(kind,records[kind],now),files=unzipSync(word),xml=strFromU8(files['word/document.xml']);
  assert.match(xml,/Fixture evidence café α/);assert.match(xml,/WARNING/);assert.match(xml,/Abstract only/);assert.match(strFromU8(files['word/_rels/document.xml.rels']),/pubmed.ncbi.nlm.nih.gov\/123/);
  if(kind==='revision')assert.match(xml,/My answer &lt;literal&gt;/);
 }
});
test('revision filters match source/answer text, accents and recall states without mutating cards',()=>{
 const cards=fixtures().revision.cards;cards.push({...cards[0],id:'c2',question:'Second question',answer:'Different answer',rating:'again'});const before=JSON.stringify(cards);
 assert.equal(filterStudyCards(cards,{term:'cafe 123',rating:'all'}).length,2);assert.deepEqual(filterStudyCards(cards,{term:'different',rating:'again'}).map(c=>c.id),['c2']);assert.equal(filterStudyCards(cards,{rating:'recalled'}).length,0);assert.equal(JSON.stringify(cards),before);
 assert.throws(()=>filterStudyCards(cards,{rating:'expert'}),/valid/);
});
test('review-date views include today, preserve outcomes as separate records, and export exactly the selection',()=>{
 const base={date:'2026-11-01',kind:'Research reading',minutes:15,learning:'QA learning',action:'Review',source:''};
 const records=[{...base,id:'due',title:'Due fixture',followUpDate:'2026-11-27',outcome:'An outcome is already written'},{...base,id:'old',title:'Past fixture',followUpDate:'2026-11-26'},{...base,id:'future',title:'Future fixture',followUpDate:'2026-11-28'},{...base,id:'none',title:'Undated fixture',followUpDate:''}];const before=JSON.stringify(records);
 assert.deepEqual(followUpSummary(records,now),{today:'2026-11-27',due:2,upcoming:1,undated:1});assert.equal(filterReflections(records,{review:'due'},now).length,2);assert.equal(filterReflections(records,{review:'upcoming'},now)[0].id,'future');assert.equal(filterReflections(records,{review:'undated'},now)[0].id,'none');assert.equal(filterReflections(records,{review:'due',followUp:'recorded'},now).length,1);
 const workspace={...emptyWorkspace(),reflections:records};
 for(const result of [portfolioMarkdown(workspace,{review:'due'},now),portfolioHTML(workspace,{review:'due'},now),portfolioSections(workspace,{review:'due'},now).map(s=>s.text).join('\n')]){assert.match(result,/Due fixture/);assert.doesNotMatch(result,/Future fixture|Undated fixture/);assert.match(result,/evaluated 2026-11-27/);}
 assert.equal(JSON.stringify(records),before);assert.throws(()=>filterReflections(records,{review:'completed'}),/valid/);
});
