import { getContent } from '@/lib/content';

export const revalidate = 3600;

export default async function robots() {
  const { site } = await getContent();
  const base = (site.domain || '').replace(/\/+$/, '');
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/preview'] }], sitemap: `${base}/sitemap.xml` };
}
