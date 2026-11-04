#!/usr/bin/env node
/*
 * Cross-platform sync: mirrors everything published on Hashnode
 * (blog.overflowbyte.cloud) and Medium into local markdown, so it renders
 * natively on this site — never in an iframe.
 *
 *   node scripts/sync-cross-platform.mjs              sync everything
 *   node scripts/sync-cross-platform.mjs --dry-run    show what would be written
 *   node scripts/sync-cross-platform.mjs --source hashnode|medium
 *   SYNC_FORCE=1 node scripts/sync-cross-platform.mjs re-fetch already-synced files
 *
 * Hashnode: the sitemap lists every post, and Hashnode serves each post's
 * original markdown at <post-url>.md, so posts arrive word for word. The free
 * GraphQL API was retired in May 2026, so it is not used. RSS only supplies
 * dates and descriptions. Posts in NEWSLETTER_SERIES (or titled "weekly …")
 * go to newsletters/, everything else to posts/.
 *
 * Medium: only the RSS feed is public, so its HTML is converted to markdown.
 * Stories whose title matches something already synced are skipped as
 * cross-posts.
 *
 * Hand-written files (no `source:` in their frontmatter) are never touched, and
 * a remote post whose URL matches a hand-written file's canonical_url is skipped.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const NEWSLETTERS_DIR = path.join(ROOT, 'newsletters');

const HASHNODE = 'https://blog.overflowbyte.cloud';
const MEDIUM_FEED = 'https://overflowbyte.medium.com/feed';
const NEWSLETTER_SERIES = ['weeklytechupdates'];
const NEWSLETTER_TITLE = /\bweekly\b|\bweek\b/i;
const NOT_POSTS = new Set(['archive', 'newsletter', 'search', 'members', 'badges']);

const dryRun = process.argv.includes('--dry-run');
const force = process.env.SYNC_FORCE === '1';
const only = (() => {
  const i = process.argv.indexOf('--source');
  return i >= 0 ? process.argv[i + 1] : null;
})();

/* ------------------------------------------------------------------ fetch */

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'overflowbyte-sync/2.0' } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

/* ---------------------------------------------------------------- parsing */

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

/** Text of the first <name> element, with CDATA unwrapped. */
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return '';
  const cdata = m[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return cdata ? cdata[1].trim() : decodeEntities(m[1]).trim();
}

function rssItems(xml) {
  return [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)].map(([, b]) => ({
    title: tag(b, 'title'),
    link: tag(b, 'link'),
    pubDate: tag(b, 'pubDate'),
    description: tag(b, 'description'),
    content: tag(b, 'content:encoded'),
    cover: b.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] ?? '',
    categories: [...b.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map(([, c]) =>
      c.replace(/^<!\[CDATA\[|\]\]>$/g, '').trim(),
    ),
  }));
}

