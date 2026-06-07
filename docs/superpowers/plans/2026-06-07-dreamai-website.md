# DreamAI Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DreamAI research-group website — an Astro static site with content-as-Markdown, a Decap CMS admin, and automated GitHub Pages deployment.

**Architecture:** Content lives as Markdown/YAML/JSON files in `src/content` and `src/data`, validated by zod schemas in `src/content.config.ts`. Pure transform helpers in `src/lib/content.ts` (unit-tested with Vitest) turn that content into the shapes pages need. Astro pages + Tailwind v4 components render it to static HTML. Decap CMS (`public/admin`) edits the same files; GitHub Actions builds and publishes to GitHub Pages.

**Tech Stack:** Astro 5, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript (strict), Vitest, Decap CMS, `@fontsource` (Inter + Lora), GitHub Actions.

---

## Conventions

- **Palette tokens** (Tailwind v4): `navy #0A2540`, `blue #2563EB`, `blue-400 #60A5FA`, `mist #F1F5F9`. Utilities: `bg-navy`, `text-blue`, `font-serif`, etc.
- **Images**: CMS uploads go to `public/images/uploads/`; image fields are **string paths** (e.g. `/images/uploads/foo.jpg`), not Astro `image()` assets. (Simpler, matches the CMS workflow; image optimization deferred.)
- **Helpers are framework-agnostic and generic** — `src/lib/content.ts` must NOT import `astro:content`, so Vitest can run it. Functions use structural generics so Astro's zod-inferred data types satisfy them directly.
- **Verification model**: pure logic uses real TDD (Vitest). Astro pages/components are verified by `npm run check` (type + schema validation) and `npm run build` (must succeed) — these genuinely validate content schemas and prop types for a static site.
- Run all commands from the repo root `D:/workspace/dreamai`.

## File Structure

```
package.json                      # deps + scripts                         (Task 1)
astro.config.mjs                  # site URL, Tailwind plugin              (Task 1)
tsconfig.json                     # strict + JSON imports                  (Task 1)
src/styles/global.css             # Tailwind import + theme tokens         (Task 1)
src/pages/index.astro             # placeholder → real home (Task 5)       (Task 1, 5)
src/content.config.ts             # collections + zod schemas              (Task 2)
src/content/{publications,people,news,resources,research}/*.md  # samples  (Task 2)
src/data/site.json                # single site-config object              (Task 2)
src/lib/content.ts                # pure transform helpers                 (Task 3)
src/lib/content.test.ts           # Vitest unit tests                      (Task 3)
src/layouts/BaseLayout.astro      # html shell, fonts, SEO                 (Task 4)
src/components/Nav.astro          # top nav                                (Task 4)
src/components/Footer.astro       # footer                                 (Task 4)
src/components/SectionHeading.astro                                        (Task 4)
src/components/Hero.astro         # split hero                             (Task 5)
src/components/StatsBar.astro                                              (Task 5)
src/components/ResearchCard.astro                                         (Task 5)
src/components/NewsCard.astro                                              (Task 5)
src/components/PersonCard.astro                                           (Task 5)
src/pages/people.astro                                                    (Task 6)
src/components/PublicationItem.astro                                      (Task 7)
src/components/BibtexButton.astro                                         (Task 7)
src/pages/publications.astro                                              (Task 7)
src/components/ResourceCard.astro                                         (Task 8)
src/pages/resources.astro                                                 (Task 8)
src/pages/news/index.astro                                                (Task 9)
src/pages/news/[slug].astro                                               (Task 9)
public/admin/index.html           # Decap loader                          (Task 10)
public/admin/config.yml           # Decap collections                     (Task 10)
.github/workflows/deploy.yml      # Pages deploy                          (Task 11)
README.md                         # editing + dev guide                    (Task 11)
```

---

## Task 1: Scaffold project & tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/pages/index.astro`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "dreamai-website",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "cms": "decap-server"
  },
  "dependencies": {
    "astro": "^5.2.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@fontsource/inter": "^5.1.0",
    "@fontsource/lora": "^5.1.0",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.0.0",
    "decap-server": "^3.1.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dream-ai-lab.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `src/styles/global.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-navy: #0A2540;
  --color-blue: #2563EB;
  --color-blue-400: #60A5FA;
  --color-mist: #F1F5F9;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Lora", Georgia, serif;
}
```

- [ ] **Step 5: Create placeholder `src/pages/index.astro`**

```astro
---
import '../styles/global.css';
---
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>DreamAI</title></head>
  <body class="font-sans text-navy"><h1 class="font-serif">DreamAI — coming soon</h1></body>
</html>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: completes with no errors; creates `node_modules/` and `package-lock.json`.

- [ ] **Step 7: Verify build succeeds**

Run: `npm run build`
Expected: `Complete!` / build finishes, `dist/index.html` created, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/styles/global.css src/pages/index.astro
git commit -m "chore: scaffold Astro + Tailwind v4 project"
```

---

## Task 2: Content collections, schemas & sample content

**Files:**
- Create: `src/content.config.ts`, `src/data/site.json`, sample files under `src/content/{publications,people,news,resources,research}/`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    year: z.number(),
    date: z.coerce.date().optional(),
    venue: z.string(),
    type: z.enum(['conference', 'journal', 'preprint', 'workshop', 'thesis']),
    links: z
      .object({
        pdf: z.string().optional(),
        arxiv: z.string().optional(),
        code: z.string().optional(),
        project: z.string().optional(),
        bibtex: z.string().optional(),
        doi: z.string().optional(),
      })
      .optional(),
    abstract: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    award: z.string().optional(),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    role: z.enum(['pi', 'core', 'researcher', 'phd', 'msc', 'intern', 'alumni', 'collaborator']),
    photo: z.string().optional(),
    title: z.string().optional(),
    affiliation: z.string().optional(),
    bio: z.string().optional(),
    interests: z.array(z.string()).default([]),
    links: z
      .object({
        email: z.string().optional(),
        scholar: z.string().optional(),
        github: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
    order: z.number().default(0),
    active: z.boolean().default(true),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(['github', 'library', 'dataset', 'benchmark', 'tool', 'model']),
    url: z.string(),
    links: z
      .object({
        repo: z.string().optional(),
        paper: z.string().optional(),
        docs: z.string().optional(),
      })
      .optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    icon: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { publications, people, news, resources, research };
```

