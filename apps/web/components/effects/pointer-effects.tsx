'use client';

import { useEffect } from 'react';

/**
 * The one listener behind every interactive light on the site.
 *
 * Two jobs, both written as CSS custom properties so the visuals themselves stay pure CSS:
 *
 * 1. **On-screen state.** Light sections (`[data-spotlight]`) get `data-inview` while visible, which
 *    is what lets their aurora drift. Off-screen sections hold still, so a long page is not
 *    animating a dozen layers nobody can see.
 * 2. **The pointer.** The section under the cursor gets `--spot-x`/`--spot-y` and `data-spot-active`
 *    (its spotlight); the interactive card under it gets `--glow-x`/`--glow-y` and a few degrees of
 *    `--tilt-x`/`--tilt-y`.
 *
 * Why one listener on the document rather than a component per card: there are dozens of cards
 * and sections, and a handler each would mean dozens of listeners and React re-renders for what is
 * only ever one pointer. Here pointer events are coalesced to one update per animation frame, the
 * element under the pointer is looked up once, and React never re-renders.
 *
 * Who gets what: visitors who ask for reduced motion get none of it — no drift, no tilt, no
 * spotlight. Touch and pen users get the drift but not the pointer effects, which would only
 * flicker under a finger. Without JavaScript the page is the same, just still.
 */

/** Maximum card tilt, in degrees. Enough to feel the card respond; not enough to read as a gimmick. */
const MAX_TILT = 5;

export function PointerEffects() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // --- 1. On-screen state ------------------------------------------------------------------
    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute('data-inview', entry.isIntersecting);
        }
      },
      { rootMargin: '120px 0px' },
    );

    // Client-side navigation swaps sections in and out, so the observed set is reconciled with the
    // document whenever its structure changes, rather than read once.
    const observed = new Set<Element>();
    const reconcile = () => {
      for (const section of observed) {
        if (!section.isConnected) {
          visibility.unobserve(section);
          observed.delete(section);
        }
      }
      document.querySelectorAll('[data-spotlight]').forEach((section) => {
        if (observed.has(section)) return;
        observed.add(section);
        visibility.observe(section);
      });
    };
    reconcile();
    const structure = new MutationObserver(reconcile);
    structure.observe(document.body, { childList: true, subtree: true });

    const cleanups: Array<() => void> = [
      () => visibility.disconnect(),
      () => structure.disconnect(),
    ];

    // --- 2. The pointer ------------------------------------------------------------------------
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let frame = 0;
      let pointer: { x: number; y: number } | null = null;
      let zone: HTMLElement | null = null;
      let card: HTMLElement | null = null;

      const releaseCard = () => {
        if (!card) return;
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
        card = null;
      };

      const releaseZone = () => {
        zone?.removeAttribute('data-spot-active');
        zone = null;
      };

      const update = () => {
        frame = 0;
        if (!pointer) return;

        // Looked up from coordinates rather than the event target, so a scroll without any pointer
        // movement still lights whatever is now under the cursor.
        const under = document.elementFromPoint(pointer.x, pointer.y);

        const nextZone = under?.closest<HTMLElement>('[data-spotlight]') ?? null;
        if (nextZone !== zone) {
          releaseZone();
          zone = nextZone;
          zone?.setAttribute('data-spot-active', '');
        }
        if (zone) {
          const box = zone.getBoundingClientRect();
          zone.style.setProperty('--spot-x', `${pointer.x - box.left}px`);
          zone.style.setProperty('--spot-y', `${pointer.y - box.top}px`);
        }

        const nextCard = under?.closest<HTMLElement>('.card-interactive') ?? null;
        if (nextCard !== card) {
          releaseCard();
          card = nextCard;
        }
        if (card) {
          const box = card.getBoundingClientRect();
          const x = (pointer.x - box.left) / box.width;
          const y = (pointer.y - box.top) / box.height;
          card.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
          card.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
          card.style.setProperty('--tilt-y', `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
          card.style.setProperty('--tilt-x', `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
        }
      };

      const schedule = () => {
        if (!frame) frame = window.requestAnimationFrame(update);
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        pointer = { x: event.clientX, y: event.clientY };
        schedule();
      };

      const onLeave = () => {
        pointer = null;
        releaseZone();
        releaseCard();
      };

      document.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('scroll', schedule, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);

      cleanups.push(() => {
        document.removeEventListener('pointermove', onMove);
        window.removeEventListener('scroll', schedule);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        if (frame) window.cancelAnimationFrame(frame);
        onLeave();
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
