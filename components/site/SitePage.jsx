import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { t, pagePath, HTML_LANG, OG_LOCALE } from '@/lib/i18n';
import { Header, Footer } from './Chrome';
import Sections from './Sections';

export function siteLangs(site) {
  return site.enableEnglish === false ? ['ms'] : ['ms', 'en'];
}

export function findPage(content, slug, { allowDraft = false } = {}) {
  const p = content.pages.find((x) => (x.slug || '') === (slug || ''));
  if (!p || (p.status === 'draft' && !allowDraft)) return null;
  return p;
}

export function themeCss(theme = {}, font) {
  const map = { brand: '--brand', brand2: '--brand-2', bg: '--bg', surface: '--surface', surface2: '--surface-2', text: '--text', muted: '--muted' };
  const ok = (c) => /^#[0-9a-f]{3,8}$/i.test(c || '') || /^rgba?\([\d\s.,%]+\)$/i.test(c || '');
  const vars = Object.entries(map).filter(([k]) => ok(theme[k])).map(([k, v]) => `${v}:${theme[k]}`);
  if (ok(theme.line)) vars.push(`--line:${theme.line}`);
  if (font && font !== 'system') vars.push(`--font:"${font}",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif`);
  if (theme.onBrand) vars.push(`--on-brand:${theme.onBrand}`);
  return `:root{${vars.join(';')}}` + (theme.onBrand ? `.btn-primary,.scr-banner,.step::before,.tips li::before,.bgrid .h,.bet .code,.logo-mark,.cta,.cta h2,.called i:first-of-type,.bgrid .c.hit{color:var(--on-brand)}.cta .btn-dark{background:var(--on-brand)}` : '');
}

export async function pageMetadata(slug, lang, opts = {}) {
  const content = await getContent();
  const { site } = content;
  const page = findPage(content, slug, opts);
  if (!page || !siteLangs(site).includes(lang)) return {};
  const base = (site.domain || '').replace(/\/+$/, '');
  const title = t(page.seo?.title, lang) || site.brandName;
  const description = t(page.seo?.description, lang);
  const url = base + pagePath(page.slug, lang);
  const og = page.seo?.ogImage || site.ogImage;
  const langs = siteLangs(site);
  return {
    title, description,
    metadataBase: base ? new URL(base) : undefined,
    alternates: {
      canonical: url,
      languages: Object.fromEntries([...langs.map((l) => [HTML_LANG[l], base + pagePath(page.slug, l)]), ['x-default', base + pagePath(page.slug, 'ms')]]),
    },
    robots: page.noindex || opts.allowDraft ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type: 'website', title, description, url, siteName: site.brandName, locale: OG_LOCALE[lang], images: og ? [og] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: og ? [og] : undefined },
    icons: site.faviconUrl ? { icon: site.faviconUrl } : undefined,
    verification: site.googleVerification ? { google: site.googleVerification } : undefined,
  };
}

function jsonLd(content, page, lang) {
  const { site } = content;
  const base = (site.domain || '').replace(/\/+$/, '');
  const url = base + pagePath(page.slug, lang);
  const graph = [];
  if (!page.slug) {
    graph.push({ '@type': 'Organization', '@id': `${base}/#organization`, name: site.brandName, url: `${base}/`, logo: site.logoUrl || undefined });
    graph.push({ '@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: site.brandName, inLanguage: HTML_LANG[lang], publisher: { '@id': `${base}/#organization` } });
  } else {
    graph.push({ '@type': 'WebPage', '@id': `${url}#webpage`, url, name: t(page.seo?.title, lang), description: t(page.seo?.description, lang), inLanguage: HTML_LANG[lang], isPartOf: { '@id': `${base}/#website` } });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t(site.homeLabel, lang) || 'Home', item: base + pagePath('', lang) },
      { '@type': 'ListItem', position: 2, name: t(page.navLabel, lang) || t(page.seo?.title, lang), item: url },
    ] });
  }
  const steps = (page.sections || []).find((s) => s.type === 'steps' && !s.hidden && s.howTo);
  if (steps) graph.push({ '@type': 'HowTo', name: t(steps.title, lang), step: steps.items.map((it, i) => ({ '@type': 'HowToStep', position: i + 1, name: t(it.title, lang), text: t(it.body, lang) })) });
  const faqs = (page.sections || []).filter((s) => s.type === 'faq' && !s.hidden).flatMap((s) => s.items || []);
  const strip = (x) => x.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  if (faqs.length) graph.push({ '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: t(f.q, lang), acceptedAnswer: { '@type': 'Answer', text: strip(t(f.a, lang)) } })) });
  return { '@context': 'https://schema.org', '@graph': graph };
}

export default async function SitePage({ slug, lang, content: given, allowDraft = false }) {
  const content = given || (await getContent());
  const { site } = content;
  const langs = siteLangs(site);
  if (!langs.includes(lang)) notFound();
  const page = findPage(content, slug, { allowDraft });
  if (!page) notFound();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss(site.theme, site.font) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(content, page, lang)) }} />
      <Header site={site} lang={lang} slug={page.slug} langs={langs} />
      <main><Sections page={page} site={site} lang={lang} /></main>
      <Footer site={site} lang={lang} slug={page.slug} langs={langs} />
    </>
  );
}
