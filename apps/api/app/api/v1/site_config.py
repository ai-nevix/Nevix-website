"""Public site configuration endpoint (specification §17)."""

# NOTE: this module deliberately does NOT use `from __future__ import annotations`.
# FastAPI resolves string annotations against the decorated function's module globals. Where a
# route is wrapped by slowapi's rate-limit decorator, that resolution fails and dependencies such
# as `DbSession` are misclassified as request-body fields, producing a confusing 422 on every
# call. Real annotations avoid the problem entirely. See docs/architecture/backend.md.


import json

from fastapi import APIRouter

from app.core.config import settings
from app.core.logging import get_logger
from app.db.session import DbSession
from app.repositories import SiteSettingRepository
from app.schemas.contact import SiteConfigFeatures, SiteConfigResponse, SocialProfile

logger = get_logger(__name__)

router = APIRouter(tags=["site"])


@router.get(
    "/site-config",
    response_model=SiteConfigResponse,
    summary="Public site configuration",
)
async def site_config(session: DbSession) -> SiteConfigResponse:
    """Return publicly safe configuration.

    Values stored in `site_settings` override the environment defaults, so an operator can correct
    a contact detail without a deployment. Only the keys listed here are ever returned — the table
    is not dumped wholesale, so adding an internal setting cannot accidentally publish it.
    """
    repository = SiteSettingRepository(session)
    overrides = await repository.get_all()

    social: list[SocialProfile] = []
    raw_social = overrides.get("social_profiles")
    if raw_social:
        try:
            parsed = json.loads(raw_social)
            if isinstance(parsed, list):
                social = [
                    SocialProfile(label=str(item["label"]), href=str(item["href"]))
                    for item in parsed
                    if isinstance(item, dict) and "label" in item and "href" in item
                ]
        except (json.JSONDecodeError, KeyError, TypeError):
            logger.warning("site_config_invalid_social_profiles")

    return SiteConfigResponse(
        company_name=overrides.get("company_name") or settings.site_company_name,
        tagline=overrides.get("tagline") or settings.site_tagline,
        contact_email=overrides.get("contact_email") or settings.site_contact_email,
        phone=overrides.get("phone") or settings.site_phone,
        address=overrides.get("address") or settings.site_address,
        social=social,
        features=SiteConfigFeatures(
            newsletter_enabled=settings.newsletter_enabled,
            attachments_enabled=settings.uploads_enabled,
            search_enabled=settings.search_enabled,
        ),
    )
