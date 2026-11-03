'use client';

import { useState } from 'react';
import { STALE_GROUP_TIMELINE } from '../../lib/permissions';
import { renderInline } from '../../lib/inline';

/**
 * The four beats of a stale credential set. Selecting a step fills the track
 * up to it, so the sequence reads as elapsed time rather than four tabs.
 */
export default function StaleTimeline() {
  const [reached, setReached] = useState(0);

  return (
    <ol className="tl" aria-label="Lifecycle of a stale group membership">
      {STALE_GROUP_TIMELINE.map((step, i) => {
        const active = i <= reached;

        return (
          <li key={step.title} className={active ? 'tl-step is-active' : 'tl-step'}>
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
        );
      })}
    </ol>
  );
}
