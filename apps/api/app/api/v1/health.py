"""Health and readiness endpoints (specification §14, §24)."""

# NOTE: this module deliberately does NOT use `from __future__ import annotations`.
# FastAPI resolves string annotations against the decorated function's module globals. Where a
# route is wrapped by slowapi's rate-limit decorator, that resolution fails and dependencies such
# as `DbSession` are misclassified as request-body fields, producing a confusing 422 on every
# call. Real annotations avoid the problem entirely. See docs/architecture/backend.md.


from fastapi import APIRouter, Response, status
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import get_logger
from app.db.session import DbSession
from app.schemas.contact import HealthCheck, HealthResponse

logger = get_logger(__name__)

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness and dependency health",
)
async def health(session: DbSession, response: Response) -> HealthResponse:
    """Report process health and the state of each dependency.

    Returns 200 when healthy and 503 when degraded, so a load balancer or orchestrator can act on
    the status code without parsing the body. The body never contains a connection string or an
    exception message — only the check name and a short, safe description.
    """
    checks: dict[str, HealthCheck] = {}

    try:
        await session.execute(text("SELECT 1"))
        checks["database"] = HealthCheck(status="ok")
    except Exception as error:
        logger.error("health_database_failed", error_type=type(error).__name__)
        checks["database"] = HealthCheck(status="error", detail="Database unreachable")

    checks["email"] = HealthCheck(
        status="ok",
        detail=(
            "configured"
            if settings.email_configured
            else "not configured (notifications disabled)"
        ),
    )

    checks["uploads"] = HealthCheck(
        status="ok",
        detail="enabled" if settings.uploads_enabled else "disabled",
    )

    degraded = any(check.status == "error" for check in checks.values())

    if degraded:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthResponse(
        status="degraded" if degraded else "ok",
        version=settings.app_version,
        environment=settings.app_env,
        checks=checks,
    )


@router.get(
    "/health/live",
    summary="Liveness probe",
    status_code=status.HTTP_200_OK,
)
async def liveness() -> dict[str, str]:
    """Liveness only — deliberately touches no dependency.

    A liveness probe that checks the database will restart a healthy process during a database
    outage, turning a recoverable incident into a restart loop.
    """
    return {"status": "ok"}


@router.get(
    "/health/ready",
    summary="Readiness probe",
)
async def readiness(session: DbSession, response: Response) -> dict[str, str]:
    """Readiness — the process should only receive traffic when the database is reachable."""
    try:
        await session.execute(text("SELECT 1"))
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not_ready"}

    return {"status": "ready"}
