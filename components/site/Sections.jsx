import { t, resolveHref, pagePath } from '@/lib/i18n';
import { Icon, Check, Cross, Inline, Paras, Title, Head, Buttons, lines, commas } from './bits';
import { Visual } from './Visuals';

const PATTERNS = {
  line: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
  corners: [[0, 0], [0, 4], [4, 0], [4, 4]],
  x: [0, 1, 2, 3, 4].flatMap((i) => [[i, i], [i, 4 - i]]),
  diagonal: [0, 1, 2, 3, 4].map((i) => [i, i]),
  full: [0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2, 3, 4].map((c) => [r, c])),
};
function Pattern({ name }) {
  const on = new Set((PATTERNS[name] || []).map(([r, c]) => `${r},${c}`));
  return <span className="pat">{Array.from({ length: 25 }, (_, i) => <i key={i} className={on.has(`${Math.floor(i / 5)},${i % 5}`) ? 'on' : ''} />)}</span>;
}

function wrapCls(s, base = '') {
  return [base, s.background === 'surface' ? 'section-surface' : '', s.tight ? 'tight' : ''].filter(Boolean).join(' ');
}

function Hero({ s, site, lang, page }) {
  const visual = s.visual || 'none';
  const crumbs = s.breadcrumb && page.slug;
  const copy = (
    <div className={visual === 'none' ? 'hero-single' : ''}>
      {crumbs && (
        <nav className="crumbs" aria-label="Breadcrumb">
          <a href={pagePath('', lang)}>{t(site.homeLabel, lang) || 'Home'}</a><span>/</span><b>{t(page.navLabel, lang) || t(page.seo?.title, lang)}</b>
        </nav>
      )}
      {t(s.eyebrow, lang) && <span className="eyebrow">{t(s.eyebrow, lang)}</span>}
      <h1><Title text={t(s.title, lang)} highlight={t(s.highlight, lang)} /></h1>
      {t(s.lead, lang) && <p className="lead">{t(s.lead, lang)}</p>}
      <div className="hero-btns"><Buttons buttons={s.buttons} lang={lang} site={site} /></div>
      {s.trust?.length > 0 && (
        <div className="trust">{s.trust.map((x, i) => <span key={i}><Check />{t(x.text, lang)}</span>)}</div>
      )}
    </div>
  );
  return (
    <section className={page.slug ? 'page-hero' : 'hero'} id={s.anchor || undefined}>
      <div className="wrap">
        {visual === 'none' ? copy : <div className="hero-grid">{copy}<div><Visual kind={visual} s={s} site={site} lang={lang} /></div></div>}
        {s.minis?.length > 0 && (
          <div className="minis">{s.minis.map((m, i) => (
            <div className="mini" key={i}><div className="ic"><Icon name={m.icon} /></div><div><b>{t(m.title, lang)}</b><span>{t(m.body, lang)}</span></div></div>
          ))}</div>
        )}
        {s.stats?.length > 0 && (
          <div className="stats">{s.stats.map((x, i) => <div className="stat" key={i}><b className="hl">{x.value}</b><span>{t(x.label, lang)}</span></div>)}</div>
        )}
      </div>
    </section>
  );
}

function CardItem({ it, s, lang, site }) {
  const title = t(it.title, lang);
  const tags = commas(t(it.tags, lang));
  if (s.layout === 'games') {
    return <a href={resolveHref(it.href, lang, site)} className="game"><Icon name={it.icon} sw={1.6} /><h3>{title}</h3><p>{t(it.body, lang)}</p></a>;
  }
  return (
    <div className="card sport var-card bet">
      {it.icon && <div className="ic"><Icon name={it.icon} /></div>}
      <h3>{title}{it.code && <span className="code">{it.code}</span>}</h3>
      <p><Inline text={t(it.body, lang)} lang={lang} site={site} /></p>
      {(it.stat1 || it.stat2) && (
        <div className="stat-row">
          {it.stat1 && <span><b>{it.stat1}</b>{t(it.stat1Label, lang)}</span>}
          {it.stat2 && <span><b>{it.stat2}</b>{t(it.stat2Label, lang)}</span>}
        </div>
      )}
      {t(it.example, lang) && <div className="ex"><Inline text={t(it.example, lang)} lang={lang} site={site} /></div>}
      {tags.length > 0 && <div className="tags">{tags.map((x) => <span key={x}>{x}</span>)}</div>}
      {it.href && t(it.linkLabel, lang) && <a className="more" href={resolveHref(it.href, lang, site)}>{t(it.linkLabel, lang)} →</a>}
    </div>
  );
}

