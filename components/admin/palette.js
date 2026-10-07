// Pull the dominant brand colors out of a logo and build a matching theme.
const toHex = (r, g, b) => '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
  }
  return [h, s, l];
}
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return toHex(f(0) * 255, f(8) * 255, f(4) * 255);
}
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

export async function extractTheme(url) {
  const img = new Image(); img.crossOrigin = 'anonymous'; img.src = url; await img.decode();
  const S = 80, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0, S, S);
  const d = g.getImageData(0, 0, S, S).data; const buckets = new Map();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue;
    const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
    if (s < 0.25 || l < 0.12 || l > 0.9) continue;
    const key = Math.round(h / 12);
    const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0, s: 0 };
    b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; b.s += s; buckets.set(key, b);
  }
  const ranked = [...buckets.entries()].map(([k, b]) => ({ k, hex: toHex(b.r / b.n, b.g / b.n, b.b / b.n), score: b.n * (0.4 + b.s / b.n) })).sort((a, b) => b.score - a.score);
  if (!ranked.length) throw new Error('logo has no strong colors');
  const brand = ranked[0].hex;
  const [h, s] = rgb2hsl(...[1, 3, 5].map((i) => parseInt(brand.slice(i, i + 2), 16)));
  const second = ranked.find((x) => Math.min(Math.abs(x.k - ranked[0].k), 30 - Math.abs(x.k - ranked[0].k)) >= 3);
  const brand2 = second ? second.hex : hsl(h + 28, Math.min(1, s + 0.05), 0.5);
  return {
    brand, brand2,
    bg: hsl(h, 0.35, 0.05), surface: hsl(h, 0.3, 0.1), surface2: hsl(h, 0.28, 0.14),
    text: hsl(h, 0.2, 0.93), muted: hsl(h, 0.12, 0.66),
    onBrand: lum(brand) > 0.45 ? '#111111' : '#ffffff', line: '',
  };
}
