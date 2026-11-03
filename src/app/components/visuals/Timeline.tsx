'use client';

import { useState } from 'react';
import type { TimelineViz } from '../../lib/visuals';
import { renderInline } from '../../lib/inline';

/**
 * Ordered beats. Selecting one fills the track up to it, so the sequence reads
 * as elapsed time rather than as a set of tabs.
 */
export default function Timeline({ steps, title }: Pick<TimelineViz, 'steps' | 'title'>) {
  const [reached, setReached] = useState(0);

  return (
    <ol className="tl" aria-label={title}>
      {steps.map((step, i) => (
        <li key={step.title} className={i <= reached ? 'tl-step is-active' : 'tl-step'}>
          <button
            type="button"
            className="tl-hit"
            aria-current={i === reached}
            onClick={() => setReached(i)}
          >
            <span className="tl-node" aria-hidden="true">
              {i + 1}
            </span>
            <span className="tl-body">
              <strong>{renderInline(step.title)}</strong>
              <span className="tl-note">{renderInline(step.body)}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
