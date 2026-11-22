'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faTerminal } from '@fortawesome/free-solid-svg-icons';
import Mermaid from './Mermaid';

interface TerminalCodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

export default function TerminalCodeBlock({ className, children }: TerminalCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const codeString = String(children ?? '').replace(/\n$/, '');

  // Handle Mermaid diagrams
  if (/language-mermaid/.test(className ?? '')) {
    return <Mermaid chart={codeString} />;
  }

  // Extract language from className (e.g. "language-bash" -> "bash")
  const langMatch = className?.match(/language-([a-zA-Z0-9_-]+)/);
  const lang = langMatch ? langMatch[1] : '';

  // Single-line inline code vs multi-line block
  const isMultiLine = codeString.includes('\n') || codeString.length > 55;

  if (!isMultiLine && !className) {
    return <code className="inline-code">{children}</code>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="terminal-card">
      <div className="terminal-card-bar">
        <div className="terminal-card-dots">
          <span className="terminal-dot terminal-dot-r" aria-hidden="true" />
          <span className="terminal-dot terminal-dot-y" aria-hidden="true" />
          <span className="terminal-dot terminal-dot-g" aria-hidden="true" />
          {lang ? (
            <span className="terminal-card-lang">{lang}</span>
          ) : (
            <span className="terminal-card-lang">
              <FontAwesomeIcon icon={faTerminal} style={{ marginRight: '4px', opacity: 0.6 }} />
              console
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm terminal-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="fa-ico" />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="terminal-card-pre">
        <code className={className}>{codeString}</code>
      </pre>
    </div>
  );
}
