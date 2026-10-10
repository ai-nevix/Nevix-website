'use client';

import { motion } from 'framer-motion';

import { MARK_STROKES, MARK_VIEWBOX } from '@/lib/brand/mark-geometry';
import { outlineStagger, phase } from '@/lib/brand/intro-config';

/**
 * Phases 3 and 4 — the emblem drawing itself, then a light sweep across it.
 *
 * The order matters, and it is what makes the mark look constructed rather than merely faded in:
 *
 *   1. each stroke's outline draws itself in light, V then A then I
 *   2. the artwork fills in behind that outline
 *   3. the outline fades, leaving the logo
 *   4. one sweep of light crosses it
 *
 * **The logo is never redrawn.** The filled state is the supplied artwork — each layer paints the
 * same PNG and shows only its own stroke through a verified `clip-path`, so the three at rest
 * reassemble the original pixel for pixel. The outlines in step 1 are the measured contours of
 * those same strokes, used as a light path and gone before the logo is legible.
 *
 * The artwork used here is the matte-repaired derivation. The supplied file carries a white matte
 * baked into its antialiased edge, which on this midnight background would ring every stroke with
 * a pale outline. See scripts/derive-brand-assets.mjs.
 */

const ARTWORK = '/brand/vastrix-symbol-clean.png';

export function VastrixLogoReveal() {
  const outline = phase('outline');
  const fill = phase('fill');
  const sweep = phase('sweep');
  const hold = phase('hold');

  return (
    <div
      className="relative"
      // Width comes from the lockup, so the mark and the wordmark keep the supplied proportion.
      style={{
        width: 'var(--vastrix-mark)',
        aspectRatio: `${MARK_VIEWBOX.width} / ${MARK_VIEWBOX.height}`,
      }}
    >
      {/* Ambient bloom behind the mark. Blurred once, never animated as a filter — animating blur
          forces a repaint every frame, which is exactly the cost the brief rules out. */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgb(37 99 235 / 0.45), transparent 62%)',
          filter: 'blur(28px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.85, 0.55] }}
        transition={{ delay: fill.delay, duration: fill.duration * 2, times: [0, 0.5, 1] }}
      />

      {/* --- 1. The outlines, drawn ------------------------------------------------------- */}
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="vastrix-outline" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="55%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {MARK_STROKES.map((stroke, index) => (
          <motion.path
            key={stroke.id}
            d={stroke.outline}
            stroke="url(#vastrix-outline)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
            transition={{
              pathLength: {
                delay: outlineStagger(index),
                duration: outline.duration,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                delay: outlineStagger(index),
                duration: outline.duration + fill.duration,
                times: [0, 0.12, 0.62, 1],
              },
            }}
          />
        ))}
      </svg>

      {/* --- 2. The artwork, filling in --------------------------------------------------- */}
      {MARK_STROKES.map((stroke, index) => (
        <motion.div
          key={stroke.id}
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url('${ARTWORK}')`, clipPath: stroke.clipPath }}
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: fill.delay + index * 0.07,
            duration: fill.duration,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}

      {/* --- 3. The light sweep ------------------------------------------------------------ */}
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
          className="absolute inset-y-[-40%] w-[45%]"
          style={{
            background:
              'linear-gradient(105deg, transparent, rgb(255 255 255 / 0.15) 35%, rgb(186 239 255 / 0.85) 50%, rgb(255 255 255 / 0.15) 65%, transparent)',
            rotate: '8deg',
          }}
          initial={{ left: '-50%' }}
          animate={{ left: '105%' }}
          transition={{ delay: sweep.delay, duration: sweep.duration, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>

      {/* --- 4. The ambient ring ----------------------------------------------------------- */}
      {/* The optional continuous-intelligence cue. One arc, barely there, very slow. It starts
          only once the logo is settled so it never competes with the reveal. */}
      <motion.svg
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: hold.delay, duration: hold.duration }}
      >
        <motion.circle
          cx="100"
          cy="100"
          r="78"
          stroke="rgb(6 182 212 / 0.5)"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeDasharray="34 456"
          animate={{ rotate: 360 }}
          style={{ transformOrigin: '100px 100px' }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </motion.svg>
    </div>
  );
}
