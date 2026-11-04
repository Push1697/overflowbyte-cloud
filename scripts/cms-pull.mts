/**
 * Export everything in Payload back into markdown files, so the static site
 * renders CMS-managed content. On Vercel, run it before the build:
 *   npm run cms:pull && npm run build
 * Files for documents deleted in the CMS are not removed here; delete them in
 * git.
 */
import fs from 'node:fs';
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import { dirFor, docToMarkdown, fileFor, type Collection, type MarkdownDoc } from '../src/payload/markdown.ts';

const payload = await getPayload({ config });

for (const collection of ['posts', 'newsletters'] as Collection[]) {
  const { docs } = await payload.find({ collection, limit: 0, pagination: false });
  fs.mkdirSync(dirFor(collection), { recursive: true });
  for (const doc of docs) {
    fs.writeFileSync(fileFor(collection, doc.slug), docToMarkdown(doc as unknown as MarkdownDoc));
  }
  console.log(`${collection}: wrote ${docs.length} file(s)`);
}

process.exit(0);
