import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import sharp from 'sharp';
import { Users } from './src/payload/collections/Users.ts';
import { Posts } from './src/payload/collections/Posts.ts';
import { Newsletters } from './src/payload/collections/Newsletters.ts';
import { Media } from './src/payload/collections/Media.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const secret = process.env.PAYLOAD_SECRET;
// Checked at runtime only: `next build` loads this config without secrets.
if (!secret && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  throw new Error('PAYLOAD_SECRET must be set in production (see docs/cms.md).');
}

/**
 * Payload CMS config. Admin at /admin, REST at /api, GraphQL at /api/graphql.
 *
 * Articles are stored as markdown (a `code` field), not rich text, because the
 * site renders markdown files; see src/payload/markdown.ts for the bridge.
 *
 * Database: a local SQLite file by default. For production, point
 * PAYLOAD_DATABASE_URL at a hosted database (docs/cms.md).
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — OverflowByte CMS' },
    importMap: { baseDir: path.resolve(dirname, 'src') },
  },
  collections: [Posts, Newsletters, Media, Users],
  secret: secret ?? 'dev-only-secret-change-me',
  sharp,
  db: sqliteAdapter({
    client: {
      url: process.env.PAYLOAD_DATABASE_URL ?? `file:${path.join(dirname, 'payload.db')}`,
      authToken: process.env.PAYLOAD_DATABASE_AUTH_TOKEN,
    },
  }),
  typescript: {
    outputFile: path.join(dirname, 'src', 'payload-types.ts'),
  },
});
