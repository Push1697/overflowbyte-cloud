import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faGraduationCap,
  faUpRightFromSquare,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import NewgrpPlayer from '../../components/visuals/NewgrpPlayer';
import ModeBits from '../../components/visuals/ModeBits';
import DacFlow from '../../components/visuals/DacFlow';
import { getPost, getPostSlugs } from '../../lib/posts';

const LAB_HREF = '/visuals/linux-permissions';

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post not found' };

  const { title, subtitle, canonical_url: canonical } = post.frontmatter;
  return {
    title,
    description: subtitle,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title, description: subtitle, type: 'article' },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  // Previously every slug served article #1; unknown slugs now 404.
  if (!post) notFound();

  const { frontmatter, content } = post;
  const canonical = frontmatter.canonical_url;
  const hasLab = slug.startsWith('01-');
  // Flagship number comes from the filename prefix (01-…, 11-…).
  const flagshipNum = slug.split('-')[0];

  return (
    <article className="shell section" style={{ maxWidth: '920px' }}>
      <Link className="action-link" href="/blog" style={{ color: 'var(--text-muted)' }}>
        <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
        Back to the flagship series
      </Link>

      <header style={{ marginTop: '1.75rem' }}>
        <div className="cluster" style={{ marginBottom: '1rem' }}>
          {frontmatter.series && (
            <span className="badge badge-accent">{frontmatter.series}</span>
          )}
          <span className="badge badge-ok">
            <span className="live-dot" aria-hidden="true" />
            Flagship #{flagshipNum}
          </span>
          <span className="meta">{frontmatter.date ?? '1 Nov 2026'}</span>
        </div>

        <h1 style={{ fontSize: 'var(--step-5)' }}>{frontmatter.title}</h1>

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
        <div
          className="card card-pad card-quiet"
          style={{ marginTop: '2rem', padding: '1rem 1.25rem' }}
        >
          <div
            className="cluster"
            style={{ justifyContent: 'space-between', ['--cluster-gap' as string]: '0.75rem' }}
          >
            <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
              Canonical home:{' '}
              <a
                href={canonical}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'underline' }}
              >
                blog.overflowbyte.cloud
              </a>
            </p>
            <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
              <a
                className="btn btn-secondary btn-sm"
                href={canonical}
                target="_blank"
                rel="noopener noreferrer"
              >
                Hashnode
                <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
              </a>
              <a
                className="btn btn-secondary btn-sm"
                href="https://overflowbyte.medium.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Medium
                <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* The widgets render inline as real components. This used to be an
          iframe onto a standalone HTML file, which loaded a second copy of the
          page's chrome inside a box and was invisible to search engines. */}
      {hasLab && (
        <section className="section-tight">
          <div className="section-head" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: 'var(--step-2)' }}>Interactive companion</h2>
              <p>
                The three instruments this article argues from, running right here. No embed,
                no second page.
              </p>
            </div>
            <Link className="btn btn-secondary btn-sm" href={LAB_HREF}>
              <FontAwesomeIcon icon={faWandMagicSparkles} className="fa-ico" />
              All eight sections
            </Link>
          </div>

          <div className="inline-lab">
            <h3>
              Step the <code>newgrp</code> syscall sequence
            </h3>
            <NewgrpPlayer />

            <h3>
              Toggle the 16 bits of <code>i_mode</code>
            </h3>
            <ModeBits />

            <h3>Run the DAC cascade</h3>
            <DacFlow />
          </div>
        </section>
      )}

      {/* Markdown is rendered to real HTML; it used to be dumped as
          pre-wrap text, so readers saw literal ## and ** markers. */}
      <div className="prose" style={{ marginTop: '3rem' }}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Wide tables scroll inside their own box instead of
            // overflowing the page on a phone.
            table: ({ children, ...props }) => (
              <div className="table-scroll">
                <table {...props}>{children}</table>
              </div>
            ),
            // The <h1> already renders in the page header above.
            h1: () => null,
          }}
        >
          {content}
        </Markdown>
      </div>

      <aside className="card card-pad card-quiet" style={{ marginTop: '3rem' }}>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'var(--step-1)', marginBottom: '0.3rem' }}>
              Want the hands-on lab commands?
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
              Reference notes, EX294 mocks and RHCSA drills live in the learning vault.
            </p>
          </div>
          <div className="cluster">
            {hasLab && (
              <Link className="btn btn-primary" href="/learn#linux-permissions">
                <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
                Test yourself
              </Link>
            )}
            <a
              className="btn btn-secondary"
              href="https://learning.overflowbyte.cloud"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learning notes
              <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
            </a>
          </div>
        </div>
      </aside>
    </article>
  );
}