- [ ] **Step 2: Create `src/data/site.json`**

```json
{
  "name": "DreamAI",
  "tagline": "Advancing the frontier of trustworthy AI",
  "description": "DreamAI is a research group studying machine learning, NLP, and trustworthy AI. We research, build, and openly share the next generation of intelligent systems.",
  "hero": {
    "heading": "Advancing the frontier of trustworthy AI",
    "subheading": "We research, build, and openly share the next generation of intelligent systems.",
    "primaryCta": { "label": "Explore research", "href": "/publications" },
    "secondaryCta": { "label": "Meet the team", "href": "/people" }
  },
  "mission": "Our mission is to advance the science of machine intelligence and translate it into open tools, datasets, and benchmarks that the whole community can build on.",
  "vision": "A future where AI systems are capable, transparent, and trustworthy — developed in the open and accountable to the people they serve.",
  "social": {
    "github": "https://github.com/dream-ai-lab",
    "email": "contact@dreamai.example",
    "scholar": "",
    "twitter": ""
  },
  "stats_manual": {
    "members": null,
    "extra": [{ "label": "Citations", "value": "1,200+" }]
  },
  "contact": "contact@dreamai.example"
}
```

- [ ] **Step 3: Create sample publications** — `src/content/publications/2025-trustworthy-llms.md`

```markdown
---
title: "Trustworthy Reasoning in Large Language Models"
authors: ["Jane Doe", "Minh Tran", "Alex Kim"]
year: 2025
date: 2025-09-15
venue: "NeurIPS 2025"
type: "conference"
tags: ["LLMs", "Trustworthy AI"]
featured: true
award: "Oral"
links:
  arxiv: "https://arxiv.org/abs/0000.00000"
  code: "https://github.com/dream-ai-lab"
---
```

And `src/content/publications/2024-vision-benchmark.md`

```markdown
---
title: "A Benchmark for Robust Visual Understanding"
authors: ["Minh Tran", "Sara Lopez"]
year: 2024
date: 2024-06-01
venue: "Journal of Machine Learning Research"
type: "journal"
tags: ["Vision", "Benchmarks"]
links:
  pdf: "https://example.com/paper.pdf"
  doi: "https://doi.org/10.0000/jmlr.2024"
---
```

- [ ] **Step 4: Create sample people** — three files

`src/content/people/jane-doe.md`
```markdown
---
name: "Jane Doe"
role: "pi"
title: "Principal Investigator"
interests: ["Trustworthy AI", "LLM reasoning"]
order: 1
links:
  email: "jane@dreamai.example"
  scholar: "https://scholar.google.com"
  github: "https://github.com/dream-ai-lab"
---
```

`src/content/people/minh-tran.md`
```markdown
---
name: "Minh Tran"
role: "core"
title: "Research Lead"
interests: ["Computer Vision", "Benchmarks"]
order: 1
links:
  github: "https://github.com/dream-ai-lab"
---
```

`src/content/people/alex-kim.md`
```markdown
---
name: "Alex Kim"
role: "phd"
title: "PhD Student"
interests: ["NLP", "Evaluation"]
order: 1
---
```

- [ ] **Step 5: Create sample news** — two files

`src/content/news/2025-neurips-accepted.md`
```markdown
---
title: "Paper accepted at NeurIPS 2025"
date: 2025-09-20
summary: "Our work on trustworthy reasoning in LLMs was accepted as an oral presentation."
tags: ["Publication"]
---
We're excited to share that our paper **Trustworthy Reasoning in Large Language Models**
was accepted at NeurIPS 2025 as an oral presentation. More details and the camera-ready
version coming soon.
```

`src/content/news/2025-dataset-release.md`
```markdown
---
title: "Releasing the RobustVQA dataset"
date: 2025-07-02
summary: "A new open dataset for evaluating robust visual question answering."
tags: ["Dataset"]
---
Today we open-sourced **RobustVQA**, a dataset for stress-testing visual question
answering models under distribution shift.
```

- [ ] **Step 6: Create sample resources** — two files

`src/content/resources/robustvqa.md`
```markdown
---
name: "RobustVQA"
description: "An open dataset for evaluating robust visual question answering under distribution shift."
category: "dataset"
url: "https://github.com/dream-ai-lab"
tags: ["Vision", "Evaluation"]
featured: true
---
```

`src/content/resources/dreamkit.md`
```markdown
---
name: "DreamKit"
description: "A Python library of utilities for reproducible LLM evaluation."
category: "github"
url: "https://github.com/dream-ai-lab"
tags: ["LLMs", "Tooling"]
---
```

- [ ] **Step 7: Create sample research directions** — three files

`src/content/research/llms.md`
```markdown
---
title: "Language Models & Reasoning"
summary: "Building and evaluating large language models that reason reliably and transparently."
icon: "🧠"
order: 1
---
```

`src/content/research/vision.md`
```markdown
---
title: "Computer Vision"
summary: "Robust visual understanding that holds up under real-world distribution shift."
icon: "👁️"
order: 2
---
```

`src/content/research/trustworthy.md`
```markdown
---
title: "Trustworthy & Open AI"
summary: "Open datasets, benchmarks, and methods for safe, accountable AI systems."
icon: "🛡️"
order: 3
---
```

- [ ] **Step 8: Verify schemas + types**

Run: `npm run check`
Expected: `0 errors` (warnings about unused are acceptable; there should be no type/content errors).

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: build succeeds, exit code 0.

- [ ] **Step 10: Commit**

```bash
git add src/content.config.ts src/data/site.json src/content
git commit -m "feat: add content collections, schemas, and sample content"
```

---

## Task 3: Content transform helpers (TDD)

**Files:**
- Create: `src/lib/content.ts`
- Test: `src/lib/content.test.ts`

