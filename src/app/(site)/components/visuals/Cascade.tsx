'use client';

import { useState } from 'react';
import type { CascadeViz } from '../../lib/visuals';
import { renderInline } from '../../lib/inline';

/**
 * Ordered checks against a selectable subject.
 *
 * The ordering is usually the lesson: which test runs first, and where the
 * decision stops. A skipped branch is dimmed rather than hidden, because the
 * reader needs to see that it was never evaluated.
 */
export default function Cascade({ checks, subjects }: Pick<CascadeViz, 'checks' | 'subjects'>) {
  const [id, setId] = useState(subjects[0]?.id);
  const subject = subjects.find((s) => s.id === id) ?? subjects[0];

  if (!subject) return null;

  return (
    <div className="flow-wrap">
      <div className="cluster" style={{ ['--cluster-gap' as string]: '0.4rem' }}>
        {subjects.map((s) => (
          <button
            key={s.id}
            type="button"
            className={s.id === subject.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            aria-pressed={s.id === subject.id}
            onClick={() => setId(s.id)}
          >
            {s.label}
            {s.detail && <span className="flow-actor-detail">{s.detail}</span>}
          </button>
        ))}
      </div>

      <ol className="flow" aria-live="polite">
        {checks.map((check, i) => {
          const result = subject.results[check.id];
          if (!result) return null;

          return (
            <li key={check.id} className={`flow-step is-${result.state}`}>
              <div className="flow-head">
                <span className="flow-index" aria-hidden="true">
                  {i + 1}
                </span>
                <strong>{check.title}</strong>
                {check.test && <code className="flow-test">{check.test}</code>}
              </div>
              <p className="flow-note">{renderInline(result.note)}</p>
            </li>
          );
        })}
      </ol>

      <p className={subject.granted ? 'flow-verdict is-ok' : 'flow-verdict is-bad'}>
        {renderInline(subject.verdict)}
      </p>
    </div>
  );
}
