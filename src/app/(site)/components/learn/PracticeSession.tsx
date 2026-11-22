'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faRotate,
  faRotateRight,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import type { Card } from '../../lib/questions';
import type { DeckLink } from '../../lib/learn-links';
import {
  deckStats,
  gradeCard,
  rememberPosition,
  resetDeck,
  useProgress,
  type Grade,
} from '../../lib/learn-progress';
import { renderInline } from '../../lib/inline';
import TierPill from './TierPill';

type Mode = 'all' | 'missed' | 'trap';

/** Keys belong to the session unless the reader is typing or on a control. */
function ownsKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return true;
  if (t.closest('input, textarea, select, [contenteditable="true"]')) return false;
  return !(e.key === ' ' || e.key === 'Enter') || !t.closest('a, button:not(.practice-card)');
}

export default function PracticeSession({
  slug,
  title,
  cards,
  companion,
}: {
  slug: string;
  title: string;
  cards: Card[];
  companion: DeckLink | null;
}) {
  const progress = useProgress();
  const [mode, setMode] = useState<Mode>('all');
  // null until the reader moves; until then we resume where they last stopped.
  const [pos, setPos] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const deckGrades = progress.grades[slug];
  const grades = useMemo(() => deckGrades ?? {}, [deckGrades]);
  // The order is fixed when a round starts, so grading a card mid-round
  // (which changes the "missed" set) does not reshuffle what is left.
  const [roundIds, setRoundIds] = useState<string[]>(() => cards.map((c) => c.id));
  const round = useMemo(
    () => roundIds.map((id) => cards.find((c) => c.id === id)!).filter(Boolean),
    [roundIds, cards],
  );
  const resumeAt =
    progress.last?.deck === slug && progress.last.index < cards.length ? progress.last.index : 0;
  const index = pos ?? (mode === 'all' ? resumeAt : 0);
  const card = round[index];
  const stats = deckStats(progress, slug, cards.map((c) => c.id));

  const startRound = useCallback(
    (next: Mode) => {
      const ids = cards
        .filter((c) =>
          next === 'missed' ? grades[c.id] === 'missed' : next === 'trap' ? c.difficulty === 'trap' : true,
        )
        .map((c) => c.id);
      setMode(next);
      setRoundIds(ids.length ? ids : cards.map((c) => c.id));
      setPos(0);
      setFlipped(false);
      setDone(false);
      cardRef.current?.focus();
    },
    [cards, grades],
  );

  const go = useCallback(
    (step: number) => {
      const next = index + step;
      if (next < 0) return;
      if (next >= round.length) {
        setDone(true);
        return;
      }
      setPos(next);
      setFlipped(false);
      if (mode === 'all') rememberPosition(slug, next);
    },
    [index, round.length, mode, slug],
  );

  const grade = useCallback(
    (g: Grade) => {
      if (!card) return;
      gradeCard(slug, card.id, g);
      go(1);
    },
    [card, slug, go],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || !ownsKey(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === ' ' || e.key === 'Enter') {
        // A focused card button flips itself through its own click handler.
        if ((e.target as HTMLElement)?.closest('.practice-card')) return;
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (flipped && (e.key === '1' || e.key.toLowerCase() === 'm')) {
        grade('missed');
      } else if (flipped && (e.key === '2' || e.key.toLowerCase() === 'g')) {
        grade('got');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, flipped, go, grade]);

  const missedCount = cards.filter((c) => grades[c.id] === 'missed').length;
  const trapCount = cards.filter((c) => c.difficulty === 'trap').length;

  if (done) {
    const roundGot = round.filter((c) => grades[c.id] === 'got').length;
    return (
      <div className="practice-shell">
        <div className="card card-pad practice-done">
          <p className="eyebrow">Round complete</p>
          <h2 style={{ fontSize: 'var(--step-3)', margin: '0.5rem 0 1rem' }}>
            {roundGot} of {round.length} got it
          </h2>
          <p className="text-muted">
            Across the whole deck: {stats.got} mastered, {stats.missed} to revisit, {stats.total - stats.seen} not yet graded.
          </p>
          <div className="cluster" style={{ marginTop: '1.5rem' }}>
            {missedCount > 0 && (
              <button type="button" className="btn btn-primary" onClick={() => startRound('missed')}>
                <FontAwesomeIcon icon={faRotateRight} className="fa-ico" />
                Practise the {missedCount} I missed
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => startRound('all')}>
              Run the whole deck again
            </button>
            <Link className="btn btn-ghost" href="/learn">
              Back to decks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="practice-shell">
      <div className="practice-top">
        <div className="cluster" role="group" aria-label="Which cards to practise" style={{ ['--cluster-gap' as string]: '0.4rem' }}>
          <button type="button" className="filter-pill" aria-pressed={mode === 'all'} onClick={() => startRound('all')}>
            All {cards.length}
          </button>
          {trapCount > 0 && (
            <button type="button" className="filter-pill tier-trap" aria-pressed={mode === 'trap'} onClick={() => startRound('trap')}>
              Traps only {trapCount}
            </button>
          )}
          {missedCount > 0 && (
            <button type="button" className="filter-pill" aria-pressed={mode === 'missed'} onClick={() => startRound('missed')}>
              Missed {missedCount}
            </button>
          )}
        </div>
        <span className="mono" aria-live="polite">
          {index + 1} / {round.length}
        </span>
      </div>
      <div
        className="practice-progress"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={round.length}
        aria-valuenow={index + 1}
      >
        <span style={{ width: `${((index + 1) / round.length) * 100}%` }} />
      </div>

      <button
        ref={cardRef}
        type="button"
        className="practice-card card learn-rich"
        data-flipped={flipped}
        aria-label={flipped ? 'Showing the answer. Press to show the question.' : 'Showing the question. Press to reveal the answer.'}
        onClick={() => setFlipped((f) => !f)}
      >
        <span className="practice-face" key={`${card.id}-${flipped}`}>
          <span className="cluster practice-meta">
            <TierPill tier={card.difficulty} />
            <span className="mono">{card.tag}</span>
            <span className="badge badge-neutral">{card.topic}</span>
            {grades[card.id] && (
              <span className={`practice-graded is-${grades[card.id]}`}>
                {grades[card.id] === 'got' ? 'Got it last time' : 'Missed last time'}
              </span>
            )}
          </span>
          {flipped ? (
            <span className="practice-answer">
              {card.answer.map((para, i) => (
                <span key={i} className="practice-para">
                  {renderInline(para)}
                </span>
              ))}
            </span>
          ) : (
            <>
              <span className="practice-setup">{renderInline(card.scenario)}</span>
              <span className="practice-question">{renderInline(card.question)}</span>
            </>
          )}
          <span className="practice-hint">
            <FontAwesomeIcon icon={faRotate} className="fa-ico" />
            {flipped ? 'Back to the question' : 'Reveal the answer'}
            <kbd>Space</kbd>
          </span>
        </span>
      </button>

      <div className="practice-controls">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(-1)} disabled={index === 0}>
          <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
          Prev <kbd>←</kbd>
        </button>
        {flipped ? (
          <div className="cluster" style={{ ['--cluster-gap' as string]: '0.5rem' }}>
            <button type="button" className="btn btn-sm grade-btn is-missed" onClick={() => grade('missed')}>
              <FontAwesomeIcon icon={faXmark} className="fa-ico" />
              Missed it <kbd>1</kbd>
            </button>
            <button type="button" className="btn btn-sm grade-btn is-got" onClick={() => grade('got')}>
              <FontAwesomeIcon icon={faCheck} className="fa-ico" />
              Got it <kbd>2</kbd>
            </button>
          </div>
        ) : (
          <span className="text-muted practice-keys">Answer in your head, then flip</span>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(1)}>
          {index + 1 === round.length ? 'Finish' : 'Skip'} <kbd>→</kbd>
          <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
        </button>
      </div>

      <div className="practice-footer">
        <span className="text-muted">
          {stats.got} mastered · {stats.missed} to revisit · saved in this browser
        </span>
        <div className="cluster" style={{ ['--cluster-gap' as string]: '0.75rem' }}>
          {companion && (
            <Link className="action-link" href={companion.href}>
              {companion.label}
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </Link>
          )}
          {stats.seen > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (confirm('Clear your saved grades for this deck?')) {
                  resetDeck(slug);
                  startRound('all');
                }
              }}
            >
              Reset progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
