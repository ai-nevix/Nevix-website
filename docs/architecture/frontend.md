# Frontend Architecture

`apps/web` — Next.js 16, App Router, React 19, TypeScript strict, Tailwind CSS 4.

> Specification §13 (frontend engineering), §23 (performance, SEO, accessibility), §26.1
> (structure).

## 1. Rendering strategy

| Route group | Mode | Revalidate | Why |
| --- | --- | --- | --- |
| `/` | Static + ISR | 1h | Content changes rarely; the largest page on the site |
| `/about`, `/team`, `/brand`, `/legal/*` | Static | — | Changes only on deploy |
| `/services`, `/services/[category]`, `/services/[category]/[service]` | SSG + ISR | 1h | 41 prerendered routes from `generateStaticParams` |
| `/solutions`, `/industries`, `/products`, `/case-studies`, `/insights` and details | SSG + ISR | 1h | Same |
| `/contact` | Static shell | — | The form is a client island inside a static page |
| `/search` | Dynamic | — | Depends on `?q=` |
| `/api/backend/*` | Dynamic route handler | — | Proxy to FastAPI |

**118 routes prerender at build time.** In production the server does almost no work for a page
view; Nginx serves `_next/static` from its own cache.

`dynamicParams = false` on every dynamic segment, so an unknown slug 404s at the routing layer
rather than triggering a runtime lookup.

## 2. Directory layout

```
apps/web/
├── app/
│   ├── (marketing)/          # route group sharing header + footer
│   │   ├── page.tsx          # homepage
│   │   ├── about/ team/ brand/ services/ solutions/ industries/
│   │   ├── products/ case-studies/ insights/ contact/ search/ legal/
│   │   └── layout.tsx        # skip link, header, <main>, footer
│   ├── api/backend/[...path] # same-origin proxy to FastAPI
│   ├── layout.tsx            # html/body, fonts, Organization + WebSite JSON-LD
│   ├── sitemap.ts robots.ts opengraph-image.tsx manifest.ts
│   ├── not-found.tsx error.tsx global-error.tsx
│   └── globals.css           # design tokens + component layer
├── components/
│   ├── layout/               # header, footer, logo, breadcrumbs, skip link
│   ├── branding/             # welcome intro (ADR-013), ambient background
│   ├── navigation/           # desktop mega-menu, mobile panel
│   ├── hero/ sections/ cards/ forms/ ui/ seo/
├── content/                  # typed content (see ADR-006)
├── lib/
│   ├── cms/                  # content provider abstraction
│   ├── api/                  # browser-side API client
│   ├── brand/                # intro timeline, measured N geometry and lockup ratios
│   ├── seo/                  # metadata builders, JSON-LD
│   ├── validation/           # zod schemas mirroring Pydantic
│   ├── env.ts                # validated environment, client/server split
│   ├── search.ts             # in-process content search
│   ├── security-headers.mjs  # shared with Nginx generation
│   └── utils.ts              # cn(), date and text helpers
└── tests/                    # vitest setup
```

## 3. Server and client boundary

Server Components are the default. Only these are client components, and each has a reason that
cannot be met on the server:

| Component | Why client |
| --- | --- |
| `layout/header.tsx` | Scroll position, which thickens the glass once light sections pass beneath |
| `effects/pointer-effects.tsx` | One document-level listener: section visibility (aurora drift) and the pointer (spotlight, card tilt) |
| `navigation/desktop-nav.tsx` | Radix NavigationMenu open/close state |
| `navigation/mobile-nav.tsx` | Radix Dialog focus trap and panel state |
| `forms/contact-form.tsx`, `forms/newsletter-form.tsx`, `sections/faq.tsx` | User input and disclosure state |

Everything else — every card, section, hero and page — renders on the server and ships no
JavaScript.

`lib/cms/index.ts` imports `server-only`, so importing content access from a client component is a
build error rather than a runtime secret leak.

## 4. Motion

Scroll reveals are **CSS scroll-driven animations on server-rendered markup**, not JavaScript.
Content is visible by default and the animation is layered on top only where supported and where
the visitor has not asked for reduced motion. The full reasoning, including the defect this
replaced, is in [ADR-011](./adr/ADR-011-css-scroll-reveal.md).

Framer Motion is retained for motion that has to coordinate with mounting and unmounting — the
mobile navigation panel and the contact form's success transition.

**Live light sections.** Every light `Section` (except reading-width `prose` ones, and any with
`ambient={false}`) renders a `LiveBackdrop`: two or three radial-gradient clouds of the brand blue
and cyan drifting slowly behind the content, a soft spotlight that follows the cursor, and a faint
dot lattice uncovered around it. The drift is CSS (`transform` only, compositor-friendly) and runs
only while the section is on screen; `components/effects/pointer-effects.tsx` sets `data-inview`
through an IntersectionObserver and writes the cursor position as CSS variables, coalesced to one
update per animation frame. The same listener gives `.card-interactive` cards a cursor-following
glow and up to 5° of tilt. Reduced-motion visitors get none of it, touch users get the drift but
no pointer effects, and without JavaScript the clouds hold still.

**Floating glass header.** The header is `fixed` and out of flow: a rounded pill of frosted midnight
glass (`backdrop-blur` + `backdrop-saturate`) inset from the viewport edges. Each page's opening
section carries `.hero-offset` (`padding-top: var(--header-height)`) so its background runs up
behind the glass while its content clears it. Every page — the 404 included — opens on midnight, so
the sheer top state always sits on a dark field; on scroll the glass thickens to keep white text
above AA contrast over light sections. Between 1024 and 1279px the header CTA is hidden so the full
navigation fits.

