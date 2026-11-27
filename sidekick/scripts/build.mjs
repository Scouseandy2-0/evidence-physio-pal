import './fetch-anatomy-model.mjs';
import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
await build({ entryPoints: ['src/anatomy-viewer.js'], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, legalComments: 'eof', outfile: 'web/anatomy-viewer.js' });
const types = { 'index.html': 'text/html', 'styles.css': 'text/css', 'app.js': 'text/javascript', 'appraisal.js': 'text/javascript', 'teaching.js': 'text/javascript', 'study.js': 'text/javascript', 'portfolio.js': 'text/javascript', 'reading.js': 'text/javascript', 'help.js': 'text/javascript', 'backup.js': 'text/javascript', 'readiness.js': 'text/javascript', 'learning-packs.js': 'text/javascript', 'workspace-search.js': 'text/javascript', 'anatomy.js': 'text/javascript', 'anatomy-catalog.js': 'text/javascript', 'anatomy-viewer.js': 'text/javascript', 'skeleton.glb': 'model/gltf-binary', 'anatomy-upstream-attribution.md': 'text/plain', 'anatomy-upstream-provenance.md': 'text/plain', 'anatomy-source-license.txt': 'text/plain', 'anatomy-third-party.txt': 'text/plain', 'manifest.webmanifest': 'application/manifest+json', 'icon-180.png': 'image/png', 'icon-192.png': 'image/png', 'icon-512.png': 'image/png', 'paper-details.js': 'text/javascript', 'research.js': 'text/javascript', 'content.js': 'text/javascript', 'sync.js': 'text/javascript', 'workspace-data.js': 'text/javascript', 'icon.svg': 'image/svg+xml' };
const assets = Object.fromEntries(Object.entries(types).map(([path, type]) => [`/${path}`, { type, binary: /\.(png|glb)$/.test(path), body: readFileSync(`web/${path}`, /\.(png|glb)$/.test(path) ? 'base64' : 'utf8') }]));
// All assets are bundled into the Worker; no independent static hosting is needed.
rmSync('dist', { recursive: true, force: true }); mkdirSync('dist/server', { recursive: true }); mkdirSync('dist/.openai', { recursive: true });
const entry = `import { withSecurityHeaders } from './worker/security.js';
import { workspaceAPI } from './worker/api.js';
import { researchAPI } from './worker/research.js';
import { paperAPI } from './worker/paper.js';
const assets = ${JSON.stringify(assets)};
async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/paper') return paperAPI(request);
  if (url.pathname === '/api/research') return researchAPI(request);
  if (url.pathname.startsWith('/api/')) return workspaceAPI(request,env);
  if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405});
  const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
  if(!asset)return new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:asset.binary?Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0)):asset.body,{headers:{'content-type':asset.type+(asset.binary?'':'; charset=utf-8'),'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});
}
export default { async fetch(request,env) { return withSecurityHeaders(await handleRequest(request,env)); } };`;
await build({ stdin: { contents: entry, resolveDir: process.cwd(), sourcefile: 'generated-worker.js' }, bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outfile: 'dist/server/index.js' });
writeFileSync('dist/.openai/hosting.json', readFileSync('.openai/hosting.json'));
console.log('Built Worker with account API and embedded app assets.');