- [ ] **Step 1: Write the failing tests** — `src/lib/content.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
  computeStats,
  groupPublicationsByYear,
  groupPeopleByRole,
  groupResourcesByCategory,
  formatAuthors,
  toBibtex,
} from './content';

describe('computeStats', () => {
  it('auto-counts publications, benchmarks, datasets, and active members', () => {
    const stats = computeStats({
      publications: [{}, {}, {}],
      resources: [
        { category: 'dataset' },
        { category: 'benchmark' },
        { category: 'dataset' },
        { category: 'github' },
      ],
      people: [{ active: true }, { active: true }, { active: false }],
    });
    expect(stats).toEqual([
      { label: 'Publications', value: 3 },
      { label: 'Benchmarks', value: 1 },
      { label: 'Datasets', value: 2 },
      { label: 'Members', value: 2 },
    ]);
  });

  it('uses manual member override and appends manual extras', () => {
    const stats = computeStats({
      publications: [],
      resources: [],
      people: [{ active: true }],
      manual: { members: 25, extra: [{ label: 'Citations', value: '1,200+' }] },
    });
    expect(stats[3]).toEqual({ label: 'Members', value: 25 });
    expect(stats[4]).toEqual({ label: 'Citations', value: '1,200+' });
  });
});

describe('groupPublicationsByYear', () => {
  it('groups by year descending and orders by date within a year', () => {
    const groups = groupPublicationsByYear([
      { year: 2024, date: new Date('2024-01-01') },
      { year: 2025, date: new Date('2025-09-01') },
      { year: 2025, date: new Date('2025-02-01') },
    ]);
    expect(groups.map((g) => g.year)).toEqual([2025, 2024]);
    expect(groups[0].items[0].date!.getMonth()).toBe(8); // Sept first
  });
});

describe('groupPeopleByRole', () => {
  it('returns non-empty role groups in canonical order, sorted by order then name', () => {
    const groups = groupPeopleByRole([
      { name: 'Bob', role: 'core', order: 2 },
      { name: 'Ann', role: 'core', order: 1 },
      { name: 'Pat', role: 'pi', order: 1 },
    ]);
    expect(groups.map((g) => g.role)).toEqual(['pi', 'core']);
    expect(groups[1].items.map((p) => p.name)).toEqual(['Ann', 'Bob']);
    expect(groups[0].label).toBe('Principal Investigators');
  });
});

describe('groupResourcesByCategory', () => {
  it('groups non-empty categories in canonical order with labels', () => {
    const groups = groupResourcesByCategory([
      { category: 'dataset' },
      { category: 'github' },
    ]);
    expect(groups.map((g) => g.category)).toEqual(['github', 'dataset']);
    expect(groups[0].label).toBe('Code & Repositories');
  });
});

describe('formatAuthors', () => {
  it('flags member authors case-insensitively', () => {
    const out = formatAuthors(['Jane Doe', 'External Person'], ['jane doe']);
    expect(out).toEqual([
      { name: 'Jane Doe', isMember: true },
      { name: 'External Person', isMember: false },
    ]);
  });
});

describe('toBibtex', () => {
  it('builds an inproceedings entry for conference papers', () => {
    const bib = toBibtex({
      title: 'Trustworthy Reasoning',
      authors: ['Jane Doe', 'Minh Tran'],
      year: 2025,
      venue: 'NeurIPS 2025',
      type: 'conference',
    });
    expect(bib).toContain('@inproceedings{doe2025trustworthy,');
    expect(bib).toContain('author = {Jane Doe and Minh Tran}');
    expect(bib).toContain('booktitle = {NeurIPS 2025}');
    expect(bib).toContain('year = {2025}');
  });

  it('uses @article and journal field for journal papers', () => {
    const bib = toBibtex({
      title: 'Robust Vision',
      authors: ['Minh Tran'],
      year: 2024,
      venue: 'JMLR',
      type: 'journal',
    });
    expect(bib).toContain('@article{');
    expect(bib).toContain('journal = {JMLR}');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './content'` (the helper file does not exist yet).

- [ ] **Step 3: Implement `src/lib/content.ts`**

