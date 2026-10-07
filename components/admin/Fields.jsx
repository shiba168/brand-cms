'use client';
import { useState } from 'react';
import { ICONS, ICON_NAMES } from '@/lib/icons';

const LBL = { ms: 'BM', en: 'EN' };
const other = (l) => (l === 'ms' ? 'en' : 'ms');

export function IconSvg({ name, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />;
}

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Upload failed');
  return j.url;
}

function I18nInput({ value, onChange, lang, area, rows, mono, placeholder }) {
  const v = value && typeof value === 'object' ? value : { ms: value || '', en: '' };
  const cur = v[lang] || '';
  const alt = v[other(lang)] || '';
  const missing = !cur && alt;
  const set = (x) => onChange({ ...v, [lang]: x });
  const props = { value: cur, onChange: (e) => set(e.target.value), placeholder: alt ? `${LBL[other(lang)]}: ${alt.slice(0, 120)}` : placeholder, className: `${mono ? 'mono' : ''} ${missing ? 'missing' : ''}` };
  return (
    <div className="i18n">
      <span className={`lang-tag ${missing ? 'warn' : ''}`} title={missing ? 'Not translated yet' : ''}>{LBL[lang]}</span>
      {area ? <textarea rows={rows || 3} {...props} /> : <input type="text" {...props} />}
      {missing && <button type="button" className="link-btn" onClick={() => set(alt)}>copy {LBL[other(lang)]}</button>}
    </div>
  );
}

function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="image-field">
      <div className="thumb">{value ? <img src={value} alt="" /> : <span>No image</span>}</div>
      <div className="image-ctrl">
        <input type="text" value={value || ''} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value)} />
        <div className="row-btns">
          <label className="btn-sm">
            {busy ? 'Uploading…' : 'Upload'}
            <input type="file" accept="image/*" hidden disabled={busy} onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              setBusy(true); setErr('');
              try { onChange(await uploadFile(f)); } catch (x) { setErr(x.message); }
              setBusy(false); e.target.value = '';
            }} />
          </label>
          {value && <button type="button" className="btn-sm ghost" onClick={() => onChange('')}>Remove</button>}
        </div>
        {err && <div className="err">{err}</div>}
      </div>
    </div>
  );
}

function IconField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="icon-field">
      <button type="button" className="icon-current" onClick={() => setOpen(!open)}><IconSvg name={value} size={20} /><span>{value || 'choose'}</span></button>
      {open && (
        <div className="icon-grid">
          {ICON_NAMES.map((n) => (
            <button type="button" key={n} title={n} className={n === value ? 'on' : ''} onClick={() => { onChange(n); setOpen(false); }}><IconSvg name={n} /></button>
          ))}
        </div>
      )}
    </div>
  );
}

function ListField({ field, value, onChange, lang }) {
  const items = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(null);
  const update = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i, d) => { const a = [...items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); setOpen(open === i ? j : open); };
  return (
    <div className="list">
      {items.map((it, i) => (
        <div className={`list-item ${open === i ? 'open' : ''}`} key={i}>
          <div className="list-head" onClick={() => setOpen(open === i ? null : i)}>
            <span className="chev">{open === i ? '▾' : '▸'}</span>
            <span className="list-label">{field.itemLabel?.(it, lang) || `Item ${i + 1}`}</span>
            <span className="list-actions" onClick={(e) => e.stopPropagation()}>
              <button type="button" title="Move up" onClick={() => move(i, -1)}>↑</button>
              <button type="button" title="Move down" onClick={() => move(i, 1)}>↓</button>
              <button type="button" title="Duplicate" onClick={() => onChange([...items.slice(0, i + 1), structuredClone(it), ...items.slice(i + 1)])}>⧉</button>
              <button type="button" title="Delete" className="danger" onClick={() => { if (confirm('Delete this item?')) onChange(items.filter((_, j) => j !== i)); }}>✕</button>
            </span>
          </div>
          {open === i && <div className="list-body"><Form fields={field.fields} value={it} onChange={(v) => update(i, v)} lang={lang} /></div>}
        </div>
      ))}
      <button type="button" className="add-btn" onClick={() => { onChange([...items, field.newItem ? field.newItem() : {}]); setOpen(items.length); }}>+ Add {field.addLabel || 'item'}</button>
    </div>
  );
}

export function Field({ field, value, onChange, lang, ctx }) {
  const f = field;
  let input;
  switch (f.type) {
    case 'i18n': input = <I18nInput value={value} onChange={onChange} lang={lang} placeholder={f.placeholder} />; break;
    case 'i18nArea': input = <I18nInput value={value} onChange={onChange} lang={lang} area rows={f.rows} mono={f.mono} />; break;
    case 'textarea': input = <textarea rows={f.rows || 3} className={f.mono ? 'mono' : ''} value={value || ''} onChange={(e) => onChange(e.target.value)} />; break;
    case 'number': input = <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />; break;
    case 'bool': return (
      <label className="check"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {f.label}{f.help && <small>{f.help}</small>}</label>
    );
    case 'select': input = <select value={value ?? f.options[0][0]} onChange={(e) => onChange(e.target.value)}>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>; break;
    case 'color': input = <ColorInput value={value} onChange={onChange} />; break;
    case 'icon': input = <IconField value={value} onChange={onChange} />; break;
    case 'image': input = <ImageField value={value} onChange={onChange} />; break;
    case 'list': input = <ListField field={f} value={value} onChange={onChange} lang={lang} />; break;
    default: input = <input type="text" value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className={`field field-${f.type}`}>
      <label className="field-label">{f.label}</label>
      {input}
      {f.help && <small className="help">{f.help}</small>}
    </div>
  );
}

export function ColorInput({ value, onChange }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000';
  return (
    <div className="color-input">
      <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="#rrggbb" />
    </div>
  );
}

export function Form({ fields, value, onChange, lang }) {
  const obj = value || {};
  return (
    <div className="form">
      {fields.filter((f) => !f.showIf || f.showIf(obj)).map((f) => (
        <Field key={f.key} field={f} value={obj[f.key]} lang={lang} onChange={(v) => onChange({ ...obj, [f.key]: v })} />
      ))}
    </div>
  );
}
