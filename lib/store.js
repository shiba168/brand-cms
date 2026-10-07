// Content storage: Upstash Redis (Vercel Marketplace) in production,
// a local JSON file during development, and the bundled seed as a fallback.
import { Redis } from '@upstash/redis';
import fs from 'fs/promises';
import path from 'path';
import seed from '@/data/seed.json';

// Optional SITE_ID lets several brand sites share one Redis database without clashing.
const NS = (process.env.SITE_ID || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
const KEY = NS ? `${NS}:site:content` : 'site:content';
const HISTORY = NS ? `${NS}:site:history` : 'site:history';
const HISTORY_MAX = 20;
const LOCAL_FILE = path.join(process.cwd(), '.data', 'content.json');

function redis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

export function storageMode() {
  if (redis()) return 'redis';
  return process.env.VERCEL ? 'none' : 'local';
}

export async function readContent() {
  const r = redis();
  if (r) {
    const c = await r.get(KEY);
    return c ? parse(c) : structuredClone(seed);
  }
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'));
  } catch {
    return structuredClone(seed);
  }
}

export async function writeContent(content) {
  content.updatedAt = new Date().toISOString();
  const r = redis();
  if (r) {
    const prev = await r.get(KEY);
    if (prev) {
      await r.lpush(HISTORY, JSON.stringify(parse(prev)));
      await r.ltrim(HISTORY, 0, HISTORY_MAX - 1);
    }
    await r.set(KEY, JSON.stringify(content));
    return 'redis';
  }
  if (process.env.VERCEL) {
    throw new Error('No database connected. In Vercel open Storage → add Upstash Redis to this project, then redeploy.');
  }
  // local dev: keep a simple history too
  const histDir = path.join(process.cwd(), '.data', 'history');
  await fs.mkdir(histDir, { recursive: true });
  try {
    const prev = await fs.readFile(LOCAL_FILE, 'utf8');
    await fs.writeFile(path.join(histDir, `${Date.now()}.json`), prev);
    const files = (await fs.readdir(histDir)).sort().reverse();
    for (const f of files.slice(HISTORY_MAX)) await fs.unlink(path.join(histDir, f));
  } catch {}
  await fs.writeFile(LOCAL_FILE, JSON.stringify(content, null, 2));
  return 'local';
}

export async function listHistory() {
  const r = redis();
  if (r) {
    const items = await r.lrange(HISTORY, 0, HISTORY_MAX - 1);
    return items.map((x, i) => ({ index: i, updatedAt: parse(x)?.updatedAt || null }));
  }
  try {
    const histDir = path.join(process.cwd(), '.data', 'history');
    const files = (await fs.readdir(histDir)).sort().reverse();
    return await Promise.all(files.map(async (f, i) => {
      const c = JSON.parse(await fs.readFile(path.join(histDir, f), 'utf8'));
      return { index: i, updatedAt: c.updatedAt || new Date(Number(f.split('.')[0])).toISOString() };
    }));
  } catch {
    return [];
  }
}

export async function readHistoryItem(index) {
  const r = redis();
  if (r) {
    const x = await r.lindex(HISTORY, index);
    return x ? parse(x) : null;
  }
  const histDir = path.join(process.cwd(), '.data', 'history');
  const files = (await fs.readdir(histDir)).sort().reverse();
  if (!files[index]) return null;
  return JSON.parse(await fs.readFile(path.join(histDir, files[index]), 'utf8'));
}
