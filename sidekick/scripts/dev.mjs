// Local preview only. This fixed fictional identity is never included in the hosted build.
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { workspaceAPI } from '../worker/api.js';
import { researchAPI } from '../worker/research.js';
import { paperAPI } from '../worker/paper.js';
mkdirSync('.sites-runtime', { recursive: true });
const db = new DatabaseSync('.sites-runtime/preview.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS preview_migrations (name TEXT PRIMARY KEY)');
for (const name of readdirSync('drizzle').filter(f => f.endsWith('.sql')).sort()) {
  if (!db.prepare('SELECT name FROM preview_migrations WHERE name=?').get(name)) {
    db.exec('BEGIN');
    try { db.exec(readFileSync(`drizzle/${name}`, 'utf8')); db.prepare('INSERT INTO preview_migrations VALUES (?)').run(name); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
}
export const adapter = { prepare(sql) { return { bind(...args) { return { async first() { return db.prepare(sql).get(...args) || null; } }; } }; } };
const port = Number(process.env.PORT || 4173);
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith('/api/')) {
      const chunks = []; for await (const part of req) chunks.push(part);
      const headers = new Headers(req.headers); headers.set('oai-authenticated-user-id', 'local-preview-user'); headers.set('oai-authenticated-user-email', 'preview@example.invalid'); headers.set('oai-authenticated-user-full-name', 'Local preview');
      const response = await (url.pathname === '/api/paper' ? paperAPI : url.pathname === '/api/research' ? researchAPI : workspaceAPI)(new Request(url, { method: req.method, headers, ...(['PUT', 'POST'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) }), { DB: adapter });
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text()); return;
    }
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!/^\/[a-zA-Z0-9.-]+$/.test(path)) { res.writeHead(404); res.end(); return; }
    const content = readFileSync(`web${path}`); res.writeHead(200, { 'content-type': types[path.split('.').at(-1)] || 'text/plain', 'cache-control': 'no-store' }); res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Local app preview on ${port}`));
