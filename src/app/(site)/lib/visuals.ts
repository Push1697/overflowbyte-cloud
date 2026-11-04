/**
 * Visual primitives.
 *
 * A closed set of diagram shapes that any article can be expressed in. Content
 * work produces *data* in these types; the renderer owns every pixel. That is
 * what keeps a hundred explainers looking like one system instead of a hundred
 * bespoke components, and it is what makes the content safe to generate in
 * bulk — a wrong field fails the type check instead of shipping a broken page.
 *
 * Adding a sixth kind is a deliberate design decision, not a content decision.
 */

export type VisualTone = 'info' | 'accent' | 'ok' | 'warn' | 'crit' | 'neutral';

type Base = {
  id: string;
  title: string;
  /** One line under the title saying what the reader should take from it. */
  caption?: string;
};

/** Ordered beats in time. Selecting one fills the track up to it. */
export type TimelineViz = Base & {
  kind: 'timeline';
  steps: { title: string; body: string }[];
};

/** A top-to-bottom pipeline, with the condition for each hop on the arrow. */
export type StagesViz = Base & {
  kind: 'stages';
  stages: { title: string; body: string; arrow?: string; tone: VisualTone }[];
};

/** Two or three ways of doing the same thing, with the outcome of each. */
export type CompareViz = Base & {
  kind: 'compare';
  columns: {
    title: string;
    subtitle?: string;
    /** Terminal transcript lines. */
    lines: string[];
    /** Substring of a line to highlight — the one token that differs. */
    mark?: string;
    markTone?: 'ok' | 'bad';
    outcome: string;
    ok: boolean;
  }[];
};

/** A reference table. One row may be emphasised as the one that matters. */
export type MatrixViz = Base & {
  kind: 'matrix';
  headers: string[];
  rows: { cells: string[]; emphasis?: boolean }[];
};

/**
 * Ordered checks evaluated against a selectable subject — the shape of almost
 * every authorization decision: who is asking, what is tested, in what order,
 * and where it stops.
 */
export type CascadeViz = Base & {
  kind: 'cascade';
  checks: { id: string; title: string; test?: string }[];
  subjects: {
    id: string;
    label: string;
    detail?: string;
    /** Keyed by check id. Every check must have an entry. */
    results: Record<string, { state: 'pass' | 'fail' | 'skip'; note: string }>;
    granted: boolean;
    verdict: string;
  }[];
};

export type Visual = TimelineViz | StagesViz | CompareViz | MatrixViz | CascadeViz;

/**
 * Fails the build if a cascade subject is missing a verdict for one of the
 * checks, which would otherwise render as a silently blank row.
 */
export function assertCascadeComplete(viz: CascadeViz): string[] {
  const problems: string[] = [];

  for (const subject of viz.subjects) {
    for (const check of viz.checks) {
      if (!subject.results[check.id]) {
        problems.push(`${viz.id}: subject "${subject.id}" has no result for check "${check.id}"`);
      }
    }
  }

  return problems;
}
