import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'posts');

export type PostFrontmatter = {
  title?: string;
  subtitle?: string;
  series?: string;
  slug?: string;
  tags?: string[];
  canonical_url?: string;
  date?: string;
};

export type Post = {
  /** Route slug, i.e. the markdown filename without its extension. */
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

/** Route slugs for every markdown file actually present in /posts. */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''))
    .sort();
}

/**
 * Loads one post by route slug, or returns null when it does not exist.
 * The slug is resolved against the known file list rather than being
 * interpolated into a path, so a crafted slug cannot escape /posts.
 */
export function getPost(slug: string): Post | null {
  if (!getPostSlugs().includes(slug)) return null;

  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);

  return { slug, frontmatter: data as PostFrontmatter, content };
}
