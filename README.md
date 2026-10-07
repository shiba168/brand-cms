# Brand site template + admin (Next.js on Vercel)

A reusable casino/brand website with a built-in editor at **/admin**:
logo, favicon, theme colors (presets or auto-extracted from the logo), fonts,
header menu, footer, and every page with drag-free section editing — in
**Bahasa Melayu and English**. The SEO tags, hreflang, Schema (Organization,
WebSite, WebPage, Breadcrumb, HowTo, FAQPage), sitemap.xml and robots.txt are
all generated from what you enter.

Starts with 3 pages: Home, `/taruhan-sukan`, `/bingo` (+ English under `/en/...`).

---

## Deploy to Vercel (≈10 minutes)

1. **Put the code on GitHub** — create a new private repo and upload this folder
   (or run `npx vercel` inside the folder).
2. **Vercel → Add New → Project →** import the repo. Framework is detected as Next.js. Deploy.
3. **Project → Settings → Environment Variables:** add
   `ADMIN_PASSWORD` = a strong password (this is your /admin login).
4. **Project → Storage:**
   - **Create / connect "Upstash for Redis"** (Marketplace, free tier is plenty) → this stores your content.
     It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
   - **Create a "Blob" store** → this stores uploaded logos and images.
     It adds `BLOB_READ_WRITE_TOKEN` automatically.
5. **Deployments → Redeploy** (so the new variables are picked up).
6. Open `https://your-project.vercel.app/admin`, log in, and go to
   **Backup & history** — all three status lights should be green.
7. In **Brand & settings**, set **Live domain** to your real domain, then add
   that domain in Vercel → Settings → Domains.

Until Redis is connected the site shows the built-in starter content and the
admin will tell you saving is disabled.

## Launching another brand

Each brand = its own Vercel project from the **same GitHub repo**, with its own
Redis + Blob + `ADMIN_PASSWORD`. To start a new brand from an existing one:
**Backup & history → Download JSON** on the old site → **Import JSON** on the
new site → change brand name, logo, colors → **Save**.
Code updates pushed to GitHub deploy to every brand at once.

## Using the editor

| Where | What you can change |
|---|---|
| **Brand & settings** | Brand name, logo (upload), logo height, favicon, social image, font, live domain, Register/Login links, header button labels, notice bar, footer text, copyright, English on/off, GA4 ID, Search Console code, extra tracking code |
| **Theme colors** | 6 presets, **Extract colors from logo**, or pick each color; live preview |
| **Menu & footer** | Header links and footer columns |
| **Pages** | Add / duplicate / delete pages, draft or published, URL, meta title & description (with Google preview + length counters), and the page's **sections** |
| **Backup & history** | Connection status, export/import JSON, restore any of the last 20 saves, log out |

- **BM / EN switch** (top right) picks which language you are editing. Fields
  still missing a translation are highlighted, with a "copy BM/EN" shortcut.
- **{brand}** anywhere in text becomes your brand name. **{year}** becomes the current year.
- **Links:** `{register}` / `{login}` use your tracking links; `/bingo` is an internal
  page (automatically becomes `/en/bingo` on English pages); full URLs work too.
- **Text formatting** in paragraphs: blank line = new paragraph, `**bold**`,
  `[link text](/page)`.
- **Side preview** shows the saved version of the page (drafts included).
- **Ctrl/Cmd + S** saves. Saving updates the live site immediately.

### Section types
Hero · Cards grid (features, games, bet types, benefits, boxed 18+ block) ·
Article text (with optional side panel) · Text + visual (odds board / phone /
bingo card / image) · Table (yes/no → ✓/✗) · Steps (optional HowTo schema) ·
Tips + panel (rows or bingo patterns) · FAQ (adds FAQ schema) · Call to action ·
Custom HTML. Every section can be moved, duplicated, hidden or edited as JSON.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  — admin password is "admin" in dev
```
Locally, content saves to `.data/content.json` and uploads to `.data/uploads/`.

## Files
- `data/seed.json` — starter content (used until the first save)
- `components/site/` — public page renderer and section blocks
- `components/admin/` — the editor
- `lib/schemas.js` — editor fields for each section type
- `app/site.css` — site styles (colors come from the Theme tab)
