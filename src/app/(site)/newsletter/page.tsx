import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCalendar, faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import { getNewsletterSlugs, getNewsletter } from '../lib/newsletters';
import { coverImage, toTime } from '../lib/posts';

export const metadata: Metadata = {
  title: 'Weekly newsletter — OverflowByte',
  description:
    'Every weekly newsletter published on blog.overflowbyte.cloud, synced here as real articles — no iframes, no embeds.',
};

export default function NewsletterIndexPage() {
  const slugs = getNewsletterSlugs();
  const items = slugs
    .map((slug) => getNewsletter(slug))
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .sort((a, b) => toTime(b.frontmatter.date) - toTime(a.frontmatter.date));

  return (
    <div className="shell section">
      <header style={{ maxWidth: '56rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <FontAwesomeIcon icon={faEnvelopeOpenText} className="fa-ico" />
          Weekly newsletter
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          The weekly dispatch
        </h1>
        <p className="lede">
          Everything published as a newsletter on Hashnode, pulled in by{' '}
          <code>npm run sync:cross-platform</code> and rendered here as plain articles —
          readable in day or night mode, searchable, and never inside a frame.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card card-pad card-quiet">
          <p className="text-muted">
            No newsletters synced yet. Run <code>npm run sync:cross-platform</code> to pull the
            weekly issues from blog.overflowbyte.cloud into <code>newsletters/</code>, then
            rebuild. The same script also mirrors new Hashnode and Medium posts into{' '}
            <code>posts/</code> automatically.
          </p>
        </div>
      ) : (
        <div className="grid deck-grid" style={{ gap: 'clamp(1.5rem, 3vw, 2rem)' }}>
          {items.map((n) => {
            const cover = coverImage(n.frontmatter, n.content);
            const href = `/newsletter/${n.slug}`;
            return (
              <article
                key={n.slug}
                className={`card card-pad card-interactive story-card reveal${cover ? ' has-cover' : ''}`}
              >
                <div className="story-body">
                  <div className="cluster" style={{ marginBottom: '0.9rem' }}>
                    <span className="badge badge-accent">{n.frontmatter.series ?? 'Weekly Newsletter'}</span>
                    {n.frontmatter.draft && <span className="badge badge-warn">Draft · dev only</span>}
                    {n.frontmatter.date && (
                      <span className="meta">
                        <FontAwesomeIcon icon={faCalendar} className="fa-ico" />
                        {n.frontmatter.date}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 'var(--step-2)', marginBottom: '0.6rem' }}>
                    <Link className="title-link" href={href}>
                      {n.frontmatter.title ?? n.slug}
                    </Link>
                  </h2>
                  {n.frontmatter.subtitle && <p className="text-muted">{n.frontmatter.subtitle}</p>}
                  <div className="cluster" style={{ marginTop: '1rem' }}>
                    {n.frontmatter.tags?.slice(0, 4).map((tag) => (
                      <span key={tag} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.25rem' }}>
                    <Link className="btn btn-primary btn-sm" href={href}>
                      Read issue
                      <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
                    </Link>
                  </div>
                </div>
                {cover && (
                  // Decorative duplicate of the title link, so keyboard and screen readers skip it.
                  <Link className="story-thumb" href={href} tabIndex={-1} aria-hidden="true">
                    {/* Remote Hashnode/Medium covers and local SVGs; no fixed host for next/image. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt="" loading="lazy" decoding="async" />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
