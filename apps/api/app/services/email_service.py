"""SMTP delivery.

Design position: email is best-effort. If SMTP is unconfigured or unreachable, the enquiry is
still recorded and the visitor still gets a confirmation — losing a lead because a mail server was
down would be the worse failure. The outcome is reported back to the caller so the response can
say honestly whether a notification was sent, and the attempt is recorded as a contact event.

Instruction §72: credentials come from configuration and never appear in source or logs.
"""

from __future__ import annotations

import re
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# A newline in a header value allows arbitrary header injection (adding Bcc, rewriting the
# subject). Rejecting them at the boundary is simpler and safer than trying to encode around it.
_HEADER_UNSAFE = re.compile(r"[\r\n]")


def _sanitise_header(value: str) -> str:
    return _HEADER_UNSAFE.sub(" ", value).strip()


class EmailService:
    """Sends transactional email over SMTP."""

    @property
    def enabled(self) -> bool:
        return settings.email_configured

    async def send(
        self,
        *,
        to: str,
        subject: str,
        text_body: str,
        html_body: str | None = None,
        reply_to: str | None = None,
    ) -> bool:
        """Send one message. Returns True when the server accepted it.

        Never raises: the caller's operation must not fail because mail delivery did.
        """
        if not settings.smtp_host:
            logger.info("email_skipped_not_configured", subject=_sanitise_header(subject))
            return False

        message = EmailMessage()
        message["From"] = f"{settings.email_from_name} <{settings.email_from}>"
        message["To"] = _sanitise_header(to)
        message["Subject"] = _sanitise_header(subject)
        if reply_to:
            message["Reply-To"] = _sanitise_header(reply_to)

        message.set_content(text_body)
        if html_body:
            message.add_alternative(html_body, subtype="html")

        try:
            await aiosmtplib.send(
                message,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                username=settings.smtp_user,
                password=settings.smtp_password,
                start_tls=settings.smtp_use_tls,
                timeout=settings.smtp_timeout_seconds,
            )
        except Exception as error:
            # The exception type is useful; its message can contain the recipient address, so it
            # is deliberately not logged (instruction §49).
            logger.warning(
                "email_send_failed",
                subject=_sanitise_header(subject),
                error_type=type(error).__name__,
            )
            return False

        logger.info("email_sent", subject=_sanitise_header(subject))
        return True


email_service = EmailService()
