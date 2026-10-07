import { NextResponse } from 'next/server';
import { COOKIE, isValidSession } from './lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();
  const ok = await isValidSession(req.cookies.get(COOKIE)?.value);
  if (ok) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/preview/:path*'] };
