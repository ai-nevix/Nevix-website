"""ORM models.

Imported here so Alembic autogenerate sees every table through `Base.metadata`.
"""

from app.models.lead import (
    ConsentStatus,
    ContactEvent,
    ContactEventType,
    Lead,
    LeadStatus,
    NewsletterSubscriber,
    SiteSetting,
)

__all__ = [
    "ConsentStatus",
    "ContactEvent",
    "ContactEventType",
    "Lead",
    "LeadStatus",
    "NewsletterSubscriber",
    "SiteSetting",
]
