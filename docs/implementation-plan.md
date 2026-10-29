# NEVIX Website — Implementation Plan

> Docker has since been removed from the project (see
> [ADR-005](architecture/adr/ADR-005-docker-compose.md)). References below to Docker, Docker
> Compose or Nginx describe the state of the project before that removal, not the current state.

**Status:** Active
**Owner:** Engineering
**Source of truth:** `docs/source-material/VASTRIX_Website_Development_Master_Specification.docx` and
`docs/source-material/VASTRIX_Detailed_Service_Catalogue_for_Website-1.docx`
(plain-text extractions of both are committed alongside them for diffable reference).

---

## 1. Requirements extracted from the source material

### 1.1 Positioning (catalogue §1, §17; specification §1)

NEVIX is an **intelligent technology and engineering company**, not a generic software agency.
The site leads with four core pillars and extends into product engineering and advisory.

| Pillar | Positioning (verbatim from catalogue) |
| --- | --- |
| AI & Intelligence | Build intelligent systems that understand, predict, generate, classify and assist. |
| Automation | Turn repetitive, rule-based and multi-step work into reliable automated workflows. |
| Digital Engineering | Design and build modern websites, applications, APIs, software systems and user experiences. |
| Data & Analytics | Turn raw data into reporting, insight, prediction and decision support. |

Tagline: **Explore. Automate. Evolve.**
Secondary positioning: **Intelligent Technology for a Smarter Tomorrow.**

### 1.2 Non-negotiable content governance (catalogue §8, §16; specification §2, §31)

These are hard constraints on the build, not stylistic preferences:

- Do **not** publish unverified government approvals, empanelments, certifications or
  marketplace registrations.
- Do **not** publish client logos or case studies without permission.
- Do **not** guarantee ROI, 100% automation, or AI accuracy.
- Do **not** claim security/compliance certifications NEVIX does not hold.
- Do **not** pad technology lists to appear larger.
- Use **"Coming Soon"** for planned capabilities.

Implementation consequence: every non-verified content item is demo content, is visibly labelled
in the UI, and is registered in `docs/dummy-data/registry.md`.

### 1.3 Product goals (specification §3)

Brand credibility · lead generation · service discovery · enterprise readiness · government
readiness (without unsupported claims) · content growth via CMS · a clean API boundary for a future
AI layer · open-source / self-hostable stack.

### 1.4 Acceptance criteria (specification §30)

Tracked verbatim in `docs/acceptance-criteria.md` with current status per item.

---

## 2. Architecture

```
                        Internet / HTTPS
                               │
                          ┌────▼────┐
                          │  Nginx  │  TLS, security headers, rate limiting
                          └────┬────┘
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
  nevix.ai            api.nevix.ai          cms.nevix.ai
  ┌─────▼─────┐          ┌─────▼─────┐          ┌─────▼─────┐
  │  Next.js  │──REST──▶ │  FastAPI  │          │  Strapi   │
  │  (web)    │          │   (api)   │          │   (cms)   │
  └─────┬─────┘          └─────┬─────┘          └─────┬─────┘
        │                      │                      │
        └───── CMS reads ──────┼──────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
              ┌─────▼────┐ ┌───▼───┐ ┌────▼────┐
              │PostgreSQL│ │ Redis │ │  MinIO  │   (Redis/MinIO: profile-gated)
              └──────────┘ └───────┘ └─────────┘
```

