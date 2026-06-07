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