```ts
// Pure, framework-agnostic transform helpers.
// MUST NOT import `astro:content` — kept unit-testable with Vitest.
// Functions use structural generics so Astro's zod-inferred data types satisfy them.

export type Role = 'pi' | 'core' | 'researcher' | 'phd' | 'msc' | 'intern' | 'alumni' | 'collaborator';
export type Category = 'github' | 'library' | 'dataset' | 'benchmark' | 'tool' | 'model';
export type PubType = 'conference' | 'journal' | 'preprint' | 'workshop' | 'thesis';

export interface Stat {
  label: string;
  value: string | number;
}

export interface SiteStatsManual {
  members?: number | null;
  extra?: { label: string; value: string | number }[];
}

export const ROLE_ORDER: Role[] = ['pi', 'core', 'researcher', 'phd', 'msc', 'intern', 'collaborator', 'alumni'];
export const ROLE_LABELS: Record<Role, string> = {
  pi: 'Principal Investigators',
  core: 'Core Team',
  researcher: 'Researchers',
  phd: 'PhD Students',
  msc: 'MSc Students',
  intern: 'Interns',
  collaborator: 'Collaborators',
  alumni: 'Alumni',
};

export const CATEGORY_ORDER: Category[] = ['github', 'library', 'dataset', 'benchmark', 'tool', 'model'];
export const CATEGORY_LABELS: Record<Category, string> = {
  github: 'Code & Repositories',
  library: 'Libraries',
  dataset: 'Datasets',
  benchmark: 'Benchmarks',
  tool: 'Tools',
  model: 'Models',
};

export function computeStats(input: {
  publications: unknown[];
  resources: { category: Category }[];
  people: { active?: boolean }[];
  manual?: SiteStatsManual;
}): Stat[] {
  const { publications, resources, people, manual = {} } = input;
  const datasets = resources.filter((r) => r.category === 'dataset').length;
  const benchmarks = resources.filter((r) => r.category === 'benchmark').length;
  const activeMembers = people.filter((p) => p.active !== false).length;
  const stats: Stat[] = [
    { label: 'Publications', value: publications.length },
    { label: 'Benchmarks', value: benchmarks },
    { label: 'Datasets', value: datasets },
    { label: 'Members', value: manual.members ?? activeMembers },
  ];
  if (manual.extra) stats.push(...manual.extra);
  return stats;
}

export function groupPublicationsByYear<T extends { year: number; date?: Date }>(
  pubs: T[]
): { year: number; items: T[] }[] {
  const map = new Map<number, T[]>();
  for (const p of pubs) {
    if (!map.has(p.year)) map.set(p.year, []);
    map.get(p.year)!.push(p);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({
      year,
      items: items.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)),
    }));
}

export function groupPeopleByRole<T extends { role: Role; name: string; order?: number }>(
  people: T[]
): { role: Role; label: string; items: T[] }[] {
  return ROLE_ORDER.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    items: people
      .filter((p) => p.role === role)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name)),
  })).filter((group) => group.items.length > 0);
}

export function groupResourcesByCategory<T extends { category: Category }>(
  resources: T[]
): { category: Category; label: string; items: T[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: resources.filter((r) => r.category === category),
  })).filter((group) => group.items.length > 0);
}

export function formatAuthors(authors: string[], memberNames: string[]): { name: string; isMember: boolean }[] {
  const set = new Set(memberNames.map((n) => n.trim().toLowerCase()));
  return authors.map((name) => ({ name, isMember: set.has(name.trim().toLowerCase()) }));
}

export function toBibtex(pub: {
  title: string;
  authors: string[];
  year: number;
  venue: string;
  type: PubType;
}): string {
  const firstAuthorLast = (pub.authors[0] ?? 'unknown').split(/\s+/).pop()!.toLowerCase().replace(/[^a-z]/g, '');
  const titleWord = pub.title.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${firstAuthorLast}${pub.year}${titleWord}`;
  const entryType =
    pub.type === 'journal'
      ? 'article'
      : pub.type === 'thesis'
        ? 'phdthesis'
        : pub.type === 'conference' || pub.type === 'workshop'
          ? 'inproceedings'
          : 'misc';
  const venueField = entryType === 'article' ? 'journal' : entryType === 'inproceedings' ? 'booktitle' : 'howpublished';
  return [
    `@${entryType}{${key},`,
    `  title = {${pub.title}},`,
    `  author = {${pub.authors.join(' and ')}},`,
    `  ${venueField} = {${pub.venue}},`,
    `  year = {${pub.year}}`,
    `}`,
  ].join('\n');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all tests PASS (6 describe blocks, 8 tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts src/lib/content.test.ts
git commit -m "feat: add tested content transform helpers"
```

---

## Task 4: Base layout, Nav, Footer, SectionHeading

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/SectionHeading.astro`

- [ ] **Step 1: Create `src/components/Nav.astro`**

```astro
---
const links = [
  { href: '/', label: 'Home' },
  { href: '/people', label: 'People' },
  { href: '/publications', label: 'Publications' },
  { href: '/resources', label: 'Resources' },
  { href: '/news', label: 'News' },
];
const path = Astro.url.pathname;
const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
---
<header class="sticky top-0 z-50 bg-navy text-white">
  <nav class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
    <a href="/" class="font-serif text-xl font-bold tracking-tight">Dream<span class="text-blue-400">AI</span></a>
    <ul class="flex flex-wrap gap-5 text-sm">
      {links.map((l) => (
        <li>
          <a
            href={l.href}
            class:list={['transition-colors hover:text-blue-400', isActive(l.href) && 'font-semibold text-blue-400']}
          >{l.label}</a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
---
import site from '../data/site.json';
const year = new Date().getFullYear();
---
<footer class="mt-20 bg-navy text-white/80">
  <div class="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 py-10 text-sm sm:flex-row">
    <div>
      <div class="font-serif text-lg font-bold text-white">Dream<span class="text-blue-400">AI</span></div>
      <p class="mt-2 max-w-sm">{site.tagline}</p>
    </div>
    <div class="flex flex-wrap gap-5">
      {site.social.github && <a href={site.social.github} class="hover:text-blue-400">GitHub</a>}
      {site.social.scholar && <a href={site.social.scholar} class="hover:text-blue-400">Scholar</a>}
      {site.social.twitter && <a href={site.social.twitter} class="hover:text-blue-400">Twitter</a>}
      {site.contact && <a href={`mailto:${site.contact}`} class="hover:text-blue-400">Contact</a>}
    </div>
  </div>
  <div class="border-t border-white/10 py-4 text-center text-xs text-white/50">
    © {year} DreamAI. Built with Astro · Hosted on GitHub Pages.
  </div>
</footer>
```

- [ ] **Step 3: Create `src/components/SectionHeading.astro`**

```astro
---
interface Props {
  eyebrow?: string;
  title: string;
}
const { eyebrow, title } = Astro.props;
---
<div class="mb-8">
  {eyebrow && <div class="text-xs font-semibold uppercase tracking-widest text-blue">{eyebrow}</div>}
  <h2 class="mt-1 font-serif text-3xl font-bold text-navy">{title}</h2>
</div>
```

- [ ] **Step 4: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/lora/600.css';
import '@fontsource/lora/700.css';
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import site from '../data/site.json';

interface Props {
  title?: string;
  description?: string;
}
const { title, description } = Astro.props;
const pageTitle = title ? `${title} · ${site.name}` : `${site.name} — ${site.tagline}`;
const desc = description ?? site.description;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    <meta name="description" content={desc} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={desc} />
    <meta property="og:type" content="website" />
  </head>
  <body class="flex min-h-screen flex-col bg-white font-sans text-navy antialiased">
    <Nav />
    <main class="flex-1"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Verify build (layout compiles)**

Run: `npm run build`
Expected: build succeeds. (The placeholder `index.astro` doesn't use the layout yet — that's fine; this confirms the layout + components compile.)

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/Nav.astro src/components/Footer.astro src/components/SectionHeading.astro
git commit -m "feat: add base layout, nav, footer, section heading"
```

---

## Task 5: Home page + home components

**Files:**
- Create: `src/components/Hero.astro`, `src/components/StatsBar.astro`, `src/components/ResearchCard.astro`, `src/components/NewsCard.astro`, `src/components/PersonCard.astro`
- Modify (replace): `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import site from '../data/site.json';
const { heading, subheading, primaryCta, secondaryCta } = site.hero;
---
<section class="bg-navy text-white">
  <div class="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
    <div>
      <div class="text-xs font-semibold uppercase tracking-widest text-blue-400">DreamAI Research Group</div>
      <h1 class="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">{heading}</h1>
      <p class="mt-5 text-lg text-white/80">{subheading}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href={primaryCta.href} class="rounded-md bg-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400">{primaryCta.label}</a>
        <a href={secondaryCta.href} class="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">{secondaryCta.label}</a>
      </div>
    </div>
    <div class="relative hidden md:block">
      <div class="relative aspect-square overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_30%_30%,#2563EB,#0A2540)]">
        <div class="absolute inset-0 opacity-40" style="background-image:radial-gradient(rgba(255,255,255,.5) 1px,transparent 1px);background-size:22px 22px"></div>
        <div class="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/60 bg-blue-400/20"></div>
        <div class="absolute left-1/3 top-1/3 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/StatsBar.astro`**

```astro
---
import type { Stat } from '../lib/content';
interface Props {
  stats: Stat[];
}
const { stats } = Astro.props;
---
<section class="border-y border-slate-200 bg-mist">
  <div class="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
    {stats.map((s) => (
      <div class="px-4 py-8 text-center">
        <div class="font-serif text-3xl font-extrabold text-blue">{s.value}</div>
        <div class="mt-1 text-sm text-slate-600">{s.label}</div>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/ResearchCard.astro`**

```astro
---
interface Props {
  title: string;
  summary: string;
  icon?: string;
}
const { title, summary, icon } = Astro.props;
---
<div class="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue/40 hover:shadow-sm">
  {icon && <div class="mb-3 text-3xl">{icon}</div>}
  <h3 class="font-serif text-lg font-bold text-navy">{title}</h3>
  <p class="mt-2 text-sm leading-relaxed text-slate-600">{summary}</p>
</div>
```

- [ ] **Step 4: Create `src/components/NewsCard.astro`**

```astro
---
interface Props {
  href: string;
  title: string;
  date: Date;
  summary: string;
  image?: string;
}
const { href, title, date, summary, image } = Astro.props;
const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
---
<a href={href} class="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md">
  <div class="aspect-[16/9] overflow-hidden bg-mist">
    {image && <img src={image} alt={title} class="h-full w-full object-cover transition group-hover:scale-105" />}
  </div>
  <div class="p-5">
    <div class="text-xs text-slate-500">{dateStr}</div>
    <h3 class="mt-1 font-serif text-lg font-bold text-navy group-hover:text-blue">{title}</h3>
    <p class="mt-2 text-sm text-slate-600">{summary}</p>
  </div>
</a>
```

- [ ] **Step 5: Create `src/components/PersonCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
interface Props {
  person: CollectionEntry<'people'>['data'];
}
const { person } = Astro.props;
const links = person.links ?? {};
---
<div class="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
  <div class="h-20 w-20 flex-none overflow-hidden rounded-full bg-slate-200">
    {person.photo && <img src={person.photo} alt={person.name} class="h-full w-full object-cover" />}
  </div>
  <div class="min-w-0">
    <h3 class="font-semibold text-navy">{person.name}</h3>
    {person.title && <p class="text-sm text-blue">{person.title}</p>}
    {person.interests.length > 0 && <p class="mt-1 text-xs text-slate-500">{person.interests.join(' · ')}</p>}
    {person.bio && <p class="mt-2 text-sm text-slate-600">{person.bio}</p>}
    <div class="mt-2 flex flex-wrap gap-3 text-xs">
      {links.email && <a href={`mailto:${links.email}`} class="text-blue hover:underline">Email</a>}
      {links.scholar && <a href={links.scholar} class="text-blue hover:underline">Scholar</a>}
      {links.github && <a href={links.github} class="text-blue hover:underline">GitHub</a>}
      {links.website && <a href={links.website} class="text-blue hover:underline">Website</a>}
    </div>
  </div>
</div>
```

- [ ] **Step 6: Replace `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import StatsBar from '../components/StatsBar.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ResearchCard from '../components/ResearchCard.astro';
import NewsCard from '../components/NewsCard.astro';
import PersonCard from '../components/PersonCard.astro';
import site from '../data/site.json';
import { computeStats } from '../lib/content';

const publications = (await getCollection('publications')).map((e) => e.data);
const resources = (await getCollection('resources')).map((e) => e.data);
const people = (await getCollection('people')).map((e) => e.data);
const research = (await getCollection('research'))
  .map((e) => e.data)
  .sort((a, b) => a.order - b.order);
const newsEntries = (await getCollection('news')).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);
const latestNews = newsEntries.slice(0, 3);
const coreTeam = people.filter((p) => p.role === 'pi' || p.role === 'core');

const stats = computeStats({ publications, resources, people, manual: site.stats_manual });
---
<BaseLayout>
  <Hero />
  <StatsBar stats={stats} />

  <section class="mx-auto max-w-6xl px-5 py-16">
    <div class="grid gap-10 md:grid-cols-2">
      <div>
        <SectionHeading eyebrow="Mission" title="Why we exist" />
        <p class="leading-relaxed text-slate-700">{site.mission}</p>
      </div>
      <div>
        <SectionHeading eyebrow="Vision" title="Where we're going" />
        <p class="leading-relaxed text-slate-700">{site.vision}</p>
      </div>
    </div>
  </section>

  {research.length > 0 && (
    <section class="bg-mist">
      <div class="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading eyebrow="Research" title="Research directions" />
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {research.map((r) => <ResearchCard title={r.title} summary={r.summary} icon={r.icon} />)}
        </div>
      </div>
    </section>
  )}

  {latestNews.length > 0 && (
    <section class="mx-auto max-w-6xl px-5 py-16">
      <div class="flex items-end justify-between">
        <SectionHeading eyebrow="News" title="Highlights & latest news" />
        <a href="/news" class="mb-8 text-sm font-semibold text-blue hover:underline">All news →</a>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        {latestNews.map((n) => (
          <NewsCard href={`/news/${n.id}`} title={n.data.title} date={n.data.date} summary={n.data.summary} image={n.data.image} />
        ))}
      </div>
    </section>
  )}

  {coreTeam.length > 0 && (
    <section class="bg-mist">
      <div class="mx-auto max-w-6xl px-5 py-16">
        <div class="flex items-end justify-between">
          <SectionHeading eyebrow="Team" title="Core team" />
          <a href="/people" class="mb-8 text-sm font-semibold text-blue hover:underline">All people →</a>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          {coreTeam.map((p) => <PersonCard person={p} />)}
        </div>
      </div>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 7: Verify types + build**

Run: `npm run check && npm run build`
Expected: `0 errors`, build succeeds. `dist/index.html` contains "Advancing the frontier".

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.astro src/components/StatsBar.astro src/components/ResearchCard.astro src/components/NewsCard.astro src/components/PersonCard.astro src/pages/index.astro
git commit -m "feat: build homepage with hero, stats, research, news, team"
```

---

## Task 6: People page

**Files:**
- Create: `src/pages/people.astro`

- [ ] **Step 1: Create `src/pages/people.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHeading from '../components/SectionHeading.astro';
import PersonCard from '../components/PersonCard.astro';
import { groupPeopleByRole } from '../lib/content';

const people = (await getCollection('people')).map((e) => e.data);
const groups = groupPeopleByRole(people);
---
<BaseLayout title="People" description="The people behind DreamAI — principal investigators, core team, researchers, and students.">
  <section class="mx-auto max-w-6xl px-5 py-16">
    <SectionHeading eyebrow="People" title="Our team" />
    {groups.map((g) => (
      <div class="mb-12">
        <h3 class="mb-5 font-serif text-xl font-bold text-navy">{g.label}</h3>
        <div class="grid gap-5 md:grid-cols-2">
          {g.items.map((p) => <PersonCard person={p} />)}
        </div>
      </div>
    ))}
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify types + build**

Run: `npm run check && npm run build`
Expected: `0 errors`, build succeeds. `dist/people/index.html` contains "Principal Investigators" and "Jane Doe".

- [ ] **Step 3: Commit**

```bash
git add src/pages/people.astro
git commit -m "feat: add people page grouped by role"
```

---

## Task 7: Publications page + items + BibTeX + filter

**Files:**
- Create: `src/components/PublicationItem.astro`, `src/components/BibtexButton.astro`, `src/pages/publications.astro`

- [ ] **Step 1: Create `src/components/BibtexButton.astro`**

```astro
---
interface Props {
  bibtex: string;
}
const { bibtex } = Astro.props;
---
<button type="button" class="bibtex-btn text-blue hover:underline" data-bibtex={bibtex}>BibTeX</button>
```

- [ ] **Step 2: Create `src/components/PublicationItem.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatAuthors, toBibtex } from '../lib/content';
import BibtexButton from './BibtexButton.astro';

