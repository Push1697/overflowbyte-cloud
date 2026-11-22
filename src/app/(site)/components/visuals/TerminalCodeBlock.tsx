'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faTerminal } from '@fortawesome/free-solid-svg-icons';
import Mermaid from './Mermaid';

type CodeProps = { className?: string; children?: React.ReactNode };

/**
 * Renders a fenced code block as a terminal window. Wired up as the markdown
 * `pre` renderer, so it only ever sees block code; inline `code` keeps the
 * default element and never ends up as a <div> inside a <p>.
 */
export default function TerminalCodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const code = React.Children.toArray(children).find(React.isValidElement) as
    | React.ReactElement<CodeProps>
    | undefined;
  const className = code?.props.className ?? '';
  const codeString = String(code?.props.children ?? '').replace(/\n$/, '');

  if (/language-mermaid/.test(className)) {
    return <Mermaid chart={codeString} />;
  }

  const lang = className.match(/language-([a-zA-Z0-9_-]+)/)?.[1] ?? '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied (insecure context or permissions); nothing to do.
    }
  };

  return (
    <div className="terminal-card">
      <div className="terminal-card-bar">
        <div className="terminal-card-dots">
          <span className="terminal-dot terminal-dot-r" aria-hidden="true" />
          <span className="terminal-dot terminal-dot-y" aria-hidden="true" />
          <span className="terminal-dot terminal-dot-g" aria-hidden="true" />
          <span className="terminal-card-lang">
            {lang || (
              <>
                <FontAwesomeIcon icon={faTerminal} style={{ marginRight: '4px', opacity: 0.6 }} />
                console
              </>
            )}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm terminal-copy-btn"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code to clipboard'}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="fa-ico" />
          <span aria-live="polite">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="terminal-card-pre">
        <code className={className || undefined}>{codeString}</code>
      </pre>
    </div>
  );
}
