import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faGraduationCap,
  faUpRightFromSquare,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import NewgrpPlayer from '../../components/visuals/NewgrpPlayer';
import ModeBits from '../../components/visuals/ModeBits';
import Cascade from '../../components/visuals/Cascade';
import VisualBlock from '../../components/visuals/VisualBlock';
import Mermaid from '../../components/visuals/Mermaid';
import { DAC_ACTORS, DAC_STAGES } from '../../lib/permissions';
import type { Visual } from '../../lib/visuals';
import { POST_VISUALS as M365_POST_VISUALS } from '../../lib/visuals/m365-device-lock';
import { POST_VISUALS as RHEL10_POST_VISUALS } from '../../lib/visuals/rhel10-storage-selinux';
import { POST_VISUALS as AWS_NACL_POST_VISUALS } from '../../lib/visuals/aws-nacl-security-groups';
import { getPost, getPostSlugs } from '../../lib/posts';

/** All post-scoped visuals, keyed by blog slug. */
const POST_VIZ: Record<string, Visual[]> = {
  ...M365_POST_VISUALS,
  ...RHEL10_POST_VISUALS,
  ...AWS_NACL_POST_VISUALS,
};

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
  // Flagship number comes from the filename prefix (01-…, 11-…); synced
  // archive posts have no prefix and are labelled by where they came from.
  const flagshipNum = /^\d{2}-/.test(slug) ? slug.slice(0, 2) : null;
  const origin = frontmatter.source === 'medium' ? 'From Medium' : 'From the Hashnode archive';
  // Data-driven diagrams attached to this post, if any.
  const visuals = POST_VIZ[slug] ?? [];

  return (
    <article className="shell section" style={{ maxWidth: '920px' }}>
      <Link className="action-link" href="/blog" style={{ color: 'var(--text-muted)' }}>
        <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
        Back to articles
      </Link>

      <header style={{ marginTop: '1.75rem' }}>
        <div className="cluster" style={{ marginBottom: '1rem' }}>
          {frontmatter.series && (
            <span className="badge badge-accent">{frontmatter.series}</span>
          )}
          {flagshipNum ? (
            <span className="badge badge-ok">
              <span className="live-dot" aria-hidden="true" />
              Flagship #{flagshipNum}
            </span>
          ) : (
            <span className="badge badge-neutral">{origin}</span>
          )}
          {frontmatter.date && <span className="meta">{frontmatter.date}</span>}
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

      {visuals.length > 0 && (
        <section
          className="section-tight"
          style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}
        >
          {visuals.map((viz) => (
            <VisualBlock key={viz.id} viz={viz} />
          ))}
        </section>
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
            <Cascade checks={DAC_STAGES} subjects={DAC_ACTORS} />
          </div>
        </section>
      )}

      {/* Markdown is rendered to real HTML; it used to be dumped as
          pre-wrap text, so readers saw literal ## and ** markers. */}
      <div className="prose" style={{ marginTop: '3rem' }}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Wide tables scroll inside their own box instead of
            // overflowing the page on a phone.
            table: ({ children, ...props }) => (
              <div className="table-scroll">
                <table {...props}>{children}</table>
              </div>
            ),
            // ```mermaid blocks render as real diagrams (client-side,
            // theme-aware); anything else stays inline code.
            code: ({ className, children }) => {
              if (/language-mermaid/.test(className ?? '')) {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
              }
              return <code className={className}>{children}</code>;
            },
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
