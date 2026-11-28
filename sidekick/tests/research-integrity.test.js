import test from 'node:test';
import assert from 'node:assert/strict';
import {validPublicationData,publicationCursor,doiURL,normalizePaper,searchPapers,citation,toRIS} from '../web/research.js';
import {lookupPublications} from '../worker/research.js';
import {loadOriginalAbstract} from '../web/paper-details.js';
const raw={source:'MED',id:'31316228',title:'Metadata fixture only',doi:'10.1234/a?b#c',authorString:'A Author',pubYear:'2026',journalTitle:'Fixture journal'};
const data=(records=[raw],hitCount=records.length)=>({hitCount,resultList:{result:records}});
test('exact identifiers reject a different paper even when its metadata is otherwise valid',()=>{
 assert.ok(validPublicationData(data(),'31316228'));assert.equal(validPublicationData(data([raw],2),'31316228'),false);assert.equal(validPublicationData(data(),'31316229'),false);
 assert.ok(validPublicationData(data(),'DOI: 10.1234/A?B#C'));assert.equal(validPublicationData(data(),'10.1234/different'),false);
 assert.ok(validPublicationData(data([],0),'31316228'));assert.ok(validPublicationData(data(),'osteoarthritis'));
});
test('contradictory counts, duplicate IDs, invalid IDs and oversized provider pages fail validation',()=>{
 for(const value of [data([raw],0),data([{...raw,title:'<i></i>'}]),data([raw,{...raw,id:31316228}],2),data([raw,raw],2),data([{...raw,id:'0'}]),data([{...raw,id:'000123'}]),data(Array.from({length:9},(_,i)=>({...raw,id:String(i+1)})),9)])assert.equal(validPublicationData(value),false);
 assert.equal(normalizePaper({...raw,id:'0'}),null);
});
test('terminal, repeated or malformed cursors cannot create an infinite load-more loop',()=>{
 assert.equal(publicationCursor({nextCursorMark:'cursor'},'cursor'),null);
 for(const next of [null,undefined,22,'','x'.repeat(2049)])assert.equal(publicationCursor({nextCursorMark:next}),null);
 assert.equal(publicationCursor({nextCursorMark:'ncbi:8'}),'ncbi:8');
});
test('publisher links and citation exports preserve reserved DOI characters as the identifier',()=>{
 const url=new URL(doiURL(raw.doi));assert.equal(url.origin,'https://doi.org');assert.equal(url.search,'');assert.equal(url.hash,'');assert.equal(decodeURIComponent(url.pathname.slice(1)),raw.doi);
 const p=normalizePaper(raw);assert.match(citation(p),/a%3Fb%23c/);assert.match(toRIS([p]),/DO  - 10.1234\/a\?b#c/);
 for(const doi of ['javascript:alert(1)','10.1234/x"evil','10.1234/x\\bad','10.1234/line\nbreak']){assert.equal(doiURL(doi),null);assert.equal(normalizePaper({...raw,doi}).doi,'');}
});
test('invalid exact primary results can recover through correctly matched PubMed backup metadata',async()=>{
 const result=await lookupPublications({term:'31316228'},{fetcher:async(url)=>{
  if(url.hostname==='www.ebi.ac.uk')return Response.json(data([{...raw,id:'999'}]));
  if(url.pathname.endsWith('esearch.fcgi'))return Response.json({esearchresult:{count:'1',idlist:['31316228']}});
  return Response.json({result:{31316228:{uid:'31316228',title:raw.title,authors:[{name:'A Author'}]}}});
 }});assert.equal(result.resultList.result[0].id,'31316228');assert.match(result.provider,/NCBI/);
});
test('invalid primary and mismatched backup identity never become an exact lookup success',async()=>{
 await assert.rejects(lookupPublications({term:'31316228'},{fetcher:async(url)=>{
  if(url.hostname==='www.ebi.ac.uk')return Response.json(data([{...raw,id:'999'}]));
  if(url.pathname.endsWith('esearch.fcgi'))return Response.json({esearchresult:{count:'1',idlist:['999']}});
  return Response.json({result:{999:{uid:'999',title:'Wrong record'}}});
 }}),/do not match/);
});
test('ten rapidly replaced searches cannot return their late responses as successful results',async()=>{
 const before=globalThis.fetch;let release;const gate=new Promise(r=>release=r);
 globalThis.fetch=async()=>{await gate;return Response.json(data());};
 try {const requests=Array.from({length:10},()=>{const controller=new AbortController();const promise=searchPapers('knee',{},'*',controller.signal);controller.abort();return assert.rejects(promise,{name:'AbortError'});});release();await Promise.all(requests);}finally{globalThis.fetch=before;}
});
test('original-abstract responses require a matching canonical source link and source title',async()=>{
 const record={pmid:'31316228',title:'Source title',abstract:'Source abstract',abstractSource:'PubMed (NCBI)',abstractStatus:'available',abstractURL:'https://pubmed.ncbi.nlm.nih.gov/31316228/',abstractRetrievedAt:new Date().toISOString(),abstractCopyright:''};
 for(const patch of [{title:''},{abstractURL:'https://example.org/wrong'},{abstractURL:'https://pubmed.ncbi.nlm.nih.gov/999/'}])await assert.rejects(loadOriginalAbstract('31316228',{fetcher:async()=>Response.json({...record,...patch})}),/unexpected/);
 assert.equal((await loadOriginalAbstract('31316228',{fetcher:async()=>Response.json(record)})).title,'Source title');
});

test('collective authors survive index normalization and RIS export alongside named authors',()=>{
 const paper=normalizePaper({...raw,authorString:'Example A, Example Trial Group.',authorList:{author:[{fullName:'Example A'},{collectiveName:'Example Trial Group'}]}});
 assert.deepEqual(paper.authorList,['Example A','Example Trial Group']);const ris=toRIS([paper]);assert.match(ris,/AU  - Example Trial Group/);assert.match(ris,/AU  - Example A/);
});
