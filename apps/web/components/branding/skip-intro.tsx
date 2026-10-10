'use client';

import { motion } from 'framer-motion';

/**
 * The way out of the intro.
 *
 * A visitor must never be held by an animation, so this is a real button: reachable by keyboard,
 * announced to assistive technology, and the first thing in the overlay's tab order. Escape does
 * the same job — see `vastrix-intro.tsx`.
 *
 * It appears almost immediately rather than fading in with everything else. A skip control that
 * arrives late is no use to the person who wanted it from the start.
 */
export function SkipIntro({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onSkip}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      className="absolute right-6 bottom-6 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-brand-400 sm:right-8 sm:bottom-8"
    >
      Skip intro
      <span className="sr-only"> and go to the VASTRIX homepage</span>
    </motion.button>
  );
}
