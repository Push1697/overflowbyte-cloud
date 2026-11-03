'use client';

import { useState } from 'react';
import { DAC_ACTORS, DAC_STAGES } from '../../lib/permissions';
import { renderInline } from '../../lib/inline';

/**
 * `generic_permission()` as a cascade: owner, then group, then other, and only
 * then the capability check. The ordering is the point — root's override is
 * evaluated last, after the mode bits have already refused.
 */
export default function DacFlow() {
  const [actorId, setActorId] = useState(DAC_ACTORS[0].id);
  const actor = DAC_ACTORS.find((a) => a.id === actorId) ?? DAC_ACTORS[0];

  return (
    <div className="flow-wrap">
      <div className="cluster" style={{ ['--cluster-gap' as string]: '0.4rem' }}>
        {DAC_ACTORS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={a.id === actorId ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            aria-pressed={a.id === actorId}
            onClick={() => setActorId(a.id)}
          >
            {a.label}
            <span className="flow-actor-detail">{a.detail}</span>
          </button>
        ))}
      </div>

      <ol className="flow" aria-live="polite">
        {DAC_STAGES.map((stage, i) => {
          const result = actor.steps[stage.id];

          return (
            <li key={stage.id} className={`flow-step is-${result.state}`}>
              <div className="flow-head">
                <span className="flow-index" aria-hidden="true">
                  {i + 1}
                </span>
                <strong>{stage.title}</strong>
                <code className="flow-test">{stage.test}</code>
              </div>
              <p className="flow-note">{result.note}</p>
            </li>
          );
        })}
      </ol>

      <p className={actor.granted ? 'flow-verdict is-ok' : 'flow-verdict is-bad'}>
        {renderInline(actor.verdict)}
      </p>
    </div>
  );
}