function metaContent(html, prop) {
  const m =
    html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${prop}"`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

/* ---------------------------------------------------- markdown cleaning */

/** Hashnode markdown is already markdown; only its extensions need undoing. */
function cleanHashnodeMarkdown(md, title) {
  let s = md.replace(/\r\n/g, '\n');
  // The page renders the title itself.
  s = s.replace(/^\s*#\s+.*\n+/, (line) => (sameTitle(line.replace(/^\s*#\s+/, ''), title) ? '' : line));
  // ![alt](url align="center") -> ![alt](url)
  s = s.replace(/(!\[[^\]]*\]\()(\S+?)\s+align="[^"]*"\)/g, '$1$2)');
  // %[https://…] embeds become plain links instead of iframes.
  s = s.replace(/^%\[(\S+?)\]\s*$/gm, '[$1]($1)');
  return stripUnsafeHtml(s).trim();
}

function stripUnsafeHtml(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<iframe[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '');
}

function htmlToMarkdown(html) {
  let s = stripUnsafeHtml(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Medium's read-tracking pixel.
    .replace(/<img[^>]*medium\.com\/_\/stat[^>]*>/gi, '');

  // Code first, so later rules leave it alone. Medium puts <br> inside <pre>.
  const code = [];
  const keep = (text) => `\u0000${code.push(text) - 1}\u0000`;
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => {
    const text = decodeEntities(c.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));
    return `\n\n${keep(`\`\`\`\n${text.replace(/^\n+|\n+$/g, '')}\n\`\`\``)}\n\n`;
  });

  s = s.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, (_, f) => {
    const img = f.match(/<img[^>]*src="([^"]+)"/i);
    const cap = f.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    return img ? `\n\n![${cap ? inline(cap[1]) : ''}](${img[1]})\n\n` : '';
  });
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${'#'.repeat(Math.max(2, Number(n)))} ${inline(t)}\n\n`);
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) =>
    `\n\n${inline(t.replace(/<\/p>\s*<p[^>]*>/gi, '\n')).split('\n').map((l) => `> ${l}`).join('\n')}\n\n`,
  );
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, t) => `\n\n${listItems(t, false)}\n\n`);
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, t) => `\n\n${listItems(t, true)}\n\n`);
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n\n${inline(t)}\n\n`);
  s = s.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
  s = s.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, (_, src) => `\n\n![](${src})\n\n`);
  s = inline(s);

  return s
    .replace(/\u0000(\d+)\u0000/g, (_, i) => code[Number(i)])
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function listItems(t, ordered) {
  return [...t.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(([, li], i) => `${ordered ? `${i + 1}.` : '-'} ${inline(li)}`)
    .join('\n');
}

function inline(s) {
  return decodeEntities(
    s
      .replace(/<br\s*\/?>/gi, '  \n')
      .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `[${t.replace(/<[^>]+>/g, '')}](${href})`)
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
      .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<[^>]+>/g, ''),
  );
}

/* ---------------------------------------------------------------- helpers */

function normTitle(t) {
  return t
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Word-overlap match, so "Mastering AWS IAM Users…" finds "Managing AWS IAM Users…". */
function sameTitle(a, b) {
  const wa = new Set(normTitle(a).split(' ').filter((w) => w.length > 2));
  const wb = new Set(normTitle(b).split(' ').filter((w) => w.length > 2));
  if (!wa.size || !wb.size) return false;
  const shared = [...wa].filter((w) => wb.has(w)).length;
  return shared / Math.min(wa.size, wb.size) >= 0.7;
}

/** Hashnode categories include pasted hashtag lists; keep short, real tags. */
function cleanTags(raw) {
  const tags = raw
    .filter((t) => !t.includes('#') && t.length <= 24)
    .map((t) => t.toLowerCase().trim().replace(/\s+/g, '-'))
    .filter(Boolean);
  return [...new Set(tags)].slice(0, 6);
}

function displayDate(raw) {
  const d = new Date(raw);
  if (!raw || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function frontmatter(fields) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) continue;
    lines.push(`${k}: ${JSON.stringify(v)}`); // JSON strings and arrays are valid YAML
  }
  lines.push('---', '');
  return lines.join('\n');
}

/** Every markdown file on disk, keyed so remote items can be matched against it. */
function loadLocal() {
  const files = [];
  for (const dir of [POSTS_DIR, NEWSLETTERS_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.md') || name.startsWith('README')) continue;
      const { data } = matter(fs.readFileSync(path.join(dir, name), 'utf8'));
      files.push({
        file: path.join(dir, name),
        title: String(data.title ?? ''),
        canonical: String(data.canonical_url ?? '').replace(/\/$/, ''),
        synced: Boolean(data.source),
      });
    }
  }
  return files;
}

function write(file, body) {
  const rel = path.relative(ROOT, file);
  if (dryRun) {
    console.log(`[dry-run] ${rel} (${body.length} chars)`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  console.log(`wrote ${rel}`);
}

/** Decide whether a remote item should be written to `file`. */
function shouldWrite(local, { file, url, title }) {
  const byUrl = local.find((f) => f.canonical === url);
  if (byUrl && !byUrl.synced) return false; // hand-written original wins
  if (local.some((f) => !f.synced && f.title && sameTitle(f.title, title))) return false;
  if (fs.existsSync(file)) return force;
  return true;
}

/* --------------------------------------------------------------- hashnode */

async function syncHashnode(local) {
  const sitemap = await fetchText(`${HASHNODE}/sitemap.xml`);
  const slugs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, loc]) => new URL(loc).pathname.replace(/^\/|\/$/g, ''))
    .filter((p) => p && !p.includes('/') && !NOT_POSTS.has(p));

  const rss = new Map(rssItems(await fetchText(`${HASHNODE}/rss.xml`)).map((i) => [new URL(i.link).pathname.slice(1), i]));

  const newsletterSlugs = new Set();
  for (const series of NEWSLETTER_SERIES) {
    const html = await fetchText(`${HASHNODE}/series/${series}`);
    for (const [, s] of html.matchAll(/href="\/([a-z0-9-]+)"/g)) newsletterSlugs.add(s);
  }

  let n = 0;
  for (const slug of slugs) {
    const url = `${HASHNODE}/${slug}`;
    const item = rss.get(slug);
    const md = await fetchText(`${url}.md`);
    let title = item?.title || (md.match(/^\s*#\s+(.+)$/m)?.[1] ?? slug);
    let description = item?.description ?? '';
    let date = item?.pubDate ?? '';
    let cover = item?.cover ?? '';
    // Older posts fall off the 20-item RSS feed; read their page meta instead.
    if (!item) {
      const page = await fetchText(url);
      title = metaContent(page, 'og:title') || title;
      description = metaContent(page, 'og:description');
      date = metaContent(page, 'article:published_time') || page.match(/"datePublished":"([^"]+)"/)?.[1] || '';
      cover = metaContent(page, 'og:image');
    }

    const isNewsletter = newsletterSlugs.has(slug) || NEWSLETTER_TITLE.test(title);
    const file = path.join(isNewsletter ? NEWSLETTERS_DIR : POSTS_DIR, `${slug}.md`);
    if (!shouldWrite(local, { file, url, title })) continue;

    const fm = frontmatter({
      title,
      subtitle: description.replace(/\s+/g, ' ').trim(),
      tags: cleanTags(item?.categories ?? []),
      slug,
      series: isNewsletter ? 'OverflowByte Weekly' : undefined,
      canonical_url: url,
      date: displayDate(date),
      cover,
      source: 'hashnode',
    });
    write(file, `${fm}\n${cleanHashnodeMarkdown(md, title)}\n`);
    local.push({ file, title, canonical: url, synced: true });
    n++;
  }
  return n;
}

/* ----------------------------------------------------------------- medium */

async function syncMedium(local) {
  let n = 0;
  for (const item of rssItems(await fetchText(MEDIUM_FEED))) {
    if (!item.title || !item.link) continue;
    const url = item.link.split('?')[0];
    // Cross-posts of something already here (from Hashnode or hand-written).
    if (local.some((f) => !f.file.includes(`medium-`) && sameTitle(f.title, item.title))) continue;

    const tail = new URL(url).pathname.split('/').pop() ?? '';
    const slug = `medium-${tail.replace(/-[0-9a-f]{10,12}$/, '')}`;
    const file = path.join(POSTS_DIR, `${slug}.md`);
    if (!shouldWrite(local, { file, url, title: item.title })) continue;

    const body = htmlToMarkdown(item.content || item.description);
    const firstPara = body.split('\n\n').find((p) => p && !p.startsWith('!') && !p.startsWith('#')) ?? '';
    const fm = frontmatter({
      title: item.title,
      subtitle: firstPara.replace(/[*_`[\]]/g, '').slice(0, 220),
      tags: cleanTags(item.categories),
      slug,
      canonical_url: url,
      date: displayDate(item.pubDate),
      cover: body.match(/!\[[^\]]*\]\((\S+?)\)/)?.[1],
      source: 'medium',
    });
    write(file, `${fm}\n${body}\n`);
    local.push({ file, title: item.title, canonical: url, synced: true });
    n++;
  }
  return n;
}

/* -------------------------------------------------------------------- run */

const local = loadLocal();
let total = 0;
// Hashnode first: it is the primary blog, so Medium cross-posts dedupe against it.
if (!only || only === 'hashnode') total += await syncHashnode(local);
if (!only || only === 'medium') total += await syncMedium(local);
console.log(`${dryRun ? '[dry-run] ' : ''}done — ${total} file(s) ${dryRun ? 'would be ' : ''}written.`);
