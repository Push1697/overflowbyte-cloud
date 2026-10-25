import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCircleCheck,
  faFlaskVial,
  faGraduationCap,
  faNetworkWired,
  faShieldHalved,
  faTerminal,
  faUpRightFromSquare,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import HeroTrace from './components/HeroTrace';
import { getPostSlugs } from './lib/posts';
import { DECKS } from './lib/questions';
import { LABS } from './lib/labs';

const LAB_HREF = '/visuals/linux-permissions';

const SURFACES = [
  {
    icon: faWandMagicSparkles,
    status: 'live' as const,
    badge: 'Live interactive lab',
    meta: '8 modules',
    title: 'Linux permissions & inodes, visually',
    body: 'Step the newgrp syscall player, simulate the DAC flowchart for Alice, Bob, Carol and root, and toggle the 16-bit i_mode calculator.',
    href: LAB_HREF,
  },
  {
    icon: faShieldHalved,
    status: 'soon' as const,
    badge: 'Nov 15 · in staging',
    meta: 'Flagship #2',
    title: 'Request-to-shell: PHP2Shell & Node2Shell',
    body: 'Follow an HTTP request as it crosses runtime boundaries, slips past sanitation and reaches execution — with the control that stops each hop.',
    href: null,
  },
  {
    icon: faNetworkWired,
    status: 'soon' as const,
    badge: 'Nov 29 · in staging',
    meta: 'Flagship #3',
    title: 'AWS packet path: NACL vs security groups',
    body: 'Trace a packet into a VPC subnet: rule evaluation order, stateful versus stateless return traffic, and where ephemeral ports get dropped.',
    href: null,
  },
];

const FOCUS = [
  {
    label: 'Linux kernel internals',
    body: 'Credentials across task_struct, struct cred and fsuid, plus VFS inode resolution.',
  },
  {
    label: 'Infrastructure & cloud ops',
    body: 'FortiGate SD-WAN, AWS, Kubernetes and monitoring, run as production systems rather than demos.',
  },
  {
    label: 'Red Hat certification track',
    body: 'A 60-day RHCSA to RHCE curriculum with unattended Ansible playbooks.',
  },
];