function Cards({ s, lang, site }) {
  const grid = { 'grid-4': 'grid-4', 'grid-3': 'grid-3', 'grid-2': 'grid-2', games: 'games' }[s.layout] || 'grid-4';
  const items = <div className={`wrap ${grid}`} style={s.boxed ? { padding: 0 } : undefined}>{(s.items || []).map((it, i) => <CardItem key={i} it={it} s={s} lang={lang} site={site} />)}</div>;
  if (s.boxed) {
    return (
      <section className={wrapCls(s)} id={s.anchor || undefined}>
        <div className="wrap"><div className="rg">
          <div className="center">
            {s.badge && <div className="age">{s.badge}</div>}
            {t(s.eyebrow, lang) && <span className="eyebrow">{t(s.eyebrow, lang)}</span>}
            {t(s.title, lang) && <h2>{t(s.title, lang)}</h2>}
            {t(s.lead, lang) && <p className="lead">{t(s.lead, lang)}</p>}
          </div>
          {items}
          {s.buttons?.length > 0 && <div className="center" style={{ marginTop: 28 }}><Buttons buttons={s.buttons} lang={lang} site={site} /></div>}
        </div></div>
      </section>
    );
  }
  return (
    <section className={wrapCls(s)} id={s.anchor || undefined}>
      <Head s={s} lang={lang} />
      {items}
      {s.buttons?.length > 0 && <div className="wrap center" style={{ marginTop: 28 }}><Buttons buttons={s.buttons} lang={lang} site={site} /></div>}
    </section>
  );
}

function Aside({ s, lang, site }) {
  const checks = lines(t(s.asideChecks, lang));
  const rows = lines(t(s.asideRows, lang)).map((l) => l.split('|').map((x) => x.trim()));
  const chips = commas(s.asideChips);
  if (!t(s.asideTitle, lang) && !checks.length && !rows.length && !chips.length && !s.asidePatterns?.length) return null;
  return (
    <aside className="panel">
      {t(s.asideTitle, lang) && <h3>{t(s.asideTitle, lang)}</h3>}
      {checks.length > 0 && <ul className="checks">{checks.map((c, i) => <li key={i}><Check /><span><Inline text={c} lang={lang} site={site} /></span></li>)}</ul>}
      {rows.length > 0 && <ul className="req">{rows.map((r, i) => <li key={i}><span>{r[0]}</span><b>{r[1]}</b></li>)}</ul>}
      {s.asidePatterns?.length > 0 && <ul className="pats">{s.asidePatterns.map((p, i) => <li key={i}><Pattern name={p.pattern} /><div><b>{t(p.title, lang)}</b>{t(p.body, lang)}</div></li>)}</ul>}
      {chips.length > 0 && <div className="pay">{chips.map((c) => <span key={c}>{c}</span>)}</div>}
    </aside>
  );
}

function Prose({ s, lang, site }) {
  const aside = <Aside s={s} lang={lang} site={site} />;
  if (!aside) {
    return (
      <section className={wrapCls(s)} id={s.anchor || undefined}>
        <div className="wrap prose-center">
          <div className="head">
            {t(s.eyebrow, lang) && <span className="eyebrow">{t(s.eyebrow, lang)}</span>}
            {t(s.title, lang) && <h2>{t(s.title, lang)}</h2>}
          </div>
          <div className="prose"><Paras text={t(s.body, lang)} lang={lang} site={site} /></div>
        </div>
      </section>
    );
  }
  return (
    <section className={wrapCls(s)} id={s.anchor || undefined}>
      <div className="wrap split">
        <div className="prose">
          {t(s.eyebrow, lang) && <span className="eyebrow">{t(s.eyebrow, lang)}</span>}
          {t(s.title, lang) && <h2>{t(s.title, lang)}</h2>}
          <Paras text={t(s.body, lang)} lang={lang} site={site} />
        </div>
        {aside}
      </div>
    </section>
  );
}

