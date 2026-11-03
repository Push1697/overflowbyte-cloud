/**
 * The wordmark as the kernel would show it: offset, bytes, ASCII.
 *
 * The hex is computed from the strings rather than typed out, so the bytes
 * cannot drift from the letters beside them — the point of the thing is that
 * it is a real dump, not a picture of one.
 */
const LINES = ['OVERFLOW', 'BYTE.CLOUD'];

const WIDTH = 8;

function rows() {
  const encoder = new TextEncoder();
  const out: { addr: string; bytes: string; ascii: string }[] = [];
  let offset = 0;

  for (const line of LINES) {
    const bytes = Array.from(encoder.encode(line));

    for (let i = 0; i < bytes.length; i += WIDTH) {
      const chunk = bytes.slice(i, i + WIDTH);

      out.push({
        addr: `0x${offset.toString(16).padStart(4, '0')}`,
        // Pad short chunks so the ASCII column stays aligned down the block.
        bytes: chunk
          .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
          .concat(Array(WIDTH - chunk.length).fill('  '))
          .join(' '),
        ascii: String.fromCharCode(...chunk),
      });

      offset += chunk.length;
    }
  }

  return out;
}

export default function HexWordmark() {
  return (
    <div className="hexdump" role="img" aria-label="OVERFLOWBYTE.CLOUD as a hex dump">
      {rows().map((row) => (
        <div key={row.addr} className="hex-row">
          <span className="hex-addr">{row.addr}</span>
          <span className="hex-bytes">{row.bytes}</span>
          <span className="hex-ascii">{row.ascii}</span>
        </div>
      ))}
    </div>
  );
}
