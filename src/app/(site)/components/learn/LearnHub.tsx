'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faFlaskVial,
  faLayerGroup,
  faListUl,
  faMagnifyingGlass,
  faPlay,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import type { Card, Deck } from '../../lib/questions';
import type { DeckLink } from '../../lib/learn-links';
import { deckStats, useProgress } from '../../lib/learn-progress';
import { renderInline } from '../../lib/inline';
import TierPill from './TierPill';

type Tab = 'decks' | 'labs' | 'all';
type Tier = Card['difficulty'] | 'any';
type HubDeck = Deck & { companion: DeckLink | null };

const TIERS: Card['difficulty'][] = ['core', 'deep', 'trap'];

/** Ring showing how many cards of a deck were graded "got it". */
function MasteryRing({ got, total }: { got: number; total: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const share = total ? got / total : 0;
  return (
    <span className="mastery" title={`${got} of ${total} mastered`}>
      <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
        <circle cx="18" cy="18" r={r} className="mastery-track" />
        <circle
          cx="18"
          cy="18"
          r={r}
          className="mastery-fill"
          strokeDasharray={`${share * c} ${c}`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span className="mastery-text">
        <strong>{got}</strong>/{total} mastered
      </span>
    </span>
  );
}

export default function LearnHub({
  decks,
  labCount,
  labsPanel,
}: {
  decks: HubDeck[];
  labCount: number;
  /** Server-rendered lab cards, shown under the Labs tab. */
  labsPanel: ReactNode;
}) {
  const progress = useProgress();
  const [tab, setTab] = useState<Tab>('decks');
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<Tier>('any');
  const [deckFilter, setDeckFilter] = useState('all');
  const [highlight, setHighlight] = useState<string | null>(null);

  const totalCards = decks.reduce((n, d) => n + d.cards.length, 0);

  // Old links (/learn#labs, /learn#<deck>) and shared tab URLs keep working.
  useEffect(() => {
    const apply = () => {
      const hash = decodeURIComponent(location.hash.slice(1));
      if (hash === 'labs' || hash === 'all' || hash === 'decks') setTab(hash);
      else if (decks.some((d) => d.slug === hash)) {
        setTab('decks');
        setHighlight(hash);
        requestAnimationFrame(() =>
          document.getElementById(`deck-${hash}`)?.scrollIntoView({ block: 'center' }),
        );
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [decks]);

  const selectTab = (next: Tab) => {
    setTab(next);
    history.replaceState(null, '', next === 'decks' ? location.pathname : `#${next}`);
  };

  const browseDeck = (slug: string) => {
    setDeckFilter(slug);
    setTier('any');
    setQuery('');
    selectTab('all');
  };

  const last = progress.last ? decks.find((d) => d.slug === progress.last!.deck) : undefined;
  const lastStats = last ? deckStats(progress, last.slug, last.cards.map((c) => c.id)) : null;
  const showContinue = last && lastStats && lastStats.seen < lastStats.total;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return decks
      .filter((deck) => deckFilter === 'all' || deck.slug === deckFilter)
      .flatMap((deck) =>
      deck.cards
        .filter((card) => tier === 'any' || card.difficulty === tier)
        .filter(
          (card) =>
            !q ||
            [card.question, card.scenario, card.topic, card.tag, ...card.answer]
              .join(' ')
              .toLowerCase()
              .includes(q),
        )
        .map((card) => ({ card, deck })),
    );
  }, [decks, query, tier, deckFilter]);

  const tabs: { id: Tab; label: string; count: number; icon: typeof faLayerGroup }[] = [
    { id: 'decks', label: 'Decks', count: decks.length, icon: faLayerGroup },
    { id: 'labs', label: 'Hands-on labs', count: labCount, icon: faFlaskVial },
    { id: 'all', label: 'All scenarios', count: totalCards, icon: faListUl },
  ];

  return (
    <div className="learn-hub">
      {showContinue && (
        <div className="continue-banner" role="status">
          <div>
            <span className="mono">Continue where you left off</span>
            <p>
              <strong>{last.title}</strong> · {lastStats.seen} of {lastStats.total} cards graded
            </p>
          </div>
          <Link className="btn btn-primary btn-sm" href={`/learn/${last.slug}`}>
            <FontAwesomeIcon icon={faPlay} className="fa-ico" />
            Resume
          </Link>
        </div>
      )}

      <div className="segmented" role="tablist" aria-label="Learning views">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className="segmented-item"
            onClick={() => selectTab(t.id)}
          >
            <FontAwesomeIcon icon={t.icon} className="fa-ico" />
            {t.label}
            <span className="segmented-count">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'decks' && (
        <div role="tabpanel" id="panel-decks" aria-labelledby="tab-decks" className="deck-hub-grid">
          {decks.map((deck) => {
            const stats = deckStats(progress, deck.slug, deck.cards.map((c) => c.id));
            const mix = TIERS.map((t) => [t, deck.cards.filter((c) => c.difficulty === t).length] as const);
            return (
              <article
                key={deck.slug}
                id={`deck-${deck.slug}`}
                className={`card card-pad deck-hub-card${highlight === deck.slug ? ' is-highlight' : ''}`}
              >
                <div className="cluster" style={{ justifyContent: 'space-between' }}>
                  <span className="badge badge-neutral">{deck.series}</span>
                  <span className="mono deck-hub-count">{deck.cards.length} cards</span>
                </div>
                <h2 className="deck-hub-title">{deck.title}</h2>
                <p className="deck-hub-summary">{deck.summary}</p>
                <div className="cluster" style={{ ['--cluster-gap' as string]: '0.35rem' }}>
                  {mix.map(([t, n]) => n > 0 && <TierPill key={t} tier={t} count={n} />)}
                </div>
                <div className="deck-hub-foot">
                  <MasteryRing got={stats.got} total={stats.total} />
                  <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => browseDeck(deck.slug)}>
                      View list
                    </button>
                    <Link className="btn btn-primary btn-sm" href={`/learn/${deck.slug}`}>
                      {stats.seen > 0 ? (
                        <FontAwesomeIcon icon={faRotateRight} className="fa-ico" />
                      ) : (
                        <FontAwesomeIcon icon={faPlay} className="fa-ico" />
                      )}
                      {stats.seen > 0 ? 'Keep practising' : 'Practice deck'}
                    </Link>
                  </div>
                </div>
                {deck.companion && (
                  <Link className="action-link deck-hub-pair" href={deck.companion.href}>
                    Pair with the {deck.companion.label}
                    <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}

      {tab === 'labs' && (
        <div role="tabpanel" id="panel-labs" aria-labelledby="tab-labs">
          {labsPanel}
        </div>
      )}

      {tab === 'all' && (
        <div role="tabpanel" id="panel-all" aria-labelledby="tab-all">
          <div className="scenario-filters">
            <label className="search-field">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="fa-ico" aria-hidden="true" />
              <span className="sr-only">Search scenarios</span>
              <input
                type="search"
                placeholder="Search: fsuid, 53003, SGID, vault-id…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="cluster" role="group" aria-label="Filter by difficulty" style={{ ['--cluster-gap' as string]: '0.4rem' }}>
              {(['any', ...TIERS] as Tier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`filter-pill${t !== 'any' ? ` tier-${t}` : ''}`}
                  aria-pressed={tier === t}
                  onClick={() => setTier(t)}
                >
                  {t === 'any' ? 'All' : t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <label className="select-field">
              <span className="sr-only">Deck</span>
              <select value={deckFilter} onChange={(e) => setDeckFilter(e.target.value)}>
                <option value="all">All decks</option>
                {decks.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-muted scenario-count" aria-live="polite">
            Showing {results.length} of {totalCards} scenarios
          </p>

          <ul className="scenario-list">
            {results.map(({ card, deck }) => (
              <li key={`${deck.slug}:${card.id}`}>
                <details className="scenario-row">
                  <summary>
                    <span className="scenario-meta">
                      <TierPill tier={card.difficulty} />
                      <span className="mono">{card.tag}</span>
                      <span className="scenario-deck">{deck.title}</span>
                    </span>
                    <span className="scenario-q">{renderInline(card.question)}</span>
                  </summary>
                  <div className="scenario-body learn-rich">
                    <p className="scenario-setup">{renderInline(card.scenario)}</p>
                    {card.answer.map((para, i) => (
                      <p key={i}>{renderInline(para)}</p>
                    ))}
                    <Link className="action-link" href={`/learn/${deck.slug}`}>
                      Practice this deck
                      <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
                    </Link>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <p className="text-muted">No scenarios match. Try a shorter search or the “All” filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
