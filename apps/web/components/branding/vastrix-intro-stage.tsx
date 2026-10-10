'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { AmbientBackground } from '@/components/branding/ambient-background';
import { SkipIntro } from '@/components/branding/skip-intro';
import { VastrixLogoReveal } from '@/components/branding/vastrix-logo-reveal';
import { brandAssets, siteConfig } from '@/content/site';
import { EXIT_DURATION_S, INTRO_TOTAL_MS, phase } from '@/lib/brand/intro-config';
import { LOCKUP } from '@/lib/brand/mark-geometry';

/**
 * The VASTRIX welcome — phases 5 to 7, and the orchestration of the whole sequence.
 *
 * This module holds everything heavy: Framer Motion, the ambient field, the reveal. It is loaded
 * on demand by `vastrix-intro.tsx`, which is why it is a separate file — see the note there.
 *
 * ## Why the curtain is not this component's job
 *
 * A client component cannot render before hydration, so an overlay that lived only in React would
 * show the homepage first and then cover it — a flash on every first visit. Instead the inline
 * script in `app/layout.tsx` sets `vastrix-intro-armed` on `<html>` before the first paint, and
 * CSS paints the midnight curtain from that class alone. This component then mounts on top of the
 * same colour, so there is nothing to see in between.
 *
 * That script also arms a failsafe timer which clears the class regardless of what React does. If
 * this bundle never arrives, or throws, the curtain still lifts and the homepage is there — the
 * animation can fail without taking the site with it.
 *
 * ## Why there is no state here
 *
 * That same class is the single source of truth for whether the intro is running, and it lives in
 * the DOM rather than in React. `useSyncExternalStore` is the supported way to read such a value:
 * it returns `false` during server render and hydration, then the real value, so there is no
 * mismatch to suppress — and removing the class is all it takes to end the intro. Mirroring the
 * class into component state would mean two sources of truth that could disagree, and a
 * `setState` inside an effect, which React's compiler rules rightly reject.
 *
 * ## What decides whether it plays
 *
 * The script, not this component: homepage only, once per session, never under reduced motion,
 * and never when `NEXT_PUBLIC_SHOW_INTRO=false`. Keeping that decision in one place is what stops
 * the two disagreeing.
 */

const ARMED_CLASS = 'vastrix-intro-armed';

/** Re-reads the class whenever anything changes it — including this component itself. */
function subscribeToArmed(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

const isArmed = () => document.documentElement.classList.contains(ARMED_CLASS);
/** Never armed on the server: there is no `<html>` class to read, and no animation to run. */
const notArmedOnServer = () => false;

export function VastrixIntroStage() {
  const playing = useSyncExternalStore(subscribeToArmed, isArmed, notArmedOnServer);

  const finish = useCallback(() => {
    document.documentElement.classList.remove(ARMED_CLASS);
  }, []);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setTimeout(finish, INTRO_TOTAL_MS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKeyDown);

    // Released on unmount as well as on completion, so a visitor who navigates away mid-intro
    // leaves no timer and no listener behind.
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [playing, finish]);

  const wordmark = phase('wordmark');
  const tagline = phase('tagline');

  return (
    <AnimatePresence>
      {playing ? (
        <motion.div
          key="vastrix-intro"
          // A stable hook for the end-to-end tests, which should not depend on utility classes.
          data-vastrix-intro=""
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: EXIT_DURATION_S, ease: [0.4, 0, 0.2, 1] }}
          // The visuals are decorative and repeat what the page already says. The skip button is
          // the one thing here that assistive technology needs, and it labels itself.
          role="presentation"
        >
          <AmbientBackground />

          <div
            className="relative flex flex-col items-center px-6"
            style={
              {
                // One width drives the whole lockup. The wordmark is the wider of the two, so it
                // is what the viewport has to accommodate; the mark and the gap follow from the
                // ratios measured off the supplied artwork.
                '--vastrix-lockup': 'min(86vw, 39rem)',
                '--vastrix-mark': `calc(var(--vastrix-lockup) / ${LOCKUP.wordmarkToMark})`,
              } as React.CSSProperties
            }
          >
            <VastrixLogoReveal />

            <motion.div
              style={{ marginTop: `calc(var(--vastrix-mark) * ${LOCKUP.gapToMark})` }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...wordmark, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={brandAssets.wordmarkLight}
                alt=""
                width={633}
                height={69}
                priority
                className="h-auto"
                style={{ width: 'var(--vastrix-lockup)' }}
              />
            </motion.div>

            <motion.p
              className="mt-[clamp(1rem,2.4vw,1.75rem)] text-center text-[clamp(0.75rem,2.2vw,0.95rem)] font-medium tracking-[0.22em] text-neutral-300 uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...tagline, ease: [0.22, 1, 0.36, 1] }}
            >
              {siteConfig.tagline}
            </motion.p>
          </div>

          <SkipIntro onSkip={finish} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
