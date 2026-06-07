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
