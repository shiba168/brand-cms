import { ICONS } from '@/lib/icons';
import { t, resolveHref } from '@/lib/i18n';

export function Icon({ name, sw = 2 }) {
  const inner = ICONS[name] || ICONS.star;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: inner }} />;
}

export const Check = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>;
export const Cross = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12" /></svg>;

// **bold** and [label](href) inside plain text
export function Inline({ text, lang, site }) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) return <a key={i} href={resolveHref(m[2], lang, site)}>{m[1]}</a>;
    return p;
  });
}

// Blank-line separated paragraphs
export function Paras({ text, lang, site }) {
  return String(text || '').split(/\n\s*\n/).filter((s) => s.trim()).map((p, i) => (
    <p key={i}><Inline text={p.trim()} lang={lang} site={site} /></p>
  ));
}

export function Title({ text, highlight }) {
  if (highlight && text.includes(highlight)) {
    const i = text.indexOf(highlight);
    return <>{text.slice(0, i)}<span className="hl">{highlight}</span>{text.slice(i + highlight.length)}</>;
  }
  return text;
}

export function Head({ s, lang, center = true }) {
  const eyebrow = t(s.eyebrow, lang), title = t(s.title, lang), lead = t(s.lead, lang);
  if (!eyebrow && !title && !lead) return null;
  return (
    <div className={center ? 'wrap center' : ''}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && <h2><Title text={title} highlight={t(s.highlight, lang)} /></h2>}
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

export function Buttons({ buttons, lang, site, dark }) {
  if (!buttons?.length) return null;
  return buttons.map((b, i) => {
    const style = b.style || (i === 0 ? 'primary' : 'ghost');
    const cls = dark ? (style === 'primary' ? 'btn btn-dark' : 'btn btn-outline') : (style === 'primary' ? 'btn btn-primary' : 'btn btn-ghost');
    const href = resolveHref(b.href, lang, site);
    const ext = /^https?:/.test(href);
    return <a key={i} href={href} className={cls} {...(ext ? { rel: 'nofollow noopener', target: b.newTab ? '_blank' : undefined } : {})}>{t(b.label, lang)}</a>;
  });
}

export const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
export const commas = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
