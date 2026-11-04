import type { CollectionConfig } from 'payload';
import { articleFields, removeMarkdownAfterDelete, writeMarkdownAfterChange } from '../markdown.ts';

/**
 * Weekly issues, mirrored to newsletters/*.md and rendered at /newsletter.
 * Synced from blog.overflowbyte.cloud by scripts/sync-cross-platform.mjs, or
 * written here directly.
 */
export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'date', 'source'],
    listSearchableFields: ['title', 'slug', 'subtitle'],
    preview: (doc) => `/newsletter/${doc.slug}`,
  },
  defaultSort: '-date',
  fields: articleFields('newsletters'),
  hooks: {
    afterChange: [writeMarkdownAfterChange('newsletters')],
    afterDelete: [removeMarkdownAfterDelete('newsletters')],
  },
};
