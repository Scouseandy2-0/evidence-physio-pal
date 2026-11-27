import { validateWorkspace, emptyWorkspace } from '../web/workspace-data.js';
const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff', 'vary': 'Cookie' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
export async function workspaceAPI(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== '/api/workspace') return json({ error: 'Not found' }, 404);
  const owner = request.headers.get('oai-authenticated-user-id');
  if (!owner || !request.headers.get('oai-authenticated-user-email')) return json({ error: 'Sign in to use your account workspace.' }, 401);
  if (!env.DB) return json({ error: 'Account storage is not available. Your browser copy has not been removed.' }, 503);
  if (!['GET', 'PUT'].includes(request.method)) return new Response(null, { status: 405, headers: { ...headers, allow: 'GET, PUT' } });
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT data, revision, updated_at FROM workspaces WHERE owner_id = ?').bind(owner).first();
      let name = request.headers.get('oai-authenticated-user-full-name') || 'Your workspace';
      if (request.headers.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf-8') { try { name = decodeURIComponent(name); } catch { name = 'Your workspace'; } }
      return json({ account: { id: owner, name }, workspace: row ? JSON.parse(row.data) : emptyWorkspace(), revision: row?.revision || 0, updatedAt: row?.updated_at || null });
    }
    if (request.headers.get('origin') !== url.origin || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Request origin does not match.' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Expected JSON.' }, 415);
    const limit = 2 * 1024 * 1024;
    if (Number(request.headers.get('content-length') || 0) > limit) return json({ error: 'Workspace exceeds the 2 MB prototype limit. Export it before reducing saved records.' }, 413);
    const reader = request.body?.getReader(); if (!reader) return json({ error: 'Missing workspace.' }, 400);
    let bytes = 0; const chunks = [];
    while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > limit) { await reader.cancel(); return json({ error: 'Workspace exceeds the 2 MB prototype limit.' }, 413); } chunks.push(value); }
    const buffer = new Uint8Array(bytes); let at = 0; for (const chunk of chunks) { buffer.set(chunk, at); at += chunk.byteLength; }
    let body, workspace;
    try { body = JSON.parse(new TextDecoder().decode(buffer)); workspace = validateWorkspace(body.workspace); } catch (e) { return json({ error: e.message || 'Invalid workspace.' }, 400); }
    if (!Number.isSafeInteger(body.revision) || body.revision < 0) return json({ error: 'Invalid workspace revision.' }, 400);
    // Older tabs must not silently remove newer appraisal or abstract provenance.
    const current = await env.DB.prepare('SELECT data FROM workspaces WHERE owner_id = ?').bind(owner).first();
    const prior = current ? JSON.parse(current.data) : null;
    if (!Array.isArray(body.workspace.appraisals) && prior?.appraisals?.length) return json({ error: 'This app tab is out of date. Export pending changes, then reload before saving appraisal records.' }, 409);
    if (!Array.isArray(body.workspace.teachingPlans) && prior?.teachingPlans?.length) return json({ error: 'This app tab is out of date. Export pending changes, then reload before saving teaching plans.' }, 409);
    if (!Array.isArray(body.workspace.studySets) && prior?.studySets?.length) return json({ error: 'This app tab is out of date. Export pending changes, then reload before saving revision cards.' }, 409);
    for (const reflection of workspace.reflections) {
      const raw = body.workspace.reflections.find(r => r.id === reflection.id);
      const old = prior?.reflections?.find(r => r.id === reflection.id);
      if (old?.followUpDate && !Object.hasOwn(raw,'followUpDate') && old.followUpDate < reflection.date) return json({ error: 'This activity has a newer follow-up record. Reload the app before changing its date.' }, 409);
      if (old) for (const key of ['outcome','followUpDate']) if (!Object.hasOwn(raw,key)) reflection[key] = old[key] || '';
    }
    for (const paper of workspace.saved) {
      const old = prior?.saved?.find(p => p.id === paper.id);
      if (!paper.abstractSource && old?.abstractSource && paper.abstract === old.abstract) {
        for (const key of ['abstractSource', 'abstractStatus', 'abstractRetrievedAt', 'abstractCopyright']) paper[key] = old[key];
      }
    }
    const data = JSON.stringify(workspace), updatedAt = new Date().toISOString();
    if (new TextEncoder().encode(data).length > limit) return json({ error: 'Workspace exceeds the 2 MB prototype limit.' }, 413);
    const result = body.revision === 0
      ? await env.DB.prepare('INSERT INTO workspaces (owner_id, data, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(owner_id) DO NOTHING RETURNING revision').bind(owner, data, updatedAt).first()
      : await env.DB.prepare('UPDATE workspaces SET data = ?, revision = revision + 1, updated_at = ? WHERE owner_id = ? AND revision = ? RETURNING revision').bind(data, updatedAt, owner, body.revision).first();
    if (!result) return json({ error: 'This workspace changed on another device. Your pending changes have been kept.' }, 409);
    return json({ revision: result.revision, updatedAt });
  } catch { return json({ error: 'Account storage could not complete this request. Your local changes have been kept.' }, 503); }
}
