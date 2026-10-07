'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Field, ColorInput, IconSvg } from './Fields';
import { SECTION_TYPES, SITE_GROUPS, NAV_FIELDS, THEME_KEYS, THEME_PRESETS } from '@/lib/schemas';
import { extractTheme } from './palette';

const rid = () => Math.random().toString(36).slice(2, 10);
const tr = (v, l) => (v && typeof v === 'object' ? v[l] || v.ms || v.en || '' : v || '');
const TABS = [['brand', 'Brand & settings'], ['theme', 'Theme colors'], ['menu', 'Menu & footer'], ['pages', 'Pages'], ['backup', 'Backup & history']];

export default function AdminApp() {
  const [content, setContent] = useState(null);
  const [saved, setSaved] = useState('');
  const [status, setStatus] = useState(null);
  const [lang, setLang] = useState('ms');
  const [tab, setTab] = useState('pages');
  const [pageIdx, setPageIdx] = useState(0);
  const [preview, setPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const flash = (msg, kind = 'ok') => { setToast({ msg, kind }); setTimeout(() => setToast(null), kind === 'err' ? 7000 : 2500); };

  useEffect(() => {
    fetch('/api/admin/content').then((r) => r.json()).then((c) => { setContent(c); setSaved(JSON.stringify(c)); });
    fetch('/api/admin/status').then((r) => r.json()).then(setStatus);
  }, []);

  const dirty = content && JSON.stringify(content) !== saved;

  const save = useCallback(async () => {
    if (!content || saving) return;
    setSaving(true);
    const r = await fetch('/api/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) return flash(j.error || 'Save failed', 'err');
    const next = { ...content, updatedAt: j.updatedAt };
    setContent(next); setSaved(JSON.stringify(next)); setPreviewKey((k) => k + 1);
    flash('Saved — live site updated');
  }, [content, saving]);

  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); } };
    const onLeave = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('keydown', onKey); window.addEventListener('beforeunload', onLeave);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('beforeunload', onLeave); };
  }, [save, dirty]);

  if (!content) return <div className="loading">Loading…</div>;
  const site = content.site;
  const setSite = (s) => setContent({ ...content, site: s });
  const setPages = (pages) => setContent({ ...content, pages });
  const page = content.pages[pageIdx] || content.pages[0];

  return (
    <div className={`admin ${preview && tab === 'pages' ? 'with-preview' : ''}`}>
      <header className="topbar">
        <div className="tb-brand">{site.logoUrl ? <img src={site.logoUrl} alt="" /> : <span className="mark">{(site.logoMark || 'B').slice(0, 2)}</span>}<b>{site.brandName}</b><span className="muted">Site editor</span></div>
        <nav className="tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
        <div className="tb-right">
          <div className="seg" title="Which language you are editing">
            {['ms', 'en'].map((l) => <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{l === 'ms' ? 'BM' : 'EN'}</button>)}
          </div>
          <a className="btn ghost" href={lang === 'en' ? '/en' : '/'} target="_blank">View site ↗</a>
          <button className={`btn primary ${dirty ? 'pulse' : ''}`} onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
        </div>
      </header>

      {status && (status.content !== 'redis' || status.uploads !== 'blob') && (
        <div className="banner">
          {status.content === 'none' && <span><b>Database not connected:</b> edits cannot be saved. In Vercel → Storage, add <b>Upstash Redis</b> to this project and redeploy.</span>}
          {status.content === 'local' && <span>Local mode: content is saved to <code>.data/content.json</code>. On Vercel connect Upstash Redis.</span>}
          {status.uploads === 'none' && <span><b>Image uploads off:</b> in Vercel → Storage, create a <b>Blob</b> store for this project (or paste image URLs).</span>}
        </div>
      )}

      <div className="body">
        {tab === 'brand' && (
          <div className="panel-wrap">
            {SITE_GROUPS.map((g) => (
              <section className="card" key={g.title}><h2>{g.title}</h2><Form fields={g.fields} value={site} onChange={setSite} lang={lang} /></section>
            ))}
          </div>
        )}

        {tab === 'theme' && <ThemeEditor site={site} setSite={setSite} flash={flash} />}

        {tab === 'menu' && (
          <div className="panel-wrap">
            <section className="card"><h2>Menu & footer</h2><p className="muted">Links starting with / are your pages (English pages get /en automatically). Use {'{register}'} and {'{login}'} for tracking links.</p>
              <Form fields={NAV_FIELDS} value={site} onChange={setSite} lang={lang} /></section>
          </div>
        )}

        {tab === 'pages' && (
          <div className="pages">
            <aside className="page-list">
              <div className="pl-head"><b>Pages</b><button className="btn-sm" onClick={() => {
                const slug = prompt('URL for the new page (e.g. kasino-langsung):', '');
                if (slug == null) return;
                const clean = slug.toLowerCase().trim().replace(/[^a-z0-9/-]+/g, '-').replace(/^-+|-+$/g, '');
                if (content.pages.some((p) => p.slug === clean)) return flash('A page with that URL already exists', 'err');
                const title = prompt('Page name (shown in breadcrumb):', clean.replace(/-/g, ' ')) || clean;
                const np = { id: rid(), slug: clean, status: 'draft', navLabel: { ms: title, en: title }, seo: { title: { ms: `${title} | {brand}`, en: `${title} | {brand}` }, description: { ms: '', en: '' } },
                  sections: ['hero', 'prose', 'faq', 'cta'].map((t) => ({ id: rid(), type: t, ...SECTION_TYPES[t].make() })) };
                np.sections[0].title = { ms: title, en: title };
                setPages([...content.pages, np]); setPageIdx(content.pages.length);
              }}>+ New</button></div>
              {content.pages.map((p, i) => (
                <button key={p.id || i} className={`pl-item ${i === pageIdx ? 'on' : ''}`} onClick={() => setPageIdx(i)}>
                  <span className="pl-name">{tr(p.navLabel, lang) || p.slug || 'Home'}</span>
                  <span className="pl-slug">/{p.slug}</span>
                  {p.status === 'draft' && <span className="pill">Draft</span>}
                </button>
              ))}
            </aside>
            {page && <PageEditor key={page.id || pageIdx} page={page} lang={lang} pages={content.pages} brand={site.brandName}
              onChange={(p) => setPages(content.pages.map((x, i) => (i === pageIdx ? p : x)))}
              onDuplicate={() => { const cp = structuredClone(page); cp.id = rid(); cp.slug = `${page.slug || 'home'}-copy`; cp.status = 'draft'; cp.sections.forEach((s) => (s.id = rid())); setPages([...content.pages, cp]); setPageIdx(content.pages.length); }}
              onDelete={() => { if (!page.slug) return flash('The homepage cannot be deleted', 'err'); if (confirm(`Delete page /${page.slug}? (You can still restore from history after saving)`)) { setPages(content.pages.filter((_, i) => i !== pageIdx)); setPageIdx(0); } }}
              preview={preview} setPreview={setPreview} />}
            {preview && page && (
              <div className="preview">
                <div className="pv-bar"><span>Preview of the <b>saved</b> version · {lang.toUpperCase()}</span>{dirty && <span className="warn">unsaved changes not shown</span>}<button className="btn-sm ghost" onClick={() => setPreviewKey((k) => k + 1)}>Reload</button></div>
                <iframe key={previewKey} src={`/preview/${page.slug}?lang=${lang}&k=${previewKey}`} title="Preview" />
              </div>
            )}
          </div>
        )}

        {tab === 'backup' && <Backup content={content} setContent={setContent} status={status} flash={flash} />}
      </div>
      {toast && <div className={`toast ${toast.kind}`}>{toast.msg}</div>}
    </div>
  );
}

