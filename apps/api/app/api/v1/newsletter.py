"""Newsletter subscription endpoints with double opt-in."""

# NOTE: this module deliberately does NOT use `from __future__ import annotations`.
# FastAPI resolves string annotations against the decorated function's module globals. Where a
# route is wrapped by slowapi's rate-limit decorator, that resolution fails and dependencies such
# as `DbSession` are misclassified as request-body fields, producing a confusing 422 on every
# call. Real annotations avoid the problem entirely. See docs/architecture/backend.md.


from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings
from app.core.security import client_ip, hash_ip, limiter
from app.db.session import DbSession
from app.schemas.contact import (
    ErrorResponse,
    NewsletterConfirmRequest,
    NewsletterRequest,
    NewsletterResponse,
)
from app.services.contact_service import ContactService

router = APIRouter(tags=["newsletter"])


@router.post(
    "/newsletter",
    response_model=NewsletterResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Subscribe to the newsletter",
    responses={
        404: {"model": ErrorResponse, "description": "Newsletter is disabled"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
    },
)
@limiter.limit(settings.rate_limit_newsletter)
async def subscribe(
    request: Request,
    payload: NewsletterRequest,
    session: DbSession,
) -> NewsletterResponse:
    """Begin double opt-in.

    Returns 202: the subscription is not active until the recipient follows the confirmation
    link. The response is identical for a new and an existing address, so this endpoint cannot be
    used to test whether a given address is subscribed.
    """
    if not settings.newsletter_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")

    service = ContactService(session)
    subscription_status, message = await service.subscribe_newsletter(
        payload, ip_hash=hash_ip(client_ip(request))
    )

    return NewsletterResponse(message=message, status=subscription_status)  # type: ignore[arg-type]


@router.post(
    "/newsletter/confirm",
    response_model=NewsletterResponse,
    summary="Confirm a newsletter subscription",
    responses={400: {"model": ErrorResponse, "description": "Invalid or used token"}},
)
@limiter.limit(settings.rate_limit_newsletter)
async def confirm(
    request: Request,
    payload: NewsletterConfirmRequest,
    session: DbSession,
) -> NewsletterResponse:
    """Complete double opt-in using the single-use token from the confirmation email."""
    if not settings.newsletter_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")

    service = ContactService(session)
    confirmed = await service.confirm_newsletter(payload.token)

    if not confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That confirmation link is no longer valid. Please subscribe again.",
        )

    return NewsletterResponse(
        message="Thank you — your subscription is confirmed.",
        status="already_subscribed",
    )
