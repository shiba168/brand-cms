import { getContent } from '@/lib/content';
import { pagePath } from '@/lib/i18n';

export const revalidate = 3600;

export default async function sitemap() {
  const { site, pages } = await getContent();
  const base = (site.domain || '').replace(/\/+$/, '');
  const langs = site.enableEnglish === false ? ['ms'] : ['ms', 'en'];
  return pages.filter((p) => p.status !== 'draft' && !p.noindex).flatMap((p) => langs.map((l) => ({
    url: base + pagePath(p.slug, l),
    lastModified: site.updatedAt || undefined,
    changeFrequency: 'weekly',
    priority: p.slug ? 0.8 : 1,
  })));
}
