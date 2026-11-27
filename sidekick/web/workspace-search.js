export const workspaceTypes = { all: 'Everything', paper: 'Saved papers', appraisal: 'Appraisals', reflection: 'CPD reflections', teaching: 'Teaching sessions', revision: 'Revision cards' };
const normalize = value => String(value || '').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('en-GB');
const compact = value => String(value || '').replace(/\s+/g,' ').trim();
function snippet(value, tokens) {
  const text=compact(value), folded=normalize(text);
  const positions=tokens.map(token=>folded.indexOf(token)).filter(n=>n>=0);
  const start=Math.max(0,(positions.length ? Math.min(...positions) : 0)-65);
  return `${start ? '…' : ''}${text.slice(start,start+220)}${start+220<text.length ? '…' : ''}`;
}
export function searchWorkspace(workspace, term, { type='all', limit=60 } = {}) {
  if(typeof term!=='string' || term.length>250) throw new Error('Use up to 250 characters to search your workspace.');
  if(!Object.hasOwn(workspaceTypes,type)) throw new Error('Choose a valid workspace record type.');
  if(!Number.isInteger(limit)||limit<1||limit>100) throw new Error('Invalid search result limit.');
  const tokens=normalize(term).trim().split(/\s+/).filter(Boolean);
  if(!tokens.length) return {total:0,results:[]};
  const records=[];
  for(const p of workspace.saved) records.push({type:'paper',id:p.id,title:p.title,text:[p.authors,p.journal,p.pmid,p.doi,p.collection,p.notes,p.abstract].join(' '),meta:p.collection || p.journal || `PMID ${p.pmid}`});
  for(const a of workspace.appraisals) records.push({type:'appraisal',id:a.id,title:a.title,text:[a.pmid,a.citation,a.design,a.question,a.findings,a.strengths,a.limitations,a.applicability,a.uncertainties,a.nextStep].join(' '),meta:`Appraisal · PMID ${a.pmid}`});
  for(const r of workspace.reflections) records.push({type:'reflection',id:r.id,title:r.title,text:[r.kind,r.learning,r.action,r.outcome,r.source,r.date].join(' '),meta:`${r.date} · ${r.kind}`});
  for(const t of workspace.teachingPlans) records.push({type:'teaching',id:t.id,title:t.title || 'Untitled teaching session',text:[t.audience,t.objectives,t.discussion,t.agenda,t.preparation,t.takeaways,t.guidance,...t.sources.map(s=>s.citation)].join(' '),meta:`${t.audience || 'Teaching'} · ${t.minutes} minutes`});
  for(const set of workspace.studySets) for(const card of set.cards) records.push({type:'revision',id:set.id,childId:card.id,title:card.question,text:[set.title,card.answer,card.source.title,card.source.citation,card.source.pmid].join(' '),meta:set.title || 'Untitled study set'});
  const results=records.filter(record=>type==='all'||record.type===type).map(record=>{
    const title=normalize(record.title), text=normalize(record.text);
    if(!tokens.every(token=>title.includes(token)||text.includes(token))) return null;
    const score=tokens.reduce((n,token)=>n+(title.includes(token)?5:1),0)+(title===normalize(term).trim()?10:0);
    return {type:record.type,id:record.id,...(record.childId?{childId:record.childId}:{}),title:record.title,meta:record.meta,snippet:snippet(record.text,tokens),score};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)||a.type.localeCompare(b.type)||a.id.localeCompare(b.id));
  return {total:results.length,results:results.slice(0,limit)};
}
