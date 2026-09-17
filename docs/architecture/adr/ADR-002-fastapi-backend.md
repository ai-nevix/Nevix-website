# ADR-002 — FastAPI for the backend

**Status:** Accepted
**Date:** 2026-09-17
**Specification reference:** §11, §14 (backend), §17 (API)

## Context

The backend handles enquiries, newsletter subscriptions, uploads and public configuration, and has
to leave a clean boundary for a future AI layer (specification §19). The specification names
Python + FastAPI + Pydantic + SQLAlchemy.

## Decision

FastAPI with Pydantic v2 schemas, SQLAlchemy 2 in async mode, Alembic migrations, and a strict
route → service → repository layering.

Route handlers stay thin by rule, not by convention: business logic lives in `app/services`, all
queries in `app/repositories`. The layering is what makes the logic testable without HTTP.

## Alternatives considered

**Django + DRF** — more batteries included, and its admin would have saved building lead
management. Not chosen because the specification names FastAPI, because Django's ORM is
synchronous by default, and because the admin would duplicate Strapi's role.

**Node.js backend** — would have unified the language across the stack. Rejected because Python is
the language the future AI and data work will be written in (the entire Data & Analytics and AI
service lines are Python), and running the AI gateway in the same runtime as the API is simpler
than bridging two.

## Consequences

**Good.** Pydantic validates every input at the boundary and generates the OpenAPI document from
the same definition, so documentation cannot drift from behaviour. Async I/O suits a workload that
is almost entirely database and SMTP waits. The service layer is directly testable.

**Costs.** Async SQLAlchemy has sharper edges than the sync version — a lazy load outside the async
context raises `MissingGreenlet`, which we hit during development and fixed with an explicit
`session.refresh()` after commit in the admin update path.

**A constraint worth knowing:** route modules deliberately do not use
`from __future__ import annotations`. FastAPI resolves string annotations against the decorated
function's module globals, and where a route is wrapped by slowapi's rate-limit decorator that
resolution fails, silently reclassifying dependencies as request-body fields. This is noted in a
comment at the top of every route module because the failure mode is a confusing 422 rather than
an import error.

## Revisit when

The API grows a substantial synchronous workload, or a framework-level feature (admin, auth
scaffolding) would remove more code than it adds.
