import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Field } from 'payload';

/**
 * The bridge between Payload and the static site. The site renders markdown
 * files from posts/ and newsletters/; Payload is the editing surface.
 *
 *   admin save      -> afterChange hook rewrites the file (local dev)
 *   cms:push        -> files into the database (one-off import, or after a sync)
 *   cms:pull        -> database into files (CI, before `next build`)
 *
 * The CMS `slug` is the route slug and filename (`02-your-code-is-clean…`),
 * not the frontmatter `slug`, which is the slug used on Hashnode/Medium and is
 * kept as `publishSlug`.
 */

export type Collection = 'posts' | 'newsletters';

export type MarkdownDoc = {
  title: string;
  slug: string;
  status?: 'draft' | 'published' | null;
  subtitle?: string | null;
  series?: string | null;
  tags?: string[] | null;
  date?: string | null;
  canonicalUrl?: string | null;
  publishSlug?: string | null;
  cover?: string | null;
  source?: 'hashnode' | 'medium' | null;
  content: string;
};

const SLUG = /^[a-z0-9][a-z0-9-]*$/;

/** Content directory, spelled out statically so the bundler traces only it. */
export function dirFor(collection: Collection): string {
  return collection === 'posts'
    ? path.join(process.cwd(), 'posts')
    : path.join(process.cwd(), 'newsletters');
}

/** Absolute path of a document's file; refuses anything that is not a plain slug. */
export function fileFor(collection: Collection, slug: string): string {
  if (!SLUG.test(slug)) throw new Error(`Refusing unsafe slug "${slug}"`);
  return path.join(dirFor(collection), `${slug}.md`);
}

function displayDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function docToMarkdown(doc: MarkdownDoc): string {
  const fm: Record<string, unknown> = {
    title: doc.title,
    subtitle: doc.subtitle || undefined,
    tags: doc.tags?.length ? doc.tags : undefined,
    slug: doc.publishSlug || undefined,
    series: doc.series || undefined,
    canonical_url: doc.canonicalUrl || undefined,
    date: displayDate(doc.date),
    cover: doc.cover || undefined,
    source: doc.source || undefined,
    draft: doc.status === 'draft' ? true : undefined,
  };
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v !== undefined) lines.push(`${k}: ${JSON.stringify(v)}`); // JSON is valid YAML
  }
  lines.push('---', '', doc.content.replace(/^\n+/, '').trimEnd(), '');
  return lines.join('\n');
}

export function markdownToDoc(slug: string, raw: string): MarkdownDoc {
  const { data, content } = matter(raw);
  // "15 Nov 2026" parses as local midnight; pin it to noon UTC so no
  // timezone can move it to the 14th or 16th on the way back out.
  const parsed = data.date ? new Date(String(data.date)) : null;
  const date = parsed && new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12));
  return {
    title: String(data.title ?? slug),
    slug,
    status: data.draft ? 'draft' : 'published',
    subtitle: data.subtitle ?? null,
    series: data.series ?? null,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    date: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
    canonicalUrl: data.canonical_url ?? null,
    publishSlug: data.slug ?? null,
    cover: data.cover ?? null,
    source: data.source === 'hashnode' || data.source === 'medium' ? data.source : null,
    content,
  };
}

/** Files on disk can only be written in local dev; Vercel's filesystem is read-only. */
const canWriteFiles = () => process.env.CMS_WRITE_FILES !== '0' && !process.env.VERCEL;

/** Ask Vercel to rebuild so `cms:pull` bakes the change into the static pages. */
async function triggerDeploy() {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return;
  try {
    await fetch(hook, { method: 'POST' });
  } catch (err) {
    console.error('[cms] deploy hook failed', err);
  }
}

export const writeMarkdownAfterChange =
  (collection: Collection): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, context, req }) => {
    // cms:push sets this: the file it read from is already the source of truth.
    if (context.skipMarkdown) return doc;
    if (canWriteFiles()) {
      try {
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
          fs.rmSync(fileFor(collection, previousDoc.slug), { force: true });
        }
        fs.mkdirSync(dirFor(collection), { recursive: true });
        fs.writeFileSync(fileFor(collection, doc.slug), docToMarkdown(doc as MarkdownDoc));
      } catch (err) {
        req.payload.logger.error({ err, msg: `[cms] could not write ${collection}/${doc.slug}.md` });
      }
    }
    await triggerDeploy();
    return doc;
  };

export const removeMarkdownAfterDelete =
  (collection: Collection): CollectionAfterDeleteHook =>
  async ({ doc }) => {
    if (canWriteFiles() && doc?.slug) fs.rmSync(fileFor(collection, doc.slug), { force: true });
    await triggerDeploy();
    return doc;
  };

/** Fields shared by posts and newsletters; mirrors the markdown frontmatter. */
export function articleFields(collection: Collection): Field[] {
  const route = collection === 'posts' ? '/blog' : '/newsletter';
  return [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) =>
        (typeof value === 'string' && SLUG.test(value)) ||
        'Lowercase letters, digits and dashes only (it becomes the filename and URL).',
      admin: { description: `URL is ${route}/<slug>. Flagships keep their number prefix, e.g. 02-…` },
    },
    { name: 'subtitle', type: 'textarea' },
    {
      name: 'content',
      type: 'code',
      required: true,
      admin: {
        language: 'markdown',
        description: 'Markdown. The title above is rendered as the H1, so start with the first paragraph or a ## heading.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft (hidden from the site)', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'date',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
    },
    {
      name: 'series',
      type: 'text',
      defaultValue: collection === 'newsletters' ? 'OverflowByte Weekly' : undefined,
      admin: { position: 'sidebar' },
    },
    { name: 'tags', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
    {
      name: 'cover',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Card thumbnail URL, e.g. /media/cover.png or /static/newsletter/<date>-banner.svg.',
      },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      admin: { position: 'sidebar', description: 'Where the original lives (Hashnode/Medium), for SEO.' },
    },
    {
      name: 'publishSlug',
      type: 'text',
      admin: { position: 'sidebar', description: 'Slug used when publishing to Hashnode/Medium.' },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Hashnode (synced)', value: 'hashnode' },
        { label: 'Medium (synced)', value: 'medium' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Set by sync:cross-platform. Leave empty for articles written here.',
      },
    },
  ];
}
