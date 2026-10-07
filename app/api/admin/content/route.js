import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { readContent, writeContent } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await readContent());
}

function validate(c) {
  if (!c || typeof c !== 'object') return 'Content must be an object';
  if (!c.site || typeof c.site !== 'object') return 'Missing "site" settings';
  if (!Array.isArray(c.pages)) return 'Missing "pages" list';
  const seen = new Set();
  for (const p of c.pages) {
    const slug = (p.slug ?? '').trim();
    if (slug && !/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(slug)) return `Invalid page URL "${slug}" — use lowercase letters, numbers and dashes`;
    if (slug === 'en' || slug.startsWith('en/') || slug.startsWith('admin') || slug.startsWith('api')) return `Page URL "${slug}" is reserved`;
    if (seen.has(slug)) return `Two pages use the URL "/${slug}"`;
    seen.add(slug);
    if (!Array.isArray(p.sections)) return `Page "/${slug}" has no sections list`;
  }
  if (!seen.has('')) return 'You need a homepage (a page with an empty URL)';
  return null;
}

export async function PUT(req) {
  const content = await req.json().catch(() => null);
  const err = validate(content);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  try {
    const storage = await writeContent(content);
    revalidateTag('content');
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, storage, updatedAt: content.updatedAt });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
