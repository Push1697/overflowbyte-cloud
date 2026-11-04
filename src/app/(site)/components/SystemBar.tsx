/**
 * The console status strip.
 *
 * Every field is a build-time fact. There is deliberately no fake latency or
 * ping counter here — inventing live telemetry on a static page is the kind of
 * decoration this site is supposed to argue against.
 */
export default function SystemBar({ items }: { items?: { label: string; value: string }[] }) {
  const fields = items ?? [{ label: 'host', value: 'overflowbyte.cloud' }];

  return (
    <div className="statusbar">
      <span className="statusbar-item is-ok">
        <span className="live-dot" aria-hidden="true" />
        sys <b>ok</b>
      </span>
      {fields.map((f) => (
        <span key={f.label} className="statusbar-item">
          {f.label} <b>{f.value}</b>
        </span>
      ))}
    </div>
  );
}
