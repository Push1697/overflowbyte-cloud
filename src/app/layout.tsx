import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { ExternalLink } from 'lucide-react';
import './globals.css';
import SiteHeader from './components/SiteHeader';
import AmbientLayer from './components/AmbientLayer';

/* Self-hosted and preloaded by Next, which removes the render-blocking
   round trip to fonts.googleapis.com the stylesheet @import used to cause. */
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.overflowbyte.cloud'),
  title: 'OverflowByte — Systems Architecture, Linux Internals & Visual Engineering Lab',
  description:
    'Interactive architecture playgrounds, Linux kernel explainers, cloud networking drills, and deep technical write-ups by Pushpendra.',
  icons: {
    icon: '/favicon.png',
    apple: '/assets/logo/overflowbyte_mark_1024.png',
  },
  openGraph: {
    title: 'OverflowByte — Systems Architecture & Visual Engineering Lab',
    description:
      'Interactive architecture playgrounds, Linux kernel explainers, and systems deep-dives.',
    url: 'https://www.overflowbyte.cloud',
    siteName: 'OverflowByte',
    images: [
      {
        url: '/assets/logo/overflowbyte_lockup.png',
        width: 1200,
        height: 630,
        alt: 'OverflowByte',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OverflowByte — Systems Architecture & Visual Engineering Lab',
    description:
      'Interactive architecture playgrounds, Linux kernel explainers, and systems deep-dives.',
    images: ['/assets/logo/overflowbyte_lockup.png'],
  },
};

const CHANNELS = [
  { href: 'https://blog.overflowbyte.cloud', label: 'Blog & newsletter (Hashnode)', external: true },
  { href: 'https://learning.overflowbyte.cloud', label: 'Second-brain lab vault (Quartz)', external: true },
  { href: 'https://overflowbyte.medium.com/', label: 'Syndication (Medium)', external: true },
  { href: '/visuals/linux-permissions', label: 'Interactive architecture lab', external: false },
];

const SERIES = [
  'Linux Internals',
  'Cloud Networking',
  'Ansible & RHCE',
  'Incident Drills',
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <SiteHeader />

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="shell">
            <div className="footer-grid">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo/overflowbyte_lockup.png"
                  alt="OverflowByte"
                  style={{ height: 30, width: 'auto', marginBottom: '0.9rem', opacity: 0.9 }}
                />
                <p className="text-muted" style={{ fontSize: 'var(--step--1)', maxWidth: '32ch' }}>
                  Systems engineering, Linux internals, cloud architecture, and incident
                  drills — explained visually with interactive models.
                </p>
              </div>

              <div>
                <h2 className="footer-title">Ecosystem</h2>
                <ul className="footer-list">
                  {CHANNELS.map(({ href, label, external }) => (
                    <li key={href}>
                      {external ? (
                        <a
                          className="footer-link"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {label}
                          <ExternalLink size={12} aria-hidden="true" />
                        </a>
                      ) : (
                        <a className="footer-link" href={href}>
                          {label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="footer-title">Series</h2>
                <ul className="footer-list">
                  {SERIES.map((series) => (
                    <li key={series}>
                      <Link
                        className="footer-link"
                        href={`/blog?series=${encodeURIComponent(series)}`}
                      >
                        {series}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="footer-title">Author</h2>
                <p
                  className="text-muted"
                  style={{ fontSize: 'var(--step--1)', marginBottom: '0.9rem' }}
                >
                  Built by Pushpendra — systems engineer and author.
                </p>
                <a
                  className="btn btn-secondary btn-sm"
                  href="https://pushpendra.overflowbyte.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="footer-bottom">
              <p>© {new Date().getFullYear()} OverflowByte. All rights reserved.</p>
              <div className="cluster" style={{ ['--cluster-gap' as string]: '1.1rem' }}>
                <a
                  className="footer-link"
                  href="https://github.com/Push1697"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <Link className="footer-link" href="/about">
                  About & contact
                </Link>
              </div>
            </div>
          </div>
        </footer>

        <AmbientLayer />
        <Analytics />
      </body>
    </html>
  );
}
