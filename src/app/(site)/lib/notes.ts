import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { listMarkdownSlugs, toTime } from './posts';

const NOTES_DIR = path.join(process.cwd(), 'notes');

/**
 * Notes are the reference shelf: labs, cheat sheets and runbooks that used to
 * live on the separate learning garden. They are plain markdown in /notes.
 */
export type NoteFrontmatter = {
  title?: string;
  subtitle?: string;
  date?: string;
  tags?: string[];
  /** Shelf the note sits on: Guides, Reference, Troubleshooting… */
  section?: string;
  /** Notes that form a course share a series and are read in series_order. */
  series?: string;
  series_group?: string;
  series_order?: number;
  draft?: boolean;
};

export type Note = {
  /** Route slug, i.e. the markdown filename without its extension. */
  slug: string;
  frontmatter: NoteFrontmatter;
  content: string;
};

export function getNoteSlugs(): string[] {
  return listMarkdownSlugs(NOTES_DIR);
}

/** Loads one note by route slug; the slug is checked against the file list first. */
export function getNote(slug: string): Note | null {
  if (!getNoteSlugs().includes(slug)) return null;

  const raw = fs.readFileSync(path.join(NOTES_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);

  return { slug, frontmatter: data as NoteFrontmatter, content };
}

export function getNotes(): Note[] {
  return getNoteSlugs()
    .map(getNote)
    .filter((n): n is Note => n !== null);
}

/** Notes of one series in reading order. */
export function getSeries(series: string): Note[] {
  return getNotes()
    .filter((n) => n.frontmatter.series === series)
    .sort((a, b) => (a.frontmatter.series_order ?? 999) - (b.frontmatter.series_order ?? 999));
}

/** Notes outside any series, grouped by section, newest first inside each. */
export function getShelves(): { section: string; notes: Note[] }[] {
  const shelves = new Map<string, Note[]>();
  for (const note of getNotes()) {
    if (note.frontmatter.series) continue;
    const section = note.frontmatter.section ?? 'Notes';
    shelves.set(section, [...(shelves.get(section) ?? []), note]);
  }
  return [...shelves.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([section, notes]) => ({
      section,
      notes: notes.sort((a, b) => toTime(b.frontmatter.date) - toTime(a.frontmatter.date)),
    }));
}