interface Props {
  pub: CollectionEntry<'publications'>['data'];
  memberNames: string[];
}
const { pub, memberNames } = Astro.props;
const authors = formatAuthors(pub.authors, memberNames);
const links = pub.links ?? {};
const bibtex = toBibtex(pub);
---
<article class="border-b border-slate-200 py-5" data-type={pub.type} data-tags={pub.tags.join(',')}>
  <h3 class="font-semibold text-navy">{pub.title}</h3>
  <p class="mt-1 text-sm text-slate-600">
    {authors.map((a, i) => (
      <span>{a.isMember ? <strong class="text-navy">{a.name}</strong> : a.name}{i < authors.length - 1 ? ', ' : ''}</span>
    ))}
  </p>
  <p class="mt-1 text-sm italic text-slate-500">
    {pub.venue}
    {pub.award && <span class="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs not-italic text-amber-800">{pub.award}</span>}
  </p>
  <div class="mt-2 flex flex-wrap gap-3 text-xs">
    {links.pdf && <a href={links.pdf} class="text-blue hover:underline">PDF</a>}
    {links.arxiv && <a href={links.arxiv} class="text-blue hover:underline">arXiv</a>}
    {links.code && <a href={links.code} class="text-blue hover:underline">Code</a>}
    {links.project && <a href={links.project} class="text-blue hover:underline">Project</a>}
    {links.doi && <a href={links.doi} class="text-blue hover:underline">DOI</a>}
    <BibtexButton bibtex={bibtex} />
  </div>
