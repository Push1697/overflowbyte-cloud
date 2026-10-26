/*
 * Publishes a prepared post to Hashnode.
 *
 * Spawns the CLI with an explicit argv array rather than a shell string, so
 * apostrophes and quotes inside the title and description (there are several)
 * cannot be mangled by shell quoting.
 *
 * Usage: node publish.mjs <meta.json> <body.md> [--tags a,b,c] [--cover <url>] [--dry]
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PUBLICATION_ID = '6087f0c5aaea092e0faa6236'; // blog.overflowbyte.cloud

const [, , metaPath, bodyPath, ...rest] = process.argv;
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

const flag = (name) => {
  const i = rest.indexOf(name);
  return i === -1 ? null : rest[i + 1];
};
const dry = rest.includes('--dry');

const tags = (flag('--tags') ?? meta.tags.join(',')).trim();
const cover = flag('--cover');

// publishPost is gated behind the publication's Pro plan; createDraft may not
// be, so the same metadata can go either way.
const kind = rest.includes('--draft') ? 'draft' : 'post';

const args = [
  '--publication-id',
  PUBLICATION_ID,
  kind,
  'create',
  '--title',
  meta.title,
  '--slug',
  meta.slug,
  '--tag',
  tags,
  '--original-article-url',
  meta.originalArticleUrl,
  '--content-file',
  path.resolve(bodyPath),
  '--json',
];

// `draft create` has no --meta-description flag; metaTags go via --input there.
if (meta.description && kind === 'post') args.push('--meta-description', meta.description);
if (meta.created) args.push('--published-at', `${meta.created}T09:00:00.000Z`);
if (cover) args.push('--cover-image', cover);

if (dry) {
  console.log(args.map((a) => (a.length > 90 ? a.slice(0, 90) + '…' : a)).join('\n  '));
  process.exit(0);
}

// The `hashnode` shim is a .cmd on Windows, which would need shell: true —
// and a shell re-splits every argument on spaces, breaking the title. Spawn
// the CLI's own entry point instead so argv is passed through untouched.
const npmRoot = spawnSync('npm', ['root', '-g'], { encoding: 'utf8', shell: true })
  .stdout?.trim();
const CLI = path.join(npmRoot ?? '', '@hashnode', 'cli', 'dist', 'index.js');
if (!fs.existsSync(CLI)) {
  console.error(`hashnode CLI not found at ${CLI} — run: npm i -g @hashnode/cli`);
  process.exit(1);
}

const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', shell: false });
process.stdout.write(r.stdout ?? '');
process.stderr.write(r.stderr ?? '');
process.exit(r.status ?? 1);
