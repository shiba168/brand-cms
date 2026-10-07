// Admin-only (see middleware): renders drafts straight from storage, never cached.
import SitePage from '@/components/site/SitePage';
import { readContent } from '@/lib/store';
import { applyTokens } from '@/lib/tokens';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function Preview({ params, searchParams }) {
  const { slug = [] } = await params;
  const { lang = 'ms' } = await searchParams;
  const content = applyTokens(await readContent());
  return <SitePage slug={slug.join('/')} lang={lang === 'en' ? 'en' : 'ms'} content={content} allowDraft />;
}
