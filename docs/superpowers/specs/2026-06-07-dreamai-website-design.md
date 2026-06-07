# DreamAI Website — Design Spec

**Date:** 2026-06-07
**Status:** Approved (design), pending implementation plan
**Owner org:** `dream-ai-lab` (GitHub)

## 1. Purpose

A public website for the **DreamAI** research group that:

1. Presents the group, its mission/vision, research directions, people, publications, resources, and news.
2. Can be **updated easily** — including by non-technical members — without rebuilding or redeploying by hand.
3. Is hosted for free on **GitHub Pages**.

Language: **English**.

References for tone/structure: [CAIR VinUni](https://cair.vinuni.edu.vn/), [greenelab lab-website-template](https://greenelab.github.io/lab-website-template/).

## 2. Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | **Astro** (v5, Content Collections) | Static output for GitHub Pages; content-as-files; great DX. |
| Styling | **Tailwind CSS v4** + design tokens | Fast, consistent; content editing is unaffected (Markdown/CMS). |
| Theme | **Academic Clean, light only** | Navy/blue, serif headings, credible research-lab feel. Dark mode deferred. |
| Content storage | **Markdown/YAML files in the repo** | Single source of truth for both the rendered site and the CMS. |
| Content editing | **Decap CMS** at `/admin` | GUI for non-technical members; commits back to git; 100% static-compatible. |
| CMS auth (now) | **GitHub web editor + Decap `local_backend`** | Zero extra infrastructure today. |
| CMS auth (later) | **Cloudflare Worker OAuth proxy** (optional) | Enables hosted anywhere-browser login; additive, no rework. |
| Hosting | **GitHub Pages org site** → `https://dream-ai-lab.github.io` (root path) | Cleanest URLs; org already exists. |
| Deploy | **GitHub Actions** (official Astro → Pages action) | Auto-build & publish on push to `main`. |
| Homepage hero | **Split layout** (mission left, abstract graphic right) | Chosen in visual review. |
| Stats | **Auto-computed** where possible + manual extras | Counts stay honest; flexibility for citations/members. |
| News | **Full Markdown posts with detail pages** | Supports real announcements/blog-style updates. |

### Considered and rejected
- **Tina / external headless CMS** — heavier setup/accounts than needed.
- **Netlify Identity / GitLab PKCE** (no-proxy auth) — would force a different host than GitHub Pages.
- **Direct use of the Jekyll greenelab template / Hugo** — user chose Astro.
- **Dark mode, per-person profile pages, external search** — deferred (YAGNI); addable later without rework.

## 3. Architecture overview

```
Markdown/YAML content  ──┐
(src/content/*)          ├─►  Astro build (Content Collections + zod schemas)  ──►  static HTML/CSS  ──►  GitHub Pages
public/admin (Decap) ────┘                                                                  ▲
                                                                                            │
Editors:  GitHub web editor  /  local Decap GUI  /  (later) hosted /admin via OAuth Worker ─┘
                         all write the SAME Markdown files → git → Actions rebuild
```

Single source of truth = the content files. Every editing path converges on git; every render path reads the same files. The CMS is a convenience layer, never a separate datastore.

## 4. Content model

All collections defined in `src/content.config.ts` with zod schemas. Decap `config.yml` field names mirror the frontmatter exactly.

### 4.1 `publications`
- `title` (string, req)
- `authors` (string[], req) — DreamAI members can be flagged for bolding (e.g. by matching `people` names)
- `year` (number, req)
- `date` (date, optional — for ordering within a year)
- `venue` (string, req) — e.g. "NeurIPS 2025"
- `type` (enum: conference | journal | preprint | workshop | thesis, req)
- `links` (object, optional): `pdf`, `arxiv`, `code`, `project`, `bibtex`, `doi`
- `abstract` (string, optional)
- `image` (image, optional — teaser)
- `tags` (string[], optional — research areas)
- `featured` (boolean, default false)
- `award` (string, optional — e.g. "Best Paper")

### 4.2 `people`
- `name` (string, req)
- `role` (enum: pi | core | researcher | phd | msc | intern | alumni | collaborator, req)
- `photo` (image, optional)
- `title` (string, optional — e.g. "Assistant Professor")
- `affiliation` (string, optional)
- `bio` (string/markdown, optional)
- `interests` (string[], optional)
- `links` (object, optional): `email`, `scholar`, `github`, `twitter`, `linkedin`, `website`
- `order` (number, default 0 — manual sort within role)
- `active` (boolean, default true)

### 4.3 `news`
- `title` (string, req)
- `date` (date, req)
- `image` (image, optional)
- `summary` (string, req — used in feed + homepage)
- `tags` (string[], optional)
- `body` (Markdown — the post content)

### 4.4 `resources`
- `name` (string, req)
- `description` (string, req)
- `category` (enum: github | library | dataset | benchmark | tool | model, req)
- `url` (string, req)
- `links` (object, optional): `repo`, `paper`, `docs`
- `tags` (string[], optional)
- `featured` (boolean, default false)

### 4.5 `research` (research directions)
- `title` (string, req)
- `summary` (string, req)
- `icon` (string, optional — icon name or emoji)
- `order` (number, default 0)
- `body` (Markdown, optional)

### 4.6 `site` (single config entry — `src/content/site/site.yaml`, edited via a Decap *file* collection)
- `mission` (string)
- `vision` (string)
- `tagline` / hero heading + subheading
- `social` (object): `github`, `twitter`, `scholar`, `email`, …
- `stats_manual` (object): `members` (or auto), `citations`, `years_active`, etc.
- `contact` (email/address)

## 5. Stats logic

Computed at build time from collections:
- **Publications** = count of `publications`
- **Datasets** = count of `resources` where `category == dataset`
- **Benchmarks** = count of `resources` where `category == benchmark`
- **Members** = count of `people` where `active == true` (or manual override)

Manual extras (citations, years active, etc.) come from `site.stats_manual`. The homepage stats bar renders a configurable ordered list mixing computed + manual values.

## 6. Pages

| Route | Content |
|---|---|
| `/` | Nav → **split Hero** → Stats bar → Mission/Vision → Research Directions (grid) → Highlights/Latest News (latest 3) → Core Team (PIs + core) → Footer |
| `/people` | Grouped sections by role: PIs → Core Team → Researchers → Students (phd/msc/intern) → Alumni. Person cards with photo, title, interests, links, inline bio. |
| `/publications` | Grouped by year (desc). Lightweight **client-side filter** by type and/or tag. Per-paper: title, authors (members bolded), venue, links, **copy-BibTeX** button. Featured subset reused on Home. |
| `/resources` | Cards grouped by category (GitHub repos, libraries, datasets, benchmarks, tools, models). |
| `/news` | Reverse-chronological feed (image, date, title, summary). |
| `/news/[slug]` | Full Markdown post page. |
| `/admin` | Decap CMS (static `public/admin/index.html` + `config.yml`). |

## 7. Components & layout

- **Layouts:** `BaseLayout` (head/SEO/meta/nav/footer), `PageLayout`, `NewsLayout`.
- **Components:** `Nav`, `Footer`, `Hero` (split), `StatsBar`, `ResearchCard`, `PublicationItem`, `BibtexButton`, `PersonCard`, `NewsCard`, `ResourceCard`, `SectionHeading`, `SEO`.
- **Styling:** Tailwind v4 with design tokens (CSS custom properties) for the navy/blue palette, serif heading font + sans body font (Google Fonts, self-hosted or `@fontsource`).
- Each component has one clear purpose, reads from typed collection entries, and is independently understandable.

## 8. Repository structure

```
/
├─ astro.config.mjs            # site: https://dream-ai-lab.github.io, base: '/'
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ content.config.ts        # collections + zod schemas
│  ├─ content/
│  │  ├─ publications/*.md
│  │  ├─ people/*.md
│  │  ├─ news/*.md
│  │  ├─ resources/*.md
│  │  ├─ research/*.md
│  │  └─ site/site.yaml         # single config entry (data collection)
│  ├─ components/
│  ├─ layouts/
│  ├─ pages/                    # index, people, publications, resources, news/index, news/[slug]
│  └─ styles/global.css         # Tailwind + tokens
├─ public/
│  ├─ admin/
│  │  ├─ index.html             # Decap CMS loader
│  │  └─ config.yml             # Decap collections (mirror schemas) + local_backend + github backend
│  └─ images/uploads/           # CMS media target
├─ .github/workflows/deploy.yml # Astro → GitHub Pages
├─ .gitignore                   # node_modules, dist, .superpowers/
└─ README.md                    # content-editing guide + dev/deploy instructions
```

## 9. Editing workflows (documented in README)

1. **GitHub web editor** — browse to a file in `src/content/...`, edit, commit. Zero setup; works for anyone with org write access.
2. **Local Decap GUI** — `npm run dev` + `npx decap-server`, open `/admin` locally; form-based editing of the same files.
3. **Hosted `/admin`** (future, optional) — add a Cloudflare Worker OAuth proxy + GitHub OAuth App so members can log in from any browser.

Each path commits Markdown to `main`; GitHub Actions rebuilds and publishes automatically.

## 10. Deployment

- `astro.config.mjs`: `site: 'https://dream-ai-lab.github.io'`, `base: '/'` (root, org site).
- `.github/workflows/deploy.yml`: official `withastro/action` → `actions/deploy-pages` on push to `main`. Pages source = GitHub Actions.
- Decap `config.yml` backend: `name: github`, `repo: dream-ai-lab/dream-ai-lab.github.io`, `branch: main`, `local_backend: true`, `media_folder: public/images/uploads`, `public_folder: /images/uploads`.

## 11. Out of scope (v1)

- Hosted `/admin` OAuth Worker (additive later).
- Dark mode / theme toggle.
- Per-person profile detail pages.
- External/site-wide search service.
- Custom domain (root org URL for now; CNAME addable later).

## 12. Success criteria

- `npm run build` produces a static site with all five sections populated from sample content.
- Adding a Markdown file to `src/content/publications/` (or via local Decap GUI) makes the publication appear on `/publications` and updates the homepage publications count after rebuild.
- Pushing to `main` auto-deploys to `https://dream-ai-lab.github.io`.
- Homepage renders the split hero, auto-computed stats, research directions, latest news, and core team.
- A non-technical member can add a news post via the GitHub web editor following the README, with no local tooling.
