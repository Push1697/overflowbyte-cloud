import Link from 'next/link';
import { User, ExternalLink, CheckCircle2, Terminal, Shield, Award, Cpu, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '3.5rem 1.5rem 6rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#38bdf8',
          fontSize: '0.86rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '1rem',
          background: 'rgba(56, 189, 248, 0.08)',
          padding: '6px 14px',
          borderRadius: '9999px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}>
          <User size={14} /> Systems Engineer & Platform Architect
        </div>
        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '1rem' }} className="gradient-text">
          About Pushpendra
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Building visual tools and low-level architectural explainers to demystify Linux internals, cloud security, and systems engineering.
        </p>
      </div>

      {/* Portfolio Card Integration */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        marginBottom: '3rem',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-blue">Official Portfolio Hub</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
              pushpendra.overflowbyte.cloud
            </h2>
          </div>
          <a
            href="https://pushpendra.overflowbyte.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: '0.92rem' }}
          >
            Open Full Portfolio Resume <ExternalLink size={14} />
          </a>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          My official resume, professional experience, open-source repositories, and production certifications are hosted on my standalone portfolio at <strong>pushpendra.overflowbyte.cloud</strong>.
        </p>

        {/* Embedded Iframe Preview */}
        <div style={{
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0b0f19',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.82rem',
            color: '#64748b',
          }}>
            <span>Preview: https://pushpendra.overflowbyte.cloud</span>
            <a href="https://pushpendra.overflowbyte.cloud" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Full Screen <ExternalLink size={12} />
            </a>
          </div>
          <iframe
            src="https://pushpendra.overflowbyte.cloud"
            style={{ width: '100%', height: '520px', border: 'none' }}
            title="Pushpendra Portfolio"
            loading="lazy"
          />
        </div>
      </div>

      {/* Engineering Philosophy & 3 Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ color: '#38bdf8', marginBottom: '10px' }}><Terminal size={24} /></div>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>Reality-First Engineering</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            No hand-waving abstractions. We trace down to C structs in <code>linux/sched.h</code>, VFS inodes, and actual system call sequences.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ color: '#34d399', marginBottom: '10px' }}><Shield size={24} /></div>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>Defense in Depth</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            From AWS VPC subnet NACLs to local Linux DAC and capabilities like <code>CAP_DAC_OVERRIDE</code>, security must be verified end-to-end.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ color: '#c084fc', marginBottom: '10px' }}><Cpu size={24} /></div>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>Visual Intuition</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Complex concepts are best learned through animated state diagrams, interactive bit grids, and repeatable hands-on lab drills.
          </p>
        </div>
      </div>

      {/* Connect Banner */}
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
          Let’s Connect & Collaborate
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
          Follow along as we publish the 10-Flagship series or connect with me on GitHub and LinkedIn.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <a href="https://github.com/Push1697" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            GitHub (@Push1697)
          </a>
          <a href="https://blog.overflowbyte.cloud" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Subscribe on Hashnode
          </a>
          <a href="https://overflowbyte.medium.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Medium
          </a>
        </div>
      </div>

    </main>
  );
}
