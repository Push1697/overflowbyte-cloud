'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Layers, Menu, Sparkles, User, X } from 'lucide-react';

/* The visual lab is a static HTML file served through a rewrite, so it is
   linked with a plain anchor. A next/link would try an RSC fetch first and
   fall back to a hard navigation, which shows up as a stall on click. */
const LAB_HREF = '/visuals/linux-permissions';

const INTERNAL_LINKS = [
  { href: '/blog', label: 'Articles & Series', icon: Layers },
  { href: '/about', label: 'About', icon: User },
];

const EXTERNAL_LINKS = [
  { href: 'https://blog.overflowbyte.cloud', label: 'Hashnode' },
  { href: 'https://learning.overflowbyte.cloud', label: 'Learning Vault' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);

  // Close the panel on navigation so it never covers the new page. Adjusting
  // state during render is React's recommended way to reset on a prop change;
  // doing this in an effect would trigger a cascading re-render.
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  // Escape closes the panel, matching normal disclosure behaviour.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <header className="site-header">
      <div className="shell">
        <nav className="nav" aria-label="Primary">
          <Link href="/" className="nav-logo" aria-label="OverflowByte home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/overflowbyte_lockup.png" alt="OverflowByte" />
          </Link>

          <div className="nav-links">
            {INTERNAL_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={isActive(href) ? 'page' : undefined}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </Link>
            ))}
            {EXTERNAL_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="nav-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            ))}
          </div>

          <a className="btn btn-primary btn-sm nav-cta" href={LAB_HREF}>
            <Sparkles size={14} aria-hidden="true" />
            Visual Lab
          </a>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-panel"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Rendered at every width but only displayed below 920px, so the
            markup stays identical between server and client. */}
        <div className="nav-panel" id="nav-panel" data-open={open}>
          {/* inert, not hidden: the content stays laid out so the row-height
              collapse can animate, while staying out of the tab order. */}
          <div className="nav-panel-inner" inert={!open}>
            {INTERNAL_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={isActive(href) ? 'page' : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            ))}
            {EXTERNAL_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="nav-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            ))}
            <a className="btn btn-primary" href={LAB_HREF}>
              <Sparkles size={15} aria-hidden="true" />
              Launch Visual Lab
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
