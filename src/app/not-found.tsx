import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="shell section"
      style={{ maxWidth: '640px', textAlign: 'center', paddingBlock: 'clamp(4rem, 12vw, 8rem)' }}
    >
      <p className="eyebrow" style={{ justifyContent: 'center' }}>
        404 · not found
      </p>
      <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
        This page resolved to nothing.
      </h1>
      <p className="lede" style={{ margin: '0 auto 2rem' }}>
        The article may still be in drafting, or the URL may be wrong. The published series and
        the interactive lab are both below.
      </p>
      <div className="cluster" style={{ justifyContent: 'center' }}>
        <Link className="btn btn-primary" href="/blog">
          <ArrowLeft size={15} aria-hidden="true" />
          Browse the series
        </Link>
        <a className="btn btn-secondary" href="/visuals/linux-permissions">
          <Sparkles size={14} aria-hidden="true" />
          Visual lab
        </a>
      </div>
    </div>
  );
}