</article>
```

- [ ] **Step 3: Create `src/pages/publications.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHeading from '../components/SectionHeading.astro';
import PublicationItem from '../components/PublicationItem.astro';
import { groupPublicationsByYear } from '../lib/content';

const pubs = (await getCollection('publications')).map((e) => e.data);
const people = (await getCollection('people')).map((e) => e.data);
const memberNames = people.map((p) => p.name);
const grouped = groupPublicationsByYear(pubs);
const types = [...new Set(pubs.map((p) => p.type))];
---
<BaseLayout title="Publications" description="Papers and preprints from the DreamAI research group.">
  <section class="mx-auto max-w-6xl px-5 py-16">
    <SectionHeading eyebrow="Publications" title="Papers & preprints" />

    <div class="mb-8 flex flex-wrap gap-2" id="pub-filters">
      <button type="button" class="filter-btn rounded-full border border-blue bg-blue px-3 py-1 text-sm text-white" data-filter="all">All</button>
      {types.map((t) => (
        <button type="button" class="filter-btn rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:border-blue" data-filter={t}>{t}</button>
      ))}
    </div>

    {grouped.map((group) => (
      <div class="pub-year mb-10" data-year={group.year}>
        <h3 class="mb-2 font-serif text-xl font-bold text-blue">{group.year}</h3>
        {group.items.map((pub) => <PublicationItem pub={pub} memberNames={memberNames} />)}
      </div>
    ))}
  </section>

  <script is:inline>
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (btn) {
        const filter = btn.dataset.filter;
        document.querySelectorAll('#pub-filters .filter-btn').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('bg-blue', active);
          b.classList.toggle('text-white', active);
          b.classList.toggle('border-blue', active);
          b.classList.toggle('text-slate-600', !active);
          b.classList.toggle('border-slate-300', !active);
        });
        document.querySelectorAll('article[data-type]').forEach((a) => {
          a.style.display = filter === 'all' || a.dataset.type === filter ? '' : 'none';
        });
        document.querySelectorAll('.pub-year').forEach((y) => {
          const anyVisible = [...y.querySelectorAll('article[data-type]')].some((a) => a.style.display !== 'none');
          y.style.display = anyVisible ? '' : 'none';
        });
        return;
      }
      const bib = e.target.closest('.bibtex-btn');
      if (bib) {
        navigator.clipboard.writeText(bib.dataset.bibtex).then(() => {
          const prev = bib.textContent;
          bib.textContent = 'Copied!';
          setTimeout(() => { bib.textContent = prev; }, 1500);
        });
      }
    });
  </script>
