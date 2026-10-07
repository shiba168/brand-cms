import { NextResponse } from 'next/server';
import { storageMode } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    content: storageMode(),
    uploads: process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : (process.env.VERCEL ? 'none' : 'local'),
    passwordSet: !!process.env.ADMIN_PASSWORD,
  });
}
