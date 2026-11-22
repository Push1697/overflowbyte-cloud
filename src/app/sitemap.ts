import type { MetadataRoute } from 'next';
import { getPost, getPostSlugs, toTime } from './(site)/lib/posts';
import { getNotes } from './(site)/lib/notes';
import { getNewsletter, getNewsletterSlugs } from './(site)/lib/newsletters';

const SITE = 'https://www.overflowbyte.tech';

/** Only list pages whose canonical URL is this site; drafts never reach here. */
function isOwnCanonical(canonical?: string) {
  return !canonical || canonical.startsWith(SITE);
}

const lastModified = (date?: string) => {
  const t = toTime(date);
  return t ? new Date(t) : undefined;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/newsletter`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/notes`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/learn`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/visuals/linux-permissions`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const posts = getPostSlugs()
    .map(getPost)
    .filter((p) => p !== null && isOwnCanonical(p.frontmatter.canonical_url))
    .map((p) => ({
      url: `${SITE}/blog/${p!.slug}`,
      lastModified: lastModified(p!.frontmatter.date),
      changeFrequency: 'monthly' as const,
      priority: /^\d{2}-/.test(p!.slug) ? 0.8 : 0.6,
    }));

  const newsletters = getNewsletterSlugs()
    .map(getNewsletter)
    .filter((n) => n !== null && isOwnCanonical(n.frontmatter.canonical_url))
    .map((n) => ({
      url: `${SITE}/newsletter/${n!.slug}`,
      lastModified: lastModified(n!.frontmatter.date),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }));

  const notes = getNotes().map((n) => ({
    url: `${SITE}/notes/${n.slug}`,
    lastModified: lastModified(n.frontmatter.date),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...pages, ...posts, ...newsletters, ...notes];
}
