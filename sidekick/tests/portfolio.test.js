import test from 'node:test';
import assert from 'node:assert/strict';
import { filterReflections,portfolioSummary,portfolioEvidence,portfolioMarkdown,portfolioHTML } from '../web/portfolio.js';
import { emptyWorkspace,validateWorkspace,mergeWorkspaces } from '../web/workspace-data.js';
import { newAppraisal } from '../web/appraisal.js';
const r=(id,date,kind='Research reading')=>({id,date,title:`QA ${id}`,kind,minutes:20,learning:'Software test learning',action:'Check source',source:'',outcome:'',followUpDate:''});
const a=()=>newAppraisal({id:'MED:123',pmid:'123',title:'QA paper',recordURL:'https://pubmed.ncbi.nlm.nih.gov/123/'},'appraisal-1',new Date('2026-11-27'));
test('portfolio filtering respects inclusive dates, activity, text and follow-up state',()=>{
 const records=[r('one','2026-01-01'),{...r('two','2026-06-01','Teaching'),outcome:'Discussed with tutor'},r('three','2026-12-31')];
 assert.deepEqual(filterReflections(records,{from:'2026-01-01',to:'2026-06-01'}).map(r=>r.id),['two','one']);
 assert.equal(filterReflections(records,{kind:'Teaching',term:'TUTOR',followUp:'recorded'})[0].id,'two');
 assert.equal(filterReflections(records,{followUp:'missing'}).length,2);
 assert.throws(()=>filterReflections(records,{from:'2026-02-30'}),/valid/);
 assert.throws(()=>filterReflections(records,{from:'2026-12-31',to:'2026-01-01'}),/start date/);
});
test('summary counts only selected recorded learning, not plans or self-test ratings',()=>{
 const records=[r('one','2026-01-01'),{...r('two','2026-06-01','Teaching'),minutes:35,outcome:'Followed up'}];
 assert.deepEqual(portfolioSummary(records),{count:2,minutes:55,activities:2,followedUp:1});
 assert.equal(portfolioSummary(filterReflections(records,{kind:'Teaching'})).minutes,35);
});
test('exports include only selected reflections and their linked evidence with explicit snapshot provenance',()=>{
 const appraisal=a();const w={...emptyWorkspace(),appraisals:[appraisal],reflections:[{...r('linked','2026-11-27'),appraisalId:appraisal.id,paperId:'MED:123',basis:'abstract',source:'https://pubmed.ncbi.nlm.nih.gov/123/'},r('other','2025-01-01')]};
 const text=portfolioMarkdown(w,{from:'2026-01-01'},new Date('2026-11-27'));
 assert.match(text,/QA linked/);assert.doesNotMatch(text,/QA other/);assert.match(text,/Abstract only/);assert.match(text,/may have changed/);assert.match(text,/pubmed.ncbi.nlm.nih.gov\/123/);
 assert.equal(portfolioEvidence(w,w.reflections).appraisals.length,1);
});
test('removed appraisal notes remain explicitly unavailable while reflection content stays exportable',()=>{
 const reflection={...r('linked','2026-11-27'),appraisalId:'gone',paperId:'MED:123',basis:'abstract'};
 const text=portfolioMarkdown({...emptyWorkspace(),reflections:[reflection]});
 assert.match(text,/Software test learning/);assert.match(text,/appraisal notes unavailable: gone/);
});
test('printable exports escape user content and contain no scripts, external assets or inferred accreditation',()=>{
 const reflection={...r('one','2026-11-27'),title:'<script>alert(1)</script>',learning:'Effect < 0.05 & uncertainty',outcome:'<img src=x onerror=alert(2)>'};
 const html=portfolioHTML({...emptyWorkspace(),reflections:[reflection]});
 assert.doesNotMatch(html,/<script|<img|<iframe|<link|<script src/i);assert.match(html,/&lt;script&gt;/);assert.match(html,/Effect &lt; 0.05 &amp; uncertainty/);assert.match(html,/@media print/);assert.match(html,/does not establish accreditation/);
});
test('follow-up fields round-trip and conflicting observed outcomes are preserved',()=>{
 const record={...r('one','2026-11-27'),outcome:'Observed outcome',followUpDate:'2026-12-01'};
 const w=validateWorkspace({...emptyWorkspace(),reflections:[record]});assert.equal(w.reflections[0].outcome,'Observed outcome');
 assert.throws(()=>validateWorkspace({...emptyWorkspace(),reflections:[{...record,followUpDate:'2026-11-26'}]}),/review date/);
 assert.throws(()=>validateWorkspace({...emptyWorkspace(),reflections:[{...record,outcome:'x'.repeat(6001)}]}));
 const merged=mergeWorkspaces(w,{...w,reflections:[{...record,outcome:'Different device observation'}]},()=> 'preserved-reflection');assert.equal(merged.reflections.length,2);
});
