import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faMedium } from '@fortawesome/free-brands-svg-icons';
import './globals.css';
import SiteHeader from './components/SiteHeader';
import AmbientLayer from './components/AmbientLayer';

/* FontAwesome normally injects its CSS at runtime, which makes icons flash
   at a huge size before hydration. We import the stylesheet above instead
   and switch the auto-injection off. */
config.autoAddCss = false;

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
  metadataBase: new URL('https://www.overflowbyte.tech'),
  title: 'OverflowByte — Systems Architecture, Linux Internals & Visual Engineering Lab',
  description:
    'Interactive architecture playgrounds, Linux kernel explainers, hands-on labs, and deep technical write-ups by Pushpendra.',
  icons: {
    icon: '/favicon.png',
    apple: '/assets/logo/overflowbyte_mark_1024.png',
  },
  openGraph: {
    title: 'OverflowByte — Systems Architecture & Visual Engineering Lab',
    description:
      'Interactive architecture playgrounds, Linux kernel explainers, hands-on labs and systems deep-dives.',
    url: 'https://www.overflowbyte.tech',
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
      'Interactive architecture playgrounds, Linux kernel explainers, hands-on labs and systems deep-dives.',
    images: ['/assets/logo/overflowbyte_lockup.png'],
  },
};

const CHANNELS = [
  { href: '/blog', label: 'Blog & newsletter', icon: faNewspaper, external: false },
  { href: 'https://overflowbyte.medium.com/', label: 'Syndication', icon: faMedium, external: true },
  { href: 'https://github.com/Push1697', label: 'Source & projects', icon: faGithub, external: true },
];

const EXPLORE = [
  { href: '/blog', label: 'Articles & series' },
  { href: '/learn', label: 'Flashcards & labs' },
  { href: '/newsletter', label: 'Weekly newsletter' },
  { href: '/about', label: 'About' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* Google-only tags */}
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=G-VLNSD6K5HE"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
          }}
        />
      </head>
      <body>
        {/* Applies the saved (or system) theme before first paint so day
            mode never flashes dark. Mirrors into the header toggle. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('ob-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();",
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <SiteHeader />

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="shell">
            <div className="footer-grid">
              <div>
                {/* The full lockup anchors the footer, where there is room
                    for the wordmark the header cannot spare. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="logo-lockup"
                  src="/assets/logo/overflowbyte_lockup_alpha.png"
                  alt="OverflowByte"
                  width={1200}
                  height={185}
                />
                <p className="text-muted" style={{ fontSize: 'var(--step--1)', maxWidth: '34ch' }}>
                  Systems engineering, Linux internals, cloud architecture and incident
                  drills — explained visually, with labs you can actually run.
                </p>
              </div>

              <div>
                <h2 className="footer-title">Explore</h2>
                <ul className="footer-list">
                  {EXPLORE.map(({ href, label }) => (
                    <li key={href}>
                      <Link className="footer-link" href={href}>
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <a className="footer-link" href="/visuals/linux-permissions">
                      Interactive visual lab
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="footer-title">Channels</h2>
                <ul className="footer-list">
                  {CHANNELS.map(({ href, label, icon }) => (
                    <li key={href}>
                      <a
                        className="footer-link"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={icon} className="fa-ico" />
                        {label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <Link className="footer-link" href="/notes">
                      <FontAwesomeIcon icon={faBookOpen} className="fa-ico" />
                      Notes &amp; labs
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="footer-title">Author</h2>
                <p
                  className="text-muted"
                  style={{ fontSize: 'var(--step--1)', marginBottom: '0.9rem' }}
                >
                  Built by Pushpendra — infrastructure systems engineer.
                </p>
                <Link className="btn btn-secondary btn-sm" href="/about">
                  Portfolio
                </Link>
              </div>
            </div>

            <div className="footer-bottom">
              <p>© {new Date().getFullYear()} OverflowByte. All rights reserved.</p>
              <Link className="footer-link" href="/about">
                About &amp; contact
              </Link>
            </div>
          </div>
        </footer>

        <AmbientLayer />
        <Analytics />
      </body>
    </html>
  );
}