Simplified from the supplied architecture diagram, which is reproduced in full as a Mermaid diagram
in [architecture-overview.md → Logical architecture](./architecture/architecture-overview.md#logical-architecture).

**Boundaries**

- The web app never talks to PostgreSQL. It reads content through `lib/cms` and submits leads
  through `lib/api` → FastAPI.
- The web app never holds a privileged secret. The CMS read token is used only in server
  components / route handlers.
- FastAPI owns leads, contact events, newsletter subscribers and site settings.
- Strapi owns marketing content. See ADR-006 for the content-provider strategy.
- Monitoring is never exposed on a public host.

---

## 3. Page list

| Route | Rendering | Source |
| --- | --- | --- |
| `/` | Static (ISR 1h) | CMS + local content |
| `/about` | Static | Local content |
| `/team` | Static | Local content (supplied founder cards) |
| `/brand` | Static — hidden (404) while `BRAND_PAGE_ENABLED` is false | Local content (supplied brand artwork) |
| `/services` | ISR | CMS |
| `/services/[slug]` (6 categories) | ISR, `generateStaticParams` | CMS |
| `/services/[slug]/[service]` (35 services) | ISR | CMS |
| `/solutions`, `/solutions/[slug]` | ISR | CMS |
| `/industries`, `/industries/[slug]` | ISR | CMS |
| `/products`, `/products/[slug]` | ISR | CMS |
| `/case-studies`, `/case-studies/[slug]` | ISR | CMS |
| `/insights`, `/insights/[slug]` | ISR | CMS |
| `/insights/category/[slug]`, `/insights/tag/[slug]` | ISR | CMS |
| `/contact` | Static shell + client form → API | — |
| `/search` | Client, server-backed | API |
| `/legal/privacy`, `/legal/terms`, `/legal/cookies` | Static (**draft**) | Local content |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Generated | — |
| `not-found`, `error`, `global-error` | Static | — |

Service category slugs are fixed by specification §5.1:
`ai-intelligence`, `automation`, `digital-engineering`, `data-analytics`,
`product-saas-engineering`, `consulting`.

---

## 4. Service list (catalogue §2–§7) — 35 services across 6 categories

- **AI & Intelligence (7):** Generative AI Solutions · AI Agents & Agentic Automation ·
  Machine Learning · NLP · Computer Vision · Document Intelligence · AI Consulting & Integration
- **Automation (7):** Business Process Automation · Python Automation · Workflow Automation ·
  RPA & Task Automation · API Integration & Orchestration · Infrastructure & IT Automation ·
  Intelligent Automation
- **Digital Engineering (7):** Website Development · Web Application Development ·
  Application Development · Backend & API Development · UI/UX Design ·
  Custom Software Development · Cloud & DevOps Engineering
- **Data & Analytics (6):** Data Analytics · Business Intelligence & Dashboards ·
  Data Engineering & ETL · Predictive Analytics · Reporting Automation · Decision Intelligence
- **Product & SaaS Engineering (4):** SaaS Product Development · MVP Development ·
  AI Product Development · Internal Tools & Portals
- **Consulting & Technology Advisory (4):** Digital Transformation Consulting ·
  Automation Opportunity Assessment · AI Readiness & Use-Case Assessment · Solution Architecture

Each service page follows the structure in catalogue §12 / specification §7.1:
hero → problem → what we do → capabilities → use cases → technology approach → how we work →
outcomes → case study → FAQ → CTA.

All service copy (deliverables, use cases, one-line values) is taken from the catalogue verbatim
or conservatively derived from it. Nothing is invented.

---

## 5. Data model

### Application database (PostgreSQL, owned by FastAPI — specification §16)

| Table | Purpose |
| --- | --- |
| `leads` | name, email, organization, service_interest, industry, requirement, timeline, budget, attachment_url, status, source, consent, ip_hash, timestamps |
| `contact_events` | lead_id, event_type, metadata (JSONB), created_at |
| `newsletter_subscribers` | email, consent_status, source, confirmed_at, created_at |
| `site_settings` | singleton: company_name, tagline, contact_email, phone, social links, updated_at |

Content entities (`services`, `service_categories`, `solutions`, `industries`, `products`,
`case_studies`, `insights`, `authors`, `faqs`) live in the CMS and are **not** duplicated in
PostgreSQL — specification §16 and instruction §28 both require this.

### CMS content model (Strapi — specification §15)

Collection types: Service Category, Service, Solution, Industry, Product, Case Study, Insight,
Author, FAQ. Single type: Site Settings. Relations per instruction §29.

---

## 6. Implementation phases

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Repo inspection, document reading, plan, dummy-data registry | Done |
| 1 | Monorepo foundation, workspaces, tooling, shared types/config | Done |
| 2 | Design system: tokens, primitives, motion, brand assets | Done |
| 3 | App shell: header, mega-menu, footer, breadcrumbs, SEO plumbing | Done |
| 4 | Homepage | Done |
| 5 | About | Done |
| 6 | Services architecture (index, 6 categories, 35 details) | Done |
| 7 | Solutions | Done |
| 8 | Industries | Done |
| 9 | Products | Done |
| 10 | Case studies | Done |
| 11 | Insights | Done |
| 12 | Contact + lead capture UX | Done |
| 13 | FastAPI + PostgreSQL + migrations | Done |
| 14 | Strapi CMS schemas + seed + provider integration | Done |
| 15 | Docker + Nginx | Done |
| 16 | CI/CD (GitLab CE) | Done |
| 17 | Security hardening + threat model | Done |
| 18 | SEO, accessibility, performance | Done |
| 19 | Monitoring + logging | Done |
| 20 | Testing (unit, component, API, E2E, a11y) | Done |
| 21 | Final production verification | Done |

---

## 7. Dependencies

Chosen to satisfy specification §11 (open-source / self-hostable). Full version and licence
inventory: `docs/licenses/`.

Frontend: Next.js · React · TypeScript · Tailwind CSS · Radix UI (shadcn/ui pattern) ·
Framer Motion · `zod` · `react-hook-form` · `lucide-react`.
Backend: FastAPI · Pydantic v2 · SQLAlchemy 2 · Alembic · `asyncpg` · `slowapi` ·
`structlog` · `prometheus-fastapi-instrumentator`.
CMS: Strapi Community Edition.
Infra: PostgreSQL · Redis (profile-gated) · MinIO (profile-gated) · Nginx · Docker Compose ·
Prometheus · Grafana · Loki · GlitchTip.

No proprietary managed service is required to run the system.

---

## 8. Deployment strategy

Single Linux host, Docker Compose, Nginx terminating TLS (specification §20.1 — explicitly
"do not introduce Kubernetes merely for appearance"). Compose profiles gate optional services so
the MVP runs `web + api + cms + postgres + nginx` and nothing more.

- `docker-compose.yml` — base (production topology)
- `docker-compose.dev.yml` — local development overrides, hot reload
- `docker-compose.staging.yml` — staging overrides
- `docker-compose.monitoring.yml` — Prometheus/Grafana/Loki/GlitchTip, internal-only

Procedures: `docs/deployment/` (deploy, rollback, backup-and-restore, TLS).

---

## 9. Testing strategy

| Layer | Tooling | Location |
| --- | --- | --- |
| Frontend unit/component | Vitest + Testing Library | `apps/web/**/*.test.tsx` |
| Type safety | `tsc --noEmit` (strict) | CI |
| Lint | ESLint (flat config) + Ruff | CI |
| Backend unit/integration | pytest + httpx AsyncClient | `apps/api/tests/` |
| E2E + accessibility | Playwright + axe-core | `tests/e2e/` |
| Build verification | `next build`, `docker build` | CI |

Critical flows from specification §27.1 are covered explicitly in `tests/e2e/`.

---

## 10. Open questions / unknowns

Tracked as blockers for real content. None of these are invented in the meantime — each maps to a
registry entry in `docs/dummy-data/registry.md`.

1. **Legal entity details** — registered name, address, jurisdiction, CIN/GST. Needed for the
   footer and legal pages.
2. **Contact details** — official email, phone, office address. Currently placeholder.
3. **Team / founding story** — no biographies exist in the source material; §25 of the instruction
   forbids inventing them. About page ships a marked placeholder.
4. **Real case studies** — none supplied and permission rules apply. All case studies ship as
   clearly labelled *Demo Case Study*.
5. **Products** — no actual product data supplied. Products ship as *Concept* / *Coming Soon*.
6. **Testimonials / client logos** — none supplied; the site ships without a testimonials section
   rather than fabricating one.
7. **Domain confirmation** — `nevix.ai` is used throughout per the specification; confirm
   registration before DNS/TLS provisioning.
8. **SMTP credentials** — notification email is implemented and disabled-by-default until
   `SMTP_HOST` is configured.
9. **Analytics choice** — no analytics is installed. If required, Plausible or Umami (both
   self-hostable) are the recommended options; see `docs/architecture/adr/ADR-009-no-analytics-in-mvp.md`.

---

## 11. Deviations from the instruction

Recorded as ADRs, each preferring the smallest change that preserves intent:

- **ADR-006** — CMS abstraction ships with a local content provider as default and Strapi as an
  opt-in provider, so the site builds and deploys without a running CMS.
- **ADR-007** — `packages/ui` is deferred; UI lives in `apps/web/components` until a second
  consumer exists.
- **ADR-008** — Redis, Celery, MinIO and pgvector are wired into compose behind profiles but not
  active in the MVP, per instruction §6.
