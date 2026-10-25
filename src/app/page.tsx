import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Network,
  ShieldAlert,
  Sparkles,
  User,
} from 'lucide-react';

const LAB_HREF = '/visuals/linux-permissions';

const LABS = [
  {
    status: 'live' as const,
    badge: 'Live interactive lab',
    meta: '8 modules',
    title: 'Linux permissions & inodes, visually',
    body: 'Step the newgrp syscall player, simulate the DAC flowchart for Alice, Bob, Carol and root, inspect task_struct to struct cred, and toggle the 16-bit i_mode calculator.',
    href: LAB_HREF,
    icon: Sparkles,
  },
  {
    status: 'soon' as const,
    badge: 'Nov 15 · in staging',
    meta: 'Flagship #2',
    title: 'Request-to-shell: PHP2Shell & Node2Shell',
    body: 'Follow an HTTP request as it crosses runtime boundaries, slips past sanitation, and reaches code execution — with the defensive control that stops each hop.',
    href: null,
    icon: ShieldAlert,
  },
  {
    status: 'soon' as const,
    badge: 'Nov 29 · in staging',
    meta: 'Flagship #3',
    title: 'AWS packet path: NACL vs security groups',
    body: 'Trace a packet arriving at a VPC subnet: rule evaluation order, stateful versus stateless return traffic, and where ephemeral ports get dropped.',
    href: null,
    icon: Network,
  },
];

const SURFACES = [
  {
    title: 'Main platform',
    domain: 'overflowbyte.cloud',
    body: 'The hub for every interactive visualizer, syscall player and calculator — no iframe limits.',
    href: null,
    note: 'You are here',
  },
  {
    title: 'Flagship blog',
    domain: 'blog.overflowbyte.cloud',
    body: 'Narrative long-form articles, the subscriber newsletter, RSS, and discussion.',
    href: 'https://blog.overflowbyte.cloud',
    note: 'Visit blog',
  },
  {
    title: 'Learning second-brain',
    domain: 'learning.overflowbyte.cloud',
    body: 'A searchable vault of 40+ RHCSA and RHCE labs, command cheat sheets and EX294 mocks.',
    href: 'https://learning.overflowbyte.cloud',
    note: 'Open vault',
  },
  {
    title: 'Medium syndication',
    domain: 'overflowbyte.medium.com',
    body: 'Canonical cross-posts, so search credit still points back to the primary blog.',
    href: 'https://overflowbyte.medium.com/',
    note: 'Follow',
  },
];

