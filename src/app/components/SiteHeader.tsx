'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faGraduationCap,
  faLayerGroup,
  faUpRightFromSquare,
  faUser,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faHashnode, faMedium } from '@fortawesome/free-brands-svg-icons';

/* The visual lab is a static HTML file served through a rewrite, so it is
   linked with a plain anchor. A next/link would try an RSC fetch first and
   fall back to a hard navigation, which shows up as a stall on click. */
const LAB_HREF = '/visuals/linux-permissions';

const INTERNAL_LINKS = [
  { href: '/blog', label: 'Articles', icon: faLayerGroup },
  { href: '/learn', label: 'Learn', icon: faGraduationCap },
  { href: '/about', label: 'About', icon: faUser },
];

const EXTERNAL_LINKS = [
  { href: 'https://blog.overflowbyte.cloud', label: 'Hashnode', icon: faHashnode },
  { href: 'https://overflowbyte.medium.com/', label: 'Medium', icon: faMedium },
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
            <img
              className="logo-mark"
              src="/assets/logo/overflowbyte_mark_alpha.png"
              alt="OverflowByte"
              width={512}
              height={381}
            />
          </Link>

          <div className="nav-links">
            {INTERNAL_LINKS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={isActive(href) ? 'page' : undefined}
              >
                <FontAwesomeIcon icon={icon} className="fa-ico" />
                {label}
              </Link>
            ))}
            {EXTERNAL_LINKS.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                className="nav-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={icon} className="fa-ico" />
                {label}
              </a>
            ))}
          </div>

          <a className="btn btn-primary btn-sm nav-cta" href={LAB_HREF}>
            <FontAwesomeIcon icon={faWandMagicSparkles} className="fa-ico" />
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
            <FontAwesomeIcon icon={open ? faXmark : faBars} className="fa-ico-lg" />
          </button>
        </nav>

        {/* Rendered at every width but only displayed below 920px, so the
            markup stays identical between server and client. */}
        <div className="nav-panel" id="nav-panel" data-open={open}>
          {/* inert, not hidden: the content stays laid out so the row-height
              collapse can animate, while staying out of the tab order. */}
          <div className="nav-panel-inner" inert={!open}>
            {INTERNAL_LINKS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={isActive(href) ? 'page' : undefined}
              >
                <FontAwesomeIcon icon={icon} className="fa-ico" />
                {label}
              </Link>
            ))}
            {EXTERNAL_LINKS.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                className="nav-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={icon} className="fa-ico" />
                {label}
                <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
              </a>
            ))}
            <a className="btn btn-primary" href={LAB_HREF}>
              <FontAwesomeIcon icon={faWandMagicSparkles} className="fa-ico" />
              Launch Visual Lab
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
