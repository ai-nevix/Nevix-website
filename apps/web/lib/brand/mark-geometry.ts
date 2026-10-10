/**
 * The geometry of the VASTRIX mark, measured from the supplied artwork.
 *
 * The mark is three strokes that read as V, A and I. They are genuinely separate shapes — the
 * woven look comes from the gradients, not from overlap — which is what allows each to be
 * revealed, drawn and moved on its own.
 *
 * Everything here was extracted from `public/brand/vastrix-symbol.png` rather than drawn by hand:
 * connected components were labelled, their contours traced, and the results simplified. Two
 * properties were then verified against that file, and both must hold if these numbers are ever
 * revised:
 *
 *   - every pixel carrying any opacity falls inside exactly one `clipPath`
 *   - no `clipPath` reaches a pixel belonging to another stroke
 *
 * The clip polygons sit ~3px outside each stroke so that what the eye sees at the boundary is the
 * artwork's own antialiased edge, never the polygon. The narrowest gap between two strokes is
 * 8.5px, so that margin cannot reach a neighbour.
 *
 * `outline` is the same shape as a path, used for the stroke-drawing phase of the intro.
 */

export const MARK_VIEWBOX = { width: 256, height: 116 } as const;

/**
 * How the mark and the wordmark sit together, measured from the supplied lockup
 * `vastrix-logo.png`: the mark occupies x 110-530 / y 4-189, and the wordmark x 3-635 / y 214-282.
 *
 * The wordmark is half again as wide as the emblem, which is easy to get wrong by eye — and
 * getting it wrong is a change to the logo's proportions. Sizing both from these ratios means the
 * intro reproduces the official lockup rather than approximating it.
 */
export const LOCKUP = {
  /** Wordmark width ÷ mark width. */
  wordmarkToMark: 1.5036,
  /** Vertical gap between them ÷ mark width. */
  gapToMark: 0.057,
} as const;

export type MarkStrokeId = 'v' | 'a' | 'i';

export interface MarkStroke {
  id: MarkStrokeId;
  /** Which letterform of the monogram this stroke is, for documentation and test names. */
  letter: string;
  /** Outline in the 256x116 viewBox, for SVG stroke animation. */
  outline: string;
  /** CSS `clip-path` polygon, in percentages of the mark's box. */
  clipPath: string;
}

export const MARK_STROKES: readonly MarkStroke[] = [
  {
    id: 'v',
    letter: 'V',
    outline: 'M3,2 L47,2 L52,4 L78,49 L81,58 L54,98 L52,99 L2,3 Z',
    clipPath:
      'polygon(0.69% -0.86%, 18.59% -0.86%, 21.12% 1.38%, 31.54% 41.17%, 32.93% 50.39%, 21.89% 86.49%, 19.81% 88.8%, -0.66% 2.1%)',
  },
  {
    id: 'a',
    letter: 'A',
    outline:
      'M129,5 L140,5 L146,10 L203,112 L160,111 L131,62 L99,110 L95,112 L58,111 L113,24 L128,6 Z',
    clipPath:
      'polygon(49.91% 1.72%, 55.11% 1.72%, 57.95% 6.94%, 81.32% 99.24%, 61.82% 98.24%, 51.11% 58.31%, 39.47% 96.83%, 37.37% 99.15%, 20.56% 98.15%, 43.19% 19.16%, 49.13% 3.43%)',
  },
  {
    id: 'i',
    letter: 'I',
    outline: 'M162,2 L195,3 L253,111 L218,111 L162,3 Z',
    clipPath: 'polygon(62.11% -0.94%, 76.88% 0.05%, 100.79% 98.28%, 84.44% 98.28%, 62.11% 3.22%)',
  },
] as const;
