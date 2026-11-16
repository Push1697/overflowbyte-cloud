import type { CollectionConfig } from 'payload';
import { articleFields, removeMarkdownAfterDelete, writeMarkdownAfterChange } from '../markdown.ts';

/**
 * Weekly issues, mirrored to newsletters/*.md and rendered at /newsletter.
 * Older issues were imported from the retired Hashnode blog; new ones are
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
