# Architecture Decision Records

Each record captures one significant decision: the context, the choice, the alternatives and the
consequences. They exist so a future maintainer can tell whether a decision still holds, rather
than reverse-engineering intent from the code.

Format: context → decision → alternatives → consequences → revisit when.

| ADR | Decision | Status |
| --- | --- | --- |
| [001](./ADR-001-nextjs-frontend.md) | Next.js App Router for the website | Accepted |
| [002](./ADR-002-fastapi-backend.md) | FastAPI for the backend | Accepted |
| [003](./ADR-003-postgresql.md) | PostgreSQL as the single database engine | Accepted |
| [004](./ADR-004-strapi-cms.md) | Self-hosted Strapi Community Edition | Accepted |
| [005](./ADR-005-docker-compose.md) | Docker Compose, not Kubernetes | Accepted |
| [006](./ADR-006-content-provider-abstraction.md) | Content provider abstraction with a local default | Accepted |
| [007](./ADR-007-open-source-stack.md) | Open-source, self-hostable stack | Accepted |
| [008](./ADR-008-deferred-infrastructure.md) | Redis, Celery, MinIO and pgvector deferred behind profiles | Accepted |
| [009](./ADR-009-no-analytics.md) | No third-party analytics | Accepted |
| [010](./ADR-010-csp-unsafe-inline.md) | `script-src 'unsafe-inline'` with compensating controls | Accepted |
| [011](./ADR-011-css-scroll-reveal.md) | CSS scroll-driven reveals instead of JavaScript | Accepted |
| [012](./ADR-012-packages-ui-deferred.md) | `packages/ui` deferred | Accepted |
| [013](./ADR-013-welcome-intro.md) | Welcome intro: CSS-armed, React-animated, self-cancelling | Accepted |
