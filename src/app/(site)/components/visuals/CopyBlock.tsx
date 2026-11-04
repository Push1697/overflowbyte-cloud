'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';

/** A shell block with a copy button, used for the verification scripts. */
export default function CopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clearing on unmount avoids setting state on a component the reader has
  // already navigated away from.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // A denied clipboard permission is not worth an error state: the code is
      // on screen and selectable either way.
    }
  };

  return (
    <div className="pane">
      <div className="pane-bar">
        <span className="pane-bar-label">{label}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="fa-ico" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="lab-code">
        <code>{code}</code>
      </pre>
    </div>
  );
}
