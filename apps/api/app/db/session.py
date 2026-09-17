"""Async database engine and session management."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# SQLite (used by the test suite) does not accept pool sizing arguments.
_is_sqlite = settings.database_url.startswith("sqlite")

_engine_kwargs: dict[str, object] = {
    "echo": settings.database_echo,
    # Recycle connections before a typical proxy or database idle timeout closes them, which
    # otherwise surfaces as an intermittent "server closed the connection unexpectedly".
    "pool_pre_ping": True,
}

if not _is_sqlite:
    _engine_kwargs.update(
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_recycle=1800,
    )

engine: AsyncEngine = create_async_engine(settings.database_url, **_engine_kwargs)

SessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession]:
    """FastAPI dependency yielding a request-scoped session.

    The session is rolled back on any exception and always closed, so a failed request cannot
    leave a transaction open and hold locks.
    """
    async with SessionFactory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


DbSession = Annotated[AsyncSession, Depends(get_session)]


async def dispose_engine() -> None:
    """Close all pooled connections. Called on application shutdown."""
    await engine.dispose()
