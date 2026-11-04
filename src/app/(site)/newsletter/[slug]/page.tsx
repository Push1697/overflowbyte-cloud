import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import Mermaid from '../../components/visuals/Mermaid';
import { getNewsletter, getNewsletterSlugs } from '../../lib/newsletters';

export function generateStaticParams() {
  return getNewsletterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsletter(slug);
  if (!item) return { title: 'Issue not found' };
  const { title, subtitle, canonical_url: canonical } = item.frontmatter;
  return {
    title: title ?? slug,
    description: subtitle,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title, description: subtitle, type: 'article' },
  };
}

export default async function NewsletterIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getNewsletter(slug);
  if (!item) notFound();

  const { frontmatter, content } = item;
  const canonical = frontmatter.canonical_url;

  return (
    <article className="shell section" style={{ maxWidth: '920px' }}>
      <Link className="action-link" href="/newsletter" style={{ color: 'var(--text-muted)' }}>
        <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
        All newsletter issues
      </Link>

      <header style={{ marginTop: '1.75rem' }}>
        <div className="cluster" style={{ marginBottom: '1rem' }}>
          <span className="badge badge-accent">{frontmatter.series ?? 'Weekly Newsletter'}</span>
          {frontmatter.date && <span className="meta">{frontmatter.date}</span>}
          {frontmatter.source && <span className="badge badge-neutral">via {frontmatter.source}</span>}
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

      {canonical && (
        <div className="card card-pad card-quiet" style={{ marginTop: '2rem', padding: '1rem 1.25rem' }}>
          <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
            Originally published:{' '}
            <a
              href={canonical}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              blog.overflowbyte.cloud
              <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
            </a>
          </p>
        </div>
      )}

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
            h1: () => null,
          }}
        >
          {content}
        </Markdown>
      </div>
    </article>
  );
}
