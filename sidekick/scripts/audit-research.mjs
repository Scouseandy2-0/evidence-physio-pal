// On-demand live public-record audit. Not part of the offline automated test suite.
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {lookupPublications} from '../worker/research.js';
import {retrievePubmedRecord} from '../worker/paper.js';
import {normalizePaper,toRIS} from '../web/research.js';
const normal=text=>String(text).normalize('NFKC').toLowerCase().replaceAll('×','x').replace(/[^\p{L}\p{N}]/gu,'');
const hash=text=>createHash('sha256').update(text).digest('hex');
function fields(text){const data={};let tag;for(const line of text.split(/\r?\n/)){const m=line.match(/^([A-Z0-9]{2,4})\s*- (.*)$/);if(m){tag=m[1];(data[tag]||=[]).push(m[2]);}else if(/^ {6}/.test(line)&&tag)data[tag][data[tag].length-1]+=' '+line.slice(6);}return data;}
const report={checkedAt:new Date().toISOString(),environment:'Source implementation in Node with live Europe PMC and NCBI requests; not a hosted iPhone search test',records:[],scenarios:[]};
async function check(name,fn){try{const detail=await fn();report.scenarios.push({name,passed:true,...detail});}catch(error){report.scenarios.push({name,passed:false,error:error.message});}}
for(const id of ['31316228','25569281','34265255','42750457']){
 await check(`Exact record ${id}`,async()=>{
  const data=await lookupPublications({term:id}),p=normalizePaper(data.resultList.result[0]);let raw;
  const original=await retrievePubmedRecord(id,{fetcher:async(url,options)=>{const response=await fetch(url,options);raw=await response.text();return new Response(raw,{status:response.status});}});
  const source=fields(raw),authors=[...(source.AU||[]),...(source.CN||[])],doi=(source.AID||[]).find(v=>v.endsWith(' [doi]'))?.replace(/ \[doi\]$/,'')||'';
  const checks={pmid:p.pmid===id,title:normal(p.title)===normal(original.title),authors:p.authorList.map(normal).join('|')===authors.map(normal).join('|'),year:p.year===(source.DP?.[0].match(/\d{4}/)?.[0]||''),doi:p.doi.toLowerCase()===doi.toLowerCase(),ris:toRIS([p]).includes(`AN  - ${id}`)};
  report.records.push({pmid:id,title:p.title,authors:p.authorList,year:p.year,doi:p.doi,provider:data.provider,sourceURL:`https://pubmed.ncbi.nlm.nih.gov/${id}/`,indexedTypes:p.types,checks,abstract:{state:original.abstractStatus,indexLength:p.abstract.length,pubmedLength:original.abstract.length,indexHash:hash(p.abstract),pubmedHash:hash(original.abstract),note:'Text hashes can differ due to heading, whitespace, symbols or index updates. No semantic-equivalence claim is made.'}});
  if(Object.values(checks).some(v=>!v))throw Error('Metadata mismatch; inspect the recorded checks.');return {provider:data.provider};
 });
}
await check('Exact DOI resolves to expected PMID',async()=>{const d=await lookupPublications({term:'10.1002/14651858.CD004376.pub3'});if(d.resultList.result[0]?.id!=='25569281')throw Error('DOI mismatch');return {pmid:'25569281',provider:d.provider};});
await check('Topic paging remains within Europe PMC with distinct records',async()=>{const first=await lookupPublications({term:'knee osteoarthritis'});if(!first.nextCursorMark)throw Error('No next page');const second=await lookupPublications({term:'knee osteoarthritis',cursor:first.nextCursorMark});const ids=first.resultList.result.map(p=>p.id);if(second.provider!==first.provider||second.resultList.result.some(p=>ids.includes(p.id)))throw Error('Mixed provider or duplicate page');return {provider:first.provider,total:first.hitCount,first:ids,second:second.resultList.result.map(p=>p.id)};});
await check('Combined author/title/trial filter respects indexed labels',async()=>{const d=await lookupPublications({term:'rotator cuff',filters:{author:'Hopewell S',field:'title',match:'phrase',type:'trial'}});if(!d.resultList.result.length||d.resultList.result.some(p=>!p.pubTypeList?.pubType?.some(t=>/^randomized controlled trial$/i.test(t))||!p.authorString.includes('Hopewell S')||!/rotator cuff/i.test(p.title)))throw Error('Combined filter mismatch');return {provider:d.provider,total:d.hitCount,ids:d.resultList.result.map(p=>p.id),note:'PMID 34265255 was not included. Its exact lookup metadata was inspected separately: the index does not label it Randomized Controlled Trial. This is an indexed-type limitation, not grounds to invent a classification; the UI now explains how to recover known papers.'};});
await check('Open-access and publication-date filters',async()=>{const d=await lookupPublications({term:'knee osteoarthritis',filters:{openAccess:true,years:'2',sort:'newest'}});const since=new Date();since.setUTCFullYear(since.getUTCFullYear()-2);if(!d.resultList.result.length||d.resultList.result.some(p=>p.isOpenAccess!=='Y'||p.firstPublicationDate<since.toISOString().slice(0,10)))throw Error('Filter mismatch');return {provider:d.provider,total:d.hitCount,ids:d.resultList.result.map(p=>p.id)};});
await check('Valid empty search stays an empty result',async()=>{const d=await lookupPublications({term:'physiosidekicknonsensicaltermxyz'});if(d.hitCount!==0||d.resultList.result.length)throw Error('Unexpected results');return {count:d.hitCount};});
await check('Primary-outage simulation uses live PubMed backup',async()=>{const d=await lookupPublications({term:'34265255'},{fetcher:(url,options)=>{if(url.hostname==='www.ebi.ac.uk')throw Error('Simulated primary outage for audit');return fetch(url,options);}});if(d.resultList.result[0]?.id!=='34265255'||!d.provider.includes('backup'))throw Error('Backup mismatch');return {provider:d.provider,pmid:d.resultList.result[0].id,note:'Primary outage simulated; NCBI responses were live.'};});
report.passed=report.scenarios.every(s=>s.passed);
report.finishedAt=new Date().toISOString();
writeFileSync(`docs/research-audit-${report.checkedAt.slice(0,10)}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,scenarios:report.scenarios,recordChecks:report.records.map(r=>({pmid:r.pmid,checks:r.checks,abstract:r.abstract.state}))},null,2));
if(!report.passed)process.exitCode=1;
