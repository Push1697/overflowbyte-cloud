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
  /** Set by scripts/sync-cross-platform.mjs on posts mirrored from elsewhere. */
  source?: 'hashnode' | 'medium';
  /** Set by the CMS for unpublished drafts, which the site never shows. */
  draft?: boolean;
  /** Card thumbnail; see coverImage() for the fallback. */
  cover?: string;
};

/** The frontmatter cover, else the first image in the article body. */
export function coverImage(frontmatter: { cover?: string }, content: string): string | null {
  return frontmatter.cover || content.match(/!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/)?.[1] || null;
}

export type Post = {
  /** Route slug, i.e. the markdown filename without its extension. */
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

// Drafts show up in `next dev` so they can be previewed; builds leave them out.
const SHOW_DRAFTS = process.env.NODE_ENV === 'development';

/** Route slugs for every published markdown file in a content directory. */
export function listMarkdownSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.startsWith('README'))
    .filter((name) => SHOW_DRAFTS || !matter(fs.readFileSync(path.join(dir, name), 'utf8')).data.draft)
    .map((name) => name.replace(/\.md$/, ''))
    .sort();
}

/** Route slugs for every published post in /posts. */
export function getPostSlugs(): string[] {
  return listMarkdownSlugs(POSTS_DIR);
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

/** Posts mirrored from Hashnode and Medium, newest first. */
export function getArchivePosts(): Post[] {
  return getPostSlugs()
    .map(getPost)
    .filter((p): p is Post => p !== null && Boolean(p.frontmatter.source))
    .sort((a, b) => toTime(b.frontmatter.date) - toTime(a.frontmatter.date));
}

export function toTime(date?: string): number {
  const t = date ? Date.parse(date) : NaN;
  return Number.isNaN(t) ? 0 : t;
}
