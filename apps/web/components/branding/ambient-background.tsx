'use client';

import { motion } from 'framer-motion';

import { MOTE_COUNT, phase } from '@/lib/brand/intro-config';

/**
 * Phases 1 and 2 — the midnight field, and the light converging on the centre.
 *
 * Deliberately sparse. The brief asks for the impression of something coming online, not a
 * particle demo, so this is a soft central glow, four light streaks travelling inward, and a
 * handful of slow motes.
 *
 * Positions are fixed rather than random. Random values would differ between the server and the
 * client render, and they would also make the composition different — and occasionally worse —
 * on every visit.
 *
 * Only `transform` and `opacity` are animated. Both are composited on the GPU, so none of this
 * triggers layout or paint while it runs. The blurs are static.
 */

/** Percentage positions, hand-placed to sit clear of the emblem in the centre. */
const MOTES = [
  { x: 12, y: 22, size: 3, delay: 0.0, drift: -18 },
  { x: 86, y: 18, size: 2, delay: 0.5, drift: 14 },
  { x: 22, y: 76, size: 2, delay: 0.9, drift: 16 },
  { x: 78, y: 82, size: 3, delay: 0.3, drift: -12 },
  { x: 48, y: 12, size: 2, delay: 1.1, drift: 10 },
  { x: 8, y: 52, size: 2, delay: 0.7, drift: -14 },
  { x: 92, y: 58, size: 2, delay: 1.3, drift: 12 },
  { x: 34, y: 88, size: 2, delay: 0.2, drift: -10 },
  { x: 66, y: 8, size: 2, delay: 1.5, drift: 14 },
  { x: 16, y: 38, size: 2, delay: 1.0, drift: 12 },
  { x: 84, y: 40, size: 2, delay: 0.6, drift: -16 },
  { x: 54, y: 90, size: 2, delay: 1.4, drift: 10 },
];

/** Streaks travel inward along the mark's own diagonal, so the light and the logo agree. */
const STREAKS = [
  { top: '28%', from: '-40vw', width: '34vw', delay: 0 },
  { top: '64%', from: '-30vw', width: '26vw', delay: 0.12 },
  { top: '38%', from: '40vw', width: '30vw', delay: 0.06, reverse: true },
  { top: '72%', from: '30vw', width: '22vw', delay: 0.18, reverse: true },
];

export function AmbientBackground() {
  const ambient = phase('ambient');
  const lines = phase('lines');

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* A single soft pool of light where the emblem will arrive. */}
      <motion.div
        className="absolute top-1/2 left-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgb(37 99 235 / 0.22) 0%, rgb(6 182 212 / 0.10) 38%, transparent 68%)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...ambient, ease: 'easeOut' }}
      />

      {STREAKS.map((streak, index) => (
        <motion.div
          key={index}
          className="absolute h-px"
          style={{
            top: streak.top,
            width: streak.width,
            left: streak.reverse ? undefined : 0,
            right: streak.reverse ? 0 : undefined,
            background: `linear-gradient(${streak.reverse ? 270 : 90}deg, transparent, rgb(6 182 212 / 0.55), rgb(37 99 235 / 0.9))`,
          }}
          initial={{ opacity: 0, x: streak.from }}
          animate={{ opacity: [0, 1, 0], x: streak.reverse ? '-24vw' : '24vw' }}
          transition={{
            delay: lines.delay + streak.delay,
            duration: lines.duration,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.45, 1],
          }}
        />
      ))}

      {MOTES.map((mote, index) => (
        <motion.span
          key={index}
          className={
            // The tail of the list is hidden on small screens, which is the mobile reduction the
            // brief asks for: fewer motes, same composition.
            index >= MOTE_COUNT.mobile
              ? 'absolute hidden rounded-full sm:block'
              : 'absolute rounded-full'
          }
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: mote.size,
            height: mote.size,
            background: index % 2 === 0 ? 'rgb(6 182 212 / 0.8)' : 'rgb(96 150 250 / 0.75)',
            boxShadow: '0 0 6px rgb(6 182 212 / 0.5)',
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.9, 0.35], y: mote.drift }}
          transition={{
            delay: ambient.delay + mote.delay * 0.4,
            duration: 2.6,
            ease: 'easeInOut',
            times: [0, 0.4, 1],
          }}
        />
      ))}
    </div>
  );
}
