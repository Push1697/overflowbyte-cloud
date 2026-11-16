import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBookOpen, faCalendar, faRoute } from '@fortawesome/free-solid-svg-icons';
import { getNotes, getSeries, getShelves, type Note } from '../lib/notes';

export const metadata: Metadata = {
  title: 'Notes — labs, cheat sheets and runbooks | OverflowByte',
  description:
    'The reference shelf: the RHCSA to RHCE lab curriculum, troubleshooting drills, cheat sheets and runbooks.',
  alternates: { canonical: '/notes' },
};

function NoteCard({ note, step }: { note: Note; step?: number }) {
  const { slug, frontmatter: fm } = note;
  const href = `/notes/${slug}`;

  return (
    <article className="card card-pad card-interactive reveal">
      <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="badge badge-neutral">
          {step !== undefined ? `Step ${String(step).padStart(2, '0')}` : (fm.section ?? 'Note')}
        </span>
        {fm.date && (
          <span className="meta">
            <FontAwesomeIcon icon={faCalendar} className="fa-ico" />
            {fm.date}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>
        <Link className="title-link" href={href}>
          {fm.title ?? slug}
        </Link>
      </h3>
      {fm.subtitle && (
        <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
          {fm.subtitle}
        </p>
      )}
      <div className="cluster" style={{ marginTop: '0.9rem', ['--cluster-gap' as string]: '0.4rem' }}>
        {fm.tags?.slice(0, 4).map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function NotesIndexPage() {
  const total = getNotes().length;
  // Every series gets its own block, read in order and split by its groups.
  const seriesNames = [...new Set(getNotes().map((n) => n.frontmatter.series).filter((s): s is string => Boolean(s)))];
  const shelves = getShelves();

  return (
    <div className="shell section">
      <header style={{ maxWidth: '56rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <FontAwesomeIcon icon={faBookOpen} className="fa-ico" />
          Notes · {total} entries
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          The reference shelf
        </h1>
        <p className="lede">
          Labs, cheat sheets and runbooks you come back to. The long-form stories are under{' '}
          <Link className="action-link" href="/blog">
            articles
          </Link>
          ; flashcards and interactive labs are under{' '}
          <Link className="action-link" href="/learn">
            learn
          </Link>
          .
        </p>
      </header>

      {seriesNames.map((series) => {
        const notes = getSeries(series);
        const groups = [...new Set(notes.map((n) => n.frontmatter.series_group ?? ''))];

        return (
          <section key={series} className="section-tight" aria-label={series}>
            <header style={{ marginBottom: '1.5rem' }}>
              <p className="eyebrow">
                <FontAwesomeIcon icon={faRoute} className="fa-ico" />
                Series · {notes.length} parts
              </p>
              <h2 style={{ fontSize: 'var(--step-4)', margin: '0.75rem 0' }}>{series}</h2>
              <Link className="btn btn-primary btn-sm" href={`/notes/${notes[0].slug}`}>
                Start with part one
                <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
              </Link>
            </header>

            {groups.map((group) => (
              <div key={group || 'all'} style={{ marginBottom: '2rem' }}>
                {group && (
                  <h3 className="text-muted" style={{ fontSize: 'var(--step-0)', marginBottom: '1rem' }}>
                    {group}
                  </h3>
                )}
                <div className="grid deck-grid" style={{ gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                  {notes
                    .filter((n) => (n.frontmatter.series_group ?? '') === group)
                    .map((note) => (
                      <NoteCard key={note.slug} note={note} step={note.frontmatter.series_order} />
                    ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      {shelves.map(({ section, notes }) => (
        <section key={section} className="section-tight" aria-label={section}>
          <h2 style={{ fontSize: 'var(--step-3)', marginBottom: '1.25rem' }}>{section}</h2>
          <div className="grid deck-grid" style={{ gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
            {notes.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
