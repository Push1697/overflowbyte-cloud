#!/usr/bin/env node
/*
 * Converts a Quartz/Obsidian note from the learning.overflowbyte.cloud garden
 * into Hashnode-ready markdown, keeping the prose word for word.
 *
 * Only things Hashnode cannot render are rewritten:
 *   - YAML frontmatter            -> stripped, emitted as metadata JSON
 *   - duplicate leading `# Title` -> stripped (Hashnode renders the title field)
 *   - ![[file.webp|alt]]         -> ![alt](hashnode CDN url)
 *   - [[slug|Label]]             -> [Label](https://learning.overflowbyte.cloud/blog/slug)
 *   - > [!danger] Heading        -> > **🚨 Heading**
 *   - %% obsidian comment %%     -> stripped
 *   - <style> blocks             -> stripped (Hashnode sanitises them anyway)
 *   - inline-styled HTML chrome  -> markdown that keeps every word it contained
 *   - href="/static/x"           -> absolute garden URL
 *
 * Usage: node prep.mjs <note.md> <images.json|-> <out.md> <out.json>
 */
import fs from 'node:fs';
import path from 'node:path';

const GARDEN = 'https://learning.overflowbyte.cloud';

const [, , notePath, imagesPath, outMd, outJson] = process.argv;
if (!notePath) {
  console.error('usage: prep.mjs <note.md> <images.json|-> <out.md> <out.json>');
  process.exit(2);
}

const images =
  imagesPath && imagesPath !== '-' ? JSON.parse(fs.readFileSync(imagesPath, 'utf8')) : {};

const raw = fs.readFileSync(notePath, 'utf8').replace(/\r\n/g, '\n');

/* ---- frontmatter -------------------------------------------------------- */
const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
if (!fm) {
  console.error(`${notePath}: no frontmatter`);
  process.exit(1);
}
let body = raw.slice(fm[0].length);

// The frontmatter here is flat scalars plus a `tags:` list — a full YAML
// parser would be overkill and would drag a dependency into the scratchpad.
const meta = {};
let listKey = null;
for (const line of fm[1].split('\n')) {
  const item = line.match(/^\s+-\s+(.*)$/);
  if (item && listKey) {
    meta[listKey].push(unquote(item[1]));
    continue;
  }
  const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
  if (!kv) continue;
  const [, key, value] = kv;
  if (value === '') {
    listKey = key;
    meta[key] = [];
  } else {
    listKey = null;
    meta[key] = unquote(value);
  }
}

function unquote(s) {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).replace(/\\"/g, '"');
  }
  return t;
}

/* ---- the one bespoke rewrite: the php2shell HTML chrome ------------------
   Two inline-styled <div> blocks and a <style> block wrap an <iframe>.
   Hashnode strips all of it, so the words inside would vanish with it.
   They are re-emitted as markdown instead. */
const threatBanner =
  '> **🚨 CRITICAL RUNTIME ZERO-DAY · CVSS 9.2 · EXPLOITED IN THE WILD**\n' +
  '>\n' +
  `> [**Open Fullscreen Experience ↗**](${GARDEN}/static/php2shell-node2shell.html)\n`;

const interactiveBlock =
  '### OverflowByte Interactive Security Lab · PHP2Shell & Node2Shell Live Simulation\n\n' +
  'The animated attack simulation is interactive and cannot be embedded here.\n\n' +
  `[**Launch the live simulation in a full window ↗**](${GARDEN}/static/php2shell-node2shell.html)\n`;

// Match each top-level <div …>…</div> block by its class, non-greedily to its
// own closing tag at column 0.
body = body.replace(
  /<div class="overflowbyte-threat-banner"[\s\S]*?\n<\/div>\n/,
  threatBanner,
);
body = body.replace(
  /<!-- Embedded Interactive Animated Blog Experience -->\n<div class="interactive-experience-wrapper"[\s\S]*?\n<\/div>\n/,
  interactiveBlock,
);

/* ---- generic cleanups --------------------------------------------------- */
body = body.replace(/<style>[\s\S]*?<\/style>\n?/g, '');
body = body.replace(/^%%[\s\S]*?%%\s*$/gm, '');

// Obsidian callouts -> bolded blockquote heading.
const CALLOUT = {
  danger: '🚨',
  warning: '⚠️',
  caution: '⛔',
  tip: '💡',
  note: '📝',
  info: 'ℹ️',
  important: '❗',
  success: '✅',
  question: '❓',
};
body = body.replace(/^> \[!(\w+)\]\s*(.*)$/gm, (m, kind, heading) => {
  const emoji = CALLOUT[kind.toLowerCase()] ?? 'ℹ️';
  const text = heading.trim();
  return text ? `> **${emoji} ${text}**\n>` : `> **${emoji} ${kind.toUpperCase()}**\n>`;
});

/* ---- image embeds ------------------------------------------------------- */
const missing = [];
body = body.replace(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g, (m, file, alt) => {
  const name = file.trim();
  const url = images[name];
  if (!url) {
    missing.push(name);
    return m;
  }
  return `![${(alt ?? name).trim()}](${url})`;
});

/* ---- internal wikilinks ------------------------------------------------- */
body = body.replace(/\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g, (m, target, label) => {
  const slug = target.trim();
  return `[${(label ?? slug).trim()}](${GARDEN}/blog/${slug})`;
});

/* ---- absolute URLs for garden-relative links ---------------------------- */
body = body.replace(/\]\(\/(?!\/)/g, `](${GARDEN}/`);
body = body.replace(/href="\/(?!\/)/g, `href="${GARDEN}/`);

/* ---- drop the duplicate H1 --------------------------------------------- */
let h1 = null;
body = body.replace(/^#\s+(.+)$/m, (m, text) => {
  if (h1 !== null) return m;
  h1 = text.trim();
  return '';
});

body = body.replace(/\n{3,}/g, '\n\n').trim() + '\n';

/* ---- emit --------------------------------------------------------------- */
const slug = path.basename(notePath, '.md');
const out = {
  slug,
  title: meta.title ?? h1 ?? slug,
  subtitle: undefined,
  description: meta.description ?? '',
  tags: meta.tags ?? [],
  created: meta.created ?? '',
  originalArticleUrl: `${GARDEN}/blog/${slug}`,
  droppedH1: h1,
  missingImages: missing,
  chars: body.length,
};

fs.writeFileSync(outMd, body, 'utf8');
fs.writeFileSync(outJson, JSON.stringify(out, null, 2), 'utf8');

console.log(JSON.stringify(out, null, 2));
const leftovers = [
  ...body.matchAll(/<(iframe|div|span|style)\b/g),
].map((m) => m[1]);
if (leftovers.length) console.log('WARN remaining html tags:', [...new Set(leftovers)].join(', '));
if (missing.length) console.log('WARN unresolved images:', missing.join(', '));
