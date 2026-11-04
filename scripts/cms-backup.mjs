#!/usr/bin/env node
/*
 * Snapshot the local CMS database (payload.db) into backups/.
 *
 *   npm run cms:backup             keep the newest 10 snapshots
 *   npm run cms:backup -- --keep 30
 *
 * Uses SQLite's VACUUM INTO, which writes a consistent copy even while
 * `npm run dev` has the database open. To restore, stop the dev server and
 * copy a snapshot over payload.db.
 *
 * The markdown files in git are the real content backup (npm run cms:push
 * rebuilds the database from them); this also keeps admin users and anything
 * not yet saved to a file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB = path.join(ROOT, 'payload.db');
const DIR = path.join(ROOT, 'backups');
const keepArg = process.argv.indexOf('--keep');
const keep = keepArg >= 0 ? Number(process.argv[keepArg + 1]) : 10;

if (!fs.existsSync(DB)) {
  console.error(`No database at ${DB}; nothing to back up.`);
  process.exit(1);
}

fs.mkdirSync(DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const out = path.join(DIR, `payload-${stamp}.db`);

const client = createClient({ url: `file:${DB}` });
// VACUUM INTO takes a string literal; the path is ours, but escape quotes anyway.
await client.execute(`VACUUM INTO '${out.replace(/'/g, "''")}'`);
client.close();
console.log(`backed up to ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);

const old = fs
  .readdirSync(DIR)
  .filter((f) => /^payload-.*\.db$/.test(f))
  .sort()
  .reverse()
  .slice(keep);
for (const f of old) fs.rmSync(path.join(DIR, f));
if (old.length) console.log(`removed ${old.length} older snapshot(s), keeping ${keep}`);
