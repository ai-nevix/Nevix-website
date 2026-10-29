# NEVIX — Architecture Overview

> Source of truth: `docs/source-material/VASTRIX_Website_Development_Master_Specification.docx`
> (§12, §20) and the supplied architecture diagram, reproduced below as
> [a Mermaid diagram](#logical-architecture).

## 1. What this system is

A public marketing website with a lead-capture backend and a self-hosted CMS, built so that a
client portal, product suite and AI assistant can be added later without redesigning it.

Everything in the stack is open source and self-hostable. That is a deliberate constraint from the
specification (§11) rather than a preference — see
[ADR-007](./adr/ADR-007-open-source-stack.md).

### Logical architecture

The supplied architecture diagram, redrawn as text so it renders in any Markdown viewer and can be
changed in a diff. It is the *logical* picture as supplied; §2 below is the runtime topology as
built, which adds Strapi and holds Redis, MinIO and pgvector behind Compose profiles
([ADR-008](./adr/ADR-008-deferred-infrastructure.md)).

```mermaid
flowchart TB
  subgraph users["Users"]
    direction LR
    visitors["Visitors<br/>(website users)"]
    clients["Clients / partners"]
    government["Government stakeholders"]
    team["Team members<br/>(admin)"]
  end

  internet(("Internet"))
  dns["Domain & DNS<br/>nevix.ai · www.nevix.ai"]
  nginx["Nginx reverse proxy<br/>SSL termination (HTTPS) · load balancing<br/>static files · security headers · rate limiting"]

  subgraph application["Application"]
    direction LR
    frontend["Frontend — web application<br/>Next.js + React + TypeScript<br/>Tailwind CSS · Framer Motion"]
    backend["Backend — API server<br/>FastAPI + Python<br/>contact / leads · content APIs<br/>admin authentication · email notifications<br/>file handling · AI integration (future)"]
    frontend <-->|"REST / JSON over HTTPS"| backend
  end

  subgraph external["External services"]
    direction TB
    smtp["Email service<br/>(SMTP)"]
    newsletter["Newsletter / notifications"]
    ai["AI services (future)<br/>Ollama / open-source LLM"]
  end

  subgraph data["Data layer"]
    direction LR
    postgres[("PostgreSQL<br/>relational database")]
    redis[("Redis<br/>cache / queue — Celery")]
    minio[("MinIO<br/>object storage")]
    pgvector[("pgvector<br/>vector search — future")]
  end

  users <-->|"HTTPS"| internet
  internet --> dns --> nginx
  nginx --> frontend
  nginx --> backend
  backend <--> external
  backend --> data

  subgraph delivery["Development & deployment"]
    direction LR
    developer["Developer"] --> git["Git"] --> gitlab["GitLab CE<br/>(self-hosted)"] --> runner["CI/CD<br/>(GitLab Runner)"] --> docker["Docker<br/>(containers)"] --> server["Server<br/>(Ubuntu / Debian)"]
  end

  subgraph monitoring["Monitoring & logging"]
    direction LR
    prometheus["Prometheus<br/>(metrics)"]
    grafana["Grafana<br/>(dashboards)"]
    loki["Loki<br/>(logs)"]
    glitchtip["GlitchTip<br/>(error tracking)"]
  end

  subgraph security["Security"]
    direction LR
    https["HTTPS<br/>(SSL/TLS)"]
    adminauth["Admin<br/>authentication"]
    firewall["Firewall"]
    headers["Security headers<br/>& rate limiting"]
  end
```

## 2. Runtime topology

**Stale.** The diagram below (and the "Development & deployment" / "Monitoring & logging"
subgraphs above) describe the Docker Compose + Nginx + Prometheus/Grafana/Loki topology that has
been removed from the project — see [ADR-005](./adr/ADR-005-docker-compose.md). No replacement
reverse proxy, container runtime or monitoring stack has been chosen yet. The request-proxying and
network-isolation *requirements* below still apply to whatever replaces it.

```
                          Internet
                             │
                        ┌────▼────┐
                        │Firewall │
                        └────┬────┘
                             │  443 / 80
                    ┌────────▼────────┐
                    │      Nginx      │  TLS, security headers, rate limiting,
                    │  reverse proxy  │  request size limits, static caching
                    └───┬────┬────┬───┘
         nevix.ai     │    │    │     cms.nevix.ai
        ┌───────────────┘    │    └──────────────┐
        │          api.nevix.ai                │
  ┌─────▼─────┐        ┌─────▼─────┐       ┌─────▼─────┐
  │  Next.js  │        │  FastAPI  │       │  Strapi   │
  │   :3000   │        │   :8000   │       │   :1337   │
  └─────┬─────┘        └─────┬─────┘       └─────┬─────┘
        │                    │                   │
        │  same-origin       │                   │
        │  /api/backend/*    │                   │
        └────────────────────┤                   │
                             │                   │
                   ┌─────────▼───────────────────▼────────┐
                   │        internal docker network        │
                   │            (no egress)                │
                   │  ┌────────────┐  ┌──────┐  ┌───────┐  │
                   │  │ PostgreSQL │  │Redis │  │ MinIO │  │
                   │  │   :5432    │  │profile│ │profile│  │
                   │  └────────────┘  └──────┘  └───────┘  │
                   └───────────────────────────────────────┘
```

Key properties:

- **Only Nginx publishes a port.** PostgreSQL has no `ports:` mapping at all, so it is unreachable
  from outside the host (specification §76).
- **The `internal` Docker network is `internal: true`**, meaning containers attached to it have no
  route to the internet. An exploited dependency in the data tier cannot phone home.
- **The browser only ever talks to one origin.** The web app proxies API calls through
  `/api/backend/*`, which keeps `connect-src 'self'` intact in the CSP and removes the need for
  CORS on public endpoints.

## 3. Request paths

### A page view

```
Browser → Nginx → Next.js
                    ├── statically prerendered HTML (most routes)
                    └── lib/cms → local content, or Strapi over HTTP (ADR-006)
```

Content pages are prerendered at build time and revalidated hourly. Nginx additionally caches
`_next/static` for a year — those filenames are content-hashed, so a new deploy invalidates them
by changing the URL.

### An enquiry

```
Browser → Nginx (rate limit: 10/min)
        → Next.js route handler /api/backend/v1/contact   (allow-list, adds X-Forwarded-For)
        → FastAPI /api/v1/contact                          (rate limit: 5/hour per IP)
            ├── Pydantic validation
            ├── ContactService: spam checks, lead creation, audit event
            ├── PostgreSQL
            └── SMTP notification (best effort — failure does not lose the lead)
```

The proxy's allow-list is the important part: it forwards a fixed set of public paths and nothing
else. `/api/v1/admin/*` is not on it, so administrative endpoints are not reachable from a browser
at all, independently of their authentication.

## 4. Component responsibilities

| Component | Owns | Does not own |
| --- | --- | --- |
| **Next.js** (`apps/web`) | Rendering, SEO metadata, sitemap, form UX, client validation | Any database access; any privileged secret |
| **FastAPI** (`apps/api`) | Leads, contact events, newsletter, uploads, site config, admin API | Marketing content |
| **Strapi** (`apps/cms`) | Marketing content and media | Application data |
| **PostgreSQL** | Application data, and Strapi's own database | — |
| **Nginx** | TLS, routing, edge security headers, rate limiting, static caching | Application logic |

Content entities are **not** duplicated into the application database (specification §16): the CMS
is the single source of truth for them, and the API never reads or writes them.

## 5. Layering inside each application

**Web** — `app/` routes render; `components/` present; `content/` holds typed content;
`lib/cms` is the only path to content; `lib/api` is the only path to the backend. No component
fetches directly.

**API** — routes stay thin; `services/` hold business logic; `repositories/` hold every query;
`models/` and `schemas/` are the persistence and wire contracts. A route handler contains no SQL.

## 6. Security boundaries

Documented in full in [`security.md`](./security.md) and
[`../security/threat-model.md`](../security/threat-model.md). In summary:

1. **Edge** — Nginx terminates TLS, applies rate limits and request size caps, blocks `/admin`,
   `/metrics` and the API docs on public hosts.
2. **Application** — every input validated with Pydantic; authorisation checked server-side on
   every admin request; uploads verified by magic number, not by declared type.
3. **Data** — PostgreSQL unreachable from outside; IP addresses stored hashed, never raw; secrets
   only from the environment; a redaction processor strips credential-shaped keys from every log
   line regardless of where they were added.

## 7. Observability

```
apps ──metrics──► Prometheus ──┐
                               ├──► Grafana (loopback only)
containers ──logs──► Promtail ─┴──► Loki
                               
unhandled exceptions ──────────────► GlitchTip (loopback only)
```

Every monitoring port binds to `127.0.0.1`, so reaching a dashboard requires an SSH tunnel or a
VPN — not merely a correct password (instruction §48).

## 8. What is deliberately not here

| Not built | Why | When to revisit |
| --- | --- | --- |
| Kubernetes | Specification §20.1 is explicit: do not introduce it for appearance | Multiple services with independent deploy cadences, or isolation requirements a single host cannot meet |
| Redis / Celery | Nothing in the MVP needs a cache or a job queue. Wired into compose behind profiles ([ADR-008](./adr/ADR-008-deferred-infrastructure.md)) | Background email sending, scheduled reports, or rate limits shared across API replicas |
| MinIO | Uploads are low volume and a mounted volume is simpler to back up | Media volume outgrows the host disk, or multiple hosts need shared storage |
| pgvector | The AI layer is not in the first release. The PostgreSQL image already includes the extension, so enabling it is a migration, not a rebuild | The NEVIX AI assistant (specification §19) |
| Keycloak | No user accounts exist yet | The client portal (specification §32, stage 3) |
| A custom admin UI | Strapi handles content; lead management is a small JSON API | Lead volume justifies a workflow interface |

## 9. Growth path

Specification §32 sequences this, and the architecture is shaped to follow it without a rewrite:

1. **Public website** — current
2. **CMS + lead management** — current (CMS provider is a configuration switch)
3. **Client portal** — add Keycloak, add authenticated routes behind the existing API boundary
4. **AI assistant** — enable pgvector, add an AI gateway behind the same FastAPI service
5. **SaaS products** — the tenancy decisions are documented in the Product & SaaS service pages
6. **Multi-tenant platform** — the point at which orchestration is genuinely justified

## 10. Related documents

- [`frontend.md`](./frontend.md) · [`backend.md`](./backend.md) · [`database.md`](./database.md)
- [`cms.md`](./cms.md) · [`deployment.md`](./deployment.md) · [`security.md`](./security.md)
- [`monitoring.md`](./monitoring.md)
- [Architecture decision records](./adr/)