function PageEditor({ page, onChange, lang, onDuplicate, onDelete, preview, setPreview, brand = '' }) {
  const fill = (x) => String(x || '').replaceAll('{brand}', brand).replaceAll('{year}', String(new Date().getFullYear()));
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const set = (k, v) => onChange({ ...page, [k]: v });
  const setSeo = (k, v) => onChange({ ...page, seo: { ...(page.seo || {}), [k]: v } });
  const sections = page.sections || [];
  const setSections = (s) => set('sections', s);
  const move = (i, d) => { const a = [...sections]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setSections(a); };
  const titleLen = fill(tr(page.seo?.title, lang)).length, descLen = fill(tr(page.seo?.description, lang)).length;
  const url = lang === 'en' ? (page.slug ? `/en/${page.slug}` : '/en') : `/${page.slug}`;

  return (
    <div className="page-editor">
      <section className="card">
        <div className="pe-head">
          <h2>{tr(page.navLabel, lang) || 'Homepage'}</h2>
          <div className="row-btns">
            <a className="btn-sm ghost" href={page.status === 'draft' ? `/preview/${page.slug}?lang=${lang}` : url} target="_blank">Open ↗</a>
            <button className={`btn-sm ${preview ? '' : 'ghost'}`} onClick={() => setPreview(!preview)}>{preview ? 'Hide preview' : 'Side preview'}</button>
            <button className="btn-sm ghost" onClick={onDuplicate}>Duplicate page</button>
            {page.slug !== '' && <button className="btn-sm danger" onClick={onDelete}>Delete</button>}
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label className="field-label">Page URL</label>
            <div className="slug"><span>{lang === 'en' ? '/en/' : '/'}</span><input value={page.slug} disabled={page.slug === '' && !page._editSlug} placeholder="(homepage)" onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g, '-'))} /></div>
          </div>
          <Field field={{ key: 'status', label: 'Status', type: 'select', options: [['published', 'Published'], ['draft', 'Draft (hidden)']] }} value={page.status} onChange={(v) => set('status', v)} lang={lang} />
          <Field field={{ key: 'navLabel', label: 'Page name (breadcrumb)', type: 'i18n' }} value={page.navLabel} onChange={(v) => set('navLabel', v)} lang={lang} />
          <Field field={{ key: 'noindex', label: 'Hide from Google (noindex)', type: 'bool' }} value={page.noindex} onChange={(v) => set('noindex', v)} lang={lang} />
        </div>
        <details className="seo-box" open>
          <summary>SEO</summary>
          <Field field={{ key: 'title', label: `Meta title · ${titleLen}/60`, type: 'i18n' }} value={page.seo?.title} onChange={(v) => setSeo('title', v)} lang={lang} />
          <Field field={{ key: 'description', label: `Meta description · ${descLen}/160`, type: 'i18nArea', rows: 2 }} value={page.seo?.description} onChange={(v) => setSeo('description', v)} lang={lang} />
          <Field field={{ key: 'ogImage', label: 'Social share image (optional)', type: 'image' }} value={page.seo?.ogImage} onChange={(v) => setSeo('ogImage', v)} lang={lang} />
          <div className="serp"><div className="serp-url">{url}</div><div className="serp-title">{fill(tr(page.seo?.title, lang)) || 'Title'}</div><div className="serp-desc">{fill(tr(page.seo?.description, lang)) || 'Description'}</div></div>
        </details>
      </section>

      <div className="sections">
        <div className="sec-title"><h3>Sections</h3><span className="muted">Top to bottom as they appear on the page</span></div>
        {sections.map((s, i) => {
          const def = SECTION_TYPES[s.type];
          const open = openId === (s.id || i);
          return (
            <div key={s.id || i} className={`sec ${open ? 'open' : ''} ${s.hidden ? 'is-hidden' : ''}`}>
              <div className="sec-head" onClick={() => setOpenId(open ? null : s.id || i)}>
                <span className="chev">{open ? '▾' : '▸'}</span>
                <span className="type">{def?.label || s.type}</span>
                <span className="sec-name">{fill(tr(s.title, lang) || tr(s.eyebrow, lang))}</span>
                {s.hidden && <span className="pill">Hidden</span>}
                <span className="sec-actions" onClick={(e) => e.stopPropagation()}>
                  <button title="Move up" onClick={() => move(i, -1)}>↑</button>
                  <button title="Move down" onClick={() => move(i, 1)}>↓</button>
                  <button title={s.hidden ? 'Show' : 'Hide'} onClick={() => setSections(sections.map((x, j) => (j === i ? { ...x, hidden: !x.hidden } : x)))}>{s.hidden ? '◌' : '◉'}</button>
                  <button title="Duplicate" onClick={() => setSections([...sections.slice(0, i + 1), { ...structuredClone(s), id: rid() }, ...sections.slice(i + 1)])}>⧉</button>
                  <button title="Delete" className="danger" onClick={() => { if (confirm('Delete this section?')) setSections(sections.filter((_, j) => j !== i)); }}>✕</button>
                </span>
              </div>
              {open && def && <SectionBody s={s} def={def} lang={lang} onChange={(v) => setSections(sections.map((x, j) => (j === i ? v : x)))} />}
            </div>
          );
        })}
        {adding ? (
          <div className="add-grid">
            {Object.entries(SECTION_TYPES).map(([k, d]) => (
              <button key={k} onClick={() => { const ns = { id: rid(), type: k, ...d.make() }; setSections([...sections, ns]); setOpenId(ns.id); setAdding(false); }}>
                <b>{d.label}</b><span>{d.desc}</span>
              </button>
            ))}
            <button className="cancel" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        ) : <button className="add-btn big" onClick={() => setAdding(true)}>+ Add section</button>}
      </div>
    </div>
  );
}

