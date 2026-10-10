import { clientEnv } from '@/lib/env';

/**
 * Everything adjustable about the welcome intro, in one place.
 *
 * The timeline is expressed as absolute milliseconds from the start rather than as a chain of
 * relative delays, because the phases deliberately overlap — the fill begins before the outline
 * has finished drawing, and the sweep runs into the wordmark. Relative delays would make that
 * overlap hard to read and harder to adjust.
 *
 * To make the whole thing faster or slower, change `durationScale`. Every value below is
 * multiplied by it, so the choreography keeps its shape.
 */

/** Master switch. `NEXT_PUBLIC_SHOW_INTRO=false` disables the intro everywhere, including its markup. */
export const INTRO_ENABLED = clientEnv.NEXT_PUBLIC_SHOW_INTRO;

/**
 * Scales every duration and delay. 1 is the designed pace (~3.4s end to end).
 * 0.7 is noticeably brisk; 1.3 is stately. Below ~0.5 the phases stop reading as separate.
 */
export const durationScale = 1;

/** Shown once per browsing session. Clear this key in devtools to see it again. */
export const INTRO_STORAGE_KEY = 'vastrix_intro_seen';

/** Absolute milliseconds from the start of the intro, before `durationScale` is applied. */
const timeline = {
  /** Phase 1 — the midnight field and its ambient light settle in. */
  ambient: { at: 0, duration: 420 },
  /** Phase 2 — light lines converge on the centre, suggesting the mark being assembled. */
  lines: { at: 240, duration: 760 },
  /** Phase 3a — each stroke's outline draws itself, V then A then I. */
  outline: { at: 520, duration: 820, stagger: 130 },
  /** Phase 3b — the artwork fills in behind the outline, which then fades. */
  fill: { at: 1280, duration: 520 },
  /** Phase 4 — a single light sweep crosses the emblem. */
  sweep: { at: 1720, duration: 560 },
  /** Phase 5 — the wordmark rises into place. */
  wordmark: { at: 1960, duration: 520 },
  /** Phase 6 — the tagline follows. */
  tagline: { at: 2340, duration: 480 },
  /** Phase 7 — the lockup holds, then the curtain lifts into the homepage. */
  hold: { at: 2860, duration: 260 },
  exit: { at: 3060, duration: 460 },
} as const;

export type IntroPhase = keyof typeof timeline;

const scale = (value: number) => Math.round(value * durationScale);

/** Seconds, as Framer Motion expects them. */
export function phase(name: IntroPhase) {
  const { at, duration } = timeline[name];
  return { delay: scale(at) / 1000, duration: scale(duration) / 1000 };
}

/** Stagger step for the per-stroke outline draw, in seconds. */
export function outlineStagger(index: number) {
  return scale(timeline.outline.at + timeline.outline.stagger * index) / 1000;
}

/** When the overlay has finished and should be removed from the page, in milliseconds. */
export const INTRO_TOTAL_MS = scale(timeline.exit.at + timeline.exit.duration);

/**
 * How long the exit transition lasts, in seconds — used both by the curtain and by the homepage
 * beneath it, so the two move together rather than one revealing the other.
 */
export const EXIT_DURATION_S = scale(timeline.exit.duration) / 1000;

/**
 * Ambient detail is reduced on small screens: fewer drifting motes and a tighter light field.
 * This is a count, not a toggle — the effect should still read on a phone, just cost less.
 */
export const MOTE_COUNT = { mobile: 5, desktop: 12 } as const;
