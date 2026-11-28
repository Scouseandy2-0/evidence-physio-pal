import test from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {portfolioSections,portfolioPDF,portfolioWord} from '../src/portfolio-exports.js';
import {emptyWorkspace} from '../web/workspace-data.js';
import {newAppraisal} from '../web/appraisal.js';
const now=new Date('2026-11-27T20:00:00Z');
function fixture(){
 const appraisal=newAppraisal({id:'MED:123',pmid:'123',title:'Selected evidence',authors:'Example Author'},'qa-appraisal',now);appraisal.basis='abstract';appraisal.design='Reader recorded design';appraisal.findings='Uncertain outcome';
 return {...emptyWorkspace(),saved:[{id:'MED:123',pmid:'123',title:'Selected evidence',retracted:true}],appraisals:[appraisal],reflections:[{id:'yes',title:'Selected – café £ α',date:'2026-11-27',minutes:25,kind:'Teaching',learning:'Line one\nLine two <script>literal text</script>',action:'Check original source',outcome:'Discussed',followUpDate:'2026-12-01',source:'https://pubmed.ncbi.nlm.nih.gov/123/',appraisalId:appraisal.id,paperId:'MED:123',basis:'abstract'},{id:'no',title:'EXCLUDED PRIVATE RECORD',date:'2025-01-01',minutes:99,kind:'Other',learning:'Do not export me',action:''}]};
}
const scope={from:'2026-01-01'};
test('both binary formats share selected records, linked evidence, warnings and declared reading basis',()=>{
 const workspace=fixture(),before=JSON.stringify(workspace),sections=portfolioSections(workspace,scope,now),text=sections.map(s=>s.text).join('\n');
 assert.match(text,/25 recorded minutes/);assert.match(text,/café £ α/);assert.match(text,/WARNING.*retracted/);assert.match(text,/Abstract only/);assert.match(text,/Reader recorded design/);assert.match(text,/may have changed/);assert.doesNotMatch(text,/EXCLUDED PRIVATE RECORD|Do not export me/);assert.equal(JSON.stringify(workspace),before);
 assert.deepEqual(sections.filter(s=>s.url).map(s=>s.url),['https://pubmed.ncbi.nlm.nih.gov/123/','https://pubmed.ncbi.nlm.nih.gov/123/']);
 assert.throws(()=>portfolioSections(workspace,{from:'2027-01-01'}),/at least one/);assert.throws(()=>portfolioSections(workspace,{from:'bad'}),/valid/);
});
test('Word export is real editable OOXML with correct Unicode, XML escaping and safe evidence hyperlinks',async()=>{
 const bytes=await portfolioWord(fixture(),scope,now);assert.equal(Buffer.from(bytes).subarray(0,2).toString(),'PK');
 const files=unzipSync(bytes),xml=strFromU8(files['word/document.xml']),relationships=strFromU8(files['word/_rels/document.xml.rels']);
 assert.ok(files['[Content_Types].xml']);assert.match(xml,/Selected – café £ α/);assert.match(xml,/Line one/);assert.match(xml,/Line two &lt;script&gt;literal text&lt;\/script&gt;/);assert.doesNotMatch(xml,/EXCLUDED PRIVATE RECORD/);assert.match(relationships,/https:\/\/pubmed.ncbi.nlm.nih.gov\/123\//);assert.match(xml,/Evidence appendix/);assert.match(xml,/Reader recorded design/);
 assert.ok(!Object.keys(files).some(path=>/vbaProject|embeddings/.test(path)));
});
test('PDF export produces a complete multipage PDF with evidence links and embedded fonts',async()=>{
 const workspace=fixture();workspace.reflections[0].learning=('Long reflection with uncertainty, café £ α.\n').repeat(200);
 const bytes=await portfolioPDF(workspace,scope,now),pdf=Buffer.from(bytes).toString('latin1');
 assert.ok(pdf.startsWith('%PDF-'));assert.match(pdf,/%%EOF/);assert.ok((pdf.match(/\/Type \/Page\b/g)||[]).length>2);assert.match(pdf,/\/FontFile2/);assert.match(pdf,/https:\/\/pubmed.ncbi.nlm.nih.gov\/123\//);
});
test('missing linked appraisals remain explicit in exported content',()=>{
 const workspace=fixture();workspace.appraisals=[];assert.match(portfolioSections(workspace,scope,now).map(s=>s.text).join('\n'),/appraisal notes unavailable: qa-appraisal/);
});
