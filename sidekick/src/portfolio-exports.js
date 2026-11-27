// Loaded only when a portfolio PDF or Word document is requested. No remote conversion.
import pdfMake from 'pdfmake/build/pdfmake.js';
import virtualFonts from 'pdfmake/build/vfs_fonts.js';
import {Document,Paragraph,TextRun,ExternalHyperlink,HeadingLevel,Packer,Footer,PageNumber,AlignmentType} from 'docx';
import {filterReflections,portfolioSummary,portfolioEvidence,portfolioScope} from '../web/portfolio.js';
import {appraisalFields,basisLabels} from '../web/appraisal.js';
pdfMake.addVirtualFileSystem(virtualFonts);
const notice='Personal records and self-reported time. This export does not establish accreditation, regulatory approval or competence. Planned sessions and revision ratings are not counted as completed learning.';
const value=text=>String(text || 'Not recorded');
// Both formats use the same ordered sections, sources and snapshot warnings.
export function portfolioSections(workspace,filters={},now=new Date()) {
 const records=filterReflections(workspace.reflections,filters);
 if(!records.length)throw new Error('Select at least one reflection before exporting.');
 const stats=portfolioSummary(records),evidence=portfolioEvidence(workspace,records);
 const sections=[{kind:'title',text:'My personal CPD portfolio'},{kind:'text',text:`PhysioSidekick · Exported ${now.toISOString()}`},{kind:'text',text:portfolioScope(filters)},{kind:'text',text:notice},{kind:'heading',text:'Selected learning'},{kind:'text',text:`${stats.count} ${stats.count===1?'reflection':'reflections'} · ${stats.minutes} recorded minutes · ${stats.activities} ${stats.activities===1?'activity type':'activity types'} · ${stats.followedUp} with follow-up recorded`}];
 const text=t=>sections.push({kind:'text',text:value(t)}),heading=t=>sections.push({kind:'heading',text:t}),field=(label,t)=>{sections.push({kind:'label',text:label});text(t);};
 for(const r of records){
  heading(r.title);text(`${r.date} · ${r.minutes} minutes · ${r.kind}`);
  field('What I learned',r.learning);field('Intended next step',r.action);field('Outcome / follow-up',r.outcome);text(`Review date: ${r.followUpDate || 'Not recorded'}`);field('Source',r.source);
  if(r.appraisalId){text(`Linked appraisal: ${r.appraisalId}`);text(`Reading basis at reflection: ${basisLabels[r.basis] || 'Not recorded'}`);}
 }
 heading('Evidence appendix');text('Appraisals below are current saved notes at export and may have changed since the reflection. They are reader-authored notes, not an app quality assessment.');
 for(const paper of evidence.papers){text(paper.title);sections.push({kind:'link',text:paper.url,url:paper.url});if(paper.citation)text(paper.citation);if(paper.retracted)text('WARNING: source marked as retracted in the saved index record.');}
 for(const a of evidence.appraisals){
  heading(`Paper appraisal: ${a.title}`);text(a.citation);sections.push({kind:'link',text:`https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,url:`https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`});text(`Appraisal ID: ${a.id} · Last edited: ${a.updatedAt}`);text(`Reading basis: ${basisLabels[a.basis] || 'Not recorded'}`);field('Study design (recorded by me)',a.design);
  for(const [key,label]of appraisalFields)field(label,a[key]);
  text('Personal appraisal notes, not an automatic evidence grade or an accredited checklist.');
 }
 if(evidence.missingAppraisals.length)text(`Linked appraisal notes unavailable: ${evidence.missingAppraisals.join(', ')}. Reflection text is retained above.`);
 return sections;
}
export async function portfolioPDF(workspace,filters={},now=new Date()) {
 const sections=portfolioSections(workspace,filters,now);
 const definition={pageSize:'A4',pageMargins:[45,48,45,48],info:{title:'My personal CPD portfolio',author:'',creator:'PhysioSidekick'},defaultStyle:{font:'Roboto',fontSize:11,lineHeight:1.25,color:'#173550'},content:sections.map(s=>({text:s.text,...(s.kind==='title'?{fontSize:23,bold:true,margin:[0,0,0,14]}:s.kind==='heading'?{fontSize:15,bold:true,margin:[0,16,0,8]}:s.kind==='label'?{bold:true,margin:[0,9,0,4]}:{margin:[0,0,0,8]}),...(s.url?{link:s.url,color:'#175ca4',decoration:'underline'}:{})})),footer:(page,pages)=>({text:`PhysioSidekick · ${page} / ${pages}`,alignment:'center',fontSize:9,color:'#52677c',margin:[0,15,0,0]})};
 return new Uint8Array(await pdfMake.createPdf(definition).getBuffer());
}
export async function portfolioWord(workspace,filters={},now=new Date()) {
 const sections=portfolioSections(workspace,filters,now);
 const children=sections.flatMap(s=>s.text.split(/\r\n|\r|\n/).map((line,index)=>new Paragraph({
  ...(s.kind==='title'?{heading:HeadingLevel.TITLE}:s.kind==='heading'?{heading:HeadingLevel.HEADING_1}:{}),
  keepNext:s.kind==='heading'||s.kind==='label',spacing:{before:index===0&&(s.kind==='heading'||s.kind==='label')?160:0,after:100},
  children:s.url?[new ExternalHyperlink({link:s.url,children:[new TextRun({text:line,style:'Hyperlink'})]})]:[new TextRun({text:line,bold:s.kind==='label'})]
 })));
 const document=new Document({title:'My personal CPD portfolio',creator:'PhysioSidekick',description:'Selected personal learning records and linked evidence',styles:{default:{document:{run:{font:'Calibri',size:22,color:'173550'},paragraph:{spacing:{after:100,line:280}}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1000,right:1000,bottom:1000,left:1000}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun('PhysioSidekick · '),new TextRun({children:[PageNumber.CURRENT]})]})]})},children}]});
 return new Uint8Array(await Packer.toArrayBuffer(document));
}
