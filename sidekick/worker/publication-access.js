// Publication metadata is public; account records keep their separate identity checks.
// An isolate-local budget bounds anonymous provider traffic without retaining IP logs.
const budgets = new Map();
export function publicationAccess(request, now = Date.now()) {
  if (request.headers.get('oai-authenticated-user-id') && request.headers.get('oai-authenticated-user-email')) return null;
  if (request.headers.get('sec-fetch-site') !== 'same-origin') return Response.json({ error: 'Open PhysioSidekick to search or load publication details.' }, { status: 401 });
  const key = request.headers.get('cf-connecting-ip') || 'anonymous-preview';
  let budget = budgets.get(key);
  if (!budget || budget.reset <= now) {
    if (budgets.size >= 1000) {
      for (const [id, item] of budgets) if (item.reset <= now) budgets.delete(id);
      // Never discard an active budget to admit another visitor.
      if (budgets.size >= 1000 && !budget) return limited();
    }
    budget = { count: 0, reset: now + 60000 };
    budgets.set(key, budget);
  }
  if (budget.count >= 30) return limited();
  budget.count++;
  return null;
}
function limited() {
  return Response.json({ error: 'The browser trial has reached its research request limit. Wait a minute, then retry.' }, { status: 429, headers: { 'retry-after': '60', 'cache-control': 'no-store' } });
}
