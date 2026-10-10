# NEVIX Dummy / Demo Data Governance

NEVIX is a new company and the supplied source material does not contain verified client work,
product data, team biographies, testimonials, legal entity details or contact details.

The specification (§2, §31) and the build instruction (§33, §34) both forbid fabricating that
information. This directory is the control system that keeps the site honest.

## The rules

1. **Nothing is disguised.** Demo content is visibly labelled in the UI — "Demo Case Study",
   "Illustrative Example", "Coming Soon", "Placeholder" — never presented as fact.
2. **Everything is registered.** Every placeholder has a `DD-nnn` identifier in
   [`registry.md`](./registry.md).
3. **Everything is marked in code.** The source carries a comment at the definition site:
   ```ts
   // DUMMY-DATA: DD-004
   // Demo case study. Replace with an approved NEVIX case study before launch.
   ```
4. **Nothing forbidden is invented.** No government approvals, empanelments, certifications,
   client names, client logos, revenue, headcount, partnerships, testimonials, ROI figures or
   performance statistics appear anywhere on the site — not even as placeholders.
5. **Launch is gated.** [`replacement-checklist.md`](./replacement-checklist.md) lists what must be
   replaced or removed before the site goes live on a public domain.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | This policy |
| `registry.md` | The authoritative register of every placeholder |
| `content.md` | The actual demo copy, with the reasoning behind each choice |
| `replacement-checklist.md` | Pre-launch gate |

## Verifying the registry

```bash
npm run audit:dummy-data
```

`scripts/audit-dummy-data.mjs` scans the repository for `DUMMY-DATA: DD-nnn` markers and
cross-checks them against `registry.md`. It fails if a marker has no registry entry, if a registry
entry claims a location that no longer contains a marker, or if an ID is duplicated. It runs in CI.
