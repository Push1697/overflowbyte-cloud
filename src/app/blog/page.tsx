import Link from 'next/link';
import { Layers, Sparkles, ExternalLink, ArrowRight, Calendar, Tag } from 'lucide-react';

const FLAGSHIPS = [
  {
    num: 1,
    title: "How Linux Decides Who Can Open a File (A Visual Deep Dive)",
    slug: "01-how-linux-decides-who-can-open-a-file",
    date: "1 Nov 2026",
    series: "Linux Internals",
    tags: ["linux", "kernel", "devops", "security"],
    status: "Ready",
    desc: "Tracing process credentials, task_struct -> struct cred, the 6-step newgrp syscall sequence, and in-memory Inode resolution.",
    interactiveUrl: "/visuals/linux-permissions",
    hashnodeUrl: "https://blog.overflowbyte.cloud/how-linux-decides-who-can-open-a-file",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "Linux Kernel Credentials & Inodes",
  },
  {
    num: 2,
    title: "Your Code Is Clean. Attackers Still Got a Shell.",
    slug: "02-your-code-is-clean-attackers-still-got-a-shell",
    date: "15 Nov 2026",
    series: "Security & Exploitation",
    tags: ["security", "rce", "php", "nodejs"],
    status: "Scheduled",
    desc: "PHP2Shell and Node2Shell attack flow: request to shell traversal, runtime boundaries, and defense positioning.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "PHP2Shell and Node2Shell",
  },
  {
    num: 3,
    title: "Port 443 Is Open in the Security Group. Why Does It Still Time Out?",
    slug: "03-port-443-is-open-in-security-group-why-timeout",
    date: "29 Nov 2026",
    series: "Cloud Networking",
    tags: ["aws", "networking", "vpc", "security"],
    status: "Scheduled",
    desc: "NACL vs Security Groups on AWS: Packet path, stateful vs stateless return traffic, ephemeral port drop rules.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "NACL vs Security Groups on AWS",
  },
  {
    num: 4,
    title: "I Broke Two Servers on Purpose and Gave Myself an Hour to Fix Them",
    slug: "04-i-broke-two-servers-on-purpose",
    date: "13 Dec 2026",
    series: "Incident Drills",
    tags: ["linux", "sre", "troubleshooting", "incidents"],
    status: "Scheduled",
    desc: "Production incident drill breakdown: alert -> decoy -> root cause -> fix timeline and the undo-daemon trap.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "Incident Drills",
  },
  {
    num: 5,
    title: "A RHEL Lab You Can Wreck and Reset in Seconds",
    slug: "05-rhel-lab-wreck-and-reset-in-seconds",
    date: "27 Dec 2026",
    series: "Linux & Virtualization",
    tags: ["rhel", "kvm", "cloud-init", "virtualization"],
    status: "Scheduled",
    desc: "Base image -> thin qcow2 overlays -> snapshots tree and instant cloud-init bootstrap on KVM.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "Building a Three-Node RHEL Lab on KVM",
  },
  {
    num: 6,
    title: "My 60-Day Plan from RHCSA to RHCE",
    slug: "06-60-day-plan-rhcsa-to-rhce",
    date: "10 Jan 2027",
    series: "Red Hat Certification Track",
    tags: ["rhcsa", "rhce", "ansible", "certification"],
    status: "Scheduled",
    desc: "Week-by-week visual roadmap and hands-on milestones for mastering Linux administration and Ansible automation.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "RHCSA to RHCE: A 60-Day Lab Curriculum",
  },
  {
    num: 7,
    title: "Every RHCSA Task, Translated to Ansible",
    slug: "07-every-rhcsa-task-translated-to-ansible",
    date: "24 Jan 2027",
    series: "Ansible & RHCE",
    tags: ["ansible", "rhcsa", "automation", "devops"],
    status: "Scheduled",
    desc: "The definitive matrix: manual command -> Ansible module -> collection -> idempotency verification.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "Manual to Ansible: A Module Map",
  },
  {
    num: 8,
    title: "The No-SSH Rule: Automating a Whole Exam Set with Ansible",
    slug: "08-the-no-ssh-rule-automating-exam-set",
    date: "7 Feb 2027",
    series: "Ansible & RHCE",
    tags: ["ansible", "rhce", "ex294", "automation"],
    status: "Scheduled",
    desc: "Automating complete RHCSA exam topologies without manual SSH: the revert -> run -> verify validation loop.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "Automating the RHCSA Set with Ansible",
  },
  {
    num: 9,
    title: "Ansible Variable Precedence, Drawn",
    slug: "09-ansible-variable-precedence-drawn",
    date: "21 Feb 2027",
    series: "Ansible & RHCE",
    tags: ["ansible", "yaml", "architecture"],
    status: "Scheduled",
    desc: "Visual 22-level precedence ladder showing which variable wins and a worked breakdown of surprising overrides.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "Ansible Fundamentals Labs",
  },
  {
    num: 10,
    title: "Ansible Vault with Two Vault IDs, Without Typing a Password",
    slug: "10-ansible-vault-with-two-vault-ids",
    date: "7 Mar 2027",
    series: "Ansible & RHCE",
    tags: ["ansible", "security", "vault", "ci-cd"],
    status: "Scheduled",
    desc: "Mapping multiple vault IDs to files and automated password scripts for seamless unattended execution.",
    interactiveUrl: "/#visual-lab",
    hashnodeUrl: "https://blog.overflowbyte.cloud",
    mediumUrl: "https://overflowbyte.medium.com/",
    learningNote: "Advanced Ansible Labs",
  },
];

export default function BlogIndexPage() {
  return (
    <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '3.5rem 1.5rem 6rem' }}>
      
      {/* Header */}
      <div style={{ maxWidth: '800px', marginBottom: '3.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#38bdf8',
          fontSize: '0.86rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}>
          <Layers size={16} /> Flagship Publications & Series Directory
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
          Technical Deep-Dives
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
          10 flagship engineering stories syndicated across Hashnode (primary blog), Medium (reach), and our interactive lab.
        </p>
      </div>

      {/* Flagships Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {FLAGSHIPS.map((post) => (
          <article
            key={post.num}
            className="glass-card"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              border: post.status === 'Ready' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={post.status === 'Ready' ? 'badge badge-live' : 'badge badge-amber'}>
                  Flagship #{post.num} · {post.status}
                </span>
                <span className="badge badge-purple">{post.series}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                <Calendar size={14} /> {post.date}
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
              <Link href={`/blog/${post.slug}`} style={{ color: 'inherit' }}>
                {post.title}
              </Link>
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '880px' }}>
              {post.desc}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {post.tags.map(t => (
                <span key={t} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  fontFamily: 'JetBrains Mono',
                }}>
                  #{t}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              marginTop: '4px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {post.status === 'Ready' ? (
                  <Link href={`/blog/${post.slug}`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                    Read Article →
                  </Link>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🗓️ Upcoming on schedule
                  </span>
                )}
                <a
                  href={post.hashnodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                >
                  Hashnode <ExternalLink size={12} />
                </a>
                <a
                  href={post.mediumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                >
                  Medium <ExternalLink size={12} />
                </a>
              </div>

              {post.interactiveUrl && (
                <Link
                  href={post.interactiveUrl}
                  style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={14} /> Interactive Lab Simulator
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

    </main>
  );
}
