import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { Analytics } from '@vercel/analytics/next';
import { Sparkles, ExternalLink, BookOpen, Layers, Terminal, User } from 'lucide-react';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.overflowbyte.cloud'),
  title: 'OverflowByte — Systems Architecture, Linux Internals & Visual Engineering Lab',
  description: 'Interactive architecture playgrounds, Linux kernel explainers, cloud networking drills, and deep technical write-ups by Pushpendra.',
  icons: {
    icon: '/favicon.png',
    apple: '/assets/logo/overflowbyte_mark_1024.png',
  },
  openGraph: {
    title: 'OverflowByte — Systems Architecture & Visual Engineering Lab',
    description: 'Interactive architecture playgrounds, Linux kernel explainers, and systems deep-dives.',
    url: 'https://www.overflowbyte.cloud',
    siteName: 'OverflowByte',
    images: [
      {
        url: '/assets/logo/overflowbyte_lockup.png',
        width: 1200,
        height: 630,
        alt: 'OverflowByte Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OverflowByte — Systems Architecture & Visual Engineering Lab',
    description: 'Interactive architecture playgrounds, Linux kernel explainers, and systems deep-dives.',
    images: ['/assets/logo/overflowbyte_lockup.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Navigation Bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <nav style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/assets/logo/overflowbyte_lockup.png"
                alt="OverflowByte Logo"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.75rem',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}>
              <Link href="/#visual-lab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-blue">
                  <Sparkles size={12} /> Visual Lab
                </span>
              </Link>
              <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <Layers size={16} /> Articles & Series
              </Link>
              <a
                href="https://blog.overflowbyte.cloud"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}
              >
                Hashnode Blog <ExternalLink size={12} />
              </a>
              <a
                href="https://learning.overflowbyte.cloud"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}
              >
                Learning Vault <ExternalLink size={12} />
              </a>
              <Link href="/about" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <User size={16} /> About
              </Link>
            </div>

            {/* Right Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/visuals/linux-permissions" className="btn btn-primary" style={{ fontSize: '0.86rem', padding: '8px 16px' }}>
                Launch Linux Lab 🚀
              </Link>
            </div>
          </nav>
        </header>

        {/* Page Content */}
        {children}

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(9, 13, 22, 0.95)',
          padding: '4rem 1.5rem 2.5rem',
          marginTop: '6rem',
        }}>
          <div style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}>
            <div>
              <img
                src="/assets/logo/overflowbyte_lockup.png"
                alt="OverflowByte"
                style={{ height: '34px', width: 'auto', marginBottom: '1rem', opacity: 0.9 }}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '320px' }}>
                Systems engineering, Linux internals, cloud architecture, and incident drills — explained visually with interactive models.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Ecosystem Channels</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#94a3b8' }}>
                <li><a href="https://blog.overflowbyte.cloud" target="_blank" rel="noopener noreferrer">📖 Blog & Newsletter (Hashnode)</a></li>
                <li><a href="https://learning.overflowbyte.cloud" target="_blank" rel="noopener noreferrer">🧠 Second-Brain Lab Vault (Quartz)</a></li>
                <li><a href="https://overflowbyte.medium.com/" target="_blank" rel="noopener noreferrer">🌐 Syndication (Medium)</a></li>
                <li><a href="/visuals/linux-permissions">🎮 Interactive Architecture Lab</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Flagship Series</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#94a3b8' }}>
                <li><Link href="/blog?series=Linux+Internals">🐧 Linux Kernel Internals</Link></li>
                <li><Link href="/blog?series=Cloud+Networking">☁️ AWS Cloud Networking</Link></li>
                <li><Link href="/blog?series=Ansible+Automation">⚙️ Ansible & RHCE Lab Drills</Link></li>
                <li><Link href="/blog?series=Incident+Response">🚨 Production Incident Drills</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Author & Engineering</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '12px' }}>
                Crafted by <strong>Pushpendra</strong>. Explore my portfolio, projects, and production resume:
              </p>
              <a
                href="https://pushpendra.overflowbyte.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.84rem', padding: '8px 14px' }}
              >
                pushpendra.overflowbyte.cloud <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div style={{
            maxWidth: '1240px',
            margin: '0 auto',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '0.84rem',
            color: '#64748b',
          }}>
            <p>© {new Date().getFullYear()} OverflowByte. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <a href="https://github.com/Push1697" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <Link href="/about">About & Contact</Link>
            </div>
          </div>
        </footer>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
