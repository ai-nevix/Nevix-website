# ADR-014 — Rebrand to NEVIX: renamed repo-wide, redesigned from the new artwork

**Status:** Accepted
**Date:** 2026-10-10
**Specification reference:** §4 (brand and visual design system)
**Deviation:** Yes — the §4 palette and single typeface are replaced by tokens taken from the
reissued artwork.

## Context

On 2026-10-10 the company, formerly VASTRIX, was renamed NEVIX, and a new identity was supplied
with the name: an N mark built from three strokes and lit from electric blue to cyan, a wordmark
whose X carries the same light, and a set of finished pieces around them. Twelve files in
`brand-assets/nevix/` — primary lockup on white, lockup on midnight, vertical lockup, wordmark, app
icon, silver monochrome mark, a wall-sign photograph, two sunset workspace boards, two founder cards
and a round profile badge — plus a logo summary board, `brand-assets/logo-summary.png`.

A find-and-replace on the name was the easy part. Four things had to be decided rather than done:

**How far the rename goes.** The name was in visible copy, but also in package scopes, container and
image names, database defaults, Nginx and Prometheus filenames, the API's project name and the
domains. Renaming only what a visitor sees leaves two names in the system that every future
maintainer has to learn are the same thing.

**What the site looks like now.** The design system was built from the specification's §4 table —
blue `#2563EB`, cyan `#06B6D4`, midnight `#0A0F1C`, all text in Manrope. The new artwork is darker,
more saturated, and lit like a horizon at dusk. The old tokens sat beside it visibly mismatched.

**How to get usable logo files.** Every supplied logo is flattened onto a background — white for the
primary lockup and the silver mark, midnight for the light-on-dark wordmark. The site needs the mark
and the wordmark on transparency, clean on both its light and its dark surfaces.

**What to do with composed artwork.** The founder cards and boards carry their words as pixels, and
the two cards are different shapes. The sunset workspace board is the obvious homepage image, but it
carries its own logo and copy.

## Decision

**Rename everything, in one change.** Every text occurrence of the old name became NEVIX: copy and
metadata; workspace packages `@nevix/web`, `@nevix/types`, `@nevix/config`, `@nevix/cms`; the API
project `nevix-api`; Docker container and image names; database defaults (role and database `nevix`,
CMS database `nevix_cms`); `infra/nginx/conf.d/nevix.conf`; Prometheus rules `nevix-alerts.yml`;
the `nevix.ai` domains; the intro's storage key and CSS class. Three exceptions, each deliberate:

- **Social URLs.** The LinkedIn, GitHub and X links in `apps/web/content/site.ts` still point to the
  profiles registered under the former name, because no NEVIX profiles exist yet. They are tracked
  as DD-010 and replaced one by one as profiles are created. (The LinkedIn URL had lost its
  `https://` and rendered as a broken relative link; that was fixed in the same change.)
- **Source material.** The supplied briefs —
  `docs/source-material/VASTRIX_Website_Development_Master_Specification.docx` and
  `docs/source-material/VASTRIX_Detailed_Service_Catalogue_for_Website-1.docx` — and their committed
  plain-text extractions are kept exactly as supplied. They record what was asked for; editing them
  would rewrite that record.
- **This ADR**, which has to name what was renamed.

**Redesign dark-led, from the artwork.** The tokens in `apps/web/app/globals.css` are taken from the
new artwork, not from the specification's table:

| Token | Value | Used for |
| --- | --- | --- |
| Electric blue — `--color-nevix-blue` | `#0B5CFF` | Primary actions, links, highlights |
| Cyan — `--color-nevix-cyan` | `#00C8FF` | Light, glows, AI and future accents |
| Indigo — `--color-nevix-indigo` | `#1F2FD6` | Depth in gradients |
| Midnight — `--color-midnight` | `#050B1A` | The header on every page, heroes, dark sections, footer |
| Horizon — `--color-horizon` | `#FF9A4D` | Hairlines and glows only — never a fill, never text |
| Cloud — `--color-light` | `#F6F8FC` | Light sections |

The header is midnight on every page. The homepage hero sets **"Intelligence in Motion."** over the
sunset photograph, with the four pillars as a divided icon row beneath it; the tagline **"Explore.
Automate. Evolve."** stays. Inner page heroes carry a faint, large N. A *horizon line* — a hairline
running cyan → blue → amber — marks the edges of dark sections, and CTA sections show the glowing N.
The sunset tone is confined to hairlines and glows because that is how it appears in the
photography: as light at an edge, not as a surface.

