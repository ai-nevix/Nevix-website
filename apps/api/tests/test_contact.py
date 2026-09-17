"""Contact endpoint tests — specification §27, instruction §51."""

from __future__ import annotations

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import ContactEvent, ContactEventType, Lead, LeadStatus


class TestContactSubmission:
    async def test_valid_submission_creates_lead(
        self,
        client: AsyncClient,
        session: AsyncSession,
        valid_contact_payload: dict[str, object],
    ) -> None:
        response = await client.post("/api/v1/contact", json=valid_contact_payload)

        assert response.status_code == 201, response.text
        body = response.json()

        assert body["reference"].startswith("VX-")
        assert body["id"]
        # Email is not configured in tests, so the response must say so rather than claim success.
        assert body["notification_sent"] is False

        lead = await session.scalar(select(Lead).where(Lead.reference == body["reference"]))
        assert lead is not None
        assert lead.email == "jane@example.org"
        assert lead.status is LeadStatus.NEW
        assert lead.consent is True
        assert lead.consented_at is not None
        # The raw IP is never stored.
        assert lead.ip_hash is not None
        assert "." not in lead.ip_hash

    async def test_submission_records_audit_event(
        self,
        client: AsyncClient,
        session: AsyncSession,
        valid_contact_payload: dict[str, object],
    ) -> None:
        response = await client.post("/api/v1/contact", json=valid_contact_payload)
        # The JSON id is a string; the column is a UUID type, so it must be converted before use
        # in a query or SQLAlchemy raises while binding the parameter.
        lead_id = uuid.UUID(response.json()["id"])

        events = list(
            await session.scalars(select(ContactEvent).where(ContactEvent.lead_id == lead_id))
        )

        assert any(event.event_type is ContactEventType.CREATED for event in events)

        created = next(e for e in events if e.event_type is ContactEventType.CREATED)
        # Audit metadata is echoed into logs, so it must not carry personal data.
        assert created.event_metadata is not None
        assert "email" not in created.event_metadata
        assert "requirement" not in created.event_metadata

    async def test_reference_is_unique_across_submissions(
        self, client: AsyncClient, valid_contact_payload: dict[str, object]
    ) -> None:
        references = set()
        for index in range(5):
            payload = {**valid_contact_payload, "email": f"person{index}@example.org"}
            response = await client.post("/api/v1/contact", json=payload)
            references.add(response.json()["reference"])

        assert len(references) == 5


class TestContactValidation:
    @pytest.mark.parametrize(
        ("field", "value", "reason"),
        [
            ("name", "A", "name shorter than two characters"),
            ("email", "not-an-email", "malformed email"),
            ("requirement", "Too short", "requirement under twenty characters"),
            ("service_interest", "Something Else", "service interest not on the allow-list"),
            ("consent", False, "consent not given"),
        ],
    )
    async def test_rejects_invalid_field(
        self,
        client: AsyncClient,
        valid_contact_payload: dict[str, object],
        field: str,
        value: object,
        reason: str,
    ) -> None:
        payload = {**valid_contact_payload, field: value}
        response = await client.post("/api/v1/contact", json=payload)

        assert response.status_code == 422, reason

        body = response.json()
        assert body["error"]["code"] == "validation_error"
        # The failing field is named so the form can highlight it.
        assert field in body["error"]["details"]

    async def test_rejects_unknown_fields(
        self, client: AsyncClient, valid_contact_payload: dict[str, object]
    ) -> None:
        """`extra="forbid"` stops a caller smuggling in a field the model does not expect."""
        payload = {**valid_contact_payload, "status": "qualified"}
        response = await client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422

    async def test_rejects_external_attachment_url(
        self, client: AsyncClient, valid_contact_payload: dict[str, object]
    ) -> None:
        """An arbitrary URL here would be an SSRF and phishing vector — see the schema."""
        payload = {**valid_contact_payload, "attachment_url": "https://evil.example/payload.pdf"}
        response = await client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422

    async def test_rejects_path_traversal_in_attachment_url(
        self, client: AsyncClient, valid_contact_payload: dict[str, object]
    ) -> None:
        payload = {**valid_contact_payload, "attachment_url": "/uploads/../../etc/passwd"}
        response = await client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422

    async def test_rejects_link_spam(
        self, client: AsyncClient, valid_contact_payload: dict[str, object]
    ) -> None:
        payload = {
            **valid_contact_payload,
            "requirement": " ".join(f"https://spam{i}.example" for i in range(8)),
        }
        response = await client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422

    async def test_error_response_has_consistent_envelope(
        self, client: AsyncClient, valid_contact_payload: dict[str, object]
    ) -> None:
        response = await client.post(
            "/api/v1/contact", json={**valid_contact_payload, "email": "nope"}
        )
        body = response.json()

        assert set(body) == {"error"}
        assert {"code", "message", "details", "request_id"} <= set(body["error"])
        assert body["error"]["request_id"]


class TestSpamHandling:
    async def test_honeypot_submission_is_flagged_not_rejected(
        self,
        client: AsyncClient,
        session: AsyncSession,
        valid_contact_payload: dict[str, object],
    ) -> None:
        """A bot gets an ordinary success response; the record is stored and flagged.

        Telling an automated submitter it was detected only helps it adapt, and rejecting outright
        would discard the record if the detection were wrong.
        """
        payload = {**valid_contact_payload, "website": "http://spam.example"}
        response = await client.post("/api/v1/contact", json=payload)

        assert response.status_code == 201
        assert response.json()["notification_sent"] is False

        lead = await session.scalar(
            select(Lead).where(Lead.reference == response.json()["reference"])
        )
        assert lead is not None
        assert lead.status is LeadStatus.SPAM

    async def test_control_characters_are_stripped(
        self, client: AsyncClient, session: AsyncSession, valid_contact_payload: dict[str, object]
    ) -> None:
        """Control characters are a header-injection vector once the value reaches an email."""
        payload = {**valid_contact_payload, "name": "Jane\r\nBcc: attacker@example.org"}
        response = await client.post("/api/v1/contact", json=payload)

        assert response.status_code == 201
        lead = await session.scalar(
            select(Lead).where(Lead.reference == response.json()["reference"])
        )
        assert lead is not None
        assert "\r" not in lead.name
        assert "\n" not in lead.name


class TestLeadsAlias:
    async def test_leads_endpoint_matches_contact(
        self, client: AsyncClient, valid_contact_payload: dict[str, object]
    ) -> None:
        """`/leads` is an alias required by specification §17; it must not diverge."""
        response = await client.post("/api/v1/leads", json=valid_contact_payload)
        assert response.status_code == 201
        assert response.json()["reference"].startswith("VX-")
