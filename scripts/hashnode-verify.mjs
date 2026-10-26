/*
 * Word-for-word check: every word of PROSE in the source note must survive into
 * the Hashnode markdown.
 *
 * The source is reduced the same way a reader sees it — frontmatter, <style>
 * blocks and HTML attributes carry no prose, so they are removed before the
 * comparison; the TEXT inside HTML tags is kept, because that text is exactly
 * what must not disappear. Link/image syntax on both sides collapses to its
 * visible label plus its URL.
 *
 * Usage: node verify.mjs <source.md> <hashnode.md>
 */
import fs from 'node:fs';

const [, , srcPath, outPath] = process.argv;

const strip = (s) =>
  s
    .replace(/\r\n/g, '\n')
    .replace(/^---\n[\s\S]*?\n---\n/, '') // frontmatter
    .replace(/<style>[\s\S]*?<\/style>/g, '') // css, no prose
    .replace(/%%[\s\S]*?%%/g, '') // obsidian comments
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\sstyle="[^"]*"/g, '') // css in attributes, no prose
    .replace(/\s(?:class|target|rel|title|loading|allow|src|href)="([^"]*)"/g, ' $1 ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ') // tags out, inner text stays
    .replace(/!\[\[([^\]|]+)\|([^\]]*)\]\]/g, ' $2 $1 ') // obsidian embed -> alt + file
    .replace(/!\[\[([^\]|]+)\]\]/g, ' $1 ')
    .replace(/\[\[([^\]|]+)\|([^\]]*)\]\]/g, ' $2 $1 ')
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, ' $1 $2 ') // md image -> alt + url
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, ' $1 $2 ')
    .replace(/^>\s*\[!(\w+)\]\s*/gm, ' ') // callout marker, not prose
    .toLowerCase();

// Words only: punctuation, markdown markers and css noise drop out.
const words = (s) => (s.match(/[a-z0-9][a-z0-9._/+-]*/g) ?? []).filter((w) => w.length > 1);

const bag = (list) => {
  const m = new Map();
  for (const w of list) m.set(w, (m.get(w) ?? 0) + 1);
  return m;
};

const src = bag(words(strip(fs.readFileSync(srcPath, 'utf8'))));
const out = bag(words(strip(fs.readFileSync(outPath, 'utf8'))));

const lost = [];
for (const [w, n] of src) {
  const have = out.get(w) ?? 0;
  if (have < n) lost.push(`${w} (source ${n}, hashnode ${have})`);
}
const added = [];
for (const [w, n] of out) {
  const have = src.get(w) ?? 0;
  if (have < n) added.push(`${w} (source ${have}, hashnode ${n})`);
}

console.log(`source words: ${[...src.values()].reduce((a, b) => a + b, 0)}`);
console.log(`hashnode words: ${[...out.values()].reduce((a, b) => a + b, 0)}`);
console.log(`\nMISSING from hashnode (${lost.length}):`);
console.log(lost.length ? lost.join('\n') : '  none');
console.log(`\nEXTRA in hashnode (${added.length}):`);
console.log(added.length ? added.join('\n') : '  none');
