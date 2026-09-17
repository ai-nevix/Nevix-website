"""Structured logging (specification §14, §24; instruction §49).

Every log line carries a timestamp, service name, level, event and — for anything inside a request
— a request id, method, path, status and latency.

Redaction is applied as a processor rather than left to each call site, because "remember not to
log the password" is not a control. Any key that looks like a credential is replaced before the
record is rendered, wherever in the codebase it was added.
"""

from __future__ import annotations

import logging
import sys
from collections.abc import MutableMapping
from typing import Any

import structlog
from structlog.types import EventDict, Processor

from app.core.config import settings

# Keys whose values are never written to a log, at any level, in any environment.
_SENSITIVE_KEYS = frozenset(
    {
        "password",
        "passwd",
        "secret",
        "secret_key",
        "token",
        "api_key",
        "apikey",
        "admin_api_key",
        "authorization",
        "auth",
        "cookie",
        "session",
        "smtp_password",
        "s3_secret_key",
        "database_url",
        "credentials",
        "private_key",
    }
)

_REDACTED = "[redacted]"


def _redact(_logger: Any, _name: str, event_dict: EventDict) -> EventDict:
    """Replace any value whose key looks sensitive, recursively."""

    def scrub(value: Any) -> Any:
        if isinstance(value, MutableMapping):
            return {
                key: _REDACTED if _is_sensitive(str(key)) else scrub(item)
                for key, item in value.items()
            }
        if isinstance(value, list):
            return [scrub(item) for item in value]
        return value

    return {
        key: _REDACTED if _is_sensitive(str(key)) else scrub(value)
        for key, value in event_dict.items()
    }


def _is_sensitive(key: str) -> bool:
    lowered = key.lower()
    return any(marker in lowered for marker in _SENSITIVE_KEYS)


def _add_service_context(_logger: Any, _name: str, event_dict: EventDict) -> EventDict:
    event_dict.setdefault("service", "vastrix-api")
    event_dict.setdefault("environment", settings.app_env)
    event_dict.setdefault("version", settings.app_version)
    return event_dict


def configure_logging() -> None:
    """Configure structlog and route the standard library logger through it."""
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
        _add_service_context,
        _redact,
    ]

    renderer: Processor = (
        structlog.processors.JSONRenderer()
        if settings.log_format == "json"
        else structlog.dev.ConsoleRenderer(colors=True)
    )

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Send uvicorn and SQLAlchemy output through the same pipeline so operators read one format.
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        structlog.stdlib.ProcessorFormatter(
            foreign_pre_chain=shared_processors,
            processors=[structlog.stdlib.ProcessorFormatter.remove_processors_meta, renderer],
        )
    )

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(log_level)

    for noisy in ("uvicorn", "uvicorn.error", "uvicorn.access", "sqlalchemy.engine"):
        logger = logging.getLogger(noisy)
        logger.handlers = []
        logger.propagate = True

    # The access log duplicates our own request middleware, which carries more context.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """Return a bound logger."""
    return structlog.get_logger(name)  # type: ignore[no-any-return]