export default function HomePage() {
  const published = getPostSlugs().length;
  const cards = DECKS.reduce((n, deck) => n + deck.cards.length, 0);

  return (
    <>
      <section className="hero">
        <div className="hero-aura" aria-hidden="true" />
        <div className="shell">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <FontAwesomeIcon icon={faTerminal} className="fa-ico" />
                Linux internals · systems · security
              </p>
              <h1 className="gradient-text">
                The kernel already decided. Here is the trace.
              </h1>
              <p className="lede">
                Deep systems writing where every claim is shown running — interactive
                visualizers, scenario flashcards, and labs where you type the command
                yourself.
              </p>
              <div className="cluster hero-actions">
                <a className="btn btn-primary btn-lg" href={LAB_HREF}>
                  Launch the visual lab
                  <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
                </a>
                <Link className="btn btn-secondary btn-lg" href="/learn">
                  <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
                  Practice & labs
                </Link>
              </div>
            </div>

            <HeroTrace />
          </div>

          <dl className="stat-row">
            <div className="stat">
              <dt>Published</dt>
              <dd>{published}</dd>
            </div>
            <div className="stat">
              <dt>Flashcards</dt>
              <dd>{cards}</dd>
            </div>
            <div className="stat">
              <dt>Hands-on labs</dt>
              <dd>{LABS.length}</dd>
            </div>
            <div className="stat">
              <dt>Lab modules</dt>
              <dd>8</dd>
            </div>
          </dl>
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
            <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
          </a>
        </div>

        <div className="grid grid-3 deck-grid">
          {SURFACES.map(({ icon, status, badge, meta, title, body, href }) => {
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
                  <FontAwesomeIcon
                    icon={icon}
                    className="fa-ico-lg"
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
                      <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
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
                className="card card-pad card-interactive card-feature deck spotlight reveal"
              >
                {inner}
              </a>
            ) : (
              <div key={title} className="card card-pad card-interactive card-muted deck reveal">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      <section className="shell section">
        <div className="section-head reveal">
          <div>
            <h2>Practice, not just reading</h2>
            <p>
              Scenario flashcards that test whether the mechanics actually landed, plus
              terminal labs with requirements and a solution you unlock when ready.
            </p>
          </div>
          <Link className="action-link" href="/learn">
            Open the deck
            <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
          </Link>
        </div>

        <div className="grid grid-2 deck-grid">
          <Link
            href="/learn"
            className="card card-pad card-interactive card-feature deck spotlight reveal"
          >
            <div className="cluster" style={{ marginBottom: '1rem' }}>
              <span className="badge badge-accent">
                <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
                {cards} flashcards
              </span>
            </div>
            <h3 style={{ fontSize: 'var(--step-2)', marginBottom: '0.6rem' }}>
              Scenario flashcards
            </h3>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)', flexGrow: 1 }}>
              Stale credentials, fsuid versus euid, SGID inheritance, the 16-bit i_mode
              bitmask, and the real order of root&rsquo;s override. Flip for the kernel
              answer.
            </p>
            <span className="action-link" style={{ marginTop: '1.25rem' }}>
              Start practising
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </span>
          </Link>

          <Link
            href="/learn#labs"
            className="card card-pad card-interactive card-feature deck spotlight reveal"
          >
            <div className="cluster" style={{ marginBottom: '1rem' }}>
              <span className="badge badge-accent">
                <FontAwesomeIcon icon={faFlaskVial} className="fa-ico" />
                {LABS.length} labs
              </span>
            </div>
            <h3 style={{ fontSize: 'var(--step-2)', marginBottom: '0.6rem' }}>
              Hands-on terminal labs
            </h3>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)', flexGrow: 1 }}>
              A scenario, a task list and hard requirements — background jobs with{' '}
              <code>nohup</code>, SGID collaboration directories, setuid audits. Write the
              command, then check yourself.
            </p>
            <span className="action-link" style={{ marginTop: '1.25rem' }}>
              Open the labs
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </span>
          </Link>
        </div>
      </section>

      <section className="shell section">
        <div className="section-head reveal">
          <div>
            <h2>Flagship articles</h2>
            <p>
              Long-form deep-dives, syndicated across Hashnode, Medium and this reader.
            </p>
          </div>
          <Link className="action-link" href="/blog">
            All 10 flagships
            <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
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
            <Link className="title-link" href="/blog/01-how-linux-decides-who-can-open-a-file">
              How Linux decides who can open a file
            </Link>
          </h3>

          <p className="text-soft" style={{ maxWidth: '72ch' }}>
            You add a developer to a group with <code>usermod -aG</code>, but their open
            terminal still gets <code>Permission denied</code>. We trace{' '}
            <code>task_struct</code> credentials, the six-step <code>newgrp</code> syscall
            sequence, in-memory inodes, and the exact evaluation order inside{' '}
            <code>generic_permission()</code>.
          </p>

          <div className="cluster" style={{ marginTop: '1.5rem' }}>
            <Link className="btn btn-primary" href="/blog/01-how-linux-decides-who-can-open-a-file">
              Read the article
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </Link>
            <a className="btn btn-secondary" href={LAB_HREF}>
              <FontAwesomeIcon icon={faWandMagicSparkles} className="fa-ico" />
              Open the simulator
            </a>
            <Link className="btn btn-ghost" href="/learn#linux-permissions">
              <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
              Test yourself
            </Link>
          </div>
        </article>
      </section>

      <section className="shell section">
        <div className="card card-pad card-feature spotlight reveal" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <div className="grid grid-split" style={{ alignItems: 'center' }}>
            <div>
              <p className="eyebrow">
                <FontAwesomeIcon icon={faTerminal} className="fa-ico" />
                Infrastructure systems engineer
              </p>
              <h2 style={{ fontSize: 'var(--step-4)', margin: '0.7rem 0 0.9rem' }}>
                Pushpendra
              </h2>
              <p className="text-soft" style={{ maxWidth: '54ch' }}>
                I design, implement, troubleshoot and operate the systems that keep modern
                workplaces connected — then write up the parts that are usually explained
                wrong.
              </p>
              <div className="cluster" style={{ marginTop: '1.5rem' }}>
                <Link className="btn btn-primary" href="/about">
                  About & portfolio
                  <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
                </Link>
                <a
                  className="btn btn-secondary"
                  href="https://pushpendra.overflowbyte.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Full resume
                  <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
                </a>
              </div>
            </div>

            <div className="card card-pad card-quiet">
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '1rem' }}>
                Core engineering focus
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {FOCUS.map(({ label, body }) => (
                  <li key={label} style={{ display: 'flex', gap: '0.65rem' }}>
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="fa-ico"
                      style={{ color: 'var(--ok)', flexShrink: 0, marginTop: '0.32rem' }}
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
