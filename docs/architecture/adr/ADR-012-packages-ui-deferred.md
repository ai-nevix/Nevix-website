# ADR-012 — `packages/ui` deferred

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §26 (repository structure), instruction §58
**Deviation:** Yes — a named directory in the suggested structure is not populated.

## Context

The suggested monorepo structure lists three shared packages:

```
packages/
    ui/
    types/
    config/
```

`types` and `config` have real consumers today. `ui` would have exactly one: `apps/web`.

## Decision

Create and use `packages/types` and `packages/config`. Do not populate `packages/ui`; UI
components live in `apps/web/components` until a second consumer exists.

| Package | Status | Consumers | Why |
| --- | --- | --- | --- |
| `@nevix/types` | Populated | `apps/web`, mirrors `apps/api` schemas | A shared contract genuinely spanning two applications |
| `@nevix/config` | Populated | `apps/web` | Base TypeScript and ESLint config, ready for the next app |
| `packages/ui` | Deferred | — | One consumer |

## Reasoning

A shared UI package with one consumer is not shared — it is the same code with a build step, a
`transpilePackages` entry, an extra `package.json`, and an import path that is longer than the
relative one. It adds friction to every component change in exchange for an abstraction nothing
uses.

`packages/types` is different, and the distinction is the point. Its types describe the contract
between the Next.js app and the FastAPI service, so a breaking backend change surfaces as a
TypeScript error at build time rather than as a runtime failure in a visitor's browser. That is
value delivered today.

## Alternatives considered

**Populate `packages/ui` now** — matches the suggested structure literally. Rejected: it optimises
for a second frontend that may never exist, at a cost paid on every component edit until then.

**Create an empty `packages/ui` with a README** — considered, and rejected as worse than nothing.
An empty directory invites someone to fill it without the decision being made.

## When to create it

When a second consumer appears. The realistic candidates, from specification §32:

- the **client portal** (stage 3) — would share buttons, forms, cards, layout primitives
- a **SaaS product UI** (stage 5)
- a Strapi admin customisation using the NEVIX design language

At that point the move is mechanical: `apps/web/components/ui/*` are already dependency-free
primitives built on Radix and the design tokens, with no imports from `content/` or `lib/cms`. They
were written that way deliberately so this decision stays cheap to reverse.

## Consequences

**Good.** Component changes are a single-file edit. No build step, no workspace linking, no
`transpilePackages` entry for UI.

**Costs.** The repository does not literally match the suggested structure. That is why this ADR
exists — so the absence reads as a decision rather than an oversight.
