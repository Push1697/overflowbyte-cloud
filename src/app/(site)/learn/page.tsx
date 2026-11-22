import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import LabCard from '../components/LabCard';
import LearnHub from '../components/learn/LearnHub';
import { DECKS } from '../lib/questions';
import { LABS } from '../lib/labs';
import { companionFor } from '../lib/learn-links';

export const metadata: Metadata = {
  title: 'Learn — flashcards & hands-on labs | OverflowByte',
  description:
    'Scenario-based flashcards with focused practice mode, and hands-on command-line labs on Linux internals, cloud networking, Ansible and hardening.',
};

export default function LearnPage() {
  const totalCards = DECKS.reduce((n, deck) => n + deck.cards.length, 0);
  const decks = DECKS.map((deck) => ({ ...deck, companion: companionFor(deck.slug) }));

  return (
    <div className="shell section">
      <header style={{ maxWidth: '58rem', marginBottom: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
        <p className="eyebrow">
          <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" />
          Practice & recall
        </p>
        <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '1rem 0' }}>
          Flashcards &amp; hands-on labs
        </h1>
        <p className="lede">
          Scenario questions that test whether you actually understand the mechanics, and
          terminal labs where you write the command yourself before checking the answer.
        </p>

        <dl className="stat-strip">
          <div>
            <dt>Flashcards</dt>
            <dd>{totalCards}</dd>
          </div>
          <div>
            <dt>Labs</dt>
            <dd>{LABS.length}</dd>
          </div>
          <div>
            <dt>Decks</dt>
            <dd>{DECKS.length}</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>Self-check</dd>
          </div>
        </dl>
      </header>

      <LearnHub
        decks={decks}
        labCount={LABS.length}
        labsPanel={
          <>
            <p className="text-muted" style={{ maxWidth: '62ch', marginBottom: '1.5rem' }}>
              Each lab gives you a scenario and a set of requirements. Write the command first,
              then open the solution to check your reasoning.
            </p>
            <div className="grid" style={{ gap: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
              {LABS.map((lab) => (
                <LabCard key={lab.id} lab={lab} />
              ))}
            </div>
          </>
        }
      />

      <aside className="card card-pad card-quiet" style={{ marginTop: '3rem' }}>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'var(--step-1)', marginBottom: '0.3rem' }}>
              Want the full lab curriculum?
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
              40+ RHCSA and RHCE drills, cheat sheets and EX294 mocks live in the notes.
            </p>
          </div>
          <Link className="btn btn-secondary" href="/notes">
            Open the notes
            <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
