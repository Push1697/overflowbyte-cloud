/**
 * Import every markdown file (posts/*.md, newsletters/*.md) into Payload.
 * Run with: npm run cms:push
 * Idempotent: matches on the filename slug and updates existing documents.
 * The files are the source here, so the afterChange hook is told not to
 * rewrite them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import { markdownToDoc, type Collection } from '../src/payload/markdown.ts';

const payload = await getPayload({ config });
const context = { skipMarkdown: true };

for (const collection of ['posts', 'newsletters'] as Collection[]) {
  const dir = path.join(process.cwd(), collection);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md') || name.startsWith('README')) continue;
    const slug = name.replace(/\.md$/, '');
    const data = markdownToDoc(slug, fs.readFileSync(path.join(dir, name), 'utf8'));
    const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1 });
    if (docs[0]) {
      await payload.update({ collection, id: docs[0].id, data, context });
      console.log(`updated ${collection}/${slug}`);
    } else {
      await payload.create({ collection, data, context });
      console.log(`created ${collection}/${slug}`);
    }
  }
}

console.log('cms:push complete');
process.exit(0);
