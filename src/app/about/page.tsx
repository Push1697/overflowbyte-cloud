import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, ExternalLink, Shield, Terminal, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Pushpendra — OverflowByte',
  description:
    'Systems engineer and platform architect building visual tools and low-level explainers for Linux internals, cloud security and systems engineering.',
};

const PILLARS = [
  {
    icon: Terminal,
    color: 'var(--accent)',
    title: 'Reality-first engineering',
    body: 'No hand-waving abstractions. We trace down to the C structs in linux/sched.h, VFS inodes, and real system call sequences.',
  },
  {
    icon: Shield,
    color: 'var(--ok)',
    title: 'Defense in depth',
    body: 'From AWS VPC subnet NACLs to local Linux DAC and capabilities like CAP_DAC_OVERRIDE, security gets verified end to end.',
  },
  {
    icon: Cpu,
    color: 'var(--info)',
    title: 'Visual intuition',
    body: 'Hard concepts land faster through animated state diagrams, interactive bit grids, and repeatable hands-on lab drills.',
  },
];

export default function AboutPage() {
  return (
    <div className="shell section" style={{ maxWidth: '980px' }}>
      <header style={{ marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <User size={14} aria-hidden="true" />
          Systems engineer & platform architect
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          About Pushpendra
        </h1>
        <p className="lede">
          Building visual tools and low-level architectural explainers to demystify Linux
          internals, cloud security and systems engineering.
        </p>
      </header>

      <section className="card card-pad card-feature spotlight reveal">
        <div
          className="cluster"
          style={{ justifyContent: 'space-between', marginBottom: '1.25rem' }}
        >
          <div>
            <span className="badge badge-accent">Portfolio hub</span>
            <h2 style={{ fontSize: 'var(--step-3)', marginTop: '0.6rem' }}>
              pushpendra.overflowbyte.cloud
            </h2>
          </div>
          <a
            className="btn btn-primary"
            href="https://pushpendra.overflowbyte.cloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open full portfolio
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        <p className="text-soft" style={{ marginBottom: '1.5rem', maxWidth: '70ch' }}>
          My resume, professional experience, open-source repositories and certifications are
          hosted on a standalone portfolio.
        </p>

        <div className="pane">
          <div className="pane-bar">
            <span className="pane-bar-label">https://pushpendra.overflowbyte.cloud</span>
            <a
              className="action-link"
              href="https://pushpendra.overflowbyte.cloud"
              target="_blank"
              rel="noopener noreferrer"
            >
              Full screen
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
          <iframe
            className="pane-frame"
            src="https://pushpendra.overflowbyte.cloud"
            title="Pushpendra portfolio"
            loading="lazy"
          />
        </div>
      </section>

      <section className="grid grid-3" style={{ marginTop: 'clamp(1.5rem, 4vw, 2rem)' }}>
        {PILLARS.map(({ icon: Icon, color, title, body }) => (
          <div key={title} className="card card-pad card-quiet reveal">
            <Icon size={22} aria-hidden="true" style={{ color, marginBottom: '0.75rem' }} />
            <h2 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>{title}</h2>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
              {body}
            </p>
          </div>
        ))}
      </section>

      <section
        className="card card-pad card-quiet reveal"
        style={{ marginTop: 'clamp(1.5rem, 4vw, 2rem)', textAlign: 'center' }}
      >
        <h2 style={{ fontSize: 'var(--step-3)', marginBottom: '0.6rem' }}>
          Let&rsquo;s connect
        </h2>
        <p
          className="text-muted"
          style={{ maxWidth: '52ch', margin: '0 auto 1.5rem' }}
        >
          Follow along as the ten-flagship series publishes, or reach out on GitHub.
        </p>
        <div className="cluster" style={{ justifyContent: 'center' }}>
          <a
            className="btn btn-primary"
            href="https://blog.overflowbyte.cloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe on Hashnode
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <a
            className="btn btn-secondary"
            href="https://github.com/Push1697"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <Link className="btn btn-secondary" href="/blog">
            Read the series
          </Link>
        </div>
      </section>
    </div>
  );
}
