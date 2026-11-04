'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Renders a ```mermaid code block as an SVG diagram. The library is loaded
 * dynamically so it never lands in the initial bundle of pages without
 * diagrams, and the theme follows the site's day/night toggle.
 */
export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const light = document.documentElement.dataset.theme === 'light';
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: light ? 'default' : 'dark',
          fontFamily: 'inherit',
        });
        const id = `mmd-${Math.random().toString(36).slice(2, 10)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (failed) {
    return (
      <pre className="mermaid-fallback">
        <code>{chart}</code>
      </pre>
    );
  }

  return <div ref={ref} className="mermaid" />;
}