const FOCUS = [
  {
    label: 'Linux kernel internals',
    body: 'Credential management across task_struct, struct cred and fsuid, plus VFS inode resolution.',
  },
  {
    label: 'Red Hat certification track',
    body: 'A 60-day RHCSA to RHCE lab curriculum with unattended Ansible playbooks.',
  },
  {
    label: 'Cloud networking',
    body: 'AWS VPC architecture, NACL versus security group packet routing, and perimeter security.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-aura" aria-hidden="true" />
        <div className="shell hero-copy">
          <p className="eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Systems engineering · security · Linux internals
          </p>
          <h1 className="gradient-text">Complex systems architecture, explained visually.</h1>
          <p className="lede">
            An interactive engineering platform of step-by-step kernel visualizers, production
            incident drills, and hands-on cloud networking breakdowns.
          </p>
          <div className="cluster hero-actions">
            <a className="btn btn-primary btn-lg" href={LAB_HREF}>
              Launch the visual lab
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <Link className="btn btn-secondary btn-lg" href="/blog">
              Explore the flagship series
            </Link>
          </div>
        </div>
      </section>

      <section className="shell section" id="visual-lab">
        <div className="section-head reveal">
          <div>
            <h2>Visual architecture lab</h2>
            <p>
              Interactive sandboxes with state machines, syscall players and live bit
              calculators.
            </p>
          </div>
          <a className="action-link" href={LAB_HREF}>
            Open flagship sandbox
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="grid grid-3">
          {LABS.map(({ status, badge, meta, title, body, href, icon: Icon }) => {
            const live = status === 'live';
            const inner = (
              <>
                <div
                  className="cluster"
                  style={{ justifyContent: 'space-between', marginBottom: '1.1rem' }}
                >
                  <span className={live ? 'badge badge-ok' : 'badge badge-warn'}>
                    {live && <span className="live-dot" aria-hidden="true" />}
                    {badge}
                  </span>
                  <Icon
                    size={17}
                    aria-hidden="true"
                    style={{ color: live ? 'var(--accent)' : 'var(--text-faint)' }}
                  />
                </div>
                <h3 style={{ fontSize: 'var(--step-2)', marginBottom: '0.6rem' }}>{title}</h3>
                <p className="text-muted" style={{ fontSize: 'var(--step--1)', flexGrow: 1 }}>
                  {body}
                </p>
                <p
                  className="cluster"
                  style={{
                    justifyContent: 'space-between',
                    marginTop: '1.25rem',
                    paddingTop: '0.9rem',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  <span className="mono">{meta}</span>
                  {live ? (
                    <span className="action-link">
                      Launch
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="mono">Scheduled</span>
                  )}
                </p>
              </>
            );

            return href ? (
              <a
                key={title}
                href={href}
                className="card card-pad card-interactive card-feature spotlight reveal"
              >
                {inner}
              </a>
            ) : (
              <div key={title} className="card card-pad card-interactive card-muted reveal">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      <section className="shell section">
        <div className="section-head reveal">
          <div>
            <h2>Flagship articles</h2>
            <p>
              Long-form technical deep-dives, syndicated across Hashnode, Medium and this
              reader.
            </p>
          </div>
          <Link className="action-link" href="/blog">
            All 10 flagships
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <article className="card card-pad card-feature spotlight reveal">
          <div className="cluster" style={{ marginBottom: '1rem' }}>
            <span className="badge badge-accent">Linux internals</span>
            <span className="badge badge-ok">
              <span className="live-dot" aria-hidden="true" />
              Flagship #1
            </span>
            <span className="meta">1 Nov 2026</span>
          </div>

          <h3 style={{ fontSize: 'var(--step-4)', marginBottom: '0.9rem' }}>
            <Link
              className="title-link"
              href="/blog/01-how-linux-decides-who-can-open-a-file"
            >
              How Linux decides who can open a file
            </Link>
          </h3>

          <p className="text-soft" style={{ maxWidth: '72ch' }}>
            You add a developer to a group with <code>usermod -aG</code>, but their open
            terminal still gets <code>Permission denied</code>. We trace the kernel mechanics:{' '}
            <code>task_struct</code> credentials, the six-step <code>newgrp</code> syscall
            sequence, in-memory inodes, and the exact evaluation order inside{' '}
            <code>generic_permission()</code>.
          </p>

          <div className="cluster" style={{ marginTop: '1.5rem' }}>
            <Link
              className="btn btn-primary"
              href="/blog/01-how-linux-decides-who-can-open-a-file"
            >
              Read the article
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <a className="btn btn-secondary" href={LAB_HREF}>
              <Sparkles size={14} aria-hidden="true" />
              Open the simulator
            </a>
            <a
              className="btn btn-ghost"
              href="https://blog.overflowbyte.cloud/how-linux-decides-who-can-open-a-file"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hashnode
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </article>
      </section>

      <section className="shell section">
        <div className="section-head reveal">
          <div>
            <h2>The OverflowByte architecture</h2>
            <p>
              Four surfaces balancing interactive learning, deep narrative reading and quick
              reference lookups.
            </p>
          </div>
        </div>

        <div className="grid grid-4">
          {SURFACES.map(({ title, domain, body, href, note }) => (
            <div key={title} className="card card-pad card-quiet reveal">
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.35rem' }}>{title}</h3>
              <p className="mono" style={{ marginBottom: '0.7rem', wordBreak: 'break-all' }}>
                {domain}
              </p>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--step--1)', marginBottom: '0.9rem' }}
              >
                {body}
              </p>
              {href ? (
                <a
                  className="action-link"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {note}
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              ) : (
                <span className="mono" style={{ color: 'var(--accent)' }}>
                  {note}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="card card-pad card-feature spotlight reveal" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <div className="grid grid-split" style={{ alignItems: 'center' }}>
            <div>
              <p className="eyebrow">
                <User size={14} aria-hidden="true" />
                Systems engineer & author
              </p>
              <h2 style={{ fontSize: 'var(--step-4)', margin: '0.7rem 0 0.9rem' }}>
                Pushpendra
              </h2>
              <p className="text-soft" style={{ maxWidth: '54ch' }}>
                I work on Linux kernel internals, systems architecture, Ansible automation and
                cloud infrastructure security — and build visual tools that make low-level
                systems intuitive.
              </p>
              <div className="cluster" style={{ marginTop: '1.5rem' }}>
                <a
                  className="btn btn-primary"
                  href="https://pushpendra.overflowbyte.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio & resume
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
                <Link className="btn btn-secondary" href="/about">
                  Engineering philosophy
                </Link>
              </div>
            </div>

            <div className="card card-pad card-quiet">
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '1rem' }}>
                Core engineering focus
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {FOCUS.map(({ label, body }) => (
                  <li key={label} style={{ display: 'flex', gap: '0.65rem' }}>
                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                      style={{ color: 'var(--ok)', flexShrink: 0, marginTop: '0.2rem' }}
                    />
                    <span style={{ fontSize: 'var(--step--1)' }}>
                      <strong style={{ color: 'var(--text)' }}>{label}:</strong>{' '}
                      <span className="text-muted">{body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
