import {appraisalFields,basisLabels} from './appraisal.js';
import {readingLabels} from './teaching.js';
export const learningTitles={appraisal:'My paper appraisal',teaching:'My draft teaching plan',revision:'My personal revision set'};
export function learningSections(kind,record,now=new Date()){
 if(!learningTitles[kind]||!record)throw Error('Choose a saved learning record to export.');
 const out=[{kind:'title',text:learningTitles[kind]},{kind:'text',text:`PhysioSidekick · Exported ${now.toISOString()}`}];
 const text=value=>out.push({kind:'text',text:String(value||'Not recorded')}),heading=value=>out.push({kind:'heading',text:String(value||'Untitled')}),field=(label,value)=>{out.push({kind:'label',text:label});text(value);};
 const paper=source=>{if(!/^[1-9]\d{0,8}$/.test(source.pmid))throw Error('The source has no valid PMID.');text(source.title);text(source.citation);const url=`https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`;out.push({kind:'link',text:url,url});if(source.retracted)text('WARNING: marked as retracted in the attached index record. Check the retraction notice.');};
 heading(record.title);text(`Last edited: ${record.updatedAt || 'Not recorded'}`);
 if(kind==='appraisal'){
  text('Personal appraisal notes, not an automatic evidence grade or an accredited checklist. Reading basis is self-reported. Check the original paper and use a design-specific checklist where appropriate.');
  paper({...record,retracted:record.sourceRetracted===true});field('Reading basis',basisLabels[record.basis]);field('Study design (recorded by me)',record.design);
  for(const [key,label]of appraisalFields)field(label,record[key]);
 }else if(kind==='teaching'){
  text('Draft teaching plan. Clinical content requires professional review before delivery. Planned duration is not completed learning time; this document provides no accreditation or competency sign-off.');
  field('Audience',record.audience);field('Planned duration',`${record.minutes} minutes (check that the edited agenda fits)`);
  for(const [key,label]of [['objectives','Learning objectives'],['agenda','Agenda'],['discussion','Fictional case / discussion'],['preparation','Facilitator preparation'],['takeaways','Takeaways and next action'],['guidance','Guidance, versions and other references to check']])field(label,record[key]);
  heading('Indexed paper references');
  for(const source of record.sources){paper(source);field('Reading basis',readingLabels[source.readingBasis]);text(`Attached: ${source.attachedAt}`);}
  if(!record.sources.length)text('No papers attached.');
  text('References are saved snapshots. Check original records, currency and local pathways before teaching.');
 }else{
  text('Personal revision cards. Answers are written by the user and are not verified clinical guidance. Recall ratings are self-reported, not competency scores. No automatic CPD credit. This export contains the full study set, including answers.');
  text(`${record.cards.length} ${record.cards.length===1?'card':'cards'}`);
  for(const [index,card]of record.cards.entries()){
   heading(`${index+1}. ${card.question}`);field('My saved answer',card.answer);paper(card.source);field('Reading basis',readingLabels[card.source.readingBasis]);field('Last recall rating',{again:'Needs another look',recalled:'Recalled (self-rated)',unrated:'Not rated'}[card.rating]);text(`Last reviewed: ${card.reviewedAt || 'Not reviewed'} · Review attempts: ${card.reviews}`);text(`Card last edited: ${card.updatedAt}`);
  }
  if(!record.cards.length)text('No revision cards recorded.');
 }
 return out;
}
