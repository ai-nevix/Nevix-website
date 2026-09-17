# ADR-001 — Next.js App Router for the website

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §11 (technical stack), §13 (frontend), §23 (performance, SEO)

## Context

The website must be fast, SEO-complete, accessible, CMS-integrated and self-hostable. The
specification names Next.js + React + TypeScript in the stack table, so the question is not
whether to use it but how.

The site is content-heavy and interaction-light: roughly 116 routes, of which only the contact
form and the navigation need client-side JavaScript at all.

## Decision

Next.js 16 with the App Router, React Server Components by default, static generation with ISR for
content routes, and `output: 'standalone'` for the container image.

Client components are opted into, not assumed. At the time of writing, the entire site ships
client JavaScript for exactly three things: the header scroll state, the mobile navigation panel
and the contact form.

## Alternatives considered

**Astro** — arguably a better fit for a content site, and would ship even less JavaScript. Not
chosen because the specification names Next.js, because the contact form and future client portal
benefit from a full React application model, and because deviating from a named stack choice needs
a stronger reason than a marginal bundle-size improvement.

**Plain React SPA** — rejected outright. Client-side rendering for a marketing site is bad for SEO
and bad for first paint, and specification §23.1 explicitly asks for static/server rendering.

**Static site generator with no server** — would not support the contact form, ISR from a CMS, or
the future portal without bolting on a second system.

## Consequences

**Good.** 116 routes prerendered at build time; the server does almost no work per request. SEO
metadata, sitemap, robots and structured data are first-class. One framework covers the marketing
site now and the authenticated portal later.

**Costs.** The App Router's caching semantics are subtle and have changed between versions —
`revalidate` values are set explicitly per route rather than relied on by default. Server
Components mean a component cannot be moved between server and client without thought, which is a
constraint contributors have to learn.

**A consequence we hit:** prerendering interacts badly with nonce-based CSP. The nonce must be
per-request while the HTML is generated once, so the two can never match. This is documented in
[ADR-010](./ADR-010-csp-unsafe-inline.md) and was verified, not assumed.

## Revisit when

The site becomes predominantly an application rather than a content site, or if Next.js's caching
model changes in a way that makes the ISR strategy unworkable.
