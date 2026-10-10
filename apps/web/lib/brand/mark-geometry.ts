/**
 * The geometry of the NEVIX mark, measured from the derived artwork `public/brand/nevix-mark.png`
 * (450x551, produced by scripts/derive-brand-assets.mjs from the supplied primary logo).
 *
 * The N is three shapes: a left stroke, a rounded diagonal bar, and a right stroke that the bar
 * folds into. The intro reveals them in the order a hand writes the letter — up the left stroke,
 * down the diagonal, up the right stroke — by drawing a broad mask along each stroke's centre line
 * over the supplied artwork. The artwork itself is never redrawn: what the visitor sees fill in is
 * the PNG, uncovered.
 *
 * Measured from the artwork's alpha channel:
 *
 *   - left stroke   x 5–127, top edge slanting from (5, 225) to (127, 355), base at y ≈ 545
 *   - diagonal bar  axis from (100, 150) to (355, 420), thickness ≈ 140
 *   - right stroke  x 319–444, top at y ≈ 10, folding under the bar at y ≈ 470
 *
 * If the artwork is ever regenerated at a different size, re-measure these. Each path overshoots
 * its stroke so a butt-capped mask still covers the rounded ends.
 */

export const MARK_VIEWBOX = { width: 450, height: 551 } as const;

/**
 * How the mark and the wordmark sit together, measured from the supplied vertical lockup
 * `nevix-verticallogo.png`: the N is 420px wide, the wordmark 726px, with 52px between them.
 *
 * The wordmark is nearly three-quarters again as wide as the N, which is easy to get wrong by eye
 * — and getting it wrong is a change to the logo's proportions. Sizing both from these ratios means
 * the intro reproduces the official lockup rather than approximating it.
 */
export const LOCKUP = {
  /** Wordmark width ÷ mark width. */
  wordmarkToMark: 1.729,
  /** Vertical gap between them ÷ mark width. */
  gapToMark: 0.124,
} as const;

export type MarkStrokeId = 'left' | 'diagonal' | 'right';

export interface MarkStroke {
  id: MarkStrokeId;
  /** Centre line of the stroke, in the order it is written. */
  path: string;
  /** Width of the reveal mask along that line — just wider than the stroke itself. */
  maskWidth: number;
  /**
   * Optional region the reveal is confined to. The left stroke's mask would otherwise uncover the
   * lower edge of the diagonal bar early, because the two run close together.
   */
  region?: string;
}

export const MARK_STROKES: readonly MarkStroke[] = [
  {
    id: 'left',
    path: 'M66 580 L66 196',
    maskWidth: 140,
    // Everything below the gap between the left stroke and the bar (the line y = x + 166).
    region: '-20,146 140,306 140,600 -20,600',
  },
  {
    id: 'diagonal',
    path: 'M42 88 L408 478',
    maskWidth: 146,
  },
  {
    id: 'right',
    path: 'M382 520 L382 -20',
    maskWidth: 140,
  },
] as const;
