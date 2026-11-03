#!/usr/bin/env node
/*
 * Collects every article across the three sources into one inventory, and
 * emits a single article's body ready to paste into a content run.
 *
 * This is a script rather than a model task on purpose: finding files and
 * stripping frontmatter is deterministic work, and a model asked to "scrape
 * the site" will quietly miss things and never tell you which.
 *
 *   node scripts/corpus.mjs list              inventory, with PII flags
 *   node scripts/corpus.mjs list --flagged    only articles needing sanitizing
 *   node scripts/corpus.mjs emit <slug>       body to stdout, frontmatter gone
 *   node scripts/corpus.mjs emit <slug> -o f  ...to a file
 *   node scripts/corpus.mjs scan <slug>       just the PII findings
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME = process.env.USERPROFILE ?? process.env.HOME ?? '';

const SOURCES = [
  { name: 'site', dir: path.join(ROOT, 'posts') },
  { name: 'garden', dir: path.resolve(ROOT, '..', 'quartz_blog', 'content', 'blog') },
  {
    name: 'inbox',
    dir: path.join(HOME, 'Downloads', 'M365-Device-Lock-Solution-Blog-markdown'),
  },
];

/* Patterns that mean "a human must look at this before it is published".
   Deliberately noisy: a false positive costs ten seconds, a miss is a leak. */
const PII = [
  { label: 'email/UPN', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { label: 'tenant', re: /[A-Za-z0-9-]+\.onmicrosoft\.com/g },
  { label: 'guid', re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
  { label: 'ipv4', re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
  { label: 'private-host', re: /\b[a-z0-9-]+\.(?:local|internal|corp|lan)\b/gi },
  { label: 'serial', re: /\b[A-Z0-9]{10,}\b/g },
  { label: 'image', re: /!\[[^\]]*\]\(([^)]+)\)/g },
];

/* Values that are public constants or already-anonymised placeholders. Matching
   one of these is not a finding. */
const BENIGN = [
  /^alex@contoso\.com$/i,
  /^it-admin@contoso\.com$/i,
  /@(?:contoso|example)\.(?:com|org|net)$/i,
  /^(\d)\1{7}-(\1{4})-/, // 11111111-1111-... style placeholders
  /^0{8}-0{4}-0{4}-0{4}-0{12}$/,
  /^0000000a-0000-0000-c000-000000000000$/i, // MS Intune Enrollment, published
  /^d4ebce55-015a-49b5-a083-c84d1797ae8c$/i, // MS Intune, published
  /^(?:10|127)\./,
  /^192\.168\./,
  /^203\.0\.113\./, // TEST-NET-3, the documentation range
];

const isBenign = (v) => BENIGN.some((re) => re.test(v));

function articles() {
  const out = [];

  for (const src of SOURCES) {
    if (!fs.existsSync(src.dir)) continue;

    for (const file of fs.readdirSync(src.dir)) {
      if (!file.endsWith('.md')) continue;
      out.push({
        source: src.name,
        slug: path.basename(file, '.md'),
        file: path.join(src.dir, file),
      });
    }
  }

  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

function body(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

function scan(file) {
  const text = fs.readFileSync(file, 'utf8');
  const found = new Map();

  for (const { label, re } of PII) {
    for (const m of text.matchAll(re)) {
      const value = m[1] ?? m[0];
      if (label !== 'image' && isBenign(value)) continue;
      if (!found.has(label)) found.set(label, new Set());
      found.get(label).add(value);
    }
  }

  return found;
}

const [, , cmd = 'list', arg, ...rest] = process.argv;
const all = articles();

if (cmd === 'list') {
  const flaggedOnly = process.argv.includes('--flagged');
  let total = 0;

  for (const a of all) {
    const found = scan(a.file);
    // Images always need a human pass, but they are not a text finding.
    const textFlags = [...found.keys()].filter((k) => k !== 'image');
    const images = found.get('image')?.size ?? 0;

    if (flaggedOnly && textFlags.length === 0) continue;

    const words = body(a.file).split(/\s+/).length;
    total += 1;

    console.log(
      `${a.source.padEnd(7)} ${a.slug.padEnd(58)} ${String(words).padStart(5)}w` +
        `${images ? `  ${String(images).padStart(2)} img` : '       '}` +
        `${textFlags.length ? `  FLAG: ${textFlags.join(', ')}` : ''}`,
    );
  }

  console.log(`\n${total} article${total === 1 ? '' : 's'}.`);
  console.log('Any FLAG, or any img count, means run the sanitization pass first.');
  process.exit(0);
}

const target = all.find((a) => a.slug === arg);
if (!target) {
  console.error(`No article "${arg}". Run: node scripts/corpus.mjs list`);
  process.exit(1);
}

if (cmd === 'scan') {
  const found = scan(target.file);
  if (!found.size) {
    console.log('No findings. Images still need a human pass if the article has any.');
    process.exit(0);
  }
  for (const [label, values] of found) {
    console.log(`${label} (${values.size}):`);
    for (const v of values) console.log(`  ${v}`);
  }
  process.exit(0);
}

if (cmd === 'emit') {
  const text = body(target.file);
  const outIdx = rest.indexOf('-o');

  if (outIdx !== -1 && rest[outIdx + 1]) {
    fs.writeFileSync(rest[outIdx + 1], text, 'utf8');
    console.error(`${text.split(/\s+/).length} words -> ${rest[outIdx + 1]}`);
  } else {
    process.stdout.write(text);
  }
  process.exit(0);
}

console.error(`Unknown command "${cmd}". Try: list | scan <slug> | emit <slug>`);
process.exit(1);
