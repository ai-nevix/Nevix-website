# ADR-013 — The welcome intro is CSS-armed, React-animated, and self-cancelling

**Status:** Accepted
**Date:** 2026-09-22
**Amended:** 2026-10-10 — the reveal rebuilt for the NEVIX N ([ADR-014](./ADR-014-nevix-rebrand.md)).
Arming, the curtain, the failsafe, reduced motion, skipping and lazy loading are unchanged.

## Context

The brief asks for a cinematic logo reveal on arrival: the emblem drawing itself from light, a
sweep across it, then the wordmark and tagline, in 2.5–4 seconds. It must play once per session,
be skippable, honour reduced motion, cost nothing in SEO terms, and never block the site.

Three things made the obvious implementation wrong.

**A client component cannot render before hydration.** An overlay that lived only in React paints
the homepage first and covers it a moment later — a visible flash on every first visit, on exactly
the page we are trying to make feel considered.

**The supplied logo is a raster on a flat background.** The primary lockup is flattened onto white,
so its antialiased edge is a blend of stroke colour and white. On a light background none of this
shows. On the brand midnight, enlarged to 400px, a naive cut-out rings every stroke with a pale
outline.

**A written reveal needs paths.** Fading or scaling a bitmap makes it appear; it does not make it
look written. The reveal has to follow the strokes, in the order a hand would make them.

## Decision

**Arm with CSS, animate with React.** An inline script in `app/layout.tsx` sets
`nevix-intro-armed` on `<html>` before the first paint; CSS paints the midnight curtain from that
class alone. `NevixIntro` then mounts on top of the same colour. Nothing is visible in between,
and there is no hydration mismatch because the curtain is not React's.

That class is also the single source of truth for whether the intro is running.
`useSyncExternalStore` reads it, and removing it ends the intro — so there is no component state
to fall out of step with it, and no `setState` in an effect.

**The script decides, the component animates.** Homepage only, once per session, never under
reduced motion, never when `NEXT_PUBLIC_SHOW_INTRO=false`. One place, so the conditions cannot
disagree.

**The N is written with a mask; the logo is never redrawn.** The N is three strokes — a left
stroke, a rounded diagonal, and a right stroke the diagonal folds into. `lib/brand/mark-geometry.ts`
holds the centre line of each, measured from the derived `nevix-mark.png`. The intro draws a broad
SVG mask along each line in writing order — up the left stroke, down the diagonal, up the right
stroke — over the supplied artwork, with a point of light leading each stroke. What fills in is the
PNG, uncovered; the light follows the same lines and is gone before the logo is fully legible. The
left stroke's mask is confined to the region below the gap it shares with the diagonal, which would
otherwise be uncovered early. Then a light sweep crosses the N, masked by the artwork's own alpha so
it travels across the strokes rather than a rectangle; the wordmark and the tagline follow — about
3.6s in all.

**The lockup is measured, not judged by eye.** The mark and the wordmark are sized from ratios taken
from the supplied vertical lockup, `nevix-verticallogo.png`: wordmark width ÷ mark width 1.729, gap ÷
mark width 0.124. The intro reproduces the official lockup rather than approximating it.

**The background is removed in a derived asset**, never in the supplied file, by
`scripts/derive-brand-assets.mjs`. It un-composites the edge rather than keying it out — each edge
pixel's colour comes from the artwork beside it and its coverage from how far it sits between that
colour and the background — so the N has no halo on midnight or on white (ADR-014). Shape,
proportion and gradient are untouched.

**A failsafe timer in the arming script clears the curtain regardless of React.**

## Consequences

**Good.** No flash, no hydration warning, no layout shift. The page is fully prerendered and the
overlay is painted over content that is already in the HTML, so crawlers are unaffected. If the
bundle never arrives or throws, the failsafe still hands the page back. Skip is a real button, in
the tab order, and Escape does the same. Reduced motion gets no overlay at all rather than a
0.01ms flash of one.

**The cost.** Derived assets exist alongside the supplied ones, and the derivation is a build step
someone has to know about — `npm run brand:check` in CI covers that. The intro's own geometry —
stroke centre lines, mask widths and lockup ratios — is measured data in
`lib/brand/mark-geometry.ts`, which must be re-measured if the logo is ever reissued; what it was
measured from is recorded there.

**Superseded: outline contours and per-stroke clip polygons.** The first version of this intro was
built for the previous mark, three letterforms side by side. It drew each stroke's measured contour
in light, then showed the filled artwork through a clip polygon per stroke. The N is one letter made
in one movement, so the reveal now follows the pen along each stroke's centre line instead of
filling shapes.

**Rejected: locking the page scroll during the intro.** `overflow: hidden` on the scroll container
disables `animation-timeline: view()`, which drives every scroll reveal on the site (ADR-011). It
froze that content part-way through its reveal for the duration of the intro — invisible behind the
curtain, but an accessibility audit reads those elements at their part-faded colour and fails them
on contrast. A stray scroll during three seconds is the cheaper problem.

**Rejected: tracing the whole logo to SVG.** For the previous mark it was built and measured — 97.1%
shape agreement and a mean colour error of 13.8/255 against the original. Good, but strictly worse
than showing the artwork itself, and it would have meant shipping a redrawn logo. The same holds for
the N.
