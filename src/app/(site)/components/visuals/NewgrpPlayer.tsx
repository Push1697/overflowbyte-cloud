'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { NEWGRP_STEPS } from '../../lib/permissions';
import { renderInline } from '../../lib/inline';

/** Steps through the six syscalls `newgrp developers` actually performs. */
export default function NewgrpPlayer() {
  const [i, setI] = useState(0);
  const step = NEWGRP_STEPS[i];
  const last = NEWGRP_STEPS.length - 1;

  return (
    <div className="player">
      <div className="player-bar">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="fa-ico" />
          Previous
        </button>

        <p className="player-count" aria-live="polite">
          <span className="mono">
            {i + 1} / {NEWGRP_STEPS.length}
          </span>
          <span className="player-title">{step.title}</span>
        </p>

        {i === last ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setI(0)}>
            <FontAwesomeIcon icon={faRotateLeft} className="fa-ico" />
            Replay
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setI((n) => Math.min(last, n + 1))}
          >
            Next step
            <FontAwesomeIcon icon={faChevronRight} className="fa-ico" />
          </button>
        )}
      </div>

      {/* The track doubles as a progress bar, so the player's position is
          legible without reading the counter. */}
      <div className="player-track" aria-hidden="true">
        {NEWGRP_STEPS.map((s, n) => (
          <span key={s.title} className={n <= i ? 'player-tick is-done' : 'player-tick'} />
        ))}
      </div>

      <p className="player-desc">{renderInline(step.body)}</p>

      <div className="table-scroll">
        <table className="cred-table">
          <thead>
            <tr>
              <th>ID type</th>
              <th>UID (user)</th>
              <th>GID (group)</th>
              <th>Supplementary groups</th>
            </tr>
          </thead>
          <tbody>
            {step.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>
                  <code className={row.uidState ? `cred-${row.uidState}` : undefined}>{row.uid}</code>
                </td>
                <td>
                  <code className={row.gidState ? `cred-${row.gidState}` : undefined}>{row.gid}</code>
                </td>
                <td>
                  <code className={step.groupsChanged ? 'cred-changed' : undefined}>{step.groups}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
