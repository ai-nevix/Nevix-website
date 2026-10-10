# ADR-013 — The welcome intro is CSS-armed, React-animated, and self-cancelling

**Status:** Accepted
**Date:** 2026-09-22

## Context

The brief asks for a cinematic logo reveal on arrival: the emblem drawing itself from light, a
sweep across it, then the wordmark and tagline, in 2.5–4 seconds. It must play once per session,
be skippable, honour reduced motion, cost nothing in SEO terms, and never block the site.

Three things made the obvious implementation wrong.

**A client component cannot render before hydration.** An overlay that lived only in React paints
the homepage first and covers it a moment later — a visible flash on every first visit, on exactly
the page we are trying to make feel considered.

**The supplied logo is a raster with a white matte.** Every supplied asset carrying transparency
was flattened onto white: the antialiased edge kept white in its colour channel, and the outermost
ring of *fully opaque* pixels is a blend of stroke colour and white — `#a2d3f6` where the stroke is
`#0086f9`. On a light background none of this shows. On the brand midnight, enlarged to 400px, it
rings every stroke with a pale outline.

**An outline reveal needs paths.** No amount of clipping a bitmap will draw a contour in light.

## Decision

**Arm with CSS, animate with React.** An inline script in `app/layout.tsx` sets
`vastrix-intro-armed` on `<html>` before the first paint; CSS paints the midnight curtain from that
class alone. `VastrixIntro` then mounts on top of the same colour. Nothing is visible in between,
and there is no hydration mismatch because the curtain is not React's.

That class is also the single source of truth for whether the intro is running.
`useSyncExternalStore` reads it, and removing it ends the intro — so there is no component state
to fall out of step with it, and no `setState` in an effect.

**The script decides, the component animates.** Homepage only, once per session, never under
reduced motion, never when `NEXT_PUBLIC_SHOW_INTRO=false`. One place, so the conditions cannot
disagree.

**Outlines are vector, the logo is not.** The stroke contours were measured from the artwork and
are used for the drawing phase; they are gone before the logo is legible. The filled state is the
supplied artwork, each stroke shown through a clip polygon verified to cover it exactly.

**The matte is repaired in a derived asset**, never in the supplied file, by
`scripts/derive-brand-assets.mjs`. Colour is bled outward from the solid artwork, and the pale
boundary ring is replaced from the pixel inside it — detected by smallest channel, so saturated
brand cyans are left alone and white dilution is not. Shape, proportion and gradient are untouched.

**A failsafe timer in the arming script clears the curtain regardless of React.**

## Consequences

**Good.** No flash, no hydration warning, no layout shift. The page is fully prerendered and the
overlay is painted over content that is already in the HTML, so crawlers are unaffected. If the
bundle never arrives or throws, the failsafe still hands the page back. Skip is a real button, in
the tab order, and Escape does the same. Reduced motion gets no overlay at all rather than a
0.01ms flash of one.

**The cost.** Two derived assets now exist alongside the supplied ones, and the derivation is a
build step someone has to know about — `--check` in CI covers that. The intro's own geometry is
measured data in `lib/brand/mark-geometry.ts`, which must be re-derived if the logo is ever
reissued; the invariants it must satisfy are recorded there.

**Rejected: locking the page scroll during the intro.** `overflow: hidden` on the scroll container
disables `animation-timeline: view()`, which drives every scroll reveal on the site (ADR-011). It
froze that content part-way through its reveal for the duration of the intro — invisible behind the
curtain, but an accessibility audit reads those elements at their part-faded colour and fails them
on contrast. A stray scroll during three seconds is the cheaper problem.

**Rejected: tracing the whole logo to SVG.** It was built and measured — 97.1% shape agreement and
a mean colour error of 13.8/255 against the original. Good, but strictly worse than showing the
artwork itself, and it would have meant shipping a redrawn logo.
