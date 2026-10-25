'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faClock,
  faFlaskVial,
  faLightbulb,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import type { Lab } from '../lib/labs';
import { renderInline } from '../lib/inline';

const DIFFICULTY: Record<Lab['difficulty'], string> = {
  intro: 'badge badge-ok',
  core: 'badge badge-accent',
  advanced: 'badge badge-warn',
};

export default function LabCard({ lab }: { lab: Lab }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="card card-pad lab" id={lab.id}>
      <div className="cluster" style={{ justifyContent: 'space-between' }}>
        <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
          <span className={DIFFICULTY[lab.difficulty]}>{lab.difficulty}</span>
          <span className="badge badge-neutral">{lab.series}</span>
        </div>
        <span className="meta">
          <FontAwesomeIcon icon={faClock} className="fa-ico" />
          ~{lab.estMinutes} min
        </span>
      </div>

      <h3 style={{ fontSize: 'var(--step-2)', margin: '0.9rem 0 0.7rem' }}>
        <FontAwesomeIcon
          icon={faFlaskVial}
          className="fa-ico"
          style={{ color: 'var(--accent)', marginRight: '0.5rem' }}
        />
        {lab.title}
      </h3>

      <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
        {lab.scenario}
      </p>

      <div className="lab-split">
        <div>
          <h4 className="lab-head">Tasks</h4>
          <ul className="lab-list">
            {lab.tasks.map((task) => (
              <li key={task}>{renderInline(task)}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="lab-head">Requirements</h4>
          <ul className="lab-list lab-list-check">
            {lab.requirements.map((req) => (
              <li key={req}>
                <FontAwesomeIcon icon={faCircleCheck} className="fa-ico" />
                <span>{renderInline(req)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        aria-expanded={revealed}
        aria-controls={`${lab.id}-solution`}
        onClick={() => setRevealed((v) => !v)}
        style={{ marginTop: '1.25rem' }}
      >
        <FontAwesomeIcon icon={faTerminal} className="fa-ico" />
        {revealed ? 'Hide solution' : 'Reveal solution'}
      </button>

      {/* Collapsed with grid-template-rows so the open/close animates. */}
      <div className="lab-reveal" data-open={revealed} id={`${lab.id}-solution`}>
        <div className="lab-reveal-inner" inert={!revealed}>
          <h4 className="lab-head">Solution</h4>
          <pre className="lab-code">
            <code>{lab.solution}</code>
          </pre>

          <h4 className="lab-head">
            <FontAwesomeIcon icon={faLightbulb} className="fa-ico" />
            Why
          </h4>
          <div className="lab-why">
            {lab.explanation.map((para, i) => (
              <p key={i}>{renderInline(para)}</p>
            ))}
          </div>

          <h4 className="lab-head">Verify</h4>
          <pre className="lab-code lab-code-quiet">
            <code>{lab.verify.join('\n')}</code>
          </pre>
        </div>
      </div>
    </article>
  );
}
