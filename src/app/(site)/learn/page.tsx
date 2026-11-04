import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFlaskVial,
  faGraduationCap,
  faLayerGroup,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import Flashcards from '../components/Flashcards';
import LabCard from '../components/LabCard';
import { DECKS } from '../lib/questions';
import { LABS } from '../lib/labs';

export const metadata: Metadata = {
  title: 'Learn — flashcards & hands-on labs | OverflowByte',
  description:
    'Scenario-based flashcards and hands-on command-line labs on Linux internals, permissions, process management and hardening.',
};

export default function LearnPage() {
  const totalCards = DECKS.reduce((n, deck) => n + deck.cards.length, 0);

  return (
    <div className="shell section">
      <header style={{ maxWidth: '58rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <p className="eyebrow">
          <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
          Practice & recall
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          Flashcards &amp; hands-on labs
        </h1>
        <p className="lede">
          Scenario questions that test whether you actually understand the kernel mechanics,
          and terminal labs where you write the command yourself before checking the answer.
        </p>

        <dl className="stat-row">
          <div className="stat">
            <dt>Flashcards</dt>
            <dd>{totalCards}</dd>
          </div>
          <div className="stat">
            <dt>Labs</dt>
            <dd>{LABS.length}</dd>
          </div>
          <div className="stat">
            <dt>Decks</dt>
            <dd>{DECKS.length}</dd>
          </div>
          <div className="stat">
            <dt>Format</dt>
            <dd style={{ fontSize: 'var(--step-0)' }}>Self-check</dd>
          </div>
        </dl>
      </header>

      {DECKS.map((deck) => (
        <section key={deck.slug} className="section-tight" id={deck.slug}>
          <div className="section-head">
            <div>
              <h2>
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="fa-ico"
                  style={{ color: 'var(--accent)', marginRight: '0.6rem' }}
                />
                {deck.title}
              </h2>
              <p>{deck.summary}</p>
            </div>
            <span className="badge badge-neutral">{deck.series}</span>
          </div>

          <Flashcards cards={deck.cards} />
        </section>
      ))}

      <section className="section-tight" id="labs">
        <div className="section-head">
          <div>
            <h2>
              <FontAwesomeIcon
                icon={faFlaskVial}
                className="fa-ico"
                style={{ color: 'var(--accent)', marginRight: '0.6rem' }}
              />
              Hands-on labs
            </h2>
            <p>
              Each lab gives you a scenario and a set of requirements. Write the command
              first, then open the solution to check your reasoning.
            </p>
          </div>
        </div>

        <div className="grid" style={{ gap: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
          {LABS.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      </section>

      <aside className="card card-pad card-quiet" style={{ marginTop: '2rem' }}>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'var(--step-1)', marginBottom: '0.3rem' }}>
              Want the full lab curriculum?
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
              40+ RHCSA and RHCE drills, cheat sheets and EX294 mocks live in the learning
              vault.
            </p>
          </div>
          <a
            className="btn btn-secondary"
            href="https://learning.overflowbyte.cloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the vault
            <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
          </a>
        </div>
      </aside>
    </div>
  );
}
