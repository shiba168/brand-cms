// Field definitions that drive the admin editor.
// Types: text, textarea, i18n, i18nArea, select, bool, number, color, icon, image, list, group
const I = (ms = '', en = '') => ({ ms, en });

const head = [
  { key: 'eyebrow', label: 'Small label above title', type: 'i18n' },
  { key: 'title', label: 'Title (H2)', type: 'i18n' },
  { key: 'lead', label: 'Intro text', type: 'i18nArea', rows: 2 },
];
const common = [
  { key: 'background', label: 'Background', type: 'select', options: [['none', 'Page background'], ['surface', 'Raised panel']] },
  { key: 'tight', label: 'Remove top spacing', type: 'bool' },
  { key: 'anchor', label: 'Anchor id (for #links)', type: 'text', placeholder: 'e.g. faq' },
];
const buttons = {
  key: 'buttons', label: 'Buttons', type: 'list', itemLabel: (b, l) => b.label?.[l] || 'Button', newItem: () => ({ label: I('Daftar', 'Register'), href: '{register}', style: 'primary' }),
  fields: [
    { key: 'label', label: 'Label', type: 'i18n' },
    { key: 'href', label: 'Link', type: 'text', help: 'Use {register} or {login} for your tracking links, /page for internal pages, or a full URL.' },
    { key: 'style', label: 'Style', type: 'select', options: [['primary', 'Solid'], ['ghost', 'Outline']] },
  ],
};
const bodyHelp = 'Blank line = new paragraph · **bold** · [link text](/page)';
const asideRows = { key: 'asideRows', label: 'Panel rows', type: 'i18nArea', rows: 4, help: 'One per line: Label | Value' };
const asideChips = { key: 'asideChips', label: 'Panel chips (comma separated)', type: 'text', placeholder: 'FPX, Maybank, CIMB' };

