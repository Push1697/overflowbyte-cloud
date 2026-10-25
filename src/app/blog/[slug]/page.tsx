import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Sparkles, Calendar, Tag, ShieldCheck } from 'lucide-react';

export async function generateStaticParams() {
  return [
    { slug: '01-how-linux-decides-who-can-open-a-file' },
  ];
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.resolve(process.cwd(), 'posts/01-how-linux-decides-who-can-open-a-file.md');

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const rawFile = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(rawFile);

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Back link */}
      <Link href="/blog" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#94a3b8',
        fontSize: '0.9rem',
        marginBottom: '2rem',
        fontWeight: 500,
      }}>
        <ArrowLeft size={16} /> Back to Flagship Series
      </Link>

      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-blue">Series: {data.series || 'Linux Internals'}</span>
          <span className="badge badge-live">Flagship #1</span>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>1 Nov 2026</span>
        </div>

        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          color: '#ffffff',
          marginBottom: '1rem',
        }}>
          {data.title}
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {data.subtitle}
        </p>

        {/* Cross-Platform Syndication Notice */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              Multi-Platform Syndication
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
              Canonical Home: <a href="https://blog.overflowbyte.cloud/how-linux-decides-who-can-open-a-file" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>blog.overflowbyte.cloud</a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="https://blog.overflowbyte.cloud/how-linux-decides-who-can-open-a-file"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.84rem', padding: '6px 12px' }}
            >
              Hashnode <ExternalLink size={12} />
            </a>
            <a
              href="https://overflowbyte.medium.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.84rem', padding: '6px 12px' }}
            >
              Medium <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Lab Callout */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
            <Sparkles size={16} /> Interactive Companion Sandbox
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '580px' }}>
            Test the live <code>newgrp</code> 6-step syscall player, simulate the DAC access flowchart, and calculate permissions on the 16-bit <code>i_mode</code> grid.
          </p>
        </div>
        <Link href="/visuals/linux-permissions" className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
          Open Visual Lab 🚀
        </Link>
      </div>

      {/* Embedded Visualizer Preview */}
      <div style={{ marginBottom: '3.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
          🎮 Embedded Architecture Sandbox
        </h3>
        <iframe
          src="/visuals/linux-permissions"
          style={{
            width: '100%',
            height: '750px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            background: '#ffffff',
          }}
          title="Linux Permissions Visual Explainer"
        />
      </div>

      {/* Article Content */}
      <div style={{
        color: '#cbd5e1',
        fontSize: '1.05rem',
        lineHeight: 1.8,
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '2rem',
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
          fontSize: '0.98rem',
          lineHeight: 1.7,
        }}>
          {content}
        </div>
      </div>

      {/* Dual Link Footer */}
      <div style={{
        marginTop: '4rem',
        padding: '2rem',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '4px' }}>Want the full hands-on lab commands?</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Access our reference notes, EX294 mock exams, and RHCSA lab drills on the Learning Second-Brain.
          </p>
        </div>
        <a
          href="https://learning.overflowbyte.cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
        >
          Open Learning Notes →
        </a>
      </div>

    </main>
  );
}
