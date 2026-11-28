// Read-only audit of public source links; never forwards identity or learning notes.
import {writeFileSync} from 'node:fs';
import {studentSources,studentUnits} from '../web/student-units.js';
import {learningPacks} from '../web/learning-packs.js';
const sources=new Map();
for(const [key,source]of Object.entries(studentSources)){sources.set(source.url,{url:source.url,title:source.title,usedBy:studentUnits.filter(u=>u.questions.some(q=>q.sourceId===key)).map(u=>u.id)});}
for(const pack of learningPacks)for(const source of pack.sources){const entry=sources.get(source.url)||{url:source.url,title:source.title,usedBy:[]};entry.usedBy.push(pack.id);sources.set(source.url,entry);}
const rows=[];
for(const source of sources.values()){
 if(new URL(source.url).hostname.endsWith('.chatgpt.site')){rows.push({...source,state:'private_app_resource',note:'Check through the signed-in app; not treated as a failed public source.'});continue;}
 try{
  const response=await fetch(source.url,{signal:AbortSignal.timeout(12000),credentials:'omit',headers:{accept:'text/html,application/pdf'}});
  let title='';if(response.headers.get('content-type')?.includes('text/html')){const body=await response.text();title=body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').trim()||'';}
  else await response.body?.cancel();
  const state=response.status===404?'not_found':response.ok?(/access denied|just a moment|attention required/i.test(title)?'blocked_page':'reachable'):'http_unverified';
  rows.push({...source,status:response.status,finalURL:response.url,title: title||source.title,state});
 }catch(error){rows.push({...source,state:'connection_unverified',reason:error.name});}
 console.log(JSON.stringify(rows.at(-1)));
}
const report={checkedAt:new Date().toISOString(),scope:'Link availability and redirects only; not independent content review or clinical approval.',sources:rows};
writeFileSync(`docs/content-link-audit-${report.checkedAt.slice(0,10)}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:rows.length,unverified:rows.filter(r=>r.state!=='reachable').map(r=>({url:r.url,state:r.state,status:r.status}))}));
