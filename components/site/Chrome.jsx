import { t, resolveHref, pagePath, LANG_LABEL, LANG_NAME } from '@/lib/i18n';
import MenuToggle from './MenuToggle';

export function Logo({ site, small }) {
  const h = small ? Math.round((site.logoHeight || 36) * 0.8) : (site.logoHeight || 36);
  return (
    <>
      {site.logoUrl
        ? <img src={site.logoUrl} alt={site.brandName} style={{ height: h }} />
        : <span className="logo-mark">{(site.logoMark || site.brandName || 'B').slice(0, 2)}</span>}
      {(!site.logoUrl || (site.showBrandText && !small)) && <span className={`logo-text${site.logoUrl ? ' has-img' : ''}`}>{site.brandName}</span>}
    </>
  );
}

export function Header({ site, lang, slug, langs }) {
  const other = langs.find((l) => l !== lang);
  const current = pagePath(slug, lang);
  return (
    <>
      {t(site.notice, lang) && <div className="notice" dangerouslySetInnerHTML={{ __html: t(site.notice, lang).replace(/^(\d+\+)/, '<b>$1</b>') }} />}
      <header>
        <div className="wrap nav">
          <a href={pagePath('', lang)} className="logo" aria-label={site.brandName}><Logo site={site} /></a>
          <ul className="menu" id="menu">
            {(site.nav || []).map((n, i) => {
              const href = resolveHref(n.href, lang, site);
              const active = href === current;
              return <li key={i}><a href={href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>{t(n.label, lang)}</a></li>;
            })}
          </ul>
          <div className="nav-cta">
            {other && <a href={pagePath(slug, other)} className="lang" hrefLang={other} lang={other}>{LANG_LABEL[other]}</a>}
            <a href={resolveHref('{login}', lang, site)} className="btn btn-ghost btn-sm">{t(site.loginLabel, lang) || 'Log In'}</a>
            <a href={resolveHref('{register}', lang, site)} className="btn btn-primary btn-sm">{t(site.registerLabel, lang) || 'Register'}</a>
            <MenuToggle />
          </div>
        </div>
      </header>
    </>
  );
}

export function Footer({ site, lang, slug, langs }) {
  const other = langs.find((l) => l !== lang);
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <a href={pagePath('', lang)} className="logo"><Logo site={site} /></a>
            {t(site.footerText, lang) && <p>{t(site.footerText, lang)}</p>}
            {site.supportEmail && <p><a href={`mailto:${site.supportEmail}`} style={{ color: 'var(--brand)' }}>{site.supportEmail}</a></p>}
          </div>
          {(site.footerColumns || []).map((col, i) => (
            <div key={i}>
              <h4>{t(col.title, lang)}</h4>
              <ul>{(col.links || []).map((l, j) => <li key={j}><a href={resolveHref(l.href, lang, site)}>{t(l.label, lang)}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="copy">
          <span>{t(site.copyright, lang)}</span>
          {other && <a href={pagePath(slug, other)} hrefLang={other} lang={other}>🌐 {LANG_NAME[other]}</a>}
        </div>
      </div>
    </footer>
  );
}
