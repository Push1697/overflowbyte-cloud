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
  faArrowRight,
  faUpRightFromSquare,
  faWandMagicSparkles,
  faMicrochip,
} from '@fortawesome/free-solid-svg-icons';
import NewgrpPlayer from '../../components/visuals/NewgrpPlayer';
import ModeBits from '../../components/visuals/ModeBits';
import Cascade from '../../components/visuals/Cascade';
import VisualBlock from '../../components/visuals/VisualBlock';
import CalloutAlert from '../../components/visuals/CalloutAlert';
import TerminalCodeBlock from '../../components/visuals/TerminalCodeBlock';
import { DAC_ACTORS, DAC_STAGES } from '../../lib/permissions';
import type { Visual } from '../../lib/visuals';
import { POST_VISUALS as M365_POST_VISUALS } from '../../lib/visuals/m365-device-lock';
import { POST_VISUALS as RHEL10_POST_VISUALS } from '../../lib/visuals/rhel10-storage-selinux';
import { POST_VISUALS as AWS_NACL_POST_VISUALS } from '../../lib/visuals/aws-nacl-security-groups';
import { POST_VISUALS as ANSIBLE_VAR_POST_VISUALS } from '../../lib/visuals/ansible-variable-precedence';
import { POST_VISUALS as ANSIBLE_VAULT_POST_VISUALS } from '../../lib/visuals/ansible-vault-two-ids';
import { POST_VISUALS as INCIDENT_DRILLS_POST_VISUALS } from '../../lib/visuals/incident-drills';
import { POST_VISUALS as RUNTIME_RCE_POST_VISUALS } from '../../lib/visuals/runtime-rce-zero-day';
import { POST_VISUALS as KVM_OVERLAY_POST_VISUALS } from '../../lib/visuals/kvm-overlay-lab';
import { POST_VISUALS as RHCSA_RHCE_POST_VISUALS } from '../../lib/visuals/rhcsa-rhce-60-day';
import { POST_VISUALS as ANSIBLE_MAP_POST_VISUALS } from '../../lib/visuals/rhcsa-to-ansible-map';
import { POST_VISUALS as NO_SSH_POST_VISUALS } from '../../lib/visuals/no-ssh-automation';
import { getPost, getPostSlugs } from '../../lib/posts';
import { videosFor } from '../../lib/youtube';
import VideoSection from '../../components/VideoSection';

/** All post-scoped visuals, keyed by blog slug. */
const POST_VIZ: Record<string, Visual[]> = {
  ...M365_POST_VISUALS,
  ...RHEL10_POST_VISUALS,
  ...AWS_NACL_POST_VISUALS,
  ...ANSIBLE_VAR_POST_VISUALS,
  ...ANSIBLE_VAULT_POST_VISUALS,
  ...INCIDENT_DRILLS_POST_VISUALS,
  ...RUNTIME_RCE_POST_VISUALS,
  ...KVM_OVERLAY_POST_VISUALS,
  ...RHCSA_RHCE_POST_VISUALS,
  ...ANSIBLE_MAP_POST_VISUALS,
  ...NO_SSH_POST_VISUALS,
};

