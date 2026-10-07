// Replace {brand} and {year} in every string, so renaming the brand in the admin updates all copy.
export function applyTokens(content) {
  const brand = content?.site?.brandName || '';
  const year = String(new Date().getFullYear());
  const walk = (v, key) => {
    if (typeof v === 'string') return key === 'brandName' ? v : v.replaceAll('{brand}', brand).replaceAll('{year}', year);
    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    return v;
  };
  return walk(content);
}
