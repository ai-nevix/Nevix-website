# Frontend Architecture

`apps/web` — Next.js 16, App Router, React 19, TypeScript strict, Tailwind CSS 4.

> Specification §13 (frontend engineering), §23 (performance, SEO, accessibility), §26.1
> (structure).

## 1. Rendering strategy

| Route group | Mode | Revalidate | Why |
| --- | --- | --- | --- |
| `/` | Static + ISR | 1h | Content changes rarely; the largest page on the site |
| `/about`, `/legal/*` | Static | — | Changes only on deploy |
| `/services`, `/services/[category]`, `/services/[category]/[service]` | SSG + ISR | 1h | 41 prerendered routes from `generateStaticParams` |
| `/solutions`, `/industries`, `/products`, `/case-studies`, `/insights` and details | SSG + ISR | 1h | Same |
| `/contact` | Static shell | — | The form is a client island inside a static page |
| `/search` | Dynamic | — | Depends on `?q=` |
| `/api/backend/*` | Dynamic route handler | — | Proxy to FastAPI |

**116 routes prerender at build time.** In production the server does almost no work for a page
view; Nginx serves `_next/static` from its own cache.

`dynamicParams = false` on every dynamic segment, so an unknown slug 404s at the routing layer
rather than triggering a runtime lookup.

## 2. Directory layout

```
apps/web/
├── app/
│   ├── (marketing)/          # route group sharing header + footer
│   │   ├── page.tsx          # homepage
│   │   ├── about/ services/ solutions/ industries/
│   │   ├── products/ case-studies/ insights/ contact/ search/ legal/
│   │   └── layout.tsx        # skip link, header, <main>, footer
│   ├── api/backend/[...path] # same-origin proxy to FastAPI
│   ├── layout.tsx            # html/body, fonts, Organization + WebSite JSON-LD
│   ├── sitemap.ts robots.ts opengraph-image.tsx manifest.ts
│   ├── not-found.tsx error.tsx global-error.tsx
│   └── globals.css           # design tokens + component layer
├── components/
│   ├── layout/               # header, footer, logo, breadcrumbs, skip link
│   ├── navigation/           # desktop mega-menu, mobile panel
│   ├── hero/ sections/ cards/ forms/ ui/ seo/
├── content/                  # typed content (see ADR-006)
├── lib/
│   ├── cms/                  # content provider abstraction
│   ├── api/                  # browser-side API client
│   ├── seo/                  # metadata builders, JSON-LD
│   ├── validation/           # zod schemas mirroring Pydantic
│   ├── env.ts                # validated environment, client/server split
│   ├── search.ts             # in-process content search
│   ├── security-headers.mjs  # shared with Nginx generation
│   └── utils.ts              # cn(), date and text helpers
└── tests/                    # vitest setup
```

## 3. Server and client boundary

Server Components are the default. Exactly four components are client components, and each has a
reason that cannot be met on the server:

| Component | Why client |
| --- | --- |
| `layout/header.tsx` | Scroll position for the sticky border state |
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

## 5. Design system

Tokens live in `app/globals.css` under Tailwind 4's `@theme`, derived from the brand palette in
specification §4. The visual language alternates deliberately between deep `midnight` sections and
clean light sections; blue and cyan are accents, never full-page decoration.

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

- 116 routes prerendered; minimal per-request work
- `next/font` self-hosts Manrope at build time — no font CDN, which is also what lets `font-src`
  stay `'self'`
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
