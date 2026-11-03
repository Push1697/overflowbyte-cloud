'use client';

import { useState } from 'react';
import {
  DEFAULT_MODE,
  MODE_BIT_NAMES,
  MODE_PRESETS,
  decodeMode,
} from '../../lib/permissions';

/**
 * The 16 bits of `i_mode`, toggleable. Every readout below is derived from the
 * same value the kernel stores, so the octal, the `ls -l` string and the file
 * type cannot drift from one another.
 */
export default function ModeBits() {
  const [mode, setMode] = useState(DEFAULT_MODE);
  const decoded = decodeMode(mode);

  const toggle = (bit: number) => setMode((m) => m ^ (1 << bit));

  return (
    <div className="bits-wrap">
      <div className="cluster" style={{ ['--cluster-gap' as string]: '0.4rem' }}>
        {MODE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={mode === preset.mode ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setMode(preset.mode)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Bit 15 on the left down to bit 0 on the right, matching how the
          value is written out in hex and octal. */}
      <div className="bits" role="group" aria-label="i_mode bits, most significant first">
        {MODE_BIT_NAMES.map((name, n) => {
          const bit = 15 - n;
          const on = Boolean((mode >> bit) & 1);

          return (
            <button
              key={name}
              type="button"
              className={on ? 'bit is-on' : 'bit'}
              aria-pressed={on}
              onClick={() => toggle(bit)}
            >
              <span className="bit-name">{name}</span>
              <span className="bit-val">{on ? 1 : 0}</span>
            </button>
          );
        })}
      </div>

      <dl className="stat-row" aria-live="polite">
        <div className="stat">
          <dt>Octal mode</dt>
          <dd className="mono">{decoded.octal}</dd>
        </div>
        <div className="stat">
          <dt>ls -l string</dt>
          <dd className="mono" style={{ color: 'var(--info)' }}>
            {decoded.ls}
          </dd>
        </div>
        <div className="stat">
          <dt>File type</dt>
          <dd style={{ fontSize: 'var(--step-0)' }}>{decoded.type}</dd>
        </div>
        <div className="stat">
          <dt>Special flags</dt>
          <dd style={{ fontSize: 'var(--step-0)' }}>{decoded.specials}</dd>
        </div>
      </dl>
    </div>
  );
}