function Split({ s, lang, site }) {
  const chips = commas(t(s.chips, lang));
  return (
    <section className={wrapCls(s)} id={s.anchor || undefined}>
      <div className={`wrap split${s.reverse ? ' reverse' : ''}`} style={{ alignItems: 'center' }}>
        <div className="prose">
          {t(s.eyebrow, lang) && <span className="eyebrow">{t(s.eyebrow, lang)}</span>}
          {t(s.title, lang) && <h2>{t(s.title, lang)}</h2>}
          <Paras text={t(s.body, lang)} lang={lang} site={site} />
          {chips.length > 0 && <div className="chips">{chips.map((c, i) => <span key={c} className={`chip${i === 0 ? ' on' : ''}`}>{c}</span>)}</div>}
          {t(s.bodyAfter, lang) && <Paras text={t(s.bodyAfter, lang)} lang={lang} site={site} />}
          {s.buttons?.length > 0 && <div className="hero-btns" style={{ marginTop: 20 }}><Buttons buttons={s.buttons} lang={lang} site={site} /></div>}
        </div>
        <Visual kind={s.visual || 'odds'} s={s} site={site} lang={lang} />
      </div>
    </section>
  );
}

function Table({ s, lang }) {
  const cols = commas(t(s.columns, lang));
  const rows = lines(t(s.rows, lang)).map((l) => l.split('|').map((x) => x.trim()));
  const cell = (v) => {
    const k = v.toLowerCase();
    if (['yes', 'ya', 'y', '✓'].includes(k)) return <span className="y"><Check /></span>;
    if (['no', 'tidak', 'n', '✗', 'x'].includes(k)) return <span className="n"><Cross /></span>;
    return v;
  };
  return (
    <section className={wrapCls(s)} id={s.anchor || undefined}>
      <Head s={s} lang={lang} />
      <div className="wrap"><div className="tbl-wrap"><table className="mkt">
        <thead><tr>{cols.map((c, i) => <th key={i} className={i === cols.length - 1 && s.highlightLast ? 'vip' : undefined}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{cell(c)}</td>)}</tr>)}</tbody>
      </table></div></div>
    </section>
  );
}

function Steps({ s, lang }) {
  return (
    <section className={wrapCls(s)} id={s.anchor || undefined}>
      <Head s={s} lang={lang} />
      <div className="wrap steps">{(s.items || []).map((it, i) => <div className="step" key={i}><h3>{t(it.title, lang)}</h3><p>{t(it.body, lang)}</p></div>)}</div>
    </section>
  );
}

function Tips({ s, lang, site }) {
  return (
    <section className={wrapCls(s)} id={s.anchor || undefined}>
      <div className="wrap split">
        <div>
          {t(s.eyebrow, lang) && <span className="eyebrow">{t(s.eyebrow, lang)}</span>}
          {t(s.title, lang) && <h2>{t(s.title, lang)}</h2>}
          <ol className="tips">{(s.items || []).map((it, i) => <li key={i}><b>{t(it.title, lang)}</b>{t(it.body, lang)}</li>)}</ol>
        </div>
        <Aside s={s} lang={lang} site={site} />
      </div>
    </section>
  );
}

function Faq({ s, lang, site }) {
  return (
    <section className={wrapCls(s)} id={s.anchor || 'faq'}>
      <Head s={s} lang={lang} />
      <div className="wrap faq">{(s.items || []).map((it, i) => (
        <details key={i} open={i === 0}><summary>{t(it.q, lang)}</summary><p><Inline text={t(it.a, lang)} lang={lang} site={site} /></p></details>
      ))}</div>
    </section>
  );
}

function Cta({ s, lang, site }) {
  return (
    <section className={wrapCls(s)} style={{ paddingTop: s.tight ? 0 : undefined, paddingBottom: 0 }} id={s.anchor || undefined}>
      <div className="wrap"><div className="cta">
        <h2>{t(s.title, lang)}</h2>
        {t(s.text, lang) && <p>{t(s.text, lang)}</p>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}><Buttons buttons={s.buttons} lang={lang} site={site} dark /></div>
      </div></div>
    </section>
  );
}

function Html({ s, lang }) {
  return <section className={wrapCls(s)} id={s.anchor || undefined}><div className="wrap custom-html" dangerouslySetInnerHTML={{ __html: t(s.html, lang) }} /></section>;
}

const MAP = { hero: Hero, cards: Cards, prose: Prose, split: Split, table: Table, steps: Steps, tips: Tips, faq: Faq, cta: Cta, html: Html };

export default function Sections({ page, site, lang }) {
  return (page.sections || []).filter((s) => !s.hidden).map((s, i) => {
    const C = MAP[s.type];
    return C ? <C key={s.id || i} s={s} site={site} lang={lang} page={page} /> : null;
  });
}