function SectionBody({ s, def, lang, onChange }) {
  const [json, setJson] = useState(null);
  return (
    <div className="sec-body">
      <div className="sec-tools">
        <button className="link-btn" onClick={() => setJson(json == null ? JSON.stringify(s, null, 2) : null)}>{json == null ? 'Edit as JSON' : 'Back to form'}</button>
      </div>
      {json == null ? <Form fields={def.fields} value={s} onChange={onChange} lang={lang} /> : (
        <div>
          <textarea className="mono" rows={18} value={json} onChange={(e) => setJson(e.target.value)} />
          <button className="btn-sm" onClick={() => { try { onChange({ ...JSON.parse(json), id: s.id, type: s.type }); setJson(null); } catch (e) { alert('Invalid JSON: ' + e.message); } }}>Apply JSON</button>
        </div>
      )}
    </div>
  );
}

function ThemeEditor({ site, setSite, flash }) {
  const theme = site.theme || {};
  const setTheme = (t) => setSite({ ...site, theme: t });
  const [suggest, setSuggest] = useState(null);
  return (
    <div className="panel-wrap theme">
      <section className="card">
        <h2>Presets</h2>
        <div className="presets">
          {Object.entries(THEME_PRESETS).map(([name, p]) => (
            <button key={name} onClick={() => setTheme({ ...p })} className="preset" style={{ background: p.bg, color: p.text, borderColor: p.surface2 }}>
              <span className="sw" style={{ background: `linear-gradient(135deg, ${p.brand}, ${p.brand2})` }} />{name}
            </button>
          ))}
        </div>
        <h2 style={{ marginTop: 24 }}>Match my logo</h2>
        <p className="muted">Reads the main colors from your uploaded logo and builds a matching dark theme.</p>
        <div className="row-btns">
          <button className="btn-sm" disabled={!site.logoUrl} onClick={async () => {
            try { setSuggest(await extractTheme(site.logoUrl)); } catch (e) { flash('Could not read the logo colors (' + e.message + ')', 'err'); }
          }}>{site.logoUrl ? 'Extract colors from logo' : 'Upload a logo first (Brand tab)'}</button>
        </div>
        {suggest && (
          <div className="suggest">
            <div className="sw-row">{THEME_KEYS.map(([k]) => <span key={k} title={k} style={{ background: suggest[k] }} />)}</div>
            <div className="row-btns">
              <button className="btn-sm" onClick={() => { setTheme({ ...theme, brand: suggest.brand, brand2: suggest.brand2, onBrand: suggest.onBrand }); setSuggest(null); }}>Use brand colors only</button>
              <button className="btn-sm" onClick={() => { setTheme(suggest); setSuggest(null); }}>Use full theme</button>
              <button className="btn-sm ghost" onClick={() => setSuggest(null)}>Cancel</button>
            </div>
          </div>
        )}
      </section>
      <section className="card">
        <h2>Colors</h2>
        <div className="colors">
          {THEME_KEYS.map(([k, label]) => (
            <div className="field" key={k}><label className="field-label">{label}</label><ColorInput value={theme[k]} onChange={(v) => setTheme({ ...theme, [k]: v })} /></div>
          ))}
          <div className="field"><label className="field-label">Border color (optional, e.g. rgba(255,255,255,0.08))</label><input type="text" value={theme.line || ''} onChange={(e) => setTheme({ ...theme, line: e.target.value })} /></div>
        </div>
      </section>
      <section className="card">
        <h2>Preview</h2>
        <ThemeSample theme={theme} site={site} />
      </section>
    </div>
  );
}

