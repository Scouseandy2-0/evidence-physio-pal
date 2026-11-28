const routes = new Set(['home','research','learn','library','cpd','fcp','practice','appraisal','study','teaching','workspace-search','paper']);
const controls = new Set(['paper-title','paper-record','paper-return','workspace-navigation','external-source','paper-heading','main']);
const activations = new Set(['no-pointer-count','pointer-click','unknown']);
export function navigationRoute(value) {
  if (typeof value !== 'string') return 'unknown';
  const route = value.includes('#') ? value.slice(value.indexOf('#') + 1) : value;
  if (/^paper\/[1-9]\d{0,8}$/.test(route)) return 'paper';
  return routes.has(route) ? route : 'unknown';
}
function safeEvent(input) {
  if (!input || typeof input !== 'object') return null;
  if (input.kind === 'route') return { kind:'route', from:navigationRoute(input.from), to:navigationRoute(input.to) };
  if (!controls.has(input.control)) return null;
  if (input.kind === 'focus') return { kind:'focus', route:navigationRoute(input.route), control:input.control };
  if (input.kind === 'activate') return { kind:'activate', route:navigationRoute(input.route), control:input.control, activation:activations.has(input.activation) ? input.activation : 'unknown' };
  return null;
}
export function createNavigationDiagnostics() {
  const events = [];
  return {
    record(input) { const event=safeEvent(input);if(event){events.push(event);if(events.length>20)events.shift();} },
    snapshot() { return events.map(event=>({...event})); }
  };
}
export function formatNavigationDiagnostics(input) {
  const events = Array.isArray(input) ? input.slice(-20).map(safeEvent).filter(Boolean) : [];
  return 'Recent app navigation (this visit only; no searches, paper titles or notes):\n' + (events.length ? events.map((event,index)=>`${index+1}. ${event.kind==='route' ? `Page ${event.from} → ${event.to}` : event.kind==='focus' ? `Focus ${event.control} on ${event.route}` : `Activate ${event.control} on ${event.route} (${event.activation})`}`).join('\n') : 'No navigation observations recorded.');
}
