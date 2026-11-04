#!/usr/bin/env node
/*
 * Newsletter banner (1200x630 SVG, the social-card size), in the logo's colours:
 * orange #f39c4a, indigo #6366f1/#a5b4fc, cyan #5ee1ff.
 *
 *   npm run newsletter:banner -- --date 2026-11-08 --issue 9 \
 *     --range "Nov 2–8, 2026" --lines "First line,|second line,|third line" \
 *     --chips "Kubernetes,AWS,Linux"
 *
 * Writes public/static/newsletter/<date>-banner.svg. Keep each line under ~26
 * characters and use at most 5 chips, or the text runs off the card.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'static', 'newsletter');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0 || !process.argv[i + 1]) {
    console.error(`missing --${name}`);
    process.exit(1);
  }
  return process.argv[i + 1];
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function banner({ file, issue, range, lines, chips }) {
  let x = 80;
  const chipSvg = chips
    .map((c, i) => {
      const w = c.length * 12.5 + 40;
      const colour = ['#f39c4a', '#a5b4fc', '#5ee1ff', '#10b981'][i % 4];
      const g = `<g transform="translate(${x} 470)"><rect width="${w}" height="44" rx="22" fill="${colour}" fill-opacity="0.12" stroke="${colour}" stroke-opacity="0.55"/><text x="${w / 2}" y="29" text-anchor="middle" fill="${colour}" font-size="20" font-weight="600">${esc(c)}</text></g>`;
      x += w + 14;
      return g;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <radialGradient id="glow" cx="85%" cy="15%" r="60%"><stop offset="0" stop-color="#f39c4a" stop-opacity="0.28"/><stop offset="1" stop-color="#f39c4a" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow2" cx="10%" cy="100%" r="55%"><stop offset="0" stop-color="#6366f1" stop-opacity="0.25"/><stop offset="1" stop-color="#6366f1" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.04"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="#0d1117"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <!-- the logo's three bars, as a brand mark -->
  <g transform="translate(80 80)">
    <rect width="88" height="14" rx="7" fill="#f39c4a"/>
    <rect y="26" width="60" height="14" rx="7" fill="#a5b4fc"/>
    <rect y="50" width="60" height="14" rx="7" fill="#6366f1"/>
    <rect x="76" y="50" width="14" height="14" rx="3" fill="#5ee1ff"/>
  </g>
  <text x="196" y="112" fill="#ededed" font-size="26" font-weight="700" letter-spacing="1">OVERFLOWBYTE <tspan fill="#f39c4a">WEEKLY</tspan></text>
  <text x="196" y="142" fill="#8b949e" font-size="20">Issue ${esc(issue)} · ${esc(range)}</text>
  ${lines.map((l, i) => `<text x="80" y="${270 + i * 74}" fill="#ededed" font-size="60" font-weight="800" letter-spacing="-1.5">${esc(l)}</text>`).join('\n  ')}
  ${chipSvg}
  <rect y="618" width="1200" height="12" fill="#f39c4a"/>
</svg>
`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, file), svg);
  console.log(`wrote ${path.relative(ROOT, path.join(OUT, file))}`);
}

banner({
  file: `${arg('date')}-banner.svg`,
  issue: `#${arg('issue')}`,
  range: arg('range'),
  lines: arg('lines').split('|').map((l) => l.trim()),
  chips: arg('chips').split(',').map((c) => c.trim()),
});