## 5. Design system

Tokens live in `app/globals.css` under Tailwind 4's `@theme`. Since the NEVIX rebrand they are
taken from the supplied artwork rather than the specification §4 table
([ADR-014](./adr/ADR-014-nevix-rebrand.md)):

| Token | Value | Used for |
| --- | --- | --- |
| `--color-nevix-blue` | `#0B5CFF` | Electric blue — primary actions, links, highlights |
| `--color-nevix-cyan` | `#00C8FF` | Light, glows, AI and future accents |
| `--color-nevix-indigo` | `#1F2FD6` | Depth in gradients |
| `--color-midnight` | `#050B1A` | Header on every page, heroes, dark sections, footer |
| `--color-horizon` | `#FF9A4D` | Sunset tone — hairlines and glows only, never a fill or text |
| `--color-light` | `#F6F8FC` | Cloud — light sections |

The design is dark-led: a floating midnight-glass header on every page, and a homepage hero that sets
"Intelligence in Motion." over the sunset photograph with the four pillars as a divided icon row.
Light sections still alternate with dark ones; blue and cyan are light, not decoration. Recurring
brand devices: a faint large N in inner page heroes, the *horizon line* (`.horizon-line`, a hairline
running cyan → blue → amber) on dark section edges, and the glowing N in CTA sections.

**Type.** Headings use Sora (`--font-display`) — geometric and slightly wide, the closest open
typeface to the wordmark. Body copy uses Manrope (`--font-sans`), where Sora's width would tire the
eye. Both are loaded by `next/font` in `app/layout.tsx`.

**Brand assets.** The supplied originals live in `brand-assets/nevix/` (plus
`brand-assets/logo-summary.png`) and are never edited. Everything in `public/brand/`, the team cards
in `public/team/`, and `app/favicon.ico`, `icon.png` and `apple-icon.png` are derived by
`scripts/derive-brand-assets.mjs`:

- the mark (`nevix-mark.png`, 450×551), the wordmark for light backgrounds
  (`nevix-wordmark-dark.png`) and for dark (`nevix-wordmark-light.png`), and a silver watermark
  (`nevix-mark-silver.png`, 420×509) — cut from the supplied lockups and separated from their flat
  backgrounds by un-compositing the edge, so there is no halo on either surface
- favicon, Apple touch and PWA icons from the supplied app icon (the ICO holds RGBA PNG payloads)
- team cards and every board re-encoded whole as WebP; the homepage hero
  (`nevix-hero-horizon.webp`) is the landscape-only region of the workspace photograph, so its own
  logo and copy are not duplicated under the page heading

`npm run brand:assets` regenerates them; `npm run brand:check` fails if any is stale and runs in
`npm run verify`. Paths and dimensions are referenced through `brandAssets` in `content/site.ts`;
the `/brand` page (`content/brand.ts`) shows every supplied picture whole.

**A trap worth knowing:** `tailwind-merge` does not know about custom scales. Left unconfigured it
classifies `text-display-md` as a *colour* utility and silently drops it when a later
`text-neutral-900` appears in the same `cn()` call — headings render at body size with no error
anywhere. `lib/utils.ts` registers the custom `font-size`, `rounded` and `shadow` groups to
prevent this. This was a real bug found by looking at a screenshot.

## 6. Accessibility

Targets WCAG 2.2 AA (specification §23.3). Verified with axe-core across 35 routes at three
viewports; the sweep is `npm run audit:pages`.

Enforced structurally rather than by review:

- `Field` in `components/forms/fields.tsx` makes it impossible to render a control without a
  label, `aria-describedby` and `aria-invalid`
- one `h1` per page, asserted in the E2E suite for every route
- the skip link is the first focusable element on every page
- Radix provides focus trapping, escape handling and focus restoration for the menu and dialogs
- a single high-contrast focus ring, defined once in `globals.css`
- nothing is communicated by colour alone — every status badge carries text
- `prefers-reduced-motion` is honoured in CSS, where it cannot be lost to a hydration race

## 7. SEO

- unique title and meta description per indexable page, built by `lib/seo/metadata.ts`
- canonical URLs on every page
- `sitemap.ts` excludes anything `noIndex` — demo case studies, placeholder products, legal drafts
- `robots.ts` disallows everything when `NEXT_PUBLIC_ENV !== 'production'`, so a staging deploy
  cannot be indexed alongside the real site
- JSON-LD: Organization, WebSite, BreadcrumbList, Service, FAQPage, Article, CreativeWork
- the Organization schema declares no award, certification, headcount or rating, because search
  engines treat structured data as factual claims

## 8. Performance

- 118 routes prerendered; minimal per-request work
- `next/font` self-hosts Manrope and Sora at build time — no font CDN, which is also what lets
  `font-src` stay `'self'`
- AVIF and WebP via `next/image`, with an explicit device-size list
- no third-party scripts at all ([ADR-009](./adr/ADR-009-no-analytics.md))
- Nginx caches `_next/static` for a year (content-hashed) and `_next/image` for 30 days

## 9. Testing

| Layer | Tool | Location |
| --- | --- | --- |
| Content integrity and governance | Vitest | `content/content.test.ts` — 42 tests |
| Types | `tsc --noEmit`, strict | CI |
| Lint | ESLint flat config | CI |
| E2E and routing | Playwright | `tests/e2e/` |
| Accessibility | axe-core via Playwright | `scripts/audit-pages.mjs` |

The content tests are worth singling out: they enforce specification §31 and catalogue §16
mechanically. A reviewer can miss an added testimonial or an invented certification; the test
cannot. It was verified by injecting violations and confirming the suite fails.
