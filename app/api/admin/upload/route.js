import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

const TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];

export async function POST(req) {
  const form = await req.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ error: 'Use PNG, JPG, WebP, GIF, SVG or ICO' }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'Max 4 MB' }, { status: 400 });
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${safe}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type });
    return NextResponse.json({ url: blob.url });
  }
  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'Image storage not connected. In Vercel open Storage → create a Blob store for this project, then redeploy. Or paste an image URL instead.' }, { status: 500 });
  }
  // local development: keep files in .data/uploads, served by /api/uploads/[name]
  const dir = path.join(process.cwd(), '.data', 'uploads');
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${safe}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/uploads/${name}` });
}
