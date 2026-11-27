// Self-hosted scripts; external access is limited to the existing font service and research fallback.
export const securityHeaders = {
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://www.ebi.ac.uk; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'",
  'permissions-policy':'camera=(), microphone=(), geolocation=(), payment=()',
  'x-content-type-options':'nosniff',
  'referrer-policy':'strict-origin-when-cross-origin'
};
export function withSecurityHeaders(response) {
  const headers=new Headers(response.headers);
  for(const [key,value] of Object.entries(securityHeaders))headers.set(key,value);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
