import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Mermaid from '../../components/visuals/Mermaid';
import { getNote, getNoteSlugs, getSeries } from '../../lib/notes';

export function generateStaticParams() {
  return getNoteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: 'Note not found' };
  const { title, subtitle } = note.frontmatter;
  return {
    title: title ?? slug,
    description: subtitle,
    alternates: { canonical: `/notes/${slug}` },
    openGraph: { title, description: subtitle, type: 'article' },
  };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const { frontmatter, content } = note;
  // Previous and next part, when the note belongs to a series.
  const series = frontmatter.series ? getSeries(frontmatter.series) : [];
  const index = series.findIndex((n) => n.slug === slug);
  const prev = index > 0 ? series[index - 1] : null;
  const next = index >= 0 && index < series.length - 1 ? series[index + 1] : null;

  return (
    <article className="shell section" style={{ maxWidth: '920px' }}>
      <Link className="action-link" href="/notes" style={{ color: 'var(--text-muted)' }}>
        <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
        All notes
      </Link>

      <header style={{ marginTop: '1.75rem' }}>
        <div className="cluster" style={{ marginBottom: '1rem' }}>
          {frontmatter.series && (
            <span className="badge badge-accent">
              {frontmatter.series}
              {index >= 0 && ` · ${index + 1} of ${series.length}`}
            </span>
          )}
          {frontmatter.section && <span className="badge badge-neutral">{frontmatter.section}</span>}
          {frontmatter.date && <span className="meta">{frontmatter.date}</span>}
        </div>

        <h1 style={{ fontSize: 'var(--step-5)' }}>{frontmatter.title ?? slug}</h1>

        {frontmatter.subtitle && (
          <p className="lede" style={{ marginTop: '1rem' }}>
            {frontmatter.subtitle}
          </p>
        )}

        {frontmatter.tags?.length ? (
          <div className="cluster" style={{ marginTop: '1.25rem', ['--cluster-gap' as string]: '0.4rem' }}>
            {frontmatter.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="prose" style={{ marginTop: '3rem' }}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            table: ({ children, ...props }) => (
              <div className="table-scroll">
                <table {...props}>{children}</table>
              </div>
            ),
            code: ({ className, children }) => {
              if (/language-mermaid/.test(className ?? '')) {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
              }
              return <code className={className}>{children}</code>;
            },
            // The page header already shows the title.
            h1: () => null,
          }}
        >
          {content}
        </Markdown>
      </div>

      {(prev || next) && (
        <nav
          className="cluster"
          aria-label="Series navigation"
          style={{ justifyContent: 'space-between', marginTop: '3rem' }}
        >
          {prev ? (
            <Link className="btn btn-secondary btn-sm" href={`/notes/${prev.slug}`}>
              <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
              {prev.frontmatter.title ?? prev.slug}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link className="btn btn-primary btn-sm" href={`/notes/${next.slug}`}>
              {next.frontmatter.title ?? next.slug}
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
