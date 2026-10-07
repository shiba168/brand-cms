'use client';
import { useState } from 'react';

export default function Login() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="login">
      <form onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr('');
        const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
        const j = await r.json().catch(() => ({}));
        setBusy(false);
        if (r.ok) location.href = '/admin'; else setErr(j.error || 'Login failed');
      }}>
        <h1>Site editor</h1>
        <p className="muted">Enter the admin password set in Vercel (ADMIN_PASSWORD).</p>
        <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" />
        {err && <div className="err">{err}</div>}
        <button className="btn primary" disabled={busy || !pw}>{busy ? 'Checking…' : 'Log in'}</button>
      </form>
    </div>
  );
}
