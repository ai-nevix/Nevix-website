# ADR-004 — Self-hosted Strapi Community Edition

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §11, §15 (CMS)

## Context

Non-developers must be able to publish insights, update service copy and manage case studies
without a code change or a deployment (specification §3: "no code change for routine publishing").
The specification names Strapi Community Edition.

## Decision

Self-hosted Strapi CE, with eleven content types generated from the specification's data model and
six shared components.

The frontend reads through a provider abstraction rather than calling Strapi directly — see
[ADR-006](./ADR-006-content-provider-abstraction.md), which is what makes the CMS optional rather
than a hard dependency.

## Alternatives considered

**A headless SaaS CMS** (Contentful, Sanity) — better editor experience and no operational burden.
Rejected because specification §11 requires a self-hostable stack, and because content is the
asset least acceptable to hold in someone else's system.

**Markdown files in the repository** — simplest possible option, and what the local content
provider effectively is. Rejected as the primary mechanism because it requires a pull request to
fix a typo, which is exactly what the CMS requirement exists to avoid.

**Building a custom CMS** — weeks of work to produce something worse than Strapi.

## Consequences

**Good.** Editors get draft/publish, media management, roles and a REST API without custom code.
Content models are version-controlled as JSON schemas, so the model is reviewable in a pull request
even though the content is not.

**Costs.** Strapi is a substantial Node application to operate: it has its own database, its own
upgrade path, and a build step that needs meaningful memory. Its admin panel is a privileged
interface and is noted in the Nginx configuration as needing an IP allow-list before public
exposure.

**Operational requirement.** The token the website uses must be **read-only**. A full-access token
in the frontend environment would let a frontend bug — or anyone who reads the environment —
modify published content. The seed script uses a separate write token that is meant to be revoked
immediately afterwards.

## Revisit when

Strapi's operational cost exceeds its editorial value, or the editorial team turns out to prefer
editing Markdown in Git after all.
