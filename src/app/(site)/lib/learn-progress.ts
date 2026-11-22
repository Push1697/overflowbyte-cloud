'use client';

import { useSyncExternalStore } from 'react';

/**
 * Flashcard self-grading, kept in this browser only (no account). Every
 * access is guarded: private windows and blocked storage just mean progress
 * is not remembered, never a broken page.
 */
export type Grade = 'got' | 'missed';

export type Progress = {
  v: 1;
  /** deck slug -> card id -> latest self-grade */
  grades: Record<string, Record<string, Grade>>;
  /** Where the reader stopped, for the "continue" banner. */
  last?: { deck: string; index: number; at: number };
};

const KEY = 'ob-learn-v1';
const EMPTY: Progress = { v: 1, grades: {} };
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cached: Progress = EMPTY;

function read(): Progress {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Progress) : EMPTY;
    cached = parsed?.v === 1 && parsed.grades ? parsed : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(next: Progress) {
  cached = next;
  try {
    cachedRaw = JSON.stringify(next);
    localStorage.setItem(KEY, cachedRaw);
  } catch {
    // Storage unavailable: keep the in-memory copy for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Progress for rendering; empty during server render and first paint. */
export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function gradeCard(deck: string, cardId: string, grade: Grade) {
  const p = read();
  write({ ...p, grades: { ...p.grades, [deck]: { ...p.grades[deck], [cardId]: grade } } });
}

export function rememberPosition(deck: string, index: number) {
  write({ ...read(), last: { deck, index, at: Date.now() } });
}

export function resetDeck(deck: string) {
  const p = read();
  const grades = { ...p.grades };
  delete grades[deck];
  write({ ...p, grades, last: p.last?.deck === deck ? undefined : p.last });
}

export function deckStats(p: Progress, deck: string, cardIds: string[]) {
  const g = p.grades[deck] ?? {};
  let got = 0;
  let missed = 0;
  for (const id of cardIds) {
    if (g[id] === 'got') got++;
    else if (g[id] === 'missed') missed++;
  }
  return { got, missed, seen: got + missed, total: cardIds.length };
}
