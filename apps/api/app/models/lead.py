"""Lead, contact event and newsletter models (specification §16).

Content entities — services, solutions, industries, products, case studies, insights — are owned
by the CMS and deliberately NOT duplicated here (specification §16, instruction §28).
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

# JSONB on PostgreSQL, plain JSON elsewhere so the test suite can run on SQLite.
JsonColumn = JSON().with_variant(JSONB(), "postgresql")


class LeadStatus(str, enum.Enum):
    """Lifecycle of an enquiry."""

    NEW = "new"
    REVIEWING = "reviewing"
    QUALIFIED = "qualified"
    CONTACTED = "contacted"
    CLOSED = "closed"
    SPAM = "spam"


class ContactEventType(str, enum.Enum):
    """Auditable events attached to a lead."""

    CREATED = "created"
    NOTIFICATION_SENT = "notification_sent"
    NOTIFICATION_FAILED = "notification_failed"
    STATUS_CHANGED = "status_changed"
    NOTE_ADDED = "note_added"
    VIEWED = "viewed"


class ConsentStatus(str, enum.Enum):
    """Double opt-in state for a newsletter subscriber."""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    UNSUBSCRIBED = "unsubscribed"


class Lead(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """An enquiry submitted through the contact form."""

    __tablename__ = "leads"
    __table_args__ = (
        # Admin listing is filtered by status and ordered by recency.
        Index("ix_leads_status_created_at", "status", "created_at"),
    )

    # Short human-quotable identifier, e.g. VX-7KQ2M4. Shown in the confirmation and in emails,
    # so support can find a record without the customer reading out a UUID.
    reference: Mapped[str] = mapped_column(String(16), unique=True, nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True)
    organization: Mapped[str | None] = mapped_column(String(160))

    service_interest: Mapped[str] = mapped_column(String(80), nullable=False)
    industry: Mapped[str | None] = mapped_column(String(80))
    requirement: Mapped[str] = mapped_column(Text, nullable=False)
    timeline: Mapped[str | None] = mapped_column(String(40))
    budget: Mapped[str | None] = mapped_column(String(40))
    attachment_url: Mapped[str | None] = mapped_column(String(512))

    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status", native_enum=False, length=20),
        default=LeadStatus.NEW,
        nullable=False,
        index=True,
    )

    # Page the enquiry came from, for attribution.
    source: Mapped[str | None] = mapped_column(String(200))

    consent: Mapped[bool] = mapped_column(nullable=False, default=False)
    consented_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Hashed, never the raw address — see app.core.security.hash_ip.
    ip_hash: Mapped[str | None] = mapped_column(String(64), index=True)
    user_agent: Mapped[str | None] = mapped_column(String(400))

    # Free-form internal notes. Not exposed on any public endpoint.
    internal_notes: Mapped[str | None] = mapped_column(Text)

    events: Mapped[list[ContactEvent]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ContactEvent.created_at",
    )

    def __repr__(self) -> str:
        return f"<Lead {self.reference} status={self.status.value}>"


class ContactEvent(UUIDPrimaryKeyMixin, Base):
    """An audit entry against a lead.

    Append-only: entries are never updated or deleted, which is what makes the history a usable
    record of what happened to an enquiry.
    """

    __tablename__ = "contact_events"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    event_type: Mapped[ContactEventType] = mapped_column(
        Enum(ContactEventType, name="contact_event_type", native_enum=False, length=30),
        nullable=False,
    )

    # Structured detail. Must never contain the enquiry body, credentials or an email address.
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column("metadata", JsonColumn)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    lead: Mapped[Lead] = relationship(back_populates="events")

    def __repr__(self) -> str:
        return f"<ContactEvent {self.event_type.value} lead={self.lead_id}>"


class NewsletterSubscriber(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A newsletter subscriber, tracked through double opt-in."""

    __tablename__ = "newsletter_subscribers"

    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False, index=True)

    consent_status: Mapped[ConsentStatus] = mapped_column(
        Enum(ConsentStatus, name="consent_status", native_enum=False, length=20),
        default=ConsentStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Single-use token for the confirmation link, cleared once used.
    confirmation_token: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    confirmation_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    unsubscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Persistent token so an unsubscribe link keeps working in old emails.
    unsubscribe_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)

    source: Mapped[str | None] = mapped_column(String(200))
    ip_hash: Mapped[str | None] = mapped_column(String(64))

    def __repr__(self) -> str:
        return f"<NewsletterSubscriber status={self.consent_status.value}>"


class SiteSetting(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Key/value site configuration editable without a redeploy.

    Values here override the corresponding environment defaults when present, so an operator can
    correct a phone number or contact address without a release.
    """

    __tablename__ = "site_settings"

    key: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    value: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(String(300))

    def __repr__(self) -> str:
        return f"<SiteSetting {self.key}>"
