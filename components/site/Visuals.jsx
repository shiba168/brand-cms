import { t } from '@/lib/i18n';
import { Icon } from './bits';
import { Logo } from './Chrome';

const PHONE_TXT = {
  ms: { badge: 'Ahli Baharu', title: 'Bonus Alu-aluan Menanti Anda', cta: 'Tuntut Sekarang', live: '● LANGSUNG', tiles: ['Sukan', 'Kasino', 'Slot', 'Esports', 'Ikan', '4D'] },
  en: { badge: 'New Members', title: 'Your Welcome Bonus Awaits', cta: 'Claim Now', live: '● LIVE', tiles: ['Sports', 'Casino', 'Slots', 'Esports', 'Fishing', '4D'] },
};

export function PhoneVisual({ s, site, lang }) {
  const x = PHONE_TXT[lang] || PHONE_TXT.ms;
  const icons = ['football', 'cards', 'slot', 'gamepad', 'fish', 'dice'];
  return (
    <div aria-hidden="true">
      <div className="phone"><div className="screen">
        <div className="scr-top"><span className="logo"><Logo site={site} small /></span><span className="bal">{s.phoneBalance || 'RM 1,250.00'}</span></div>
        <div className="scr-banner"><small>{t(s.phoneBadge, lang) || x.badge}</small><strong>{t(s.phoneTitle, lang) || x.title}</strong><em>{x.cta}</em></div>
        <div className="tiles">{x.tiles.map((l, i) => <div className="tile" key={i}><Icon name={icons[i]} sw={1.8} />{l}</div>)}</div>
        <div className="match">
          <div className="row"><b>{s.phoneMatch || 'JDT vs Selangor'}</b><span className="live">{x.live}</span></div>
          <div className="odds"><span>1.85</span><span>3.40</span><span>4.10</span></div>
        </div>
      </div></div>
    </div>
  );
}

const NUMS = [[7, 22, 38, 51, 66], [3, 19, 33, 47, 72], [12, 28, null, 58, 61], [9, 17, 44, 53, 70], [1, 25, 36, 49, 64]];
const HITS = new Set(['0,0', '1,1', '3,3', '4,4', '0,3', '3,0', '2,4']);
const BINGO_TXT = { ms: { free: 'BEBAS', room: 'Bilik 75 Bola', round: 'Pusingan #4821', calls: 'Nombor terkini:' }, en: { free: 'FREE', room: '75-Ball Room', round: 'Round #4821', calls: 'Latest calls:' } };

export function BingoVisual({ lang }) {
  const x = BINGO_TXT[lang] || BINGO_TXT.ms;
  return (
    <div className="bcard" aria-hidden="true">
      <div className="bcard-top"><b>{x.room}</b><span>{x.round}</span></div>
      <div className="bgrid">
        {'BINGO'.split('').map((l) => <div className="h" key={l}>{l}</div>)}
        {NUMS.flatMap((row, r) => row.map((n, c) => (
          <div key={`${r}${c}`} className={`c${n === null ? ' free hit' : HITS.has(`${r},${c}`) ? ' hit' : ''}`}><span>{n === null ? x.free : n}</span></div>
        )))}
      </div>
      <div className="called"><span>{x.calls}</span>{['G-53', 'B-7', 'O-66', 'I-19', 'N-38'].map((b) => <i key={b}>{b}</i>)}</div>
    </div>
  );
}

export function OddsBoard({ s, lang }) {
  const labels = ['1', 'X', '2'];
  return (
    <div className="board" aria-hidden="true">
      <h3>{t(s.boardTitle, lang)} <span className="live">{lang === 'en' ? '● LIVE' : '● LANGSUNG'}</span></h3>
      {(s.fixtures || []).map((f, i) => (
        <div className="fx" key={i}>
          <div className="t"><span>{f.home}</span><span>{f.away}</span></div>
          <div className="m">{t(f.meta, lang)}</div>
          <div className="odds">{[f.o1, f.ox, f.o2].map((o, j) => <span key={j}><small>{labels[j]}</small>{o || '—'}</span>)}</div>
        </div>
      ))}
      {t(s.boardNote, lang) && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>{t(s.boardNote, lang)}</p>}
    </div>
  );
}

export function Visual({ kind, s, site, lang }) {
  if (kind === 'phone') return <PhoneVisual s={s} site={site} lang={lang} />;
  if (kind === 'bingo') return <BingoVisual lang={lang} />;
  if (kind === 'odds') return <OddsBoard s={s} lang={lang} />;
  if (kind === 'image' && s.image) return <img className="hero-image" src={s.image} alt={t(s.imageAlt, lang) || ''} />;
  return null;
}
