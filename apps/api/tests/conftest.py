"""Shared pytest fixtures.

Tests run against an in-memory SQLite database rather than PostgreSQL so the suite needs no
running service and stays fast. The models avoid PostgreSQL-only constructs for exactly this
reason — JSONB is declared as a dialect variant of JSON, and enums are stored as strings.

Migration behaviour is verified separately against PostgreSQL in CI; see .gitlab-ci.yml.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator

# Environment must be set before app.core.config is imported anywhere.
os.environ.setdefault("APP_ENV", "local")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-for-validation")
os.environ.setdefault("ADMIN_API_KEY", "test-admin-key-that-is-at-least-32-characters-long")
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")
os.environ.setdefault("METRICS_ENABLED", "false")
os.environ.setdefault("LOG_FORMAT", "console")
os.environ.setdefault("LOG_LEVEL", "WARNING")
os.environ.setdefault("UPLOAD_DIR", "")

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_session
from app.main import app


@pytest.fixture
async def engine() -> AsyncGenerator:
    """A fresh in-memory database per test.

    `StaticPool` keeps every connection pointed at the same in-memory database; without it each
    connection gets its own empty one and nothing persists between statements.
    """
    from sqlalchemy.pool import StaticPool

    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    yield test_engine

    await test_engine.dispose()


@pytest.fixture
async def session(engine) -> AsyncGenerator[AsyncSession]:
    factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as db_session:
        yield db_session


@pytest.fixture
async def client(session: AsyncSession) -> AsyncGenerator[AsyncClient]:
    """HTTP client bound to the app with the test session injected."""

    async def override_get_session() -> AsyncGenerator[AsyncSession]:
        yield session

    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client

    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers() -> dict[str, str]:
    return {"Authorization": "Bearer test-admin-key-that-is-at-least-32-characters-long"}


@pytest.fixture
def valid_contact_payload() -> dict[str, object]:
    return {
        "name": "Jane Doe",
        "email": "jane@example.org",
        "organization": "Example Organisation",
        "service_interest": "Automation",
        "industry": "Manufacturing",
        "requirement": (
            "We process about two thousand supplier invoices a month by hand and errors "
            "only surface at month-end reconciliation."
        ),
        "timeline": "3-6 months",
        "budget": "$50k - $150k",
        "consent": True,
        "source": "/services/automation",
    }
