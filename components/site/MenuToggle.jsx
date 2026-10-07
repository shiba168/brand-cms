'use client';
import { useState } from 'react';

export default function MenuToggle() {
  const [open, setOpen] = useState(false);
  return (
    <button className="burger" aria-label="Menu" aria-controls="menu" aria-expanded={open}
      onClick={() => { const m = document.getElementById('menu'); m?.classList.toggle('open'); setOpen(!!m?.classList.contains('open')); }}>
      <span></span><span></span><span></span>
    </button>
  );
}
