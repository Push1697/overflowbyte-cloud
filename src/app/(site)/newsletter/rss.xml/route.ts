import { getNewsletter, getNewsletterSlugs } from '../../lib/newsletters';
import { toTime } from '../../lib/posts';

// Built once at deploy time, like the issue pages themselves.
export const dynamic = 'force-static';

const SITE = 'https://www.overflowbyte.tech';

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const issues = getNewsletterSlugs()
    .map((slug) => getNewsletter(slug))
    .filter((n): n is NonNullable<typeof n> => n !== null && !n.frontmatter.draft)
    .sort((a, b) => toTime(b.frontmatter.date) - toTime(a.frontmatter.date));

  const items = issues
    .map(({ slug, frontmatter: f }) => {
      const url = `${SITE}/newsletter/${slug}`;
      const time = toTime(f.date);
      return [
        '    <item>',
        `      <title>${xml(f.title ?? slug)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        time ? `      <pubDate>${new Date(time).toUTCString()}</pubDate>` : '',
        f.subtitle ? `      <description>${xml(f.subtitle)}</description>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OverflowByte Weekly</title>
    <link>${SITE}/newsletter</link>
    <atom:link href="${SITE}/newsletter/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Weekly DevOps, cloud, Linux and security digest from OverflowByte.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