export const SECTION_TYPES = {
  hero: {
    label: 'Hero', desc: 'Page header with H1, buttons and optional visual',
    fields: [
      { key: 'breadcrumb', label: 'Show breadcrumb (inner pages)', type: 'bool' },
      { key: 'eyebrow', label: 'Small label above title', type: 'i18n' },
      { key: 'title', label: 'H1 title', type: 'i18nArea', rows: 2 },
      { key: 'highlight', label: 'Highlighted words', type: 'i18n', help: 'Must appear exactly in the title — shown in brand color' },
      { key: 'lead', label: 'Intro text', type: 'i18nArea', rows: 3 },
      buttons,
      { key: 'visual', label: 'Right-side visual', type: 'select', options: [['none', 'None (full width)'], ['phone', 'Phone mockup'], ['bingo', 'Bingo card'], ['image', 'Image']] },
      { key: 'image', label: 'Image', type: 'image', showIf: (s) => s.visual === 'image' },
      { key: 'phoneBadge', label: 'Phone banner label', type: 'i18n', showIf: (s) => s.visual === 'phone' },
      { key: 'phoneTitle', label: 'Phone banner title', type: 'i18n', showIf: (s) => s.visual === 'phone' },
      { key: 'trust', label: 'Tick list under buttons', type: 'list', itemLabel: (x, l) => x.text?.[l], newItem: () => ({ text: I() }), fields: [{ key: 'text', label: 'Text', type: 'i18n' }] },
      { key: 'minis', label: 'Feature boxes', type: 'list', itemLabel: (x, l) => x.title?.[l], newItem: () => ({ icon: 'bolt', title: I(), body: I() }),
        fields: [{ key: 'icon', label: 'Icon', type: 'icon' }, { key: 'title', label: 'Title', type: 'i18n' }, { key: 'body', label: 'Text', type: 'i18n' }] },
      { key: 'stats', label: 'Stats', type: 'list', itemLabel: (x, l) => `${x.value || ''} ${x.label?.[l] || ''}`, newItem: () => ({ value: '', label: I() }),
        fields: [{ key: 'value', label: 'Number', type: 'text' }, { key: 'label', label: 'Label', type: 'i18n' }] },
      { key: 'anchor', label: 'Anchor id', type: 'text' },
    ],
    make: () => ({ visual: 'none', breadcrumb: true, eyebrow: I('Label', 'Label'), title: I('Tajuk halaman', 'Page title'), lead: I(), buttons: [{ label: I('Daftar Sekarang', 'Register Now'), href: '{register}', style: 'primary' }], minis: [], stats: [], trust: [] }),
  },
  cards: {
    label: 'Cards grid', desc: 'Features, games, bet types, benefits…',
    fields: [
      ...head,
      { key: 'layout', label: 'Layout', type: 'select', options: [['grid-4', '4 columns'], ['grid-3', '3 columns'], ['grid-2', '2 columns'], ['games', 'Game tiles (6 across, linked)']] },
      { key: 'boxed', label: 'Put inside a highlighted box', type: 'bool' },
      { key: 'badge', label: 'Round badge (e.g. 18+)', type: 'text', showIf: (s) => s.boxed },
      { key: 'items', label: 'Cards', type: 'list', itemLabel: (x, l) => x.title?.[l], newItem: () => ({ icon: 'star', title: I('Tajuk', 'Title'), body: I() }),
        fields: [
          { key: 'icon', label: 'Icon', type: 'icon' },
          { key: 'title', label: 'Title', type: 'i18n' },
          { key: 'body', label: 'Text', type: 'i18nArea', rows: 3 },
          { key: 'href', label: 'Link (game tiles / "read more")', type: 'text' },
          { key: 'linkLabel', label: 'Read-more label', type: 'i18n' },
          { key: 'tags', label: 'Tags (comma separated)', type: 'i18n' },
          { key: 'code', label: 'Corner badge', type: 'text', placeholder: 'e.g. 1X2' },
          { key: 'example', label: 'Example box', type: 'i18n' },
          { key: 'stat1', label: 'Stat 1 value', type: 'text' }, { key: 'stat1Label', label: 'Stat 1 label', type: 'i18n' },
          { key: 'stat2', label: 'Stat 2 value', type: 'text' }, { key: 'stat2Label', label: 'Stat 2 label', type: 'i18n' },
        ] },
      buttons,
      ...common,
    ],
    make: () => ({ layout: 'grid-3', eyebrow: I('Label', 'Label'), title: I('Tajuk bahagian', 'Section title'), lead: I(), items: [{ icon: 'star', title: I('Kad 1', 'Card 1'), body: I() }] }),
  },
  prose: {
    label: 'Article text', desc: 'Paragraphs for SEO copy, with optional side panel',
    fields: [
      { key: 'eyebrow', label: 'Small label above title', type: 'i18n' },
      { key: 'title', label: 'Title (H2)', type: 'i18n' },
      { key: 'body', label: 'Text', type: 'i18nArea', rows: 12, help: bodyHelp },
      { key: 'asideTitle', label: 'Side panel title (leave empty for no panel)', type: 'i18n' },
      { key: 'asideChecks', label: 'Panel tick list', type: 'i18nArea', rows: 4, help: 'One per line' },
      asideRows, asideChips,
      ...common,
    ],
    make: () => ({ eyebrow: I(), title: I('Tajuk', 'Title'), body: I('Perenggan pertama.\n\nPerenggan kedua.', 'First paragraph.\n\nSecond paragraph.') }),
  },
  split: {
    label: 'Text + visual', desc: 'Text on one side, odds board / phone / image on the other',
    fields: [
      { key: 'eyebrow', label: 'Small label above title', type: 'i18n' },
      { key: 'title', label: 'Title (H2)', type: 'i18n' },
      { key: 'body', label: 'Text', type: 'i18nArea', rows: 6, help: bodyHelp },
      { key: 'chips', label: 'Chips (comma separated)', type: 'i18n' },
      { key: 'bodyAfter', label: 'Text after chips', type: 'i18nArea', rows: 3 },
      buttons,
      { key: 'visual', label: 'Visual', type: 'select', options: [['odds', 'Odds board'], ['phone', 'Phone mockup'], ['bingo', 'Bingo card'], ['image', 'Image']] },
      { key: 'reverse', label: 'Visual on the left', type: 'bool' },
      { key: 'image', label: 'Image', type: 'image', showIf: (s) => s.visual === 'image' },
      { key: 'phoneBadge', label: 'Phone banner label', type: 'i18n', showIf: (s) => s.visual === 'phone' },
      { key: 'phoneTitle', label: 'Phone banner title', type: 'i18n', showIf: (s) => s.visual === 'phone' },
      { key: 'boardTitle', label: 'Board title', type: 'i18n', showIf: (s) => (s.visual || 'odds') === 'odds' },
      { key: 'fixtures', label: 'Matches', type: 'list', showIf: (s) => (s.visual || 'odds') === 'odds', itemLabel: (x) => `${x.home || ''} vs ${x.away || ''}`,
        newItem: () => ({ home: 'Home', away: 'Away', meta: I(), o1: '1.90', ox: '3.20', o2: '3.80' }),
        fields: [{ key: 'home', label: 'Home', type: 'text' }, { key: 'away', label: 'Away', type: 'text' }, { key: 'meta', label: 'League · time', type: 'i18n' },
          { key: 'o1', label: 'Odds 1', type: 'text' }, { key: 'ox', label: 'Odds X', type: 'text' }, { key: 'o2', label: 'Odds 2', type: 'text' }] },
      { key: 'boardNote', label: 'Board footnote', type: 'i18n', showIf: (s) => (s.visual || 'odds') === 'odds' },
      ...common,
    ],
    make: () => ({ visual: 'odds', title: I('Tajuk', 'Title'), body: I(), fixtures: [], boardTitle: I('Langsung Sekarang', 'Live Now') }),
  },
  table: {
    label: 'Table', desc: 'Comparison or markets table',
    fields: [
      ...head,
      { key: 'columns', label: 'Column headers (comma separated)', type: 'i18n' },
      { key: 'rows', label: 'Rows', type: 'i18nArea', rows: 8, help: 'One row per line, cells separated by | — "yes"/"no" become ✓ / ✗' },
      { key: 'highlightLast', label: 'Highlight last column', type: 'bool' },
      ...common,
    ],
    make: () => ({ title: I('Perbandingan', 'Comparison'), columns: I('Ciri, A, B', 'Feature, A, B'), rows: I('Contoh | yes | no', 'Example | yes | no') }),
  },
  steps: {
    label: 'Steps', desc: 'Numbered how-to steps',
    fields: [
      ...head,
      { key: 'items', label: 'Steps', type: 'list', itemLabel: (x, l) => x.title?.[l], newItem: () => ({ title: I(), body: I() }), fields: [{ key: 'title', label: 'Title', type: 'i18n' }, { key: 'body', label: 'Text', type: 'i18nArea', rows: 2 }] },
      { key: 'howTo', label: 'Add HowTo schema for Google', type: 'bool' },
      ...common,
    ],
    make: () => ({ title: I('Cara Bermula', 'How to Start'), items: [1, 2, 3, 4].map((n) => ({ title: I(`Langkah ${n}`, `Step ${n}`), body: I() })), howTo: true }),
  },
  tips: {
    label: 'Tips + panel', desc: 'Numbered tips with a side panel',
    fields: [
      { key: 'eyebrow', label: 'Small label above title', type: 'i18n' },
      { key: 'title', label: 'Title (H2)', type: 'i18n' },
      { key: 'items', label: 'Tips', type: 'list', itemLabel: (x, l) => x.title?.[l], newItem: () => ({ title: I(), body: I() }), fields: [{ key: 'title', label: 'Title', type: 'i18n' }, { key: 'body', label: 'Text', type: 'i18nArea', rows: 2 }] },
      { key: 'asideTitle', label: 'Panel title', type: 'i18n' },
      asideRows,
      { key: 'asidePatterns', label: 'Bingo patterns', type: 'list', itemLabel: (x, l) => x.title?.[l], newItem: () => ({ pattern: 'line', title: I(), body: I() }),
        fields: [{ key: 'pattern', label: 'Pattern', type: 'select', options: [['line', 'Line'], ['corners', 'Four corners'], ['x', 'Letter X'], ['diagonal', 'Diagonal'], ['full', 'Full house']] }, { key: 'title', label: 'Title', type: 'i18n' }, { key: 'body', label: 'Text', type: 'i18n' }] },
      asideChips,
      ...common,
    ],
    make: () => ({ title: I('Tips', 'Tips'), items: [{ title: I(), body: I() }], asideTitle: I('Maklumat', 'Info'), asideRows: I('Label | Nilai', 'Label | Value') }),
  },
  faq: {
    label: 'FAQ', desc: 'Questions & answers (adds FAQ schema)',
    fields: [
      ...head,
      { key: 'items', label: 'Questions', type: 'list', itemLabel: (x, l) => x.q?.[l], newItem: () => ({ q: I(), a: I() }), fields: [{ key: 'q', label: 'Question', type: 'i18n' }, { key: 'a', label: 'Answer', type: 'i18nArea', rows: 3, help: '**bold** and [links](/page) allowed' }] },
      ...common,
    ],
    make: () => ({ eyebrow: I('Soalan Lazim', 'FAQ'), title: I('Soalan Lazim', 'Frequently Asked Questions'), items: [{ q: I('Soalan?', 'Question?'), a: I('Jawapan.', 'Answer.') }] }),
  },
  cta: {
    label: 'Call to action', desc: 'Brand-colored banner with buttons',
    fields: [{ key: 'title', label: 'Title', type: 'i18n' }, { key: 'text', label: 'Text', type: 'i18nArea', rows: 2 }, buttons, { key: 'tight', label: 'Remove top spacing', type: 'bool' }],
    make: () => ({ tight: true, title: I('Sedia untuk bermula?', 'Ready to start?'), text: I(), buttons: [{ label: I('Daftar Sekarang', 'Register Now'), href: '{register}', style: 'primary' }, { label: I('Log Masuk', 'Log In'), href: '{login}', style: 'ghost' }] }),
  },
  html: {
    label: 'Custom HTML', desc: 'Paste your own HTML block',
    fields: [{ key: 'html', label: 'HTML', type: 'i18nArea', rows: 12, mono: true, help: 'Rendered as-is inside the page width. Scripts are not recommended.' }, ...common],
    make: () => ({ html: I('<p>…</p>', '<p>…</p>') }),
  },
};