function ThemeSample({ theme, site }) {
  const g = `linear-gradient(135deg, ${theme.brand}, ${theme.brand2})`;
  return (
    <div className="sample" style={{ background: theme.bg, color: theme.text }}>
      <div className="s-nav" style={{ borderColor: theme.line || 'rgba(255,255,255,.08)' }}>
        {site.logoUrl ? <img src={site.logoUrl} alt="" style={{ height: 26 }} /> : <span className="s-mark" style={{ background: g, color: theme.onBrand || '#111' }}>{(site.logoMark || 'B').slice(0, 2)}</span>}
        <b>{site.brandName}</b><span style={{ flex: 1 }} /><span className="s-btn" style={{ background: g, color: theme.onBrand || '#111' }}>Daftar</span>
      </div>
      <div style={{ padding: 20 }}>
        <span className="s-eyebrow" style={{ color: theme.brand, borderColor: theme.brand }}>EYEBROW</span>
        <h3 style={{ fontSize: 26, margin: '10px 0 6px' }}><span style={{ background: g, WebkitBackgroundClip: 'text', color: 'transparent' }}>Highlighted</span> heading</h3>
        <p style={{ color: theme.muted, margin: 0 }}>Secondary text color for paragraphs.</p>
        <div className="s-cards">{[1, 2, 3].map((n) => <div key={n} style={{ background: theme.surface, border: `1px solid ${theme.line || 'rgba(255,255,255,.08)'}` }}><div className="s-ic" style={{ color: theme.brand, background: theme.surface2 }}><IconSvg name={['bolt', 'gift', 'lock'][n - 1]} /></div><b>Card {n}</b><span style={{ color: theme.muted }}>Card text</span></div>)}</div>
        <div className="s-cta" style={{ background: g, color: theme.onBrand || '#111' }}><b>Call to action banner</b></div>
      </div>
    </div>
  );
}

