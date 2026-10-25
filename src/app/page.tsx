import Link from 'next/link';
import { Sparkles, Terminal, Layers, ArrowRight, ExternalLink, ShieldAlert, Cpu, Network, CheckCircle2, User, BookOpen } from 'lucide-react';

export default function HomePage() {
  return (
    <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
      
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '5rem 0 4rem',
        maxWidth: '960px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          color: '#38bdf8',
          marginBottom: '1.5rem',
          fontWeight: 600,
        }}>
          <Sparkles size={14} /> Systems Engineering, Security & Linux Internals
        </div>

        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          marginBottom: '1.5rem',
        }} className="gradient-text">
          Complex Systems Architecture,<br />Explained Visually.
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: '#94a3b8',
          maxWidth: '720px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6,
        }}>
          An interactive engineering platform hosting step-by-step kernel visualizers, production incident drills, and hands-on cloud networking breakdowns.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link href="/visuals/linux-permissions" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.96rem' }}>
            Launch Linux Visual Lab 🚀
          </Link>
          <Link href="/blog" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.96rem' }}>
            Explore Flagship Series 📚
          </Link>
          <a
            href="https://pushpendra.overflowbyte.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '12px 24px', fontSize: '0.96rem', borderColor: 'rgba(56, 189, 248, 0.3)' }}
          >
            Portfolio Resume <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* SECTION 1: Interactive Visual Lab */}
      <section id="visual-lab" style={{ margin: '4rem 0 6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              🎮 Visual Architecture Lab
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '4px' }}>
              ByteByteGo-style interactive sandboxes with state machines, syscall players, and live bit calculators.
            </p>
          </div>
          <Link href="/visuals/linux-permissions" style={{ color: '#38bdf8', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Open Flagship Sandbox <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
        }}>
          {/* Flagship #1 Card */}
          <Link href="/visuals/linux-permissions" className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className="badge badge-live">● Live Interactive Lab</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>8 Modules</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
              Linux Permissions & Inodes, Visually
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.5rem' }}>
              Interact with the <code>newgrp</code> 6-step syscall player, simulate the DAC flowchart (Alice, Bob, Carol, Root), inspect <code>task_struct → struct cred</code>, and toggle the 16-bit <code>i_mode</code> calculator.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: '0.9rem',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              Launch Interactive Visualizer <ArrowRight size={16} />
            </div>
          </Link>

          {/* Upcoming Flagship #2 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className="badge badge-amber">Nov 15 · In Staging</span>
              <ShieldAlert size={18} color="#fbbf24" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
              Request-to-Shell: PHP2Shell & Node2Shell
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.5rem' }}>
              Visual attack flow simulator: follow an HTTP request as it traverses runtime boundaries, bypasses sanitation, and executes shellcode in memory.
            </p>
            <div style={{ color: '#fbbf24', fontSize: '0.88rem', fontWeight: 600 }}>
              Flagship #2 Architecture Tool
            </div>
          </div>

          {/* Upcoming Flagship #3 */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className="badge badge-purple">Nov 29 · In Staging</span>
              <Network size={18} color="#c084fc" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
              AWS Packet Path: NACL vs Security Groups
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.5rem' }}>
              Interactive packet journey simulator: trace traffic arriving at an AWS VPC subnet, rule evaluation order, stateless return traffic, and ephemeral port drop mechanics.
            </p>
            <div style={{ color: '#c084fc', fontSize: '0.88rem', fontWeight: 600 }}>
              Flagship #3 Architecture Tool
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Cross-Platform Articles & Flagships */}
      <section style={{ margin: '6rem 0' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            📖 Flagship Articles & Cross-Platform Series
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '4px' }}>
            Long-form technical deep-dives syndicated across Hashnode, Medium, and our self-hosted reader.
          </p>
        </div>

        {/* Featured Post Card */}
        <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">Series: Linux Internals</span>
            <span className="badge badge-live">Flagship #1</span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Scheduled: 1 Nov 2026</span>
          </div>

          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
            <Link href="/blog/01-how-linux-decides-who-can-open-a-file" style={{ color: 'inherit' }}>
              How Linux Decides Who Can Open a File (A Visual Deep Dive)
            </Link>
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '820px' }}>
            You add a developer to a group with <code>usermod -aG</code>, but their open terminal gets <code>Permission Denied</code>. We trace the internal kernel mechanics of <code>task_struct</code> credentials, the 6-step syscall sequence of <code>newgrp</code>, in-memory Inodes, and the exact order of <code>generic_permission()</code>.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/blog/01-how-linux-decides-who-can-open-a-file" className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
              Read Article & Interactive Guide →
            </Link>
            <a
              href="https://blog.overflowbyte.cloud/how-linux-decides-who-can-open-a-file"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem' }}
            >
              Hashnode Blog <ExternalLink size={12} />
            </a>
            <a
              href="https://overflowbyte.medium.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.88rem' }}
            >
              Medium <ExternalLink size={12} />
            </a>
            <Link href="/visuals/linux-permissions" className="btn btn-secondary" style={{ fontSize: '0.88rem', color: '#38bdf8' }}>
              Open Live Simulator 🎮
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: The 3-Pillar Ecosystem */}
      <section style={{ margin: '6rem 0' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '0.5rem' }}>
          🏛️ The OverflowByte Architecture
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2.5rem' }}>
          Four interconnected surfaces engineered to balance interactive learning, deep narrative reading, and reference lookups.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌐</div>
            <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>1. Main Platform</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px' }}>
              <strong>overflowbyte.cloud</strong> (Vercel): Central hub hosting all interactive visualizers, syscall players, and tools with zero iframe limits.
            </p>
            <span style={{ color: '#38bdf8', fontSize: '0.82rem', fontFamily: 'JetBrains Mono' }}>You are here</span>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✍️</div>
            <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>2. Flagship Blog</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px' }}>
              <strong>blog.overflowbyte.cloud</strong> (Hashnode): Narrative articles, subscriber newsletter, RSS feeds, and developer discussions.
            </p>
            <a href="https://blog.overflowbyte.cloud" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Visit Blog <ExternalLink size={12} />
            </a>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📚</div>
            <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>3. Learning Second-Brain</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px' }}>
              <strong>learning.overflowbyte.cloud</strong> (Quartz): Searchable lookup vault with 40+ RHCSA/RHCE labs, command cheat sheets, and EX294 mock exams.
            </p>
            <a href="https://learning.overflowbyte.cloud" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Learning Vault <ExternalLink size={12} />
            </a>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📰</div>
            <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>4. Medium Syndication</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px' }}>
              <strong>overflowbyte.medium.com</strong>: Canonical cross-posting ensuring full Google SEO credit points to our primary blog.
            </p>
            <a href="https://overflowbyte.medium.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Follow on Medium <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 4: Integrated About & Portfolio Section */}
      <section style={{
        margin: '6rem 0',
        padding: '3rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              <User size={14} /> Systems Engineer & Author
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Pushpendra
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Specialized in Linux kernel internals, systems architecture, automation with Ansible, and cloud infrastructure security. I create visual interactive tools and architectural breakdowns to make low-level systems intuitive.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="https://pushpendra.overflowbyte.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: '0.9rem' }}
              >
                Visit Full Portfolio Resume <ExternalLink size={14} />
              </a>
              <Link href="/about" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                Engineering Philosophy & Focus
              </Link>
            </div>
          </div>

          {/* Highlights Box */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.75rem',
          }}>
            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              Core Engineering Focus
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem', color: '#94a3b8' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Linux Kernel Internals:</strong> Credential management (<code>task_struct</code>, <code>struct cred</code>, <code>fsuid</code>), VFS inode resolution.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Red Hat Certification Track:</strong> 60-day RHCSA to RHCE lab curriculum & unattended Ansible playbooks.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Cloud Networking:</strong> AWS VPC architecture, NACL vs Security Group packet routing, and perimeter security.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

    </main>
  );
}
