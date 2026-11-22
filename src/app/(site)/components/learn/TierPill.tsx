import type { Card } from '../../lib/questions';

const LABEL: Record<Card['difficulty'], string> = { core: 'Core', deep: 'Deep', trap: 'Trap' };

/** Colour-coded difficulty: Core slate, Deep indigo, Trap amber. */
export default function TierPill({ tier, count }: { tier: Card['difficulty']; count?: number }) {
  return (
    <span className={`tier-pill tier-${tier}`}>
      {count !== undefined && <span className="tier-count">{count}</span>}
      {LABEL[tier]}
    </span>
  );
}
