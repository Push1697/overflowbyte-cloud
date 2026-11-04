import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { listMarkdownSlugs } from './posts';

const NEWSLETTERS_DIR = path.join(process.cwd(), 'newsletters');

export type NewsletterFrontmatter = {
  title?: string;
  subtitle?: string;
  tags?: string[];
  slug?: string;
  series?: string;
  canonical_url?: string;
  date?: string;
  source?: string;
  cover?: string;
  draft?: boolean;
};

export type Newsletter = {
  slug: string;
  frontmatter: NewsletterFrontmatter;
  content: string;
};

/** Route slugs for every published newsletter; callers sort by date. */
export function getNewsletterSlugs(): string[] {
  return listMarkdownSlugs(NEWSLETTERS_DIR);
}

export function getNewsletter(slug: string): Newsletter | null {
  if (!getNewsletterSlugs().includes(slug)) return null;

  const raw = fs.readFileSync(path.join(NEWSLETTERS_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);

  return { slug, frontmatter: data as NewsletterFrontmatter, content };
}
