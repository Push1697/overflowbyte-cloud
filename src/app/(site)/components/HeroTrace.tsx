import type { ReactNode } from 'react';

/* The hero visual: a kernel permission check resolving to EACCES.
   It is the thesis of Flagship #1 shown rather than described, and it
   borrows the status-strip / ops-console language from the portfolio.
   Pure CSS -- each line is revealed by an animation-delay, so there is no
   client JavaScript and the text is fully present for crawlers. */

const LINES: ReactNode[] = [
  <>
    <span className="trace-dim">$</span> sudo -u alice cat /data/audit.log
  </>,
  <>{' '}</>,
  <>
    <span className="trace-key">task_struct</span>
    <span className="trace-dim"> pid=1042 comm=bash</span>
  </>,
  <>
    <span className="trace-dim">└─ </span>
    <span className="trace-key">struct cred</span>
    <span className="trace-dim"> fsuid=1001 fsgid=1001</span>
  </>,
  <>
    <span className="trace-dim">   └─ groups=[1001] </span>
    <span className="trace-warn">← stale since login</span>
  </>,
  <>
    <span className="trace-key">inode</span>
    <span className="trace-dim"> i_mode=0640 uid=0 gid=1050</span>
  </>,
  <>{' '}</>,
  <>
    <span className="trace-key">generic_permission()</span>
  </>,
  <>
    <span className="trace-dim">  owner?  1001 ≠ 0 </span>
    <span className="trace-bad">✗</span>
  </>,
  <>
    <span className="trace-dim">  group?  1050 ∉ groups </span>
    <span className="trace-bad">✗</span>
  </>,
  <>
    <span className="trace-dim">  other?  --- </span>
    <span className="trace-bad">✗</span>
  </>,
  <>{' '}</>,
  <>
    <span className="trace-verdict">EACCES  Permission denied</span>
  </>,
];

export default function HeroTrace() {
  return (
    <div className="trace" role="img" aria-label="A kernel permission check resolving to EACCES: a stale supplementary group list in struct cred causes generic_permission to deny the open.">
      <div className="trace-bar">
        <div className="trace-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span className="trace-title">dac-trace — flagship #1</span>
      </div>

      <pre className="trace-body" aria-hidden="true">
        {LINES.map((line, i) => (
          <span
            key={i}
            className="trace-line"
            style={{ ['--i' as string]: i }}
          >
            {line}
          </span>
        ))}
      </pre>

      <div className="trace-strip" aria-hidden="true">
        <span>
          <span className="live-dot" />
          trace: live
        </span>
        <span>vfs: inode cache</span>
        <span>modules: 8</span>
      </div>
    </div>
  );
}