function Backup({ content, setContent, status, flash }) {
  const [hist, setHist] = useState(null);
  useEffect(() => { fetch('/api/admin/history').then((r) => r.json()).then(setHist).catch(() => setHist([])); }, []);
  return (
    <div className="panel-wrap">
      <section className="card">
        <h2>Connection status</h2>
        <ul className="status">
          <li><span className={status?.content === 'redis' ? 'ok' : 'bad'}>●</span> Content database: <b>{status?.content === 'redis' ? 'Upstash Redis connected' : status?.content === 'local' ? 'Local file (development)' : 'Not connected'}</b></li>
          <li><span className={status?.uploads === 'blob' ? 'ok' : 'bad'}>●</span> Image uploads: <b>{status?.uploads === 'blob' ? 'Vercel Blob connected' : status?.uploads === 'local' ? 'Local folder (development)' : 'Not connected'}</b></li>
          <li><span className={status?.passwordSet ? 'ok' : 'bad'}>●</span> Admin password: <b>{status?.passwordSet ? 'Set via ADMIN_PASSWORD' : 'Using development default — set ADMIN_PASSWORD in Vercel'}</b></li>
        </ul>
      </section>
      <section className="card">
        <h2>Export / import</h2>
        <p className="muted">Download everything (settings + all pages) as one JSON file. Import it into another deployment to clone a brand site.</p>
        <div className="row-btns">
          <button className="btn-sm" onClick={() => {
            const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = `${(content.site.brandName || 'site').toLowerCase().replace(/\W+/g, '-')}-content-${new Date().toISOString().slice(0, 10)}.json`; a.click();
          }}>Download JSON</button>
          <label className="btn-sm ghost">Import JSON…<input type="file" accept="application/json" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            try { const c = JSON.parse(await f.text()); if (!c.site || !Array.isArray(c.pages)) throw new Error('Not a site export'); setContent(c); flash('Imported — review, then Save to publish'); } catch (x) { flash(x.message, 'err'); }
            e.target.value = '';
          }} /></label>
        </div>
      </section>
      <section className="card">
        <h2>Version history</h2>
        <p className="muted">The last 20 saved versions. Restoring loads it into the editor — press Save to publish it.</p>
        {!hist ? <p className="muted">Loading…</p> : hist.length === 0 ? <p className="muted">No earlier versions yet.</p> : (
          <ul className="hist">{hist.map((h) => (
            <li key={h.index}><span>{h.updatedAt ? new Date(h.updatedAt).toLocaleString() : `Version ${h.index + 1}`}</span>
              <button className="btn-sm ghost" onClick={async () => { const r = await fetch(`/api/admin/history?index=${h.index}`); if (r.ok) { setContent(await r.json()); flash('Version loaded — press Save to publish it'); } }}>Restore</button></li>
          ))}</ul>
        )}
      </section>
      <section className="card">
        <h2>Account</h2>
        <button className="btn-sm ghost" onClick={async () => { await fetch('/api/logout', { method: 'POST' }); location.href = '/admin/login'; }}>Log out</button>
      </section>
    </div>
  );
}
