import SitePage, { pageMetadata } from '@/components/site/SitePage';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  return pageMetadata(slug.join('/'), 'ms');
}

export default async function Page({ params }) {
  const { slug = [] } = await params;
  return <SitePage slug={slug.join('/')} lang="ms" />;
}
