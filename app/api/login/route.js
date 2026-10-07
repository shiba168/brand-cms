import { NextResponse } from 'next/server';
import { COOKIE, adminPassword, sessionToken } from '@/lib/auth';

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  const pw = adminPassword();
  if (!pw) return NextResponse.json({ error: 'ADMIN_PASSWORD is not set in Vercel → Settings → Environment Variables.' }, { status: 500 });
  if (password !== pw) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await sessionToken(pw), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
