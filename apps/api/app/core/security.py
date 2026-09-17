"""Security primitives: admin authentication, rate limiting, IP handling and error envelopes.

Specification §14, §17, §22; instruction §31, §32.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def client_ip(request: Request) -> str:
    """Resolve the caller's IP address.

    `X-Forwarded-For` is only trusted because this service is never exposed directly: Nginx
    terminates TLS and rewrites the header, and the container network does not route to the API
    from outside. If that topology changes, this must be revisited — a spoofable client IP defeats
    rate limiting entirely.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Left-most entry is the original client; the rest are proxies.
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


def hash_ip(ip: str) -> str:
    """One-way hash of an IP address for abuse correlation.

    The raw address is never stored. The secret key acts as a salt, so hashes are not comparable
    across deployments and cannot be reversed with a rainbow table of the IPv4 space.
    """
    return hmac.new(
        settings.secret_key.encode("utf-8"),
        ip.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()[:32]


limiter = Limiter(
    key_func=client_ip,
    enabled=settings.rate_limit_enabled,
    default_limits=[settings.rate_limit_default],
    storage_uri=settings.rate_limit_storage_uri or "memory://",
    headers_enabled=True,
)


_bearer_scheme = HTTPBearer(auto_error=False, description="Admin API key")


async def require_admin(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
    request: Request,
) -> str:
    """Authenticate an administrative request.

    Notes:
    - When no admin key is configured the admin API is *disabled*, not open. A missing secret
      must never mean "no authentication required".
    - Comparison uses `secrets.compare_digest` so a wrong key cannot be discovered by timing.
    - Failures are logged with the hashed IP for audit (specification §18) but never with the
      supplied token.
    """
    if not settings.admin_enabled:
        logger.warning("admin_api_disabled", path=request.url.path)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found.",
        )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expected = settings.admin_api_key or ""
    if not secrets.compare_digest(credentials.credentials, expected):
        logger.warning(
            "admin_auth_failed",
            path=request.url.path,
            ip_hash=hash_ip(client_ip(request)),
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return "admin"


AdminPrincipal = Annotated[str, Depends(require_admin)]
