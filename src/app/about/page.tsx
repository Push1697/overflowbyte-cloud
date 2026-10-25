import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCloud,
  faCubes,
  faEye,
  faFileArrowDown,
  faNetworkWired,
  faServer,
  faShieldHalved,
  faTerminal,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faHashnode, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export const metadata: Metadata = {
  title: 'About Pushpendra — OverflowByte',
  description:
    'Infrastructure systems engineer working across FortiGate SD-WAN, AWS, Kubernetes and Linux internals — and writing the visual explainers behind OverflowByte.',
};

const PORTFOLIO = 'https://pushpendra.overflowbyte.cloud';

/* Figures mirrored from the portfolio. Kept as plain data here rather than
   embedded in an iframe, which rendered a whole second site inside a box. */
const METRICS = [
  { label: 'Uptime / latency', value: '99.98% · 18ms' },
  { label: 'Office rollout', value: '400+ seats' },
  { label: 'Enterprise migrations', value: '100+' },
  { label: 'SLA compliance', value: '95%+' },
];

const CAPABILITIES = [
  {
    icon: faNetworkWired,
    title: 'Networking & security',
    body: 'FortiGate SD-WAN policy routing, segmentation and perimeter design across multi-site offices.',
  },
  {
    icon: faCloud,
    title: 'Cloud & DevOps',
    body: 'AWS VPC architecture, Terraform, Docker and Kubernetes, with monitoring that actually pages the right person.',
  },
  {
    icon: faServer,
    title: 'Enterprise infrastructure',
    body: 'Windows Server and Linux estates, identity, Microsoft 365 and Google Workspace migrations.',
  },
  {
    icon: faCubes,
    title: 'Monitoring & automation',
    body: 'Zabbix, Prometheus, Ansible and n8n — turning repeat incidents into unattended playbooks.',
  },
];

const PILLARS = [
  {
    icon: faTerminal,
    color: 'var(--accent)',
    title: 'Reality-first engineering',
    body: 'No hand-waving abstractions. We trace down to the C structs in linux/sched.h, VFS inodes and real syscall sequences.',
  },
  {
    icon: faShieldHalved,
    color: 'var(--ok)',
    title: 'Defense in depth',
    body: 'From AWS VPC subnet NACLs to local Linux DAC and capabilities like CAP_DAC_OVERRIDE, security gets verified end to end.',
  },
  {
    icon: faEye,
    color: 'var(--info)',
    title: 'Visual intuition',
    body: 'Hard concepts land faster through animated state diagrams, interactive bit grids and repeatable lab drills.',
  },
];

export default function AboutPage() {
  return (
    <div className="shell section" style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <FontAwesomeIcon icon={faServer} className="fa-ico" />
          Infrastructure · cloud · operations
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          Pushpendra
        </h1>
        <p className="lede">
          Infrastructure systems engineer in Jaipur. I design, implement, troubleshoot and
          operate the systems that keep modern workplaces connected — then write up the
          parts that are usually explained wrong.
        </p>

        <div className="cluster" style={{ marginTop: '1.75rem' }}>
          <a
            className="btn btn-primary"
            href={PORTFOLIO}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faFileArrowDown} className="fa-ico" />
            Full portfolio & resume
          </a>
          <a
            className="btn btn-secondary"
            href="https://github.com/Push1697"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} className="fa-ico" />
            GitHub
          </a>
          <a
            className="btn btn-secondary"
            href="https://www.linkedin.com/in/pushpendra-dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} className="fa-ico" />
            LinkedIn
          </a>
        </div>

        <dl className="stat-row">
          {METRICS.map(({ label, value }) => (
            <div key={label} className="stat">
              <dt>{label}</dt>
              <dd style={{ fontSize: 'var(--step-0)' }}>{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="section-tight">
        <div className="section-head reveal">
          <div>
            <h2>What I work on</h2>
            <p>The day job behind the writing — production systems, not demo environments.</p>
          </div>
          <a className="action-link" href={PORTFOLIO} target="_blank" rel="noopener noreferrer">
            Full breakdown
            <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
          </a>
        </div>

        <div className="grid grid-2 deck-grid">
          {CAPABILITIES.map(({ icon, title, body }) => (
            <div key={title} className="card card-pad card-interactive deck reveal">
              <FontAwesomeIcon
                icon={icon}
                className="fa-ico-lg"
                style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}
              />
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>{title}</h3>
              <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-tight">
        <div className="section-head reveal">
          <div>
            <h2>How this site is written</h2>
            <p>Three rules every explainer here has to pass.</p>
          </div>
        </div>

        <div className="grid grid-3">
          {PILLARS.map(({ icon, color, title, body }) => (
            <div key={title} className="card card-pad card-quiet reveal">
              <FontAwesomeIcon
                icon={icon}
                className="fa-ico-lg"
                style={{ color, marginBottom: '0.75rem' }}
              />
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>{title}</h3>
              <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="card card-pad card-feature spotlight reveal"
        style={{ marginTop: 'clamp(1.5rem, 4vw, 2rem)', textAlign: 'center' }}
      >
        <h2 style={{ fontSize: 'var(--step-3)', marginBottom: '0.6rem' }}>
          Follow the series
        </h2>
        <p className="text-muted" style={{ maxWidth: '52ch', margin: '0 auto 1.5rem' }}>
          Ten flagship deep-dives, each with an interactive lab and a flashcard set.
        </p>
        <div className="cluster" style={{ justifyContent: 'center' }}>
          <a
            className="btn btn-primary"
            href="https://blog.overflowbyte.cloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faHashnode} className="fa-ico" />
            Subscribe on Hashnode
          </a>
          <Link className="btn btn-secondary" href="/blog">
            Read the series
            <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
          </Link>
          <Link className="btn btn-secondary" href="/learn">
            Flashcards & labs
          </Link>
        </div>
      </section>
    </div>
  );
}