export const SITE_GROUPS = [
  { title: 'Brand', fields: [
    { key: 'brandName', label: 'Brand name', type: 'text', help: 'Every {brand} in your page text is replaced with this.' },
    { key: 'logoUrl', label: 'Logo', type: 'image', help: 'PNG/SVG with transparent background works best.' },
    { key: 'logoHeight', label: 'Logo height (px)', type: 'number' },
    { key: 'showBrandText', label: 'Also show brand name as text next to logo', type: 'bool' },
    { key: 'logoMark', label: 'Letter mark (used when no logo)', type: 'text' },
    { key: 'faviconUrl', label: 'Favicon', type: 'image' },
    { key: 'ogImage', label: 'Default social share image (1200×630)', type: 'image' },
    { key: 'font', label: 'Font', type: 'select', options: [['system', 'System (fastest)'], ['Inter', 'Inter'], ['Poppins', 'Poppins'], ['Montserrat', 'Montserrat'], ['Plus Jakarta Sans', 'Plus Jakarta Sans'], ['Outfit', 'Outfit'], ['Kanit', 'Kanit'], ['Sora', 'Sora'], ['DM Sans', 'DM Sans']] },
  ] },
  { title: 'Links & buttons', fields: [
    { key: 'domain', label: 'Live domain', type: 'text', help: 'e.g. https://yourbrand.com — used for canonical, hreflang, sitemap.' },
    { key: 'registerUrl', label: 'Register link ({register})', type: 'text' },
    { key: 'loginUrl', label: 'Login link ({login})', type: 'text' },
    { key: 'registerLabel', label: 'Header register button', type: 'i18n' },
    { key: 'loginLabel', label: 'Header login button', type: 'i18n' },
    { key: 'homeLabel', label: 'Breadcrumb "Home" label', type: 'i18n' },
    { key: 'supportEmail', label: 'Support email', type: 'text' },
  ] },
  { title: 'Site text', fields: [
    { key: 'notice', label: 'Top notice bar (leave empty to hide)', type: 'i18n' },
    { key: 'footerText', label: 'Footer description', type: 'i18nArea', rows: 2 },
    { key: 'copyright', label: 'Copyright line', type: 'i18n', help: '{year} and {brand} are filled in automatically.' },
  ] },
  { title: 'Languages & tracking', fields: [
    { key: 'enableEnglish', label: 'Publish English version (/en/)', type: 'bool' },
    { key: 'gaId', label: 'Google Analytics 4 ID', type: 'text', placeholder: 'G-XXXXXXX' },
    { key: 'googleVerification', label: 'Google Search Console verification code', type: 'text', placeholder: 'content value only' },
    { key: 'customBodyHtml', label: 'Extra tracking code (end of page)', type: 'textarea', rows: 4, mono: true },
  ] },
];

