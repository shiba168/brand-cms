// Minimal password auth: cookie holds an HMAC of a fixed label keyed by ADMIN_PASSWORD.
// Changing ADMIN_PASSWORD in Vercel logs everyone out.
export const COOKIE = 'brand_admin';

export function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === 'production' ? null : 'admin';
}

export async function sessionToken(password) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('brand-cms-admin-session-v1'));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function isValidSession(token) {
  const pw = adminPassword();
  if (!pw || !token) return false;
  const expected = await sessionToken(pw);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}
