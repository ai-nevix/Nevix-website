"""Data access for leads, contact events and newsletter subscribers.

All database access lives in this layer. Route handlers never build queries, and services depend
on this interface rather than on SQLAlchemy — specification §14 ("keep business logic out of route
handlers", "database access belongs in repositories").
"""

from __future__ import annotations

import secrets
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import (
    ConsentStatus,
    ContactEvent,
    ContactEventType,
    Lead,
    LeadStatus,
    NewsletterSubscriber,
    SiteSetting,
)

# Unambiguous alphabet: no O/0, I/1, or similar pairs, so a reference can be read aloud or
# transcribed from an email without error.
_REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
_REFERENCE_LENGTH = 6


def _generate_reference() -> str:
    body = "".join(secrets.choice(_REFERENCE_ALPHABET) for _ in range(_REFERENCE_LENGTH))
    return f"VX-{body}"


class LeadRepository:
    """Persistence operations for enquiries."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def _allocate_reference(self) -> str:
        """Generate a reference that is not already taken.

        The collision probability at this alphabet and length is negligible, but the column is
        unique, so a retry loop is cheaper than an occasional 500.
        """
        for _ in range(6):
            candidate = _generate_reference()
            existing = await self._session.scalar(
                select(Lead.id).where(Lead.reference == candidate).limit(1)
            )
            if existing is None:
                return candidate

        # Falls back to a longer reference rather than failing the submission.
        return f"VX-{uuid.uuid4().hex[:10].upper()}"

    async def create(
        self,
        *,
        name: str,
        email: str,
        organization: str | None,
        service_interest: str,
        industry: str | None,
        requirement: str,
        timeline: str | None,
        budget: str | None,
        attachment_url: str | None,
        source: str | None,
        consent: bool,
        ip_hash: str | None,
        user_agent: str | None,
        status: LeadStatus = LeadStatus.NEW,
    ) -> Lead:
        lead = Lead(
            reference=await self._allocate_reference(),
            name=name,
            email=email,
            organization=organization,
            service_interest=service_interest,
            industry=industry,
            requirement=requirement,
            timeline=timeline,
            budget=budget,
            attachment_url=attachment_url,
            source=source,
            consent=consent,
            consented_at=datetime.now(UTC) if consent else None,
            ip_hash=ip_hash,
            user_agent=(user_agent or "")[:400] or None,
            status=status,
        )
        self._session.add(lead)
        await self._session.flush()
        return lead

    async def get_by_id(self, lead_id: uuid.UUID) -> Lead | None:
        return await self._session.get(Lead, lead_id)

    async def get_by_reference(self, reference: str) -> Lead | None:
        return await self._session.scalar(select(Lead).where(Lead.reference == reference))

    async def list_leads(
        self,
        *,
        page: int = 1,
        page_size: int = 25,
        status: LeadStatus | None = None,
        search: str | None = None,
    ) -> tuple[list[Lead], int]:
        """Return a page of leads, newest first, with the total matching count."""
        conditions = []
        if status is not None:
            conditions.append(Lead.status == status)
        if search:
            # Case-insensitive contains. Parameterised by SQLAlchemy, so the pattern cannot be
            # used for injection; the wildcards are escaped so a literal % is not a wildcard.
            escaped = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            pattern = f"%{escaped}%"
            conditions.append(
                Lead.name.ilike(pattern, escape="\\")
                | Lead.email.ilike(pattern, escape="\\")
                | Lead.organization.ilike(pattern, escape="\\")
                | Lead.reference.ilike(pattern, escape="\\")
            )

        base = select(Lead)
        if conditions:
            for condition in conditions:
                base = base.where(condition)

        total = await self._session.scalar(
            select(func.count()).select_from(base.subquery())
        )

        rows = await self._session.scalars(
            base.order_by(Lead.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return list(rows), int(total or 0)

    async def update(
        self,
        lead: Lead,
        *,
        status: LeadStatus | None = None,
        internal_notes: str | None = None,
    ) -> Lead:
        if status is not None and status != lead.status:
            previous = lead.status
            lead.status = status
            await self.add_event(
                lead,
                ContactEventType.STATUS_CHANGED,
                {"from": previous.value, "to": status.value},
            )

        if internal_notes is not None:
            lead.internal_notes = internal_notes
            await self.add_event(lead, ContactEventType.NOTE_ADDED, None)

        await self._session.flush()
        return lead

    async def add_event(
        self,
        lead: Lead,
        event_type: ContactEventType,
        metadata: dict[str, Any] | None = None,
    ) -> ContactEvent:
        """Append an audit entry.

        `metadata` must never contain the enquiry body, an email address or any credential — it is
        written to the database and echoed into logs (instruction §49).
        """
        event = ContactEvent(lead_id=lead.id, event_type=event_type, event_metadata=metadata)
        self._session.add(event)
        await self._session.flush()
        return event

    async def count_recent_from_ip(self, ip_hash: str, since: datetime) -> int:
        """How many enquiries this hashed IP has submitted since `since`.

        A second line of defence behind the request rate limiter, which catches submissions that
        arrive slowly enough to stay under it.
        """
        total = await self._session.scalar(
            select(func.count())
            .select_from(Lead)
            .where(Lead.ip_hash == ip_hash, Lead.created_at >= since)
        )
        return int(total or 0)


class NewsletterRepository:
    """Persistence operations for newsletter subscribers."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_email(self, email: str) -> NewsletterSubscriber | None:
        return await self._session.scalar(
            select(NewsletterSubscriber).where(NewsletterSubscriber.email == email.lower())
        )

    async def get_by_confirmation_token(self, token: str) -> NewsletterSubscriber | None:
        return await self._session.scalar(
            select(NewsletterSubscriber).where(NewsletterSubscriber.confirmation_token == token)
        )

    async def get_by_unsubscribe_token(self, token: str) -> NewsletterSubscriber | None:
        return await self._session.scalar(
            select(NewsletterSubscriber).where(NewsletterSubscriber.unsubscribe_token == token)
        )

    async def create_pending(
        self,
        *,
        email: str,
        source: str | None,
        ip_hash: str | None,
    ) -> NewsletterSubscriber:
        subscriber = NewsletterSubscriber(
            email=email.lower(),
            consent_status=ConsentStatus.PENDING,
            confirmation_token=secrets.token_urlsafe(32),
            confirmation_sent_at=datetime.now(UTC),
            unsubscribe_token=secrets.token_urlsafe(32),
            source=source,
            ip_hash=ip_hash,
        )
        self._session.add(subscriber)
        await self._session.flush()
        return subscriber

    async def confirm(self, subscriber: NewsletterSubscriber) -> NewsletterSubscriber:
        subscriber.consent_status = ConsentStatus.CONFIRMED
        subscriber.confirmed_at = datetime.now(UTC)
        # Single-use: clearing the token prevents replay of a confirmation link.
        subscriber.confirmation_token = None
        await self._session.flush()
        return subscriber

    async def unsubscribe(self, subscriber: NewsletterSubscriber) -> NewsletterSubscriber:
        subscriber.consent_status = ConsentStatus.UNSUBSCRIBED
        subscriber.unsubscribed_at = datetime.now(UTC)
        await self._session.flush()
        return subscriber

    async def reissue_confirmation(
        self, subscriber: NewsletterSubscriber
    ) -> NewsletterSubscriber:
        """Issue a fresh confirmation token for a subscriber who never confirmed."""
        subscriber.confirmation_token = secrets.token_urlsafe(32)
        subscriber.confirmation_sent_at = datetime.now(UTC)
        await self._session.flush()
        return subscriber


class SiteSettingRepository:
    """Key/value overrides for publicly exposed site configuration."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_all(self) -> dict[str, str | None]:
        rows = await self._session.scalars(select(SiteSetting))
        return {row.key: row.value for row in rows}

    async def set(self, key: str, value: str | None, description: str | None = None) -> SiteSetting:
        existing = await self._session.scalar(select(SiteSetting).where(SiteSetting.key == key))
        if existing is None:
            existing = SiteSetting(key=key, value=value, description=description)
            self._session.add(existing)
        else:
            existing.value = value
            if description is not None:
                existing.description = description
        await self._session.flush()
        return existing


__all__ = [
    "LeadRepository",
    "NewsletterRepository",
    "SiteSettingRepository",
]
