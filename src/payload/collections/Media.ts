import type { CollectionConfig } from 'payload';

/**
 * Images for articles. Upload here, then paste the file's URL into the
 * markdown: ![alt](/media/file.png). Files land in public/media so the static
 * site serves them directly. On Vercel the filesystem is read-only, so
 * production uploads need a storage adapter (see docs/cms.md).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
  },
  fields: [{ name: 'alt', type: 'text', required: true }],
};
