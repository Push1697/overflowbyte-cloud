'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import type { Card } from '../lib/questions';
import { renderInline } from '../lib/inline';

const DIFFICULTY: Record<Card['difficulty'], { label: string; cls: string }> = {
  core: { label: 'Core', cls: 'badge badge-ok' },
  deep: { label: 'Deep', cls: 'badge badge-accent' },
  trap: { label: 'Trap', cls: 'badge badge-warn' },
};

function Flashcard({ card }: { card: Card }) {
  const [flipped, setFlipped] = useState(false);
  const meta = DIFFICULTY[card.difficulty];

  return (
    <button
      type="button"
      className="flash"
      data-flipped={flipped}
      aria-expanded={flipped}
      aria-label={
        flipped ? `${card.tag}: showing answer. Activate to hide.` : `${card.tag}: ${card.question} Activate to reveal the answer.`
      }
      onClick={() => setFlipped((v) => !v)}
    >
      <div className="flash-inner">
        <div className="flash-face flash-face-front">
          <div className="cluster" style={{ marginBottom: '0.8rem' }}>
            <span className={meta.cls}>{meta.label}</span>
            <span className="mono">{card.tag}</span>
          </div>
          <p className="flash-q">{card.question}</p>
          <p className="flash-scenario">{renderInline(card.scenario)}</p>
          <span className="flash-hint">
            <FontAwesomeIcon icon={faRotate} className="fa-ico" />
            Flip for the kernel answer
          </span>
        </div>

        <div className="flash-face flash-face-back">
          <div className="cluster" style={{ marginBottom: '0.8rem' }}>
            <span className="badge badge-accent">{card.topic}</span>
          </div>
          <div className="flash-a">
            {card.answer.map((para, i) => (
              <p key={i}>{renderInline(para)}</p>
            ))}
          </div>
          <span className="flash-hint">
            <FontAwesomeIcon icon={faArrowLeft} className="fa-ico" />
            Back to the question
          </span>
        </div>
      </div>
    </button>
  );
}

export default function Flashcards({ cards }: { cards: Card[] }) {
  return (
    <div className="flash-grid">
      {cards.map((card) => (
        <Flashcard key={card.id} card={card} />
      ))}
    </div>
  );
}
