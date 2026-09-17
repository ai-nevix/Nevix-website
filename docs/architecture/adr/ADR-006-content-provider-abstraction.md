# ADR-006 — Content provider abstraction with a local default

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §13 (rendering from CMS), §30 (CMS layer), instruction §30
**Deviation:** Yes — this records a departure from the literal reading of the instruction.

## Context

The specification has content pages rendered with ISR from Strapi (§13) and requires a clean CMS
abstraction rather than scattered fetch calls (§30). Instruction §30 says the same.

Taken literally, that makes Strapi a build-time dependency of the website: `next build` would have
to reach a running, populated CMS to generate any content page. That has three consequences worth
naming:

1. **The build cannot run in isolation.** CI, a new contributor's laptop, and a Docker build all
   need a reachable CMS with the right content in it.
2. **A CMS outage becomes a deployment outage.** Not just stale content — no build at all.
3. **There is nothing to launch with.** The site cannot be deployed until someone has manually
   entered 35 services, 10 solutions, 6 industries and the rest into an admin panel.

The third point is the practical one. All of that content already exists, written from the
catalogue, in this repository.

## Decision

Introduce a `ContentProvider` interface (`apps/web/lib/cms/types.ts`) with two implementations:

- **`local`** (default) — serves the typed content in `apps/web/content/`
- **`strapi`** — reads from a running Strapi instance

Selected by the `CONTENT_PROVIDER` environment variable. Every component reads through
`lib/cms/index.ts` and never knows which is active.

`apps/cms/scripts/seed.mjs` pushes the local content into Strapi, so switching providers produces
an identical site rather than an empty one.

## Why this is the smallest change that preserves the intent

The instruction's requirement is a clean CMS abstraction with typed responses and handled error
states. That is exactly what is built — the abstraction is *more* rigorous than a direct
integration, because it has two implementations and therefore cannot leak Strapi's response shape
into components.

What changes is only the default. Strapi remains fully implemented, fully configured, and one
environment variable away.

## Alternatives considered

**Strapi-only, as written.** Rejected for the reasons above — principally that it makes the site
undeployable until content entry is finished.

**Local-only, drop Strapi.** Rejected: it fails the specification's stated goal of routine
publishing without a code change (§3).

**Build-time export from Strapi into committed files.** A reasonable middle ground, but it adds a
generation step to the pipeline and makes "what is published" depend on when the export last ran.

## Consequences

**Good.** The site builds and deploys with no external dependency. CI needs no CMS. The Strapi
integration is exercised by the same interface the local provider satisfies, so a provider bug
shows up as a type error rather than a runtime surprise. Migration is a configuration change plus
one seed run.

**Costs.** Two implementations to keep aligned. Mitigated by the shared interface and by the
domain types in `packages/types` — a field added to a content type that the Strapi provider does
not return is a compile error.

**Risk if misconfigured.** Setting `CONTENT_PROVIDER=strapi` while Strapi is empty produces a site
with no content. `STRAPI_FALLBACK_TO_LOCAL=true` exists for deployments that would rather degrade
than fail, and is **off by default**: silently serving different content than the CMS holds is a
worse failure than an honest error, because nobody notices it.

## Revisit when

Content is being edited primarily in Strapi and the local files have become stale. At that point
the local provider should be reduced to a fallback, or removed and replaced by a committed export.