export const NAV_FIELDS = [
  { key: 'nav', label: 'Header menu', type: 'list', itemLabel: (x, l) => `${x.label?.[l] || ''}  →  ${x.href || ''}`, newItem: () => ({ label: I('Menu', 'Menu'), href: '/' }),
    fields: [{ key: 'label', label: 'Label', type: 'i18n' }, { key: 'href', label: 'Link', type: 'text' }] },
  { key: 'footerColumns', label: 'Footer columns', type: 'list', itemLabel: (x, l) => x.title?.[l], newItem: () => ({ title: I('Kolum', 'Column'), links: [] }),
    fields: [{ key: 'title', label: 'Column title', type: 'i18n' },
      { key: 'links', label: 'Links', type: 'list', itemLabel: (x, l) => `${x.label?.[l] || ''}  →  ${x.href || ''}`, newItem: () => ({ label: I(), href: '/' }), fields: [{ key: 'label', label: 'Label', type: 'i18n' }, { key: 'href', label: 'Link', type: 'text' }] }] },
];

export const THEME_KEYS = [
  ['brand', 'Brand (buttons, highlights)'], ['brand2', 'Gradient partner'], ['bg', 'Page background'], ['surface', 'Cards / panels'],
  ['surface2', 'Inner panels'], ['text', 'Text'], ['muted', 'Secondary text'], ['onBrand', 'Text on brand buttons'],
];