</BaseLayout>
```

- [ ] **Step 4: Verify types + build**

Run: `npm run check && npm run build`
Expected: `0 errors`, build succeeds. `dist/publications/index.html` contains "Trustworthy Reasoning" and a "BibTeX" button, with member author "Jane Doe" wrapped in `<strong>`.

- [ ] **Step 5: Commit**

```bash
git add src/components/PublicationItem.astro src/components/BibtexButton.astro src/pages/publications.astro
git commit -m "feat: add publications page with year grouping, filter, and BibTeX copy"
```

---

## Task 8: Resources page

**Files:**
- Create: `src/components/ResourceCard.astro`, `src/pages/resources.astro`

- [ ] **Step 1: Create `src/components/ResourceCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
interface Props {
  resource: CollectionEntry<'resources'>['data'];
}
const { resource } = Astro.props;
---
<a href={resource.url} class="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue/40 hover:shadow-sm">
  <h3 class="font-semibold text-navy">{resource.name}</h3>
  <p class="mt-2 text-sm text-slate-600">{resource.description}</p>
  {resource.tags.length > 0 && (
    <div class="mt-3 flex flex-wrap gap-2">
      {resource.tags.map((t) => <span class="rounded bg-mist px-2 py-0.5 text-xs text-slate-600">{t}</span>)}
    </div>
  )}
</a>
```

- [ ] **Step 2: Create `src/pages/resources.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ResourceCard from '../components/ResourceCard.astro';
import { groupResourcesByCategory } from '../lib/content';

const resources = (await getCollection('resources')).map((e) => e.data);
const groups = groupResourcesByCategory(resources);
---
<BaseLayout title="Resources" description="Open-source code, libraries, datasets, and benchmarks from DreamAI.">
  <section class="mx-auto max-w-6xl px-5 py-16">
    <SectionHeading eyebrow="Resources" title="Code, datasets & tools" />
    {groups.map((g) => (
      <div class="mb-12">
        <h3 class="mb-5 font-serif text-xl font-bold text-navy">{g.label}</h3>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {g.items.map((r) => <ResourceCard resource={r} />)}
        </div>
      </div>
    ))}
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify types + build**

Run: `npm run check && npm run build`
Expected: `0 errors`, build succeeds. `dist/resources/index.html` contains "Datasets" and "RobustVQA".

- [ ] **Step 4: Commit**

```bash
git add src/components/ResourceCard.astro src/pages/resources.astro
git commit -m "feat: add resources page grouped by category"
```

---

## Task 9: News feed + detail pages

**Files:**
- Create: `src/pages/news/index.astro`, `src/pages/news/[slug].astro`

- [ ] **Step 1: Create `src/pages/news/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionHeading from '../../components/SectionHeading.astro';
import NewsCard from '../../components/NewsCard.astro';

const news = (await getCollection('news')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="News" description="Announcements and updates from the DreamAI research group.">
  <section class="mx-auto max-w-6xl px-5 py-16">
    <SectionHeading eyebrow="News" title="News & announcements" />
    <div class="grid gap-6 md:grid-cols-3">
      {news.map((n) => (
        <NewsCard href={`/news/${n.id}`} title={n.data.title} date={n.data.date} summary={n.data.summary} image={n.data.image} />
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/news/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const news = await getCollection('news');
  return news.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const dateStr = entry.data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout title={entry.data.title} description={entry.data.summary}>
  <article class="mx-auto max-w-3xl px-5 py-16">
    <a href="/news" class="text-sm text-blue hover:underline">← All news</a>
    <h1 class="mt-4 font-serif text-4xl font-bold text-navy">{entry.data.title}</h1>
    <div class="mt-2 text-sm text-slate-500">{dateStr}</div>
    {entry.data.image && <img src={entry.data.image} alt={entry.data.title} class="mt-6 w-full rounded-xl" />}
    <div class="prose prose-slate mt-8 max-w-none">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify types + build**

Run: `npm run check && npm run build`
Expected: `0 errors`, build succeeds. `dist/news/index.html` lists both posts; `dist/news/2025-neurips-accepted/index.html` exists and renders the Markdown body inside a `prose` container.

- [ ] **Step 4: Commit**

```bash
git add src/pages/news/index.astro src/pages/news/[slug].astro
git commit -m "feat: add news feed and detail pages"
```

---

## Task 10: Decap CMS admin

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`

- [ ] **Step 1: Create `public/admin/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DreamAI · Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/admin/config.yml`**

