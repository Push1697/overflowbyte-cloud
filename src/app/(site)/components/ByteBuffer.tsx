'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

/** `char buf[8]` — small enough that you overrun it by accident. */
const CAPACITY = 8;

const encoder = new TextEncoder();

/**
 * The proof bench: a fixed-width buffer you can overrun by typing.
 *
 * It encodes as real UTF-8 rather than counting characters, so a two-byte
 * accent or a four-byte emoji costs what it actually costs. That is the whole
 * lesson — `strlen` is not `sizeof`, and the gap is where the bug lives.
 */
export default function ByteBuffer() {
  const [value, setValue] = useState('OVERFLOW');

  const bytes = useMemo(() => encoder.encode(value), [value]);
  const overflowed = bytes.length > CAPACITY;
  const cells = Math.max(CAPACITY, bytes.length);

  return (
    <div className="bench">
      <label className="bench-label" htmlFor="bench-input">
        <span className="mono">char buf[{CAPACITY}];</span> — write into it
      </label>

      <input
        id="bench-input"
        className="bench-input"
        type="text"
        value={value}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => setValue(e.target.value)}
        aria-describedby="bench-readout"
      />

      <div className="buf" aria-hidden="true">
        {Array.from({ length: cells }, (_, i) => {
          const byte = bytes[i];
          const written = byte !== undefined;
          const past = i >= CAPACITY;

          return (
            <div
              key={i}
              className={`buf-cell${past && written ? ' is-over' : written ? ' is-filled' : ''}`}
            >
              <span className="buf-byte">
                {written ? byte.toString(16).padStart(2, '0').toUpperCase() : '00'}
              </span>
              {/* Only printable ASCII gets a glyph; everything else is a dot,
                  exactly as hexdump prints it. */}
              <span className="buf-char">
                {written && byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : '.'}
              </span>
            </div>
          );
        })}
      </div>

      <p className="bench-readout" id="bench-readout" aria-live="polite">
        <span>
          WRITTEN <b>{bytes.length}</b>
        </span>
        <span>
          CAPACITY <b>{CAPACITY}</b>
        </span>
        <span>
          OVERRUN <b>{Math.max(0, bytes.length - CAPACITY)}</b>
        </span>
        <span>
          STATUS{' '}
          <b style={{ color: overflowed ? 'var(--crit)' : 'var(--ok)' }}>
            {overflowed ? 'SIGSEGV' : 'OK'}
          </b>
        </span>
      </p>

      {overflowed && (
        <div className="bench-panic" role="status">
          <strong>
            <FontAwesomeIcon icon={faTriangleExclamation} className="fa-ico" />
            Stack smashing detected
          </strong>
          <p>
            You just wrote {bytes.length - CAPACITY} byte
            {bytes.length - CAPACITY === 1 ? '' : 's'} past the end of an {CAPACITY}-byte buffer.
            In C nothing stops you — the bytes land on whatever sat next on the stack, which is
            how a saved return address becomes an attacker&apos;s jump target.
          </p>
          <Link className="action-link" href="/blog">
            How the kernel and the compiler try to stop this
            <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
          </Link>
        </div>
      )}
    </div>
  );
}
