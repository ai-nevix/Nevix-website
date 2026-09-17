"""Request and response schemas for contact, lead and newsletter endpoints.

These mirror `packages/types/src/api.ts`. Validation here is authoritative — the frontend schema
is a UX affordance and is never trusted (specification §14, instruction §26).
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.lead import LeadStatus

# Kept in sync with SERVICE_INTERESTS in packages/types/src/api.ts.
ServiceInterest = Literal[
    "AI & Intelligence",
    "Automation",
    "Digital Engineering",
    "Data & Analytics",
    "Product & SaaS Engineering",
    "Consulting & Technology Advisory",
    "Not sure yet",
]

IndustryOption = Literal[
    "Government & Public Sector",
    "Healthcare",
    "Manufacturing",
    "Finance",
    "Education",
    "Enterprise / IT",
    "Other",
]

TimelineOption = Literal[
    "Immediate",
    "Within 1 month",
    "1-3 months",
    "3-6 months",
    "6+ months",
    "Exploring options",
]

BudgetOption = Literal[
    "Not disclosed",
    "Under $10k",
    "$10k - $50k",
    "$50k - $150k",
    "$150k+",
]

# Catches the most common spam pattern: a message body that is mostly links.
_URL_PATTERN = re.compile(r"https?://", re.IGNORECASE)
# Control characters have no legitimate place in a form field. Newlines are excluded from this
# class because `requirement` is a legitimately multi-line field.
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

# Single-line fields additionally reject newlines. `name` and `organization` end up in an email
# Subject and in the Reply-To display name, where an embedded CRLF is a header-injection vector
# (adding a Bcc, rewriting the subject). The email layer sanitises headers as well; the two checks
# are deliberately independent so neither is the single point of failure.
# U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR are treated as line breaks by
# JavaScript and by some mail clients, so they are stripped alongside CR and LF. They are
# written as escapes because the literal characters are invisible in source.
_LINE_BREAKS = re.compile("[\r\n\u2028\u2029]+")


def _clean(value: str) -> str:
    """Strip control characters and collapse surrounding whitespace."""
    return _CONTROL_CHARS.sub("", value).strip()


def _clean_single_line(value: str) -> str:
    """Clean a value that must stay on one line."""
    return _LINE_BREAKS.sub(" ", _clean(value)).strip()


class ContactRequest(BaseModel):
    """`POST /api/v1/contact` body."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: Annotated[str, Field(min_length=2, max_length=120)]
    email: Annotated[EmailStr, Field(max_length=254)]
    organization: Annotated[str | None, Field(default=None, max_length=160)]
    service_interest: ServiceInterest
    industry: IndustryOption | None = None
    requirement: Annotated[str, Field(min_length=20, max_length=5000)]
    timeline: TimelineOption | None = None
    budget: BudgetOption | None = None
    attachment_url: Annotated[str | None, Field(default=None, max_length=512)]
    consent: bool
    source: Annotated[str | None, Field(default=None, max_length=200)]

    # Honeypot. A non-empty value means an automated submission; see the endpoint for handling.
    website: Annotated[str | None, Field(default=None, max_length=200)] = None

    @field_validator("requirement", mode="after")
    @classmethod
    def _strip_control_characters(cls, value: str | None) -> str | None:
        return _clean(value) if value else value

    @field_validator("name", "organization", "source", mode="after")
    @classmethod
    def _strip_line_breaks(cls, value: str | None) -> str | None:
        return _clean_single_line(value) if value else value

    @field_validator("consent")
    @classmethod
    def _consent_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Consent is required before we can respond to your enquiry.")
        return value

    @field_validator("requirement")
    @classmethod
    def _reject_link_spam(cls, value: str) -> str:
        """Reject bodies that are predominantly links.

        A genuine enquiry occasionally includes a URL. One that is mostly URLs is link spam, and
        this check is cheap compared with a human reading it.
        """
        links = len(_URL_PATTERN.findall(value))
        if links >= 5:
            raise ValueError(
                "Your message contains too many links. "
                "Please describe your requirement in words."
            )
        return value

    @field_validator("attachment_url")
    @classmethod
    def _validate_attachment_url(cls, value: str | None) -> str | None:
        """Only accept an attachment reference this service issued.

        Accepting an arbitrary URL here would let a submitter point the notification email at a
        host they control, which is both an SSRF vector and a way to place a hostile link in
        front of staff.
        """
        if value is None:
            return None
        if not value.startswith("/uploads/"):
            raise ValueError("Invalid attachment reference.")
        if ".." in value:
            raise ValueError("Invalid attachment reference.")
        return value


class ContactResponse(BaseModel):
    """Confirmation returned after a successful enquiry."""

    id: uuid.UUID
    reference: str
    message: str
    notification_sent: bool


class NewsletterRequest(BaseModel):
    """`POST /api/v1/newsletter` body."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    email: Annotated[EmailStr, Field(max_length=254)]
    consent: bool
    source: Annotated[str | None, Field(default=None, max_length=200)]
    website: Annotated[str | None, Field(default=None, max_length=200)] = None

    @field_validator("consent")
    @classmethod
    def _consent_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Please confirm you would like to receive these emails.")
        return value


class NewsletterResponse(BaseModel):
    message: str
    status: Literal["pending_confirmation", "already_subscribed"]


class NewsletterConfirmRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: Annotated[str, Field(min_length=16, max_length=64)]


class LeadRead(BaseModel):
    """Administrative view of a lead.

    Deliberately excludes `ip_hash` and `user_agent`: they exist for abuse correlation, not for
    routine display, and there is no reason to surface them in a listing.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reference: str
    name: str
    email: str
    organization: str | None
    service_interest: str
    industry: str | None
    requirement: str
    timeline: str | None
    budget: str | None
    attachment_url: str | None
    status: LeadStatus
    source: str | None
    internal_notes: str | None
    created_at: datetime
    updated_at: datetime


class LeadUpdate(BaseModel):
    """`PATCH /api/v1/admin/leads/{id}` body."""

    model_config = ConfigDict(extra="forbid")

    status: LeadStatus | None = None
    internal_notes: Annotated[str | None, Field(default=None, max_length=5000)] = None


class PaginatedLeads(BaseModel):
    items: list[LeadRead]
    total: int
    page: int
    page_size: int
    pages: int


class SiteConfigFeatures(BaseModel):
    newsletter_enabled: bool
    attachments_enabled: bool
    search_enabled: bool


class SocialProfile(BaseModel):
    label: str
    href: str


class SiteConfigResponse(BaseModel):
    """Public configuration consumed by the frontend."""

    company_name: str
    tagline: str
    contact_email: str
    phone: str | None
    address: str | None
    social: list[SocialProfile]
    features: SiteConfigFeatures


class HealthCheck(BaseModel):
    status: Literal["ok", "error"]
    detail: str | None = None


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    version: str
    environment: str
    checks: dict[str, HealthCheck]


class UploadResponse(BaseModel):
    url: str
    filename: str
    content_type: str
    size_bytes: int


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, list[str]] | None = None
    request_id: str | None = None


class ErrorResponse(BaseModel):
    """The single error envelope every endpoint returns (specification §14)."""

    error: ErrorDetail


class SearchResultItem(BaseModel):
    type: str
    title: str
    excerpt: str
    href: str
    score: float


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[SearchResultItem]