export const THEME_PRESETS = {
  'Gold': { brand: '#f5b301', brand2: '#ff7a00', bg: '#0a0e16', surface: '#121a29', surface2: '#18223a', text: '#e9edf5', muted: '#9aa6bd', onBrand: '#111111', line: '' },
  'Emerald': { brand: '#10d47a', brand2: '#06b6d4', bg: '#07110e', surface: '#0f1d18', surface2: '#16291f', text: '#e8f3ee', muted: '#94ada3', onBrand: '#062016', line: '' },
  'Royal blue': { brand: '#3b82f6', brand2: '#8b5cf6', bg: '#080c18', surface: '#10172b', surface2: '#172140', text: '#e8edf8', muted: '#97a3c0', onBrand: '#ffffff', line: '' },
  'Crimson': { brand: '#ef4444', brand2: '#f97316', bg: '#120909', surface: '#1d1111', surface2: '#2a1616', text: '#f6e9e9', muted: '#b59a9a', onBrand: '#ffffff', line: '' },
  'Purple': { brand: '#a855f7', brand2: '#ec4899', bg: '#0d0915', surface: '#171024', surface2: '#221735', text: '#efe9f8', muted: '#a99bbf', onBrand: '#ffffff', line: '' },
  'Light': { brand: '#e11d48', brand2: '#f59e0b', bg: '#f5f6fa', surface: '#ffffff', surface2: '#eef1f6', text: '#0f172a', muted: '#5b6476', onBrand: '#ffffff', line: 'rgba(15,23,42,0.10)' },
};
