# ADR-009 — No third-party analytics

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §11 (self-hostable stack), §23.2, instruction §32

## Context

Marketing sites conventionally carry an analytics tag. Nothing in the supplied specification or
catalogue asks for one, and no measurement requirement has been stated.

Adding one is not a neutral default. A third-party script means:

- an external origin in `script-src`, which materially weakens the Content Security Policy
- visitor data leaving infrastructure we control, on a site that markets self-hosting
- a cookie consent obligation, and a banner, for a capability nobody has asked for
- a render-blocking or layout-affecting request on every page load

## Decision

Ship no analytics, no tag manager, no advertising pixel and no social tracking script.

This is enforced technically, not by convention: `script-src` in the Content Security Policy lists
no external origin, and `connect-src 'self'` means an injected script could not exfiltrate to one
either. The cookie notice says plainly that there is nothing to consent to, and the site therefore
displays no consent banner.

## Alternatives considered

**Google Analytics** — rejected. It is the single largest weakening of the CSP available, and it is
poorly aligned with a company whose positioning is self-hosted, open-source technology.

**Plausible or Umami, self-hosted** — genuinely reasonable, and the recommended option *if a
measurement requirement appears*. Not adopted now because there is no stated requirement, and
because it is another service to operate, secure and back up.

**Server-side analysis of Nginx access logs** — already available. The logs are structured JSON and
shipped to Loki, so page-view counts and referrer breakdowns can be queried in Grafana without
adding anything to the browser. This covers most of what a marketing team actually asks for.

## Consequences

**Good.** Strict CSP. No consent banner. Faster pages. Nothing to disclose in the privacy policy
beyond what the web server records anyway. The claim "no tracking" in the cookie notice is
literally true and verifiable by viewing source.

**Costs.** No client-side behavioural data: no scroll depth, no funnel analysis, no
session recordings. If the marketing function later needs that, it is a real gap.

## If this is revisited

The recommendation, in order of preference:

1. **Loki queries over Nginx logs** — no new service, no client-side code, no consent question.
2. **Self-hosted Plausible or Umami** — cookieless by design, so likely still no consent banner;
   add its origin to `script-src` and `connect-src`, update the cookie notice, and record the
   change here.
3. A third-party SaaS analytics product — would contradict ADR-007 and needs a separate decision.
