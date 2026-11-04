import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faGraduationCap,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import Timeline from '../../components/visuals/Timeline';
import NewgrpPlayer from '../../components/visuals/NewgrpPlayer';
import ModeBits from '../../components/visuals/ModeBits';
import Cascade from '../../components/visuals/Cascade';
import CopyBlock from '../../components/visuals/CopyBlock';
import {
  CRED_FIELDS,
  DAC_ACTORS,
  DAC_STAGES,
  LOOKUP_STAGES,
  SGID_COMPARISON,
  STALE_GROUP_TIMELINE,
  VERIFY_SCRIPT,
} from '../../lib/permissions';
import { renderInline } from '../../lib/inline';

export const metadata: Metadata = {
  title: 'Linux permissions, visually — OverflowByte',
  description:
    'An interactive lab on kernel process credentials, the newgrp syscall sequence, in-memory inodes, the 16 bits of i_mode and discretionary access control.',
};

/** Numbered section shell, so every block carries its place in the sequence. */
function Viz({
  n,
  title,
  lede,
  children,
}: {
  n: number;
  title: React.ReactNode;
  lede: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="viz reveal">
      <div className="viz-head">
        <span className="viz-n" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
        <div>
          <h2>{title}</h2>
          <p className="viz-lede">{lede}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Callout({ tone, children }: { tone: 'key' | 'warn'; children: React.ReactNode }) {
  return <p className={`callout is-${tone}`}>{children}</p>;
}

export default function LinuxPermissionsLab() {
  return (
    <div className="shell section" style={{ maxWidth: '1000px' }}>
      <Link className="action-link" href="/blog" style={{ color: 'var(--text-muted)' }}>
        <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
        Back to the series
      </Link>

      <header style={{ marginTop: '1.75rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <FontAwesomeIcon icon={faTerminal} className="fa-ico" />
          Interactive lab · kernel internals
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          Linux permissions, visually
        </h1>
        <p className="lede">
          Eight passes over the same question: which identity does the kernel actually compare
          against an inode? Step the <code>newgrp</code> syscall sequence, toggle the 16 bits of{' '}
          <code>i_mode</code>, and run the DAC cascade yourself.
        </p>
      </header>

      <Viz
        n={1}
        title={
          <>
            The stale groups dilemma — why <code>usermod -aG</code> fails open shells
          </>
        }
        lede="When an admin adds you to a group, your open terminal does not inherit it. Step through the lifecycle."
      >
        <Timeline
          title="Lifecycle of a stale group membership"
          steps={STALE_GROUP_TIMELINE}
        />
        <Callout tone="key">
          {renderInline(
            'Linux processes never poll `/etc/group`. Credentials are an immutable, reference-counted in-kernel object.',
          )}
        </Callout>
      </Viz>

      <Viz
        n={2}
        title={
          <>
            Kernel structure: <code>task_struct</code> → <code>struct cred</code>
          </>
        }
        lede="Every thread has a task_struct pointing at its struct cred. Four distinct ID pairs live there, and only one of them decides file access."
      >
        <div className="table-scroll">
          <table className="cred-table">
            <thead>
              <tr>
                <th>Credential field</th>
                <th>Name</th>
                <th>Kernel role</th>
              </tr>
            </thead>
            <tbody>
              {CRED_FIELDS.map((row) => (
                <tr key={row.field} className={row.emphasis ? 'is-emphasis' : undefined}>
                  <th scope="row">
                    <code>{row.field}</code>
                  </th>
                  <td>{row.name}</td>
                  <td>{renderInline(row.role)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="warn">
          {renderInline(
            'NFS servers and other userspace file servers are why `fsuid` exists: they can impersonate a user for file access without also inheriting that user’s signal permissions.',
          )}
        </Callout>
      </Viz>

      <Viz
        n={3}
        title={
          <>
            Interactive <code>newgrp</code> syscall player
          </>
        }
        lede="Six steps, from fork() to the refreshed shell. Watch which credential fields change at each one."
      >
        <NewgrpPlayer />
        <Callout tone="warn">
          {renderInline(
            '`newgrp` is setuid-root. Its privileged `setgid()` call changes all four GID fields — real, effective, saved and filesystem — not just the effective one.',
          )}
        </Callout>
      </Viz>

      <Viz
        n={4}
        title="Inodes & dentry path resolution"
        lede="Opening /var/log/app.log walks three layers of cache before any disk block is touched."
      >
        <div className="lookup">
          {LOOKUP_STAGES.map((stage, i) => (
            <div key={stage.title}>
              {stage.arrow && (
                <p className="lookup-arrow" aria-hidden="true">
                  ↓ {stage.arrow}
                </p>
              )}
              <div className={`lookup-stage is-${stage.tone}`}>
                <strong>
                  <span className="mono">{i + 1}.</span> {stage.title}
                </strong>
                <p>{renderInline(stage.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </Viz>

      <Viz
        n={5}
        title={
          <>
            Interactive <code>i_mode</code> 16-bit grid
          </>
        }
        lede="Toggle any bit, or load a preset, and watch the octal mode, the ls -l string and the file type stay in sync."
      >
        <ModeBits />
        <Callout tone="key">
          {renderInline(
            'The execute column carries two meanings at once. A set-id or sticky bit replaces `x` with `s` or `t`, and uppercases it when the execute bit underneath is clear — which is how `ls` shows you a set-id bit that can never actually fire.',
          )}
        </Callout>
      </Viz>

      <Viz
        n={6}
        title={
          <>
            Interactive DAC flowchart (<code>generic_permission</code>)
          </>
        }
        lede="Four actors attempt a write to a file owned by alice:developers, mode 0640 (-rw-r-----)."
      >
        <Cascade checks={DAC_STAGES} subjects={DAC_ACTORS} />
        <Callout tone="warn">
          {renderInline(
            'Root’s override comes **last**. The kernel first checks whether the permission bits naturally permit access; only on refusal does it test for `CAP_DAC_OVERRIDE`.',
          )}
        </Callout>
      </Viz>

      <Viz
        n={7}
        title="SGID directory demo"
        lede="What changes about file creation when the setgid bit is applied to a directory."
      >
        <div className="grid grid-2">
          {SGID_COMPARISON.map((col) => (
            <div key={col.title} className={col.ok ? 'comp is-ok' : 'comp'}>
              <strong>{renderInline(col.title)}</strong>
              <p className="comp-sub">{renderInline(col.subtitle)}</p>
              <pre className="lab-code lab-code-quiet">
                <code>
                  {col.lines.map((line) => {
                    const at = line.indexOf(col.mark);
                    // Highlight just the group column, which is the only
                    // thing that differs between the two runs.
                    if (!line.startsWith('-rw') || at === -1) return `${line}\n`;
                    return (
                      <span key={line}>
                        {line.slice(0, at)}
                        <span className={`comp-mark is-${col.markTone}`}>{col.mark}</span>
                        {line.slice(at + col.mark.length)}
                        {'\n'}
                      </span>
                    );
                  })}
                </code>
              </pre>
              <p className="comp-out">{renderInline(col.outcome)}</p>
            </div>
          ))}
        </div>
      </Viz>

      <Viz
        n={8}
        title="Try it yourself"
        lede="Run these in any Linux shell to read your own live credentials and inode metadata."
      >
        <CopyBlock label="verify-permissions.sh" code={VERIFY_SCRIPT} />
      </Viz>

      <aside className="card card-pad card-feature spotlight reveal" style={{ marginTop: '3rem' }}>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'var(--step-2)', marginBottom: '0.4rem' }}>
              Now test whether it stuck
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
              The same material as flashcards, plus hands-on labs with verification steps.
            </p>
          </div>
          <div className="cluster">
            <Link className="btn btn-primary" href="/learn#linux-permissions">
              <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
              Flashcards & labs
            </Link>
            <Link className="btn btn-secondary" href="/blog/01-how-linux-decides-who-can-open-a-file">
              Read the article
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
