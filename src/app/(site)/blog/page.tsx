import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashnode, faMedium } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowRight,
  faBoxArchive,
  faCalendar,
  faGraduationCap,
  faLayerGroup,
  faUpRightFromSquare,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { getArchivePosts } from '../lib/posts';

export const metadata: Metadata = {
  title: 'Technical deep-dives — OverflowByte',
  description:
    'Twelve flagship engineering stories on Linux internals, cloud networking, incident response, Ansible automation, cloud identity and RHEL certification.',
};

const LAB_HREF = '/visuals/linux-permissions';

type Flagship = {
  num: number;
  title: string;
  slug: string;
  date: string;
  series: string;
  tags: string[];
  desc: string;
  hashnodeUrl?: string;
  mediumUrl?: string;
  labHref?: string;
  /** Flashcard deck on /learn that covers this article. */
  deckSlug?: string;
};

const FLAGSHIPS: Flagship[] = [
  {
    num: 1,
    title: 'How Linux decides who can open a file',
    slug: '01-how-linux-decides-who-can-open-a-file',
    date: '1 Nov 2026',
    series: 'Linux Internals',
    tags: ['linux', 'kernel', 'devops', 'security'],
    desc: 'Tracing process credentials from task_struct to struct cred, the six-step newgrp syscall sequence, and in-memory inode resolution.',
    hashnodeUrl: 'https://blog.overflowbyte.cloud/how-linux-decides-who-can-open-a-file',
    mediumUrl: 'https://overflowbyte.medium.com/',
    labHref: LAB_HREF,
    deckSlug: 'linux-permissions',
  },
  {
    num: 2,
    title: 'Your code is clean. Attackers still got a shell.',
    slug: '02-your-code-is-clean-attackers-still-got-a-shell',
    date: '15 Nov 2026',
    series: 'Security & Exploitation',
    tags: ['security', 'rce', 'php', 'nodejs'],
    desc: 'PHP2Shell and Node2Shell attack flow: request-to-shell traversal, runtime boundaries, and where defensive controls actually belong.',
  },
  {
    num: 3,
    title: 'Port 443 is open in the security group. Why does it still time out?',
    slug: '03-port-443-is-open-in-security-group-why-timeout',
    date: '29 Nov 2026',
    series: 'Cloud Networking',
    tags: ['aws', 'networking', 'vpc', 'security'],
    desc: 'NACLs versus security groups on AWS: packet path, stateful versus stateless return traffic, and ephemeral port drop rules.',
    hashnodeUrl: 'https://blog.overflowbyte.cloud/port-443-is-open-in-security-group-why-timeout',
    mediumUrl: 'https://overflowbyte.medium.com/',
    deckSlug: 'aws-nacl-security-groups',
  },
  {
    num: 4,
    title: 'I broke two servers on purpose and gave myself an hour to fix them',
    slug: '04-i-broke-two-servers-on-purpose',
    date: '13 Dec 2026',
    series: 'Incident Drills',
    tags: ['linux', 'sre', 'troubleshooting', 'incidents'],
    desc: 'A production incident drill end to end: alert, decoy, root cause, fix timeline, and the undo-daemon trap.',
  },
  {
    num: 5,
    title: 'A RHEL lab you can wreck and reset in seconds',
    slug: '05-rhel-lab-wreck-and-reset-in-seconds',
    date: '27 Dec 2026',
    series: 'Linux & Virtualization',
    tags: ['rhel', 'kvm', 'cloud-init', 'virtualization'],
    desc: 'Base image to thin qcow2 overlays to a snapshot tree, with instant cloud-init bootstrap on KVM.',
  },
  {
    num: 6,
    title: 'My 60-day plan from RHCSA to RHCE',
    slug: '06-60-day-plan-rhcsa-to-rhce',
    date: '10 Jan 2027',
    series: 'Red Hat Certification',
    tags: ['rhcsa', 'rhce', 'ansible', 'certification'],
    desc: 'A week-by-week roadmap and hands-on milestones for Linux administration and Ansible automation.',
  },
  {
    num: 7,
    title: 'Every RHCSA task, translated to Ansible',
    slug: '07-every-rhcsa-task-translated-to-ansible',
    date: '24 Jan 2027',
    series: 'Ansible & RHCE',
    tags: ['ansible', 'rhcsa', 'automation', 'devops'],
    desc: 'The definitive matrix: manual command, Ansible module, collection, and idempotency verification.',
  },
  {
    num: 8,
    title: 'The no-SSH rule: automating a whole exam set with Ansible',
    slug: '08-the-no-ssh-rule-automating-exam-set',
    date: '7 Feb 2027',
    series: 'Ansible & RHCE',
    tags: ['ansible', 'rhce', 'ex294', 'automation'],
    desc: 'Automating complete RHCSA topologies without manual SSH, through a revert, run and verify loop.',
  },
  {
    num: 9,
    title: 'Ansible variable precedence, drawn',
    slug: '09-ansible-variable-precedence-drawn',
    date: '21 Feb 2027',
    series: 'Ansible & RHCE',
    tags: ['ansible', 'yaml', 'architecture'],
    desc: 'The 22-level precedence ladder showing which variable wins, with a worked breakdown of surprising overrides.',
  },
  {
    num: 10,
    title: 'Ansible Vault with two vault IDs, without typing a password',
    slug: '10-ansible-vault-with-two-vault-ids',
    date: '7 Mar 2027',
    series: 'Ansible & RHCE',
    tags: ['ansible', 'security', 'vault', 'ci-cd'],
    desc: 'Mapping multiple vault IDs to files, with automated password scripts for unattended execution.',
  },
  {
    num: 11,
    title: 'The mobile access runbook: Company Portal, work profile and the copy-paste block',
    slug: '11-mobile-access-runbook-m365-phones',
    date: '3 Nov 2026',
    series: 'Cloud & Identity',
    tags: ['intune', 'entra-id', 'mdm', 'security'],
    desc: 'Enroll phones in Intune first, gate Microsoft 365 on compliance with report-only Conditional Access, then lock copy-paste inside the work profile and Office apps.',
    hashnodeUrl: 'https://blog.overflowbyte.cloud/mobile-access-runbook-m365-phones',
    mediumUrl: 'https://overflowbyte.medium.com/',
    deckSlug: 'm365-device-lock',
  },
  {
    num: 12,
    title: 'Mastering enterprise storage, advanced security and SELinux in RHEL 10',
    slug: '12-rhel10-storage-selinux-lab',
    date: '3 Nov 2026',
    series: 'Red Hat Certification',
    tags: ['rhel', 'rhcsa', 'rhce', 'lvm', 'selinux'],
    desc: 'LVM provisioning, SUID/SGID/sticky semantics, POSIX ACLs and persistent SELinux policy — an end-to-end hands-on lab with exact commands for EX200 and EX294.',
    hashnodeUrl: 'https://blog.overflowbyte.cloud/rhel10-storage-selinux-lab',
    mediumUrl: 'https://overflowbyte.medium.com/',
    deckSlug: 'rhel10-storage-selinux',
  },
];

