# DreamAI Website

Source for [dream-ai-lab.github.io](https://dream-ai-lab.github.io) — an Astro static site
deployed to GitHub Pages. Content lives as Markdown/JSON files; a Decap CMS admin provides
a form-based editor over the same files.

## Develop locally

```bash
npm install
npm run dev        # http://localhost:4321
```

Other scripts: `npm run build`, `npm run preview`, `npm run check` (types), `npm test` (unit tests).

## Adding / editing content

Content is the source of truth in `src/content/` (and `src/data/site.json`). There are
three ways to edit it:

### 1. GitHub web editor (no setup)
Browse to a file under `src/content/...` on GitHub, click the pencil, edit, and commit.
- **News** → `src/content/news/*.md`
- **Publications** → `src/content/publications/*.md`
- **People** → `src/content/people/*.md`
- **Resources** → `src/content/resources/*.md`
- **Research directions** → `src/content/research/*.md`
- **Site text / mission / hero / stats** → `src/data/site.json`

Copy an existing file as a template. After committing to `main`, GitHub Actions rebuilds and
publishes automatically (~1–2 min).

### 2. Local CMS GUI (form-based, no accounts)
Run **both** processes (two terminals):
```bash
npm run dev        # terminal 1 — serves the site
npm run cms        # terminal 2 — Decap local backend (port 8081)
```
Then open **http://localhost:4321/admin/index.html** — edit via forms; saving writes directly
to the local content files. Commit with git as usual.

> **Dev URL gotcha:** with `npm run dev` you must use the full `/admin/index.html` path —
> Astro's dev server doesn't serve a directory index, so `/admin/` returns 404. On the deployed
> site (and via `npm run preview`) plain `/admin/` works. Both processes must be running or
> Decap can't reach the local backend.

### 3. Hosted admin (optional, future)
To let members log in at `https://dream-ai-lab.github.io/admin/` from any browser, deploy a
small OAuth proxy (e.g. a free Cloudflare Worker) and register a GitHub OAuth App, then point
`backend` in `public/admin/config.yml` at it. Until then, use options 1–2.

## How the homepage stats work
`# Publications`, `# Datasets`, and `# Benchmarks` are counted automatically from the content.
`# Members` auto-counts active people unless `stats_manual.members` is set in `site.json`.
Add other figures (e.g. citations) under `stats_manual.extra`.

## Publication project pages
Every publication gets a detail page at `/publications/<file-name>`, styled like an academic
project page (hero with title + authors + link buttons → abstract → video → BibTeX). These
frontmatter fields enrich it (all optional):

- `abstract` — shown in the Abstract section
- `image` + `teaser` — teaser figure and its caption
- `links.video` — a YouTube/embed URL (auto-embedded); plus `links.poster`, `links.slides`
- the Markdown **body** (below the frontmatter) renders as the method/results sections

BibTeX is generated automatically, and DreamAI members listed in `authors` are bolded.

## Images & assets
Static images live in `public/images/`:
- `hero.jpg` — homepage hero background (square works best; referenced by `hero.image` in `site.json`)
- `people/<slug>.jpg` — team photos (a gradient + initials placeholder shows until one is added)
- `og-card.jpg` — the social / link-preview card (Open Graph + Twitter)

Research-direction icons use **Lucide** icon names (e.g. `brain-circuit`, see
https://lucide.dev/icons) rather than emoji.

## Deployment
Pushing to `main` triggers `.github/workflows/deploy.yml`. In the repo settings, set
**Settings → Pages → Build and deployment → Source = GitHub Actions** (one-time).
