import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PracticeSession from '../../components/learn/PracticeSession';
import { DECKS, getDeck } from '../../lib/questions';
import { companionFor } from '../../lib/learn-links';

// Every deck is known at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return DECKS.map((deck) => ({ deck: deck.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deck: string }>;
}): Promise<Metadata> {
  const deck = getDeck((await params).deck);
  if (!deck) return { title: 'Deck not found' };
  return {
    title: `${deck.title} — practice flashcards | OverflowByte`,
    description: deck.summary,
    alternates: { canonical: `/learn/${deck.slug}` },
  };
}

export default async function PracticePage({ params }: { params: Promise<{ deck: string }> }) {
  const deck = getDeck((await params).deck);
  if (!deck) notFound();

  return (
    <div className="shell section practice-page">
      <Link className="action-link" href="/learn" style={{ color: 'var(--text-muted)' }}>
        <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
        All decks
      </Link>

      <header style={{ margin: '1.5rem 0 1.75rem' }}>
        <span className="badge badge-neutral">{deck.series}</span>
        <h1 style={{ fontSize: 'var(--step-4)', margin: '0.75rem 0 0.5rem' }}>{deck.title}</h1>
        <p className="text-muted" style={{ maxWidth: '62ch' }}>
          {deck.summary}
        </p>
        <p className="practice-shortcuts text-muted">
          <kbd>Space</kbd> flip · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>1</kbd> missed it ·{' '}
          <kbd>2</kbd> got it
        </p>
      </header>

      <PracticeSession
        slug={deck.slug}
        title={deck.title}
        cards={deck.cards}
        companion={companionFor(deck.slug)}
      />
    </div>
  );
}