**Sora for headings, Manrope for body.** Sora's geometric, slightly wide letterforms are the closest
open typeface to the wordmark. Manrope stays on body copy, where Sora's width would tire the eye.
Both are SIL Open Font License 1.1 and self-hosted by `next/font`, so `font-src 'self'` is
unchanged.

**Separate the logo by un-compositing, not by keying.** `scripts/derive-brand-assets.mjs` finds the
background by flood fill from the border, so pale artwork enclosed by strokes stays artwork. Each
edge pixel takes its colour C from the nearest interior pixel, and its coverage *a* follows from the
blend `P = a·C + (1 − a)·B` with the known background B. Colour is then bled into the transparent
pixels, so a resampler cannot drag the old background back along the edge. Outputs:
`nevix-mark.png` (450×551), `nevix-wordmark-dark.png` (navy, for light backgrounds),
`nevix-wordmark-light.png` (white, for midnight) and `nevix-mark-silver.png` (420×509, a
watermark). Favicon, Apple touch and PWA icons come from the supplied app icon.
`npm run brand:check` fails CI if any derived file no longer matches what the script would produce.

**Publish composed artwork whole.** Team cards are re-encoded as WebP without cropping and each is
framed at its own ratio — the CEO's card is 3:2, the co-founder's square — rather than forcing one
shape on both. As before, the founders' cards appear only on `/team`. Every other supplied piece is
published whole on a new `/brand` page, alongside the palette, the typefaces and download links for
the transparent logo files.

**The hero uses a logo-free region of the photograph.** `nevix-hero-horizon.webp` is the
landscape-only region of `nevix-google.png` (x 760–1672, y 165–941). The rest of that picture carries
its own logo and tag lines, which would put a second, unselectable copy of the message beneath the
page's real heading.

## Alternatives considered

**Rename visible text only; keep internal identifiers.** Cheaper on the day and touches no database.
Rejected: infrastructure names surface in logs, alerts and dashboards that people read, and before
launch there is no production data to migrate — the cost of renaming will never be lower. What
remains is one local development database, renamed with three commands documented in `Startup.md`.

**Keep the §4 palette and Manrope throughout.** Rejected. The specification's own instruction is to
treat the supplied logo and brand assets as the visual source of truth, and its table was derived
from the earlier artwork. Holding the table over the artwork it was meant to describe inverts that.

**Key out the background by a colour threshold.** The usual approach. Rejected: an antialiased edge
pixel is partly background, so a threshold either keeps it — a pale halo on midnight, a dark one on
white — or drops it, leaving a jagged edge. Un-compositing keeps the edge's smoothness and loses its
background.

**Crop the founder cards to a common grid.** Rejected, as before: they are designed compositions with
names and quotes set into them, and the two do not share a ratio.

**Use the whole workspace photograph as the hero.** Rejected: two headlines, one of them a picture.

## Consequences

**Good.** One name everywhere. The logo sits cleanly on light and dark with no halo. The site and the
supplied artwork read as one identity. Every derived file is reproducible and checked in CI; a
corrected original can be dropped into `brand-assets/nevix/` and regenerated with
`npm run brand:assets`.

**Costs.**

- A local database created before the rebrand no longer matches the API's default `DATABASE_URL`.
  `Startup.md` gives the one-time rename, or the old URL can be set explicitly.
- The pixel coordinates in the derive script (mark region, wordmark columns, hero region) and the
  stroke geometry in `lib/brand/mark-geometry.ts` are measured from these exact files. A reissued file
  with a different size or layout needs them re-measured.
- The social links carry the former name until they are replaced — a visible inconsistency, accepted
  knowingly and tracked as DD-010.
- The design now departs from the specification's §4 table. This record is why.
- The welcome intro was rebuilt for the N — see [ADR-013](./ADR-013-welcome-intro.md).

## Revisit when

- **NEVIX social profiles exist** — replace each URL in `siteConfig.social` and close DD-010.
- **A formal brand standard is issued** — its values replace these tokens and the palette on
  `/brand`.
- **Transparent or vector originals are supplied** — feed them to the derive script in place of the
  flattened files; the un-compositing step then has nothing to do.
- **The founder cards are reissued at one ratio** — per-card framing on `/team` can be simplified.