```yaml
backend:
  name: github
  repo: dream-ai-lab/dream-ai-lab.github.io
  branch: main

# Local editing without an OAuth proxy: run `npm run cms` + `npm run dev`,
# then open http://localhost:4321/admin/ — Decap writes files on disk.
local_backend: true

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: news
    label: News
    label_singular: News post
    folder: "src/content/news"
    create: true
    slug: "{{slug}}"
    fields:
      - { name: title, label: Title, widget: string }
      - { name: date, label: Date, widget: datetime }
      - { name: summary, label: Summary, widget: text }
      - { name: image, label: Image, widget: image, required: false }
      - { name: tags, label: Tags, widget: list, required: false }
      - { name: body, label: Body, widget: markdown }

  - name: publications
    label: Publications
    label_singular: Publication
    folder: "src/content/publications"
    create: true
    slug: "{{year}}-{{slug}}"
    fields:
      - { name: title, label: Title, widget: string }
      - { name: authors, label: Authors, widget: list, field: { name: author, label: Author, widget: string } }
      - { name: year, label: Year, widget: number, value_type: int }
      - { name: date, label: Date, widget: datetime, required: false }
      - { name: venue, label: Venue, widget: string }
      - { name: type, label: Type, widget: select, options: [conference, journal, preprint, workshop, thesis] }
      - { name: abstract, label: Abstract, widget: text, required: false }
      - { name: award, label: Award, widget: string, required: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
      - { name: tags, label: Tags, widget: list, required: false }
      - name: links
        label: Links
        widget: object
        required: false
        fields:
          - { name: pdf, label: PDF, widget: string, required: false }
          - { name: arxiv, label: arXiv, widget: string, required: false }
          - { name: code, label: Code, widget: string, required: false }
          - { name: project, label: Project, widget: string, required: false }
          - { name: doi, label: DOI, widget: string, required: false }
      - { name: body, label: Notes, widget: markdown, required: false }

  - name: people
    label: People
    label_singular: Person
    folder: "src/content/people"
    create: true
    slug: "{{slug}}"
    fields:
      - { name: name, label: Name, widget: string }
      - { name: role, label: Role, widget: select, options: [pi, core, researcher, phd, msc, intern, alumni, collaborator] }
      - { name: title, label: Title, widget: string, required: false }
      - { name: affiliation, label: Affiliation, widget: string, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: bio, label: Bio, widget: text, required: false }
      - { name: interests, label: Interests, widget: list, required: false }
      - { name: order, label: Sort order, widget: number, value_type: int, default: 0, required: false }
      - { name: active, label: Active member, widget: boolean, default: true }
      - name: links
        label: Links
        widget: object
        required: false
        fields:
          - { name: email, label: Email, widget: string, required: false }
          - { name: scholar, label: Scholar, widget: string, required: false }
          - { name: github, label: GitHub, widget: string, required: false }
          - { name: twitter, label: Twitter, widget: string, required: false }
          - { name: linkedin, label: LinkedIn, widget: string, required: false }
          - { name: website, label: Website, widget: string, required: false }
      - { name: body, label: Notes, widget: markdown, required: false }

  - name: resources
    label: Resources
    label_singular: Resource
    folder: "src/content/resources"
    create: true
    slug: "{{slug}}"
    fields:
      - { name: name, label: Name, widget: string }
      - { name: description, label: Description, widget: text }
      - { name: category, label: Category, widget: select, options: [github, library, dataset, benchmark, tool, model] }
      - { name: url, label: URL, widget: string }
      - { name: featured, label: Featured, widget: boolean, default: false }
      - { name: tags, label: Tags, widget: list, required: false }
      - name: links
        label: Links
        widget: object
        required: false
        fields:
          - { name: repo, label: Repo, widget: string, required: false }
          - { name: paper, label: Paper, widget: string, required: false }
          - { name: docs, label: Docs, widget: string, required: false }
      - { name: body, label: Notes, widget: markdown, required: false }

  - name: research
    label: Research directions
    label_singular: Research direction
    folder: "src/content/research"
    create: true
    slug: "{{slug}}"
    fields:
      - { name: title, label: Title, widget: string }
      - { name: summary, label: Summary, widget: text }
      - { name: icon, label: Icon (emoji), widget: string, required: false }
      - { name: order, label: Sort order, widget: number, value_type: int, default: 0, required: false }
      - { name: body, label: Details, widget: markdown, required: false }

  - name: site
    label: Site settings
    files:
      - name: config
        label: Site config
        file: "src/data/site.json"
        fields:
          - { name: name, label: Site name, widget: string }
          - { name: tagline, label: Tagline, widget: string }
          - { name: description, label: Description, widget: text }
          - name: hero
            label: Hero
            widget: object
            fields:
              - { name: heading, label: Heading, widget: string }
              - { name: subheading, label: Subheading, widget: text }
              - name: primaryCta
                label: Primary button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }
              - name: secondaryCta
                label: Secondary button
                widget: object
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: href, label: Link, widget: string }
          - { name: mission, label: Mission, widget: text }
          - { name: vision, label: Vision, widget: text }
          - name: social
            label: Social links
            widget: object
            fields:
              - { name: github, label: GitHub, widget: string, required: false }
              - { name: email, label: Email, widget: string, required: false }
              - { name: scholar, label: Scholar, widget: string, required: false }
              - { name: twitter, label: Twitter, widget: string, required: false }
          - name: stats_manual
            label: Manual stats
            widget: object
            fields:
              - { name: members, label: Members (blank = auto-count), widget: number, value_type: int, required: false }
              - name: extra
                label: Extra stats
                widget: list
                required: false
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: value, label: Value, widget: string }
          - { name: contact, label: Contact email, widget: string }
```

- [ ] **Step 3: Verify the admin is emitted and build still succeeds**

Run: `npm run build`
Expected: build succeeds; `dist/admin/index.html` and `dist/admin/config.yml` exist (Astro copies `public/` verbatim).

- [ ] **Step 4: Commit**

```bash
git add public/admin/index.html public/admin/config.yml
git commit -m "feat: add Decap CMS admin config"
```

---

## Task 11: Deployment workflow, README, and final verification

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Build with Astro
        uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Create `README.md`**

````markdown
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
````

- [ ] **Step 3: Final full verification**

Run: `npm run check && npm test && npm run build`
Expected: `0` type errors, all unit tests pass, build succeeds with `dist/` containing `index.html`, `people/`, `publications/`, `resources/`, `news/`, `news/<slug>/`, and `admin/`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: add GitHub Pages deploy workflow and README"
```

- [ ] **Step 5: Push and enable Pages (manual, requires the GitHub repo)**

```bash
git remote add origin https://github.com/dream-ai-lab/dream-ai-lab.github.io.git
git branch -M main
git push -u origin main
```
Then in GitHub: **Settings → Pages → Source = GitHub Actions**. The workflow deploys to
`https://dream-ai-lab.github.io`.

---

## Self-Review

**Spec coverage:**
- Home (logo, mission/vision, intro + research directions, highlights/news + numbers, core teams) → Tasks 5 (+2 content). ✓
- People (core teams + researchers) → Task 6, `groupPeopleByRole` (Task 3). ✓
- Publications list → Task 7. ✓
- Resources (GitHub, libs) → Task 8. ✓
- News → Task 9. ✓
- Admin can edit/add news, publications, resources → Task 10 (Decap), README workflows (Task 11). ✓
- Astro + GitHub Pages + easy updates → Tasks 1, 11. ✓
- Auto-computed stats + manual extras → `computeStats` (Task 3), used in Task 5. ✓
- Academic Clean light theme, split hero → Tasks 1 (tokens), 4–5. ✓

**Placeholder scan:** No TBD/TODO; every code step contains complete code. Sample-content "example.com" URLs are intentional sample data, replaced via the CMS.

**Type consistency:** Helper names (`computeStats`, `groupPublicationsByYear`, `groupPeopleByRole`, `groupResourcesByCategory`, `formatAuthors`, `toBibtex`) are identical across definition (Task 3) and all call sites (Tasks 5–8). Components consume `CollectionEntry<'...'>['data']`; generic helper signatures accept those zod-inferred types. `Stat` type shared by `computeStats` and `StatsBar`. News routing uses `entry.id` consistently in `index.astro`, `news/index.astro`, and `news/[slug].astro`.
