# Database

PostgreSQL 16 (`pgvector/pgvector:pg16`). One instance, two databases.

> Specification §16 (data model), §76 (database security).

## 1. Databases

| Database | Owner | Contents |
| --- | --- | --- |
| `vastrix` | FastAPI | leads, contact_events, newsletter_subscribers, site_settings |
| `vastrix_cms` | Strapi | CMS content and Strapi's own tables |

Created by `infra/docker/postgres/init/01-create-cms-database.sh` on first start.

**Content entities are not duplicated into `vastrix`.** Specification §16 and instruction §28 both
require this: the CMS is the single source of truth for services, solutions, industries, products,
case studies and insights, and the API never reads or writes them.

## 2. Schema

```
leads
├── id                 uuid        PK
├── reference          varchar(16) UNIQUE  -- VX-A7K2M9, quotable by a human
├── name               varchar(120)
├── email              varchar(254)        INDEX
├── organization       varchar(160)  NULL
├── service_interest   varchar(80)
├── industry           varchar(80)   NULL
├── requirement        text
├── timeline           varchar(40)   NULL
├── budget             varchar(40)   NULL
├── attachment_url     varchar(512)  NULL
├── status             enum          INDEX  -- new|reviewing|qualified|contacted|closed|spam
├── source             varchar(200)  NULL   -- originating page
├── consent            boolean
├── consented_at       timestamptz   NULL
├── ip_hash            varchar(64)   INDEX  -- HMAC-SHA256, never the raw address
├── user_agent         varchar(400)  NULL
├── internal_notes     text          NULL   -- never exposed publicly
├── created_at         timestamptz   INDEX
└── updated_at         timestamptz

contact_events              -- append-only audit trail
├── id            uuid  PK
├── lead_id       uuid  FK -> leads(id) ON DELETE CASCADE, INDEX
├── event_type    enum        -- created|notification_sent|notification_failed|
│                             -- status_changed|note_added|viewed
├── metadata      jsonb NULL  -- never personal data; it is echoed into logs
└── created_at    timestamptz INDEX

newsletter_subscribers      -- double opt-in
├── id                    uuid        PK
├── email                 varchar(254) UNIQUE, INDEX
├── consent_status        enum         INDEX  -- pending|confirmed|unsubscribed
├── confirmation_token    varchar(64)  UNIQUE, NULL  -- cleared on use (single-use)
├── confirmation_sent_at  timestamptz  NULL
├── confirmed_at          timestamptz  NULL
├── unsubscribed_at       timestamptz  NULL
├── unsubscribe_token     varchar(64)  UNIQUE  -- persistent, so old emails keep working
├── source                varchar(200) NULL
├── ip_hash               varchar(64)  NULL
└── created_at/updated_at timestamptz

site_settings               -- key/value overrides, editable without a redeploy
├── id, key UNIQUE, value, description, created_at, updated_at
```

Composite index `ix_leads_status_created_at` backs the admin listing, which filters by status and
orders by recency.

## 3. Design decisions

**UUID primary keys.** A reference can appear in a URL or an email without disclosing how many
records exist, and rows can be created without a round trip.

**A separate human-readable `reference`.** `VX-A7K2M9`, from an alphabet with no O/0 or I/1
confusion, so it can be read aloud or transcribed from an email without error. A UUID cannot.

**Hashed IP addresses.** `ip_hash` is HMAC-SHA256 keyed by `SECRET_KEY`. Enough to correlate abuse
from one source; not reversible, and not comparable across deployments. The raw address is never
written to the database.

**Append-only audit events.** `contact_events` rows are never updated or deleted. That is what
makes the history a usable record rather than a current-state summary.

**`metadata` carries no personal data.** It is written to the database *and* echoed into logs, so
the enquiry body and email address are deliberately excluded. There is a test asserting this.

**Enums stored as strings** (`native_enum=False`) rather than PostgreSQL enum types. Adding a value
to a native enum requires a migration with an exclusive lock; a varchar with a constraint does not.
It also lets the test suite run on SQLite.

**JSONB with a JSON fallback.** `JSON().with_variant(JSONB(), "postgresql")` gives PostgreSQL
indexing and SQLite compatibility from one declaration.

## 4. Migrations

Alembic, async engine. The database URL comes from application settings, never from `alembic.ini`,
so a connection string is never committed.

```bash
alembic revision --autogenerate -m "description"   # generate — always review the output
alembic upgrade head                               # apply
alembic downgrade -1                               # reverse one
alembic check                                      # fail if models and migrations have drifted
```

Applied automatically by the container entrypoint before uvicorn starts, with a bounded retry so a
database that is still coming up does not crash-loop the container. Set `RUN_MIGRATIONS=false` when
several API replicas start together and a separate job owns migrations, so concurrent upgrades
cannot race.

**Autogenerate output is reviewed, not trusted.** The initial migration was emitted with an
unqualified `Text()` that would have raised `NameError` on upgrade; it was caught by running the
migration rather than by reading it.

## 5. Verification

CI runs against real PostgreSQL:

```
alembic upgrade head
alembic downgrade base      # every migration must reverse
alembic upgrade head
alembic check               # no model drift
```

This exists because the unit suite runs on SQLite, which would not catch a PostgreSQL-only
construct or an irreversible migration.

## 6. Security

- **Not published to the host.** No `ports:` mapping; attached only to the `internal` Docker
  network, which is declared `internal: true` and therefore has no route to the internet either.
- `scram-sha-256` authentication, set at `initdb` time.
- Credentials from the environment only.
- Every query is parameterised through SQLAlchemy. The admin search escapes `%` and `_` explicitly
  so a literal `%` cannot behave as a wildcard and return every record — there is a test for that.
- Backups encrypted at rest on the backup target and verified with `pg_restore --list` at creation.

## 7. Backups

`scripts/backup-database.sh`, daily via cron. Custom-format dumps, verified immediately, retained
30 days with pre-deploy snapshots kept indefinitely.

**A backup is a hypothesis until it has been restored.** `scripts/restore-database.sh --verify`
restores into a scratch database and checks the result. Specification §24.1 requires testing
restoration, and instruction §50 says not to claim backups are reliable until a restore has
actually been performed — so the launch checklist item stays unticked until someone runs it.

See [`../deployment/backup-and-restore.md`](../deployment/backup-and-restore.md).
