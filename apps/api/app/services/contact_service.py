"""Contact and newsletter business logic.

Route handlers stay thin; everything that decides what happens to an enquiry lives here
(specification §14).
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.models.lead import ConsentStatus, ContactEventType, Lead, LeadStatus
from app.repositories import LeadRepository, NewsletterRepository
from app.schemas.contact import ContactRequest, NewsletterRequest
from app.services.email_service import email_service
from app.services.email_templates import (
    lead_acknowledgement,
    lead_notification,
    newsletter_confirmation,
)

logger = get_logger(__name__)

# A single IP submitting more than this in a day is either testing or abusing the form. Further
# submissions are still stored — so nothing is lost if the assessment is wrong — but flagged as
# spam so they do not generate notifications or reach the review queue.
_MAX_LEADS_PER_IP_PER_DAY = 10


class ContactResult:
    """Outcome of processing an enquiry."""

    def __init__(self, lead: Lead, notification_sent: bool) -> None:
        self.lead = lead
        self.notification_sent = notification_sent


class ContactService:
    """Creates leads, records audit events and dispatches notifications."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._leads = LeadRepository(session)
        self._newsletter = NewsletterRepository(session)

    async def submit_enquiry(
        self,
        payload: ContactRequest,
        *,
        ip_hash: str,
        user_agent: str | None,
    ) -> ContactResult:
        """Record an enquiry and attempt to notify the team.

        Spam handling is deliberately silent. A submission that trips the honeypot or the
        per-IP threshold is stored with `status=SPAM` and the caller receives an ordinary success
        response. Telling an automated submitter that it was detected only helps it adapt, and a
        false positive would otherwise discard a real enquiry with no record.
        """
        is_spam = bool(payload.website)

        if not is_spam:
            recent = await self._leads.count_recent_from_ip(
                ip_hash, datetime.now(UTC) - timedelta(days=1)
            )
            if recent >= _MAX_LEADS_PER_IP_PER_DAY:
                is_spam = True
                logger.warning("contact_ip_threshold_exceeded", ip_hash=ip_hash, recent=recent)

        lead = await self._leads.create(
            name=payload.name,
            email=str(payload.email),
            organization=payload.organization,
            service_interest=payload.service_interest,
            industry=payload.industry,
            requirement=payload.requirement,
            timeline=payload.timeline,
            budget=payload.budget,
            attachment_url=payload.attachment_url,
            source=payload.source,
            consent=payload.consent,
            ip_hash=ip_hash,
            user_agent=user_agent,
            status=LeadStatus.SPAM if is_spam else LeadStatus.NEW,
        )

        await self._leads.add_event(
            lead,
            ContactEventType.CREATED,
            # No personal data in the audit metadata — it is echoed into logs.
            {"service_interest": payload.service_interest, "flagged_spam": is_spam},
        )

        notification_sent = False

        if not is_spam:
            notification_sent = await self._notify(lead)
            await self._leads.add_event(
                lead,
                (
                    ContactEventType.NOTIFICATION_SENT
                    if notification_sent
                    else ContactEventType.NOTIFICATION_FAILED
                ),
                {"channel": "email"},
            )

        await self._session.commit()

        logger.info(
            "lead_created",
            reference=lead.reference,
            service_interest=lead.service_interest,
            flagged_spam=is_spam,
            notification_sent=notification_sent,
        )

        return ContactResult(lead=lead, notification_sent=notification_sent)

    async def _notify(self, lead: Lead) -> bool:
        """Send the internal notification and the visitor acknowledgement."""
        if not settings.email_configured or not settings.email_notify_to:
            return False

        subject, text, html = lead_notification(
            reference=lead.reference,
            name=lead.name,
            email=lead.email,
            organization=lead.organization,
            service_interest=lead.service_interest,
            industry=lead.industry,
            requirement=lead.requirement,
            timeline=lead.timeline,
            budget=lead.budget,
            attachment_url=lead.attachment_url,
            source=lead.source,
        )

        sent = await email_service.send(
            to=settings.email_notify_to,
            subject=subject,
            text_body=text,
            html_body=html,
            # Lets a team member reply to the enquirer without copying the address out.
            reply_to=lead.email,
        )

        # The acknowledgement is a courtesy; its failure does not change the reported outcome.
        ack_subject, ack_text, ack_html = lead_acknowledgement(
            reference=lead.reference, name=lead.name
        )
        await email_service.send(
            to=lead.email,
            subject=ack_subject,
            text_body=ack_text,
            html_body=ack_html,
        )

        return sent

    async def subscribe_newsletter(
        self,
        payload: NewsletterRequest,
        *,
        ip_hash: str,
    ) -> tuple[str, str]:
        """Start double opt-in for a newsletter subscription.

        Returns (status, message). The response is intentionally identical whether or not the
        address was already known: a differing response would turn this endpoint into an oracle
        for whether a given address is subscribed.
        """
        generic_message = (
            "Almost there — check your inbox for a confirmation link. "
            "You will not receive anything until you confirm."
        )

        if payload.website:
            logger.info("newsletter_honeypot_triggered")
            return "pending_confirmation", generic_message

        email = str(payload.email).lower()
        existing = await self._newsletter.get_by_email(email)

        if existing and existing.consent_status is ConsentStatus.CONFIRMED:
            await self._session.commit()
            return "already_subscribed", generic_message

        if existing:
            subscriber = await self._newsletter.reissue_confirmation(existing)
        else:
            subscriber = await self._newsletter.create_pending(
                email=email, source=payload.source, ip_hash=ip_hash
            )

        if subscriber.confirmation_token:
            confirm_url = (
                f"{settings.site_url.rstrip('/')}"
                f"/newsletter/confirm?token={subscriber.confirmation_token}"
            )
            subject, text, html = newsletter_confirmation(confirm_url=confirm_url)
            await email_service.send(
                to=email, subject=subject, text_body=text, html_body=html
            )

        await self._session.commit()
        logger.info("newsletter_subscription_pending")

        return "pending_confirmation", generic_message

    async def confirm_newsletter(self, token: str) -> bool:
        """Complete double opt-in. Returns False for an unknown or already-used token."""
        subscriber = await self._newsletter.get_by_confirmation_token(token)
        if subscriber is None:
            return False

        await self._newsletter.confirm(subscriber)
        await self._session.commit()
        logger.info("newsletter_confirmed")
        return True

    async def unsubscribe_newsletter(self, token: str) -> bool:
        subscriber = await self._newsletter.get_by_unsubscribe_token(token)
        if subscriber is None:
            return False

        await self._newsletter.unsubscribe(subscriber)
        await self._session.commit()
        logger.info("newsletter_unsubscribed")
        return True
