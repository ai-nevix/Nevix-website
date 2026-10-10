# Deployment Architecture

> Specification §20 (deployment), §20.1 (initial topology), §25 (environments).
> See [ADR-005](./adr/ADR-005-docker-compose.md).

## 1. Topology

One Linux host (Ubuntu Server or Debian), Docker Compose, Nginx terminating TLS.

```
Production host
├── nginx        :80 :443     ← the only published ports
├── web          :3000        (internal)
├── api          :8000        (internal)
├── cms          :1337        (internal)
└── postgres     :5432        (internal network only, no port mapping at all)

Optional, profile-gated:
├── redis        --profile cache
├── minio        --profile storage
└── worker       --profile workers

Observability (-f docker-compose.monitoring.yml), all bound to 127.0.0.1:
└── prometheus, grafana, loki, promtail, exporters, glitchtip
```

## 2. Hosts

| Hostname | Routes to | Notes |
| --- | --- | --- |
| `nevix.ai` | Next.js | Canonical origin |
| `www.nevix.ai` | 301 → apex | One origin ranks |
| `api.nevix.ai` | FastAPI | `/admin`, `/metrics`, `/docs` return 404 here |
| `cms.nevix.ai` | Strapi | Restrict `/admin` by IP before public exposure |
| *(none)* | Monitoring | Loopback only — reachable via SSH tunnel or VPN |

## 3. Environments

| Environment | Compose files | Indexed | Notes |
| --- | --- | --- | --- |
| local | `docker-compose.yml` + `.dev.yml` | no | Hot reload, published ports, Mailpit captures all email |
| staging | `+ .staging.yml` | **no** | `NEXT_PUBLIC_ENV != production` ⇒ robots.txt disallows everything |
| production | `docker-compose.yml` | yes | Manual approval gate in CI |

A staging site indexed alongside production splits ranking signals and can surface unreviewed
content publicly, so the robots behaviour is driven by environment rather than by remembering to
set a flag.

## 4. First deployment

```bash
# On the host
git clone <repository> /opt/nevix && cd /opt/nevix

cp .env.example .env
./scripts/generate-secrets.sh --write     # generates and writes every secret, chmod 600

# Fill in the values the generator cannot know:
#   POSTGRES_USER, NEXT_PUBLIC_SITE_URL, SMTP_*, EMAIL_NOTIFY_TO
$EDITOR .env

# TLS — see docs/deployment/tls.md
./scripts/issue-certificates.sh nevix.ai

docker compose build
docker compose up -d

# Verify before announcing anything
curl -f https://nevix.ai/
curl -f https://api.nevix.ai/api/v1/health
curl -f https://nevix.ai/sitemap.xml
```

Migrations run automatically from the API container's entrypoint, with a bounded retry so a
database still starting does not crash-loop the container.

## 5. Routine deployment

Through CI (`.gitlab-ci.yml`):

```
merge to main
  → lint, type-check, tests, migration test on real PostgreSQL
  → security scans (npm audit, pip-audit, gitleaks)
  → build and push images tagged with the commit SHA
  → deploy to staging automatically, then smoke test
  → MANUAL APPROVAL
  → back up production, deploy, smoke test
```

Production is manual and default-branch-only. Specification §21 places an approval gate before
production and instruction §46 forbids deploying blindly from every branch.

The production job takes a backup **before** running migrations. A failed migration with no recent
backup is the scenario that matters.

## 6. Rollback

```bash
./scripts/rollback.sh              # to the previously recorded tag
./scripts/rollback.sh --to abc1234 # to a specific tag
./scripts/rollback.sh --list       # what is available
```

Rolling back **code** is safe and takes about a minute. Rolling back a **migration** is not
automatic — if the release included a destructive schema change, restore from the pre-deploy
backup instead. Full procedure: [`../deployment/rollback.md`](../deployment/rollback.md).

## 7. Zero-downtime

Not provided. `docker compose up -d` restarts containers, so there is a brief gap.

For a marketing site that is an acceptable trade; the alternative is a load balancer and two
replicas of everything. It is recorded here so nobody assumes otherwise, and the trigger for
changing it is an availability target that a single host demonstrably cannot meet.

## 8. Host requirements

| Resource | Minimum | Recommended |
| --- | --- | --- |
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB (Strapi's build step is the peak) |
| Disk | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu Server 24.04 LTS or Debian 12 | |

Firewall: allow 22 (restricted to known addresses), 80 and 443. Nothing else.

## 9. What is backed up

| Item | Mechanism | Frequency |
| --- | --- | --- |
| Application database | `pg_dump --format=custom`, verified at creation | daily + pre-deploy |
| CMS database | same | daily + pre-deploy |
| API uploads | tar.gz from the volume | daily |
| CMS media | tar.gz from the volume | daily |
| `.env` and TLS certificates | **manual, out of band** | on change |

`.env` is deliberately not in the automated backup — it is the one file whose compromise
compromises everything else. Store it in a password manager or a secrets vault.

See [`../deployment/backup-and-restore.md`](../deployment/backup-and-restore.md).
