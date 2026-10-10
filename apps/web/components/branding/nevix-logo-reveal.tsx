'use client';

import { motion } from 'framer-motion';

import { brandAssets } from '@/content/site';
import { outlineStagger, phase } from '@/lib/brand/intro-config';
import { MARK_STROKES, MARK_VIEWBOX } from '@/lib/brand/mark-geometry';

/**
 * Phases 3 and 4 — the N writing itself, then a light sweep across it.
 *
 * The order is what makes the mark look written rather than merely faded in:
 *
 *   1. a point of light travels up the left stroke, down the diagonal and up the right stroke —
 *      the order a hand writes an N
 *   2. behind it, the artwork is uncovered along the same path
 *   3. the light fades and the N settles, its glow coming up
 *   4. one sweep of light crosses it
 *
 * **The logo is never redrawn.** What fills in is the supplied artwork (the derived, transparent
 * `nevix-mark.png`), uncovered by an SVG mask drawn along each stroke's measured centre line — see
 * lib/brand/mark-geometry.ts. The light in step 1 follows the same lines and is gone before the
 * logo is fully legible.
 */

const ARTWORK = brandAssets.mark.src;
const EASE = [0.65, 0, 0.35, 1] as const;

export function NevixLogoReveal() {
  const outline = phase('outline');
  const fill = phase('fill');
  const sweep = phase('sweep');
  const hold = phase('hold');

  return (
    <motion.div
      className="relative"
      // Width comes from the lockup, so the mark and the wordmark keep the supplied proportion.
      style={{
        width: 'var(--nevix-mark)',
        aspectRatio: `${MARK_VIEWBOX.width} / ${MARK_VIEWBOX.height}`,
      }}
      initial={{ scale: 0.97 }}
      animate={{ scale: 1 }}
      transition={{ delay: fill.delay, duration: fill.duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient bloom behind the mark. Blurred once, never animated as a filter — animating blur
          forces a repaint every frame, which is exactly the cost the brief rules out. */}
      <motion.div
        className="absolute inset-[-10%] -z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(11 92 255 / 0.55), rgb(0 200 255 / 0.12) 45%, transparent 68%)',
          filter: 'blur(30px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.95, 0.7] }}
        transition={{
          delay: outline.delay,
          duration: fill.delay - outline.delay + fill.duration * 2,
          times: [0, 0.4, 0.8, 1],
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {MARK_STROKES.filter((stroke) => stroke.region).map((stroke) => (
            <clipPath key={stroke.id} id={`nevix-region-${stroke.id}`}>
              <polygon points={stroke.region} />
            </clipPath>
          ))}

          {/* --- 2. The mask that uncovers the artwork, written stroke by stroke ------------- */}
          <mask
            id="nevix-reveal"
            maskUnits="userSpaceOnUse"
            x={-60}
            y={-60}
            width={MARK_VIEWBOX.width + 120}
            height={MARK_VIEWBOX.height + 120}
          >
            {MARK_STROKES.map((stroke, index) => (
              <motion.path
                key={stroke.id}
                d={stroke.path}
                stroke="#fff"
                strokeWidth={stroke.maskWidth}
                strokeLinecap="butt"
                clipPath={stroke.region ? `url(#nevix-region-${stroke.id})` : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  delay: outlineStagger(index),
                  duration: outline.duration,
                  ease: EASE,
                }}
              />
            ))}
          </mask>

          <linearGradient id="nevix-trace" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#5b8eff" />
            <stop offset="60%" stopColor="#7ddcff" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* The artwork, shown only where the mask has been written. */}
        <image
          href={ARTWORK}
          width={MARK_VIEWBOX.width}
          height={MARK_VIEWBOX.height}
          mask="url(#nevix-reveal)"
        />

        {/* --- 1. The point of light leading each stroke ---------------------------------- */}
        <g style={{ filter: 'drop-shadow(0 0 6px rgb(51 198 255 / 0.9))' }}>
          {MARK_STROKES.map((stroke, index) => (
            <motion.path
              key={stroke.id}
              d={stroke.path}
              stroke="url(#nevix-trace)"
              strokeWidth={5}
              strokeLinecap="round"
              clipPath={stroke.region ? `url(#nevix-region-${stroke.id})` : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              transition={{
                pathLength: {
                  delay: outlineStagger(index),
                  duration: outline.duration,
                  ease: EASE,
                },
                opacity: {
                  delay: outlineStagger(index),
                  duration: outline.duration + 0.32,
                  times: [0, 0.1, 0.7, 1],
                },
              }}
            />
          ))}
        </g>
      </svg>

      {/* --- 4. The light sweep ------------------------------------------------------------ */}
      {/* Masked by the artwork's own alpha, so the light travels across the strokes themselves
          rather than across a rectangle sitting on top of them. */}
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          maskImage: `url('${ARTWORK}')`,
          maskSize: '100% 100%',
          WebkitMaskImage: `url('${ARTWORK}')`,
          WebkitMaskSize: '100% 100%',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay: sweep.delay, duration: sweep.duration, times: [0, 0.15, 0.7, 1] }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-y-[-40%] w-[55%]"
          style={{
            background:
              'linear-gradient(105deg, transparent, rgb(255 255 255 / 0.15) 35%, rgb(186 239 255 / 0.85) 50%, rgb(255 255 255 / 0.15) 65%, transparent)',
            rotate: '-42deg',
          }}
          initial={{ left: '-60%' }}
          animate={{ left: '110%' }}
          transition={{ delay: sweep.delay, duration: sweep.duration, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>

      {/* --- The ambient ring -------------------------------------------------------------- */}
      {/* The optional continuous-intelligence cue. One arc, barely there, very slow. It starts
          only once the logo is settled so it never competes with the reveal. */}
      <motion.svg
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[170%] w-[170%] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ delay: hold.delay, duration: hold.duration }}
      >
        <motion.circle
          cx="100"
          cy="100"
          r="78"
          stroke="rgb(51 198 255 / 0.5)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeDasharray="34 456"
          animate={{ rotate: 360 }}
          style={{ transformOrigin: '100px 100px' }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </motion.svg>
    </motion.div>
  );
}
