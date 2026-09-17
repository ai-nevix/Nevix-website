"""Contact and lead endpoints (specification §17)."""

# NOTE: this module deliberately does NOT use `from __future__ import annotations`.
# FastAPI resolves string annotations against the decorated function's module globals. Where a
# route is wrapped by slowapi's rate-limit decorator, that resolution fails and dependencies such
# as `DbSession` are misclassified as request-body fields, producing a confusing 422 on every
# call. Real annotations avoid the problem entirely. See docs/architecture/backend.md.


from fastapi import APIRouter, Request, status

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import client_ip, hash_ip, limiter
from app.db.session import DbSession
from app.schemas.contact import ContactRequest, ContactResponse, ErrorResponse
from app.services.contact_service import ContactService

logger = get_logger(__name__)

router = APIRouter(tags=["contact"])


@router.post(
    "/contact",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a project enquiry",
    responses={
        422: {"model": ErrorResponse, "description": "Validation failed"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
    },
)
@limiter.limit(settings.rate_limit_contact)
async def submit_contact(
    request: Request,
    payload: ContactRequest,
    session: DbSession,
) -> ContactResponse:
    """Record an enquiry and notify the team.

    Rate limited per client IP. A submission that fails spam checks still receives a normal
    success response — see `ContactService.submit_enquiry` for why.
    """
    service = ContactService(session)

    result = await service.submit_enquiry(
        payload,
        ip_hash=hash_ip(client_ip(request)),
        user_agent=request.headers.get("user-agent"),
    )

    return ContactResponse(
        id=result.lead.id,
        reference=result.lead.reference,
        message=(
            "Thank you — your enquiry has been received. "
            f"Your reference is {result.lead.reference}."
        ),
        notification_sent=result.notification_sent,
    )


@router.post(
    "/leads",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a lead (alias of /contact)",
    include_in_schema=False,
)
@limiter.limit(settings.rate_limit_contact)
async def create_lead(
    request: Request,
    payload: ContactRequest,
    session: DbSession,
) -> ContactResponse:
    """Alias for `POST /contact`.

    Present because the specification's endpoint table (§17) lists both. They share one
    implementation so the two cannot diverge.
    """
    return await submit_contact(request, payload, session)
