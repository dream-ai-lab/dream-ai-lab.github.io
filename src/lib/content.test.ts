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
