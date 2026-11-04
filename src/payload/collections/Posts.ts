import type { CollectionConfig } from 'payload';
import { articleFields, removeMarkdownAfterDelete, writeMarkdownAfterChange } from '../markdown.ts';

/** Articles, mirrored to posts/*.md and rendered at /blog/<slug>. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'date', 'series', 'source'],
    listSearchableFields: ['title', 'slug', 'subtitle'],
    preview: (doc) => `/blog/${doc.slug}`,
  },
  defaultSort: '-date',
  fields: articleFields('posts'),
  hooks: {
    afterChange: [writeMarkdownAfterChange('posts')],
    afterDelete: [removeMarkdownAfterDelete('posts')],
  },
};
