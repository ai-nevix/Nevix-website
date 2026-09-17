# ADR-010 — `script-src 'unsafe-inline'` with compensating controls

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §22 ("CSP ... as appropriate"), §13, §23.1; instruction §32
**Security-relevant:** Yes. Read this before changing the CSP.

## Context

The intended policy was `script-src 'self'` with a per-request nonce — the strongest practical
configuration. That failed, and the reason matters.

Next.js App Router emits inline `<script>` tags in the rendered HTML for its bootstrap and for the
React Server Component payload. A nonce can cover them only if the nonce in the HTML matches the
nonce in the response header. On a statically prerendered page it cannot: the HTML is generated
once at build time, the header is generated per request.

**This was verified, not assumed.** A nonce-emitting middleware was added, the site was built, and
the result inspected:

```
$ curl -D- http://localhost:3101/about
content-security-policy: script-src 'self' 'nonce-MzA1OTIy...' 'strict-dynamic'

$ grep -o 'nonce="[^"]*"' page.html
(no matches)
```

The header carried a fresh nonce; the prerendered HTML carried none. Every inline script would
have been blocked — which is what the browser console showed before the middleware was removed:
seven CSP violations per page and no working hydration.

The only way to make nonces work is to render every page dynamically. That would contradict the
rendering strategy the specification mandates (§13 lists Static/ISR for every content route, §23.1
asks for static/server rendering and minimal client JavaScript) and would give up the prerendering
that makes the site fast.

## Decision

`script-src 'self' 'unsafe-inline'`, with the rest of the policy kept as tight as possible, and the
residual risk constrained by other directives rather than accepted openly.

Defined once in `apps/web/lib/security-headers.mjs` so the Next.js layer and the Nginx layer cannot
drift apart.

## Compensating controls

`'unsafe-inline'` means an attacker who achieves HTML injection can execute script. The rest of the
policy is built to make that as useless as possible:

| Control | Effect |
| --- | --- |
| `connect-src 'self'` | An injected script **cannot exfiltrate** to an external host — no fetch, no XHR, no WebSocket, no beacon. |
| `script-src` lists no external origin | No third-party script can be loaded at all, so no tag manager or CDN to abuse. |
| `form-action 'self'` | A form cannot be repointed at an attacker's origin. |
| `object-src 'none'` | No plugin-based execution. |
| `base-uri 'self'` | `<base>` injection cannot redirect relative script URLs. |
| `frame-ancestors 'none'` | No clickjacking. |
| `img-src 'self' data: blob:` | Removes the classic image-beacon exfiltration channel. |
| No user-generated HTML is rendered | React escapes all interpolated content by default. |
| One `dangerouslySetInnerHTML` in the codebase | `components/seo/json-ld.tsx`, which escapes `<` before serialising — the standard inline-JSON-LD XSS vector. |
| Markdown renderer emits React elements, never HTML | A `<script>` in a CMS article body renders as literal text. See `components/sections/markdown.tsx`. |

The realistic attack that `'unsafe-inline'` enables is defacement or in-page phishing. Data
exfiltration, the outcome that usually matters, is blocked by `connect-src`.

## Alternatives considered

**Render everything dynamically and use nonces.** The only way to get a strict policy. Rejected:
it trades the site's performance characteristics and contradicts an explicit specification
requirement, to close a vector that the remaining directives already constrain heavily.

**Hash-based CSP.** Not viable — the inline script contents differ per page and per build, so the
hash set would have to be computed per route and emitted as a per-route header.

**Accept the CSP violations and ship a broken site.** Not a real option; hydration failure breaks
the mobile menu and the contact form.

## Consequences

The site scores lower on an automated CSP grader than a nonce-based policy would. That is a known
and deliberate trade, recorded here so a future reviewer finds the reasoning rather than
re-discovering the problem.

## Revisit when

- Next.js supports build-time nonce placeholders, or per-route hash emission
- The site moves to dynamic rendering for another reason, at which point nonces become free
- Any requirement appears to render user-supplied HTML — that changes the risk calculation
  materially and this decision should be re-opened immediately
