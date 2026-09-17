"""VASTRIX API application.

Composition root: configuration, logging, middleware, routers, error handling and lifespan.

Specification §14 (backend), §17 (API), §22 (security), §24 (observability).
"""

from __future__ import annotations

import time
import uuid
from collections.abc import AsyncGenerator, Awaitable, Callable
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1 import api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.security import client_ip, hash_ip, limiter
from app.db.session import dispose_engine
from app.schemas.contact import ErrorDetail, ErrorResponse

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    """Startup and shutdown."""
    logger.info(
        "application_starting",
        environment=settings.app_env,
        version=settings.app_version,
        email_configured=settings.email_configured,
        admin_enabled=settings.admin_enabled,
        rate_limiting=settings.rate_limit_enabled,
    )

    # Stated explicitly at startup so an operator can see from the logs that the admin surface is
    # off, rather than assuming it is protected.
    if not settings.admin_enabled:
        logger.warning("admin_api_disabled_no_key_configured")

    yield

    logger.info("application_stopping")
    await dispose_engine()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Backend for the VASTRIX website: contact and lead management, newsletter "
        "subscriptions, attachment uploads and public site configuration."
    ),
    lifespan=lifespan,
    # Interactive documentation is useful in development and is an unnecessary disclosure of the
    # API surface in production.
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
    debug=settings.debug,
)

app.state.limiter = limiter


# ---------------------------------------------------------------------------------------------
# Middleware. Order matters: the last one added is the outermost, so request context is
# established before anything else runs.
# ---------------------------------------------------------------------------------------------

if settings.rate_limit_enabled:
    app.add_middleware(SlowAPIMiddleware)

if settings.cors_origins:
    # Only reached when a client genuinely calls cross-origin. The website uses a same-origin
    # proxy, so this list is normally empty. Never "*" — enforced in Settings.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
        max_age=600,
    )

if settings.is_production:
    # Defence against Host-header poisoning. Nginx already enforces server_name; this is the
    # application-level equivalent for the case where it is bypassed.
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["api.vastrix.ai", "www.vastrix.ai", "vastrix.ai", "api", "localhost"],
    )


@app.middleware("http")
async def request_context(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Bind a request id and emit one structured access log line per request.

    The request id is returned as `X-Request-ID` and included in error responses, so a user report
    can be tied to a specific log entry without exposing anything about the failure.
    """
    request_id = request.headers.get("x-request-id") or uuid.uuid4().hex[:16]

    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        method=request.method,
        path=request.url.path,
    )

    request.state.request_id = request_id
    started = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        latency_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.exception(
            "request_failed",
            latency_ms=latency_ms,
            ip_hash=hash_ip(client_ip(request)),
        )
        raise

    latency_ms = round((time.perf_counter() - started) * 1000, 2)
    response.headers["X-Request-ID"] = request_id

    # Health probes run constantly; logging every one buries real traffic.
    if not request.url.path.startswith("/api/v1/health"):
        logger.info(
            "request_completed",
            status=response.status_code,
            latency_ms=latency_ms,
        )

    return response


@app.middleware("http")
async def security_headers(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Baseline security headers on API responses.

    Nginx sets these at the edge too. Setting them here means a direct call — or a misconfigured
    proxy — still gets them (specification §22).
    """
    response = await call_next(request)

    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Cross-Origin-Resource-Policy", "same-origin")
    # JSON API responses are never a document; an empty policy blocks everything.
    response.headers.setdefault(
        "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"
    )
    response.headers.setdefault("Cache-Control", "no-store")

    if settings.is_production:
        response.headers.setdefault(
            "Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"
        )

    return response


# ---------------------------------------------------------------------------------------------
# Error handling. Every failure returns the same envelope (specification §14) and never leaks an
# internal message, a stack trace or a connection string (instruction §52).
# ---------------------------------------------------------------------------------------------


def _error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    request: Request,
    details: dict[str, list[str]] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    body = ErrorResponse(
        error=ErrorDetail(
            code=code,
            message=message,
            details=details,
            request_id=getattr(request.state, "request_id", None),
        )
    )
    return JSONResponse(status_code=status_code, content=body.model_dump(), headers=headers)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Turn Pydantic validation errors into field-keyed messages the form can display."""
    details: dict[str, list[str]] = {}

    for error in exc.errors():
        # location is ("body", "field_name") for a JSON body.
        location = [str(part) for part in error["loc"] if part not in {"body", "query", "path"}]
        field = ".".join(location) or "_root"
        message = error.get("msg", "Invalid value")
        # Pydantic prefixes custom validator messages; the prefix is noise to a form user.
        message = message.removeprefix("Value error, ")
        details.setdefault(field, []).append(message)

    logger.info("request_validation_failed", fields=sorted(details))

    return _error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        code="validation_error",
        message="Some of the details provided were not valid.",
        request=request,
        details=details,
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Explain the limit without implying the caller did something wrong."""
    logger.warning("rate_limit_exceeded", ip_hash=hash_ip(client_ip(request)))

    return _error_response(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        code="rate_limited",
        message=(
            "You have made several requests in a short time. "
            "Please wait a few minutes before trying again."
        ),
        request=request,
        headers={"Retry-After": str(getattr(exc, "retry_after", 60) or 60)},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Map HTTP exceptions onto the shared envelope."""
    codes = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        405: "method_not_allowed",
        413: "payload_too_large",
        415: "unsupported_media_type",
    }

    return _error_response(
        status_code=exc.status_code,
        code=codes.get(exc.status_code, "error"),
        message=str(exc.detail) if exc.detail else "Request failed.",
        request=request,
        headers=dict(exc.headers) if exc.headers else None,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Last resort.

    The exception is logged in full with its traceback; the response carries only a generic
    message and the request id.
    """
    logger.exception("unhandled_exception", error_type=type(exc).__name__)

    return _error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="internal_error",
        message="Something went wrong on our side. Please try again shortly.",
        request=request,
    )


# ---------------------------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------------------------

app.include_router(api_router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    """Minimal service identity. Deliberately discloses nothing about the deployment."""
    return {"service": settings.app_name, "status": "ok"}


# ---------------------------------------------------------------------------------------------
# Metrics (specification §24)
# ---------------------------------------------------------------------------------------------

if settings.metrics_enabled:
    from prometheus_fastapi_instrumentator import Instrumentator

    # `/metrics` is bound on the application but is never exposed publicly — Nginx does not proxy
    # it, and Prometheus scrapes it over the internal container network (instruction §48).
    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        excluded_handlers=["/metrics", "/api/v1/health/live"],
    ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
