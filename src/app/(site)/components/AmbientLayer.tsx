'use client';

import { useEffect } from 'react';

/* Two small signs of life, both driven through CSS custom properties so they
   never trigger a React re-render:
   - .spotlight surfaces track the pointer
   - ambient loops pause while the tab is hidden */
export default function AmbientLayer() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let frame = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion.matches) return;
      const target = (event.target as Element | null)?.closest<HTMLElement>('.spotlight');
      if (!target) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        target.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    };

    // Delegated, so surfaces added by a route change are covered too.
    document.addEventListener('pointermove', onPointerMove, { passive: true });

    const onVisibilityChange = () => {
      document.documentElement.style.setProperty(
        '--ambient',
        document.hidden ? 'paused' : 'running',
      );
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