export default function BlogIndexPage() {
  const archive = getArchivePosts();

  return (
    <div className="shell section">
      <header style={{ maxWidth: '56rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <FontAwesomeIcon icon={faLayerGroup} className="fa-ico" />
          Flagship publications
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          Technical deep-dives
        </h1>
        <p className="lede">
          Twelve flagship engineering stories, syndicated across Hashnode as the primary blog,
          Medium for reach, and this interactive reader.
        </p>
      </header>

      <div className="grid deck-grid" style={{ gap: 'clamp(1.5rem, 3vw, 2rem)' }}>
        {FLAGSHIPS.map((post) => (
          <article
            key={post.num}
            className="card card-pad card-interactive card-feature deck spotlight reveal"
          >
              <div
                className="cluster"
                style={{ justifyContent: 'space-between', marginBottom: '0.9rem' }}
              >
                <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
                  <span className="badge badge-ok">
                    <span className="live-dot" aria-hidden="true" />
                    Flagship #{post.num} · Published
                  </span>
                  <span className="badge badge-neutral">{post.series}</span>
                </div>
                <span className="meta">
                  <FontAwesomeIcon icon={faCalendar} className="fa-ico" />
                  {post.date}
                </span>
              </div>

              <h2 style={{ fontSize: 'var(--step-2)', marginBottom: '0.6rem' }}>
                <Link className="title-link" href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>

              <p className="text-muted" style={{ maxWidth: '82ch' }}>
                {post.desc}
              </p>

              <div
                className="cluster"
                style={{ marginTop: '1rem', ['--cluster-gap' as string]: '0.4rem' }}
              >
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>

              <div
                className="cluster"
                style={{
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
                  <Link className="btn btn-primary btn-sm" href={`/blog/${post.slug}`}>
                    Read article
                    <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
                  </Link>
                  {post.hashnodeUrl && (
                    <a
                      className="btn btn-ghost btn-sm"
                      href={post.hashnodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Hashnode
                      <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
                    </a>
                  )}
                  {post.mediumUrl && (
                    <a
                      className="btn btn-ghost btn-sm"
                      href={post.mediumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Medium
                      <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
                    </a>
                  )}
                  {post.deckSlug && (
                    <Link
                      className="btn btn-ghost btn-sm"
                      href={`/learn#${post.deckSlug}`}
                    >
                      <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
                      Test yourself
                    </Link>
                  )}
                </div>

                {post.labHref && (
                  <a className="action-link" href={post.labHref}>
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="fa-ico" />
                    Interactive lab
                  </a>
                )}
              </div>
            </article>
        ))}
      </div>

      {archive.length > 0 && (
        <section style={{ marginTop: 'var(--section)' }} aria-labelledby="archive-title">
          <header style={{ maxWidth: '56rem', marginBottom: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
            <p className="eyebrow">
              <FontAwesomeIcon icon={faBoxArchive} className="fa-ico" />
              Archive
            </p>
            <h2 id="archive-title" style={{ fontSize: 'var(--step-4)', margin: '0.75rem 0' }}>
              Everything else I&apos;ve written
            </h2>
            <p className="text-muted">
              Mirrored word for word from Hashnode and Medium by{' '}
              <code>npm run sync:cross-platform</code>. Weekly issues live under the{' '}
              <Link className="action-link" href="/newsletter">
                newsletter
              </Link>
              .
            </p>
          </header>

          <div className="grid deck-grid" style={{ gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
            {archive.map(({ slug, frontmatter: fm }) => (
              <article key={slug} className="card card-pad card-interactive reveal">
                <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-neutral">
                    <FontAwesomeIcon icon={fm.source === 'medium' ? faMedium : faHashnode} className="fa-ico" />
                    {fm.source === 'medium' ? 'Medium' : 'Hashnode'}
                  </span>
                  {fm.date && (
                    <span className="meta">
                      <FontAwesomeIcon icon={faCalendar} className="fa-ico" />
                      {fm.date}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>
                  <Link className="title-link" href={`/blog/${slug}`}>
                    {fm.title ?? slug}
                  </Link>
                </h3>
                {fm.subtitle && (
                  <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
                    {fm.subtitle}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
