import test from 'node:test';
import assert from 'node:assert/strict';
import {publicationAccess} from '../worker/publication-access.js';
import {researchAPI} from '../worker/research.js';
import {paperAPI} from '../worker/paper.js';
import {workspaceAPI} from '../worker/api.js';
const req=(path,headers={},method='GET',body)=>new Request('https://app.example'+path,{method,headers,...(body?{body}: {})});
test('anonymous same-origin visitors may read publication metadata, while private workspaces still reject them',async()=>{
 const headers={'sec-fetch-site':'same-origin','cf-connecting-ip':'test-publication-access'};
 assert.equal(publicationAccess(req('/api/research',headers),1000),null);
 assert.equal((await workspaceAPI(req('/api/workspace',headers),{})).status,401);
 assert.equal((await researchAPI(req('/api/research',{...headers,origin:'https://elsewhere.example','content-type':'application/json'},'POST','{}'))).status,403);
 assert.equal((await paperAPI(req('/api/paper?pmid=invalid',headers))).status,400);
 assert.equal(publicationAccess(req('/api/research',{'sec-fetch-site':'cross-site'})).status,401);
});
test('anonymous publication traffic is bounded across search and abstract requests, and budgets expire',()=>{
 const request=req('/api/research',{'sec-fetch-site':'same-origin','cf-connecting-ip':'test-budget'});
 for(let n=0;n<30;n++)assert.equal(publicationAccess(request,100000),null);
 const blocked=publicationAccess(request,100000);assert.equal(blocked.status,429);assert.equal(blocked.headers.get('retry-after'),'60');
 assert.equal(publicationAccess(request,160001),null);
 const signed=req('/api/research',{'oai-authenticated-user-id':'account','oai-authenticated-user-email':'qa@example.invalid'});assert.equal(publicationAccess(signed,100000),null);
});
