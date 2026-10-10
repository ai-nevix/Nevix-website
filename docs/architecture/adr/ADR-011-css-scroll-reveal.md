# ADR-011 — CSS scroll-driven reveals instead of JavaScript

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §4.1 (motion), §23.1 (minimal client JavaScript), §23.3 (reduced motion)
**Found by:** Visual verification during the build.

## Context

Section reveal animations were first implemented with Framer Motion's `whileInView`. The pattern is
conventional and looked correct in a browser.

A full-page screenshot showed otherwise: **every section below the fold was blank.** The pillar
cards, the solutions grid, the industries grid, the case studies, the products and the insights
were all missing.

The cause is how `whileInView` works. Framer Motion server-renders the element with
`style="opacity:0"` and only reveals it after the client bundle has hydrated and an
IntersectionObserver has fired. Anything that does not run that JavaScript sees an empty page:

- a visitor with JavaScript disabled or blocked
- a visitor on a slow connection, until hydration completes
- a crawler that does not execute scripts
- any tool that captures the page outside the viewport

That is a correctness problem, not a styling preference. The earlier implementation's own comment
claimed "content is always present in the DOM" — which was true of the DOM and false of what a
visitor could see.

## Decision

Reveals are implemented as **server components emitting plain markup**, animated purely with CSS
scroll-driven animations:

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: nevix-reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% cover calc(16% + (var(--reveal-step, 0) * 3%));
    }
  }
}
```

The critical property is the ordering: **the default state of every element is fully visible.** The
animation is layered on top, and only where the browser supports `animation-timeline` *and* the
visitor has not requested reduced motion. A browser without support renders the content in its
final state. There is no state in which the content is invisible.

`Reveal`, `Stagger` and `StaggerItem` keep the same API, so no page needed rewriting.

## Framer Motion is still used

The specification names Framer Motion in the stack, and it earns its place where motion has to
coordinate with mounting and unmounting — the mobile navigation panel, and the contact form's
transition to its success state. Scroll reveals are not that case: they are one-way, and CSS does
them with zero JavaScript.

## Alternatives considered

**Keep Framer Motion, start at `opacity: 1` and animate from a class added on mount.** Fixes the
invisibility but produces a flash of un-animated content, and still ships the JavaScript.

**Hand-rolled IntersectionObserver adding a class.** Same defect as before — content invisible
until the script runs — unless the default is visible, at which point CSS alone is sufficient.

**Drop reveals entirely.** Viable, and better than shipping broken ones, but the specification asks
for subtle purposeful motion and the CSS approach delivers it for free.

## Consequences

**Good.** Content is visible without JavaScript, always. Roughly 40 KB of client bundle removed
from every page that had a reveal. Reduced motion is honoured at the CSS layer, where it cannot be
lost to a hydration race. Server components, so nothing is sent to the browser at all.

**Costs.** `animation-timeline: view()` is not universally supported. In an unsupporting browser
the content simply appears without animation, which is the correct fallback. The stagger effect
uses `sibling-index()` where available and falls back to a uniform range otherwise.

## The general lesson

This was found by taking a full-page screenshot and looking at it, not by a passing test. Visual
verification catches a class of defect that unit tests and type checking cannot.
