import type { Visual } from '../../lib/visuals';
import { renderInline } from '../../lib/inline';
import Timeline from './Timeline';
import Cascade from './Cascade';

/**
 * Renders any Visual. This is the only place that decides how a diagram looks,
 * so content can be written — or generated — as plain data and still arrive
 * looking like the rest of the site.
 *
 * Static kinds render on the server; only the two interactive ones ship JS.
 */
export default function VisualBlock({ viz }: { viz: Visual }) {
  return (
    <figure className="viz-block" id={viz.id}>
      <figcaption className="viz-block-head">
        <strong>{renderInline(viz.title)}</strong>
        {viz.caption && <span>{renderInline(viz.caption)}</span>}
      </figcaption>

      {viz.kind === 'timeline' && <Timeline steps={viz.steps} title={viz.title} />}

      {viz.kind === 'cascade' && <Cascade checks={viz.checks} subjects={viz.subjects} />}

      {viz.kind === 'stages' && (
        <div className="lookup">
          {viz.stages.map((stage, i) => (
            <div key={stage.title}>
              {stage.arrow && (
                <p className="lookup-arrow" aria-hidden="true">
                  ↓ {stage.arrow}
                </p>
              )}
              <div className={`lookup-stage is-${stage.tone}`}>
                <strong>
                  <span className="mono">{i + 1}.</span> {renderInline(stage.title)}
                </strong>
                <p>{renderInline(stage.body)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {viz.kind === 'compare' && (
        <div className="grid grid-2">
          {viz.columns.map((col) => (
            <div key={col.title} className={col.ok ? 'comp is-ok' : 'comp'}>
              <strong>{renderInline(col.title)}</strong>
              {col.subtitle && <p className="comp-sub">{renderInline(col.subtitle)}</p>}
              <pre className="lab-code lab-code-quiet">
                <code>
                  {col.lines.map((line) => {
                    const at = col.mark ? line.indexOf(col.mark) : -1;
                    // Highlight only the token that differs between columns.
                    if (!col.mark || at === -1) return `${line}\n`;
                    return (
                      <span key={line}>
                        {line.slice(0, at)}
                        <span className={`comp-mark is-${col.markTone ?? 'ok'}`}>{col.mark}</span>
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
      )}

      {viz.kind === 'matrix' && (
        <div className="table-scroll">
          <table className="cred-table">
            <thead>
              <tr>
                {viz.headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viz.rows.map((row) => (
                <tr key={row.cells.join('|')} className={row.emphasis ? 'is-emphasis' : undefined}>
                  {row.cells.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row">
                        {renderInline(cell)}
                      </th>
                    ) : (
                      <td key={i}>{renderInline(cell)}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
