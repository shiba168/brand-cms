// Serves images uploaded in local development (production uses Vercel Blob URLs).
import fs from 'fs/promises';
import path from 'path';

const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon' };

export async function GET(_req, { params }) {
  const { name } = await params;
  if (!/^[a-z0-9.\-_]+$/i.test(name)) return new Response('Bad name', { status: 400 });
  try {
    const buf = await fs.readFile(path.join(process.cwd(), '.data', 'uploads', name));
    return new Response(buf, { headers: { 'Content-Type': MIME[name.split('.').pop().toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