const FLAGSHIP_DECKS: Record<string, string> = {
  '01-how-linux-decides-who-can-open-a-file': 'linux-permissions',
  '02-your-code-is-clean-attackers-still-got-a-shell': 'runtime-rce-zero-day',
  '03-port-443-is-open-in-security-group-why-timeout': 'aws-nacl-security-groups',
  '04-i-broke-two-servers-on-purpose': 'incident-drills',
  '05-rhel-lab-wreck-and-reset-in-seconds': 'kvm-overlay-lab',
  '06-60-day-plan-rhcsa-to-rhce': 'rhcsa-rhce-60-day',
  '07-every-rhcsa-task-translated-to-ansible': 'rhcsa-to-ansible-map',
  '08-the-no-ssh-rule-automating-exam-set': 'no-ssh-automation',
  '09-ansible-variable-precedence-drawn': 'ansible-variable-precedence',
  '10-ansible-vault-with-two-vault-ids': 'ansible-vault-two-ids',
  '11-mobile-access-runbook-m365-phones': 'm365-device-lock',
  '12-rhel10-storage-selinux-lab': 'rhel10-storage-selinux',
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
    alternates: { canonical: canonical ?? `/blog/${slug}` },
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

  if (!post) notFound();

  const { frontmatter, content } = post;
  const canonical = frontmatter.canonical_url;
  const hasLab = slug.startsWith('01-');
  const deckSlug = FLAGSHIP_DECKS[slug];
  const flagshipNum = /^\d{2}-/.test(slug) ? slug.slice(0, 2) : null;
  const origin = frontmatter.source === 'medium' ? 'From Medium' : 'From the archive';
  const visuals = POST_VIZ[slug] ?? [];
  const videos = videosFor('blog', slug);
  const canonicalHost = canonical && URL.canParse(canonical) ? new URL(canonical).hostname : null;

  return (
    <article className="shell section blog-article-shell" style={{ maxWidth: '940px' }}>
      {/* Ambient animated dot-grid & glow backdrop */}
      <div className="blog-backdrop" aria-hidden="true" />

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
              Flagship #{flagshipNum} · Deep Dive
            </span>
          ) : (
            <span className="badge badge-neutral">{origin}</span>
          )}
          {frontmatter.date && <span className="meta">{frontmatter.date}</span>}
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', lineHeight: 1.15, fontWeight: 800 }}>
          {frontmatter.title}
        </h1>

        {frontmatter.subtitle && (
          <p
            className="lede"
            style={{ marginTop: '1.25rem', fontSize: '1.2rem', lineHeight: 1.6 }}
          >
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

      {canonical && canonicalHost && (
        <div className="card card-pad card-quiet" style={{ marginTop: '2rem', padding: '1rem 1.25rem' }}>
          <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
            Originally published on{' '}
            <a
              href={canonical}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              {canonicalHost}
              <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
            </a>
          </p>
        </div>
      )}

      <VideoSection videos={videos} />

      {/* Interactive Architecture Lab & System Models */}
      {visuals.length > 0 && (
        <section id="lab" className="section-tight article-lab-panel" style={{ scrollMarginTop: 'calc(var(--header-h) + 1rem)' }}>
          <div className="section-head" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="cluster" style={{ marginBottom: '0.4rem' }}>
                <span className="badge badge-accent">
                  <FontAwesomeIcon icon={faMicrochip} style={{ marginRight: '5px' }} />
                  Interactive Architecture Lab
                </span>
                <span className="badge badge-ok">{visuals.length} Visual Instruments</span>
              </div>
              <h2 style={{ fontSize: 'var(--step-2)', margin: 0, border: 'none', paddingTop: 0 }}>
                Live System Models & Cascades
              </h2>
              <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                Interact with the state transitions, decision cascades, and architectural boundaries below.
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {visuals.map((viz) => (
              <VisualBlock key={viz.id} viz={viz} />
            ))}
          </div>
        </section>
      )}

      {/* Flagship #01 Dedicated Kernel Instruments */}
      {hasLab && (
        <section className="section-tight article-lab-panel is-kernel">
          <div className="section-head" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="cluster" style={{ marginBottom: '0.4rem' }}>
                <span className="badge badge-ok">Linux Kernel Instruments</span>
              </div>
              <h2 style={{ fontSize: 'var(--step-2)', margin: 0, border: 'none', paddingTop: 0 }}>
                Interactive Kernel Playground
              </h2>
              <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                Live instruments running right in this page: step the newgrp syscall sequence, toggle 16 i_mode bits, and evaluate the DAC cascade.
              </p>
            </div>
            <Link className="btn btn-secondary btn-sm" href={LAB_HREF}>
              <FontAwesomeIcon icon={faWandMagicSparkles} className="fa-ico" />
              Full Lab (8 Sections)
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

      {/* Main Technical Article Prose */}
      <div className="prose" style={{ marginTop: '3.5rem' }}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // High-contrast, clean-scrolling data tables
            table: ({ children, ...props }) => (
              <div className="table-scroll">
                <table {...props}>{children}</table>
              </div>
            ),
            // GitHub alert callout card parsing (> [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION])
            blockquote: CalloutAlert,
            // Fenced blocks become terminal windows; inline code stays inline.
            pre: ({ children }) => <TerminalCodeBlock>{children}</TerminalCodeBlock>,
            // The <h1> already renders in the page header above.
            h1: () => null,
          }}
        >
          {content}
        </Markdown>
      </div>

      <aside className="card card-pad card-quiet" style={{ marginTop: '4rem', padding: '1.75rem' }}>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'var(--step-1)', marginBottom: '0.3rem' }}>
              Want the hands-on lab commands & flashcards?
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
              Interactive scenario cards, EX294 mock exams and production drills live in the learning garden.
            </p>
          </div>
          <div className="cluster">
            {deckSlug && (
              <Link className="btn btn-primary" href={`/learn#${deckSlug}`}>
                <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
                Practice flashcards
              </Link>
            )}
            <Link className="btn btn-secondary" href="/learn#labs">
              Hands-on labs
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </Link>
            <Link className="btn btn-secondary" href="/notes">
              Learning notes
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </Link>
          </div>
        </div>
      </aside>
    </article>
  );
}
