import test from 'node:test';
import assert from 'node:assert/strict';
import { searchPapers, europePMCSearchURL, externalResearchLinks, validPublicationData, buildQuery } from '../web/research.js';
const good={hitCount:1,resultList:{result:[{source:'MED',id:'31316228',title:'Real upstream metadata fixture'}]},nextCursorMark:'next'};
async function withFetch(mock,run){const before=globalThis.fetch;globalThis.fetch=mock;try{await run();}finally{globalThis.fetch=before;}}
test('hosted 503 recovers through a credential-free browser request with exact filters and cursor',async()=>{
  const calls=[];const filters={openAccess:true,type:'trial',author:'Smith',years:'2'};
  await withFetch(async(url,options)=>{calls.push({url:String(url),options});return calls.length===1?Response.json({error:'Both connections unavailable'},{status:503}):Response.json(good);},async()=>{
    const r=await searchPapers('knee',filters,'next-page');assert.equal(r.papers[0].pmid,'31316228');assert.equal(r.total,1);assert.match(r.provider,/direct connection/);assert.equal(r.nextCursor,'next');
    const url=new URL(calls[1].url);assert.equal(url.searchParams.get('query'),buildQuery('knee',filters));assert.equal(url.searchParams.get('cursorMark'),'next-page');assert.equal(url.searchParams.get('resultType'),'core');assert.equal(calls[1].options.credentials,'omit');assert.equal(calls[1].options.referrerPolicy,'no-referrer');assert.deepEqual(calls[1].options.headers,{accept:'application/json'});
  });
});
test('account and request rejection do not launch external fallback',async()=>{
  for(const status of [400,401,403,413,415,429]){let calls=0;await withFetch(async()=>{calls++;return Response.json({error:'Rejected'},{status});},async()=>{await assert.rejects(searchPapers('knee',{}),/Rejected/);assert.equal(calls,1);});}
});
test('NCBI pagination never switches to a different provider on failure',async()=>{
 let calls=0;await withFetch(async()=>{calls++;return Response.json({error:'Unavailable'},{status:503});},async()=>{await assert.rejects(searchPapers('knee',{},'ncbi:8'),/Unavailable/);assert.equal(calls,1);});
});
test('direct timeout fails explicitly and cancellation stays an AbortError',async()=>{
 await withFetch(async(url,{signal})=>String(url)==='/api/research'?Response.json({},{status:503}):new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true})),async()=>{
   await assert.rejects(searchPapers('knee',{},'*',undefined,{directTimeoutMs:5}),/No result count/);
   const abort=new AbortController();const pending=searchPapers('knee',{},'*',abort.signal);abort.abort();await assert.rejects(pending,{name:'AbortError'});
 });
});
test('invalid or non-PubMed payloads cannot become research results; genuine zero is valid',()=>{
 assert.ok(validPublicationData({hitCount:0,resultList:{result:[]}}));
 for(const data of [{hitCount:10,resultList:{result:[]}},{hitCount:1,resultList:{result:[{source:'PPR',id:'1',title:'x'}]}},{...good,hitCount:-1},{...good,hitCount:1.5}])assert.equal(validPublicationData(data),false);
});
test('official recovery link preserves the complete query without allowing an arbitrary destination',()=>{
 const f={openAccess:true,match:'phrase',author:'Smith A',type:'review',years:'5',sort:'newest'};
 const url=new URL(externalResearchLinks('knee osteoarthritis',f).europePMC);assert.equal(url.origin,'https://europepmc.org');assert.equal(url.searchParams.get('query'),buildQuery('knee osteoarthritis',f));assert.equal(europePMCSearchURL('31316228').searchParams.get('query'),'EXT_ID:31316228 AND SRC:MED');assert.throws(()=>europePMCSearchURL('knee',{},'ncbi:8'));
});
