export const LANGS = ['ms', 'en'];
export const LANG_LABEL = { ms: 'BM', en: 'EN' };
export const LANG_NAME = { ms: 'Bahasa Melayu', en: 'English' };
export const HTML_LANG = { ms: 'ms-MY', en: 'en-MY' };
export const OG_LOCALE = { ms: 'ms_MY', en: 'en_MY' };

// Read a translatable field: {ms, en} or a plain string.
export function t(v, lang) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return v[lang] || v.ms || v.en || '';
}

export function pagePath(slug, lang) {
  const s = (slug || '').replace(/^\/+|\/+$/g, '');
  if (lang === 'en') return s ? `/en/${s}` : '/en';
  return s ? `/${s}` : '/';
}

// Turn content hrefs into real links: {register}/{login} tokens, and
// internal links get the /en prefix on English pages.
export function resolveHref(href, lang, site) {
  if (!href) return '#';
  if (href === '{register}') return site?.registerUrl || '/register';
  if (href === '{login}') return site?.loginUrl || '/login';
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  if (lang === 'en' && href.startsWith('/') && !href.startsWith('/en/') && href !== '/en' && !href.startsWith('/sitemap')) {
    if (href === '/') return '/en';
    if (href.startsWith('/#')) return `/en${href.slice(1)}`;
    return `/en${href}`;
  }
  return href;
}
