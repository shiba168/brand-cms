import { NextResponse } from 'next/server';
import { listHistory, readHistoryItem } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const i = req.nextUrl.searchParams.get('index');
  if (i !== null) {
    const item = await readHistoryItem(Number(i));
    return item ? NextResponse.json(item) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(await listHistory());
}
