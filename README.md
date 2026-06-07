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
```bash
npm run cms        # starts the Decap local backend
npm run dev        # in a second terminal
```
Open http://localhost:4321/admin/ — edit via forms; changes write to the local files. Commit
with git as usual.

### 3. Hosted admin (optional, future)
To let members log in at `https://dream-ai-lab.github.io/admin/` from any browser, deploy a
small OAuth proxy (e.g. a free Cloudflare Worker) and register a GitHub OAuth App, then point
`backend` in `public/admin/config.yml` at it. Until then, use options 1–2.

## How the homepage stats work
`# Publications`, `# Datasets`, and `# Benchmarks` are counted automatically from the content.
`# Members` auto-counts active people unless `stats_manual.members` is set in `site.json`.
Add other figures (e.g. citations) under `stats_manual.extra`.

## Deployment
Pushing to `main` triggers `.github/workflows/deploy.yml`. In the repo settings, set
**Settings → Pages → Build and deployment → Source = GitHub Actions** (one-time).
