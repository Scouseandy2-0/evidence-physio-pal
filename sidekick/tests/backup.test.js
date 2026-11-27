import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyWorkspace} from '../web/workspace-data.js';
import {parseWorkspaceBackup,workspaceBackup,backupLimit} from '../web/backup.js';
import {withSecurityHeaders,securityHeaders} from '../worker/security.js';
test('backup round trips preserve the workspace and accept supported legacy formats',()=>{
 const workspace=emptyWorkspace();assert.deepEqual(parseWorkspaceBackup(workspaceBackup(workspace)),workspace);
 assert.deepEqual(parseWorkspaceBackup(JSON.stringify(workspace)),workspace);
 for(const version of [1,3,7])assert.deepEqual(parseWorkspaceBackup(JSON.stringify({version,workspace})),workspace);
});
test('future, missing and malformed backup envelopes fail rather than stripping unknown content',()=>{
 for(const version of [undefined,0,-1,8,'7',1.5])assert.throws(()=>parseWorkspaceBackup(JSON.stringify({version,workspace:emptyWorkspace()})),/version/);
 for(const text of ['[]','null','bad json',JSON.stringify({saved:[{id:'bad'}],reflections:[]})])assert.throws(()=>parseWorkspaceBackup(text));
 assert.throws(()=>parseWorkspaceBackup(' '.repeat(backupLimit+1)),/4 MB/);
});
test('response protection preserves authenticated API semantics and limits executable sources',async()=>{
 const response=withSecurityHeaders(Response.json({error:'Sign in'},{status:401,headers:{'cache-control':'no-store, private',vary:'Cookie'}}));
 assert.equal(response.status,401);assert.equal(response.headers.get('cache-control'),'no-store, private');assert.equal(response.headers.get('vary'),'Cookie');assert.deepEqual(await response.json(),{error:'Sign in'});
 assert.ok(!response.headers.has('access-control-allow-origin'));
 assert.match(response.headers.get('content-security-policy'),/script-src 'self';/);assert.match(response.headers.get('content-security-policy'),/connect-src 'self' https:\/\/www.ebi.ac.uk;/);assert.match(response.headers.get('content-security-policy'),/object-src 'none'/);assert.doesNotMatch(response.headers.get('content-security-policy'),/unsafe-eval/);assert.equal(response.headers.get('permissions-policy'),securityHeaders['permissions-policy']);
});

test('unknown record types and workspaces over the account limit cannot be silently truncated on import',()=>{
 assert.throws(()=>parseWorkspaceBackup(JSON.stringify({...emptyWorkspace(),futureRecords:[{text:'Keep me'}]})),/unsupported record/);
 const workspace={...emptyWorkspace(),saved:Array.from({length:110},(_,i)=>({id:`MED:${i+1}`,pmid:String(i+1),title:'Software fixture',notes:'x'.repeat(20000)}))};
 assert.throws(()=>parseWorkspaceBackup(workspaceBackup(workspace)),/2 MB account limit/);
});
