import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, ExternalLink, Layers, Sparkles } from 'lucide-react';
import { getPostSlugs } from '../lib/posts';

export const metadata: Metadata = {
  title: 'Technical deep-dives — OverflowByte',
  description:
    'Ten flagship engineering stories on Linux internals, cloud networking, incident response and Ansible automation.',
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
];

export default function BlogIndexPage() {
  // Only link to posts whose markdown file actually exists, so a scheduled
  // entry never navigates to a 404 or to the wrong article.
  const published = new Set(getPostSlugs());

  return (
    <div className="shell section">
      <header style={{ maxWidth: '56rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <Layers size={15} aria-hidden="true" />
          Flagship publications
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          Technical deep-dives
        </h1>
        <p className="lede">
          Ten flagship engineering stories, syndicated across Hashnode as the primary blog,
          Medium for reach, and this interactive reader.
        </p>
      </header>

      <div className="grid" style={{ gap: '1.25rem' }}>
        {FLAGSHIPS.map((post) => {
          const isLive = published.has(post.slug);

          return (
            <article
              key={post.num}
              className={
                isLive
                  ? 'card card-pad card-interactive card-feature spotlight reveal'
                  : 'card card-pad card-muted reveal'
              }
            >
              <div
                className="cluster"
                style={{ justifyContent: 'space-between', marginBottom: '0.9rem' }}
              >
                <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
                  <span className={isLive ? 'badge badge-ok' : 'badge badge-warn'}>
                    {isLive && <span className="live-dot" aria-hidden="true" />}
                    Flagship #{post.num} · {isLive ? 'Published' : 'Scheduled'}
                  </span>
                  <span className="badge badge-neutral">{post.series}</span>
                </div>
                <span className="meta">
                  <Calendar size={13} aria-hidden="true" />
                  {post.date}
                </span>
              </div>

              <h2 style={{ fontSize: 'var(--step-2)', marginBottom: '0.6rem' }}>
                {isLive ? (
                  <Link className="title-link" href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                ) : (
                  post.title
                )}
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
                {isLive ? (
                  <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
                    <Link className="btn btn-primary btn-sm" href={`/blog/${post.slug}`}>
                      Read article
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                    {post.hashnodeUrl && (
                      <a
                        className="btn btn-ghost btn-sm"
                        href={post.hashnodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Hashnode
                        <ExternalLink size={12} aria-hidden="true" />
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
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="meta">Drafting — publishes {post.date}</span>
                )}

                {post.labHref && (
                  <a className="action-link" href={post.labHref}>
                    <Sparkles size={14} aria-hidden="true" />
                    Interactive lab
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
