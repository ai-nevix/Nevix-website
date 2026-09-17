"""Administrative endpoint tests — authentication, authorization and audit.

Specification §18, instruction §31, §74 (authentication bypass, authorization bypass, exposed
admin interfaces).
"""

from __future__ import annotations

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import ContactEvent, ContactEventType, Lead, LeadStatus


@pytest.fixture
async def created_lead(
    client: AsyncClient, valid_contact_payload: dict[str, object]
) -> dict[str, str]:
    response = await client.post("/api/v1/contact", json=valid_contact_payload)
    return response.json()


class TestAdminAuthentication:
    async def test_rejects_request_without_credentials(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/admin/leads")
        assert response.status_code == 401
        assert response.json()["error"]["code"] == "unauthorized"

    async def test_rejects_wrong_key(self, client: AsyncClient) -> None:
        response = await client.get(
            "/api/v1/admin/leads", headers={"Authorization": "Bearer wrong-key"}
        )
        assert response.status_code == 401

    async def test_rejects_non_bearer_scheme(self, client: AsyncClient) -> None:
        response = await client.get(
            "/api/v1/admin/leads",
            headers={"Authorization": "Basic dGVzdDp0ZXN0"},
        )
        assert response.status_code == 401

    async def test_accepts_valid_key(
        self, client: AsyncClient, admin_headers: dict[str, str]
    ) -> None:
        response = await client.get("/api/v1/admin/leads", headers=admin_headers)
        assert response.status_code == 200

    async def test_error_body_discloses_nothing(self, client: AsyncClient) -> None:
        """A failed auth response must not hint at the expected credential."""
        response = await client.get("/api/v1/admin/leads")
        body = response.text.lower()
        assert "test-admin-key" not in body
        assert "secret" not in body


class TestAdminLeadListing:
    async def test_lists_leads_newest_first(
        self,
        client: AsyncClient,
        admin_headers: dict[str, str],
        valid_contact_payload: dict[str, object],
    ) -> None:
        for index in range(3):
            await client.post(
                "/api/v1/contact",
                json={**valid_contact_payload, "email": f"p{index}@example.org"},
            )

        response = await client.get("/api/v1/admin/leads", headers=admin_headers)
        body = response.json()

        assert body["total"] == 3
        assert len(body["items"]) == 3
        timestamps = [item["created_at"] for item in body["items"]]
        assert timestamps == sorted(timestamps, reverse=True)

    async def test_filters_by_status(
        self,
        client: AsyncClient,
        admin_headers: dict[str, str],
        valid_contact_payload: dict[str, object],
    ) -> None:
        await client.post("/api/v1/contact", json=valid_contact_payload)
        await client.post(
            "/api/v1/contact",
            json={**valid_contact_payload, "email": "bot@example.org", "website": "spam"},
        )

        response = await client.get(
            "/api/v1/admin/leads", headers=admin_headers, params={"status": "spam"}
        )
        body = response.json()

        assert body["total"] == 1
        assert body["items"][0]["status"] == "spam"

    async def test_page_size_is_capped(
        self, client: AsyncClient, admin_headers: dict[str, str]
    ) -> None:
        """An authenticated caller must not be able to request the whole table at once."""
        response = await client.get(
            "/api/v1/admin/leads", headers=admin_headers, params={"page_size": 5000}
        )
        assert response.status_code == 422

    async def test_search_wildcards_are_escaped(
        self,
        client: AsyncClient,
        admin_headers: dict[str, str],
        valid_contact_payload: dict[str, object],
    ) -> None:
        """A literal '%' must not behave as a wildcard and match every record."""
        await client.post("/api/v1/contact", json=valid_contact_payload)

        response = await client.get(
            "/api/v1/admin/leads", headers=admin_headers, params={"search": "%"}
        )
        assert response.status_code == 200
        assert response.json()["total"] == 0

    async def test_listing_excludes_ip_hash_and_user_agent(
        self,
        client: AsyncClient,
        admin_headers: dict[str, str],
        created_lead: dict[str, str],
    ) -> None:
        """Abuse-correlation fields exist for investigation, not for routine display."""
        response = await client.get("/api/v1/admin/leads", headers=admin_headers)
        item = response.json()["items"][0]
        assert "ip_hash" not in item
        assert "user_agent" not in item


class TestAdminLeadDetail:
    async def test_retrieves_lead(
        self,
        client: AsyncClient,
        admin_headers: dict[str, str],
        created_lead: dict[str, str],
    ) -> None:
        response = await client.get(
            f"/api/v1/admin/leads/{created_lead['id']}", headers=admin_headers
        )
        assert response.status_code == 200
        assert response.json()["reference"] == created_lead["reference"]

    async def test_records_view_as_audit_event(
        self,
        client: AsyncClient,
        session: AsyncSession,
        admin_headers: dict[str, str],
        created_lead: dict[str, str],
    ) -> None:
        """Access to personal data is itself auditable (specification §18)."""
        await client.get(f"/api/v1/admin/leads/{created_lead['id']}", headers=admin_headers)

        events = list(
            await session.scalars(
                select(ContactEvent).where(
                    ContactEvent.lead_id == uuid.UUID(created_lead["id"]),
                    ContactEvent.event_type == ContactEventType.VIEWED,
                )
            )
        )
        assert len(events) == 1

    async def test_unknown_lead_returns_404(
        self, client: AsyncClient, admin_headers: dict[str, str]
    ) -> None:
        response = await client.get(
            f"/api/v1/admin/leads/{uuid.uuid4()}", headers=admin_headers
        )
        assert response.status_code == 404


class TestAdminLeadUpdate:
    async def test_updates_status_and_records_event(
        self,
        client: AsyncClient,
        session: AsyncSession,
        admin_headers: dict[str, str],
        created_lead: dict[str, str],
    ) -> None:
        response = await client.patch(
            f"/api/v1/admin/leads/{created_lead['id']}",
            headers=admin_headers,
            json={"status": "qualified"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "qualified"

        lead = await session.get(Lead, uuid.UUID(created_lead["id"]))
        assert lead is not None
        assert lead.status is LeadStatus.QUALIFIED

        events = list(
            await session.scalars(
                select(ContactEvent).where(
                    ContactEvent.lead_id == lead.id,
                    ContactEvent.event_type == ContactEventType.STATUS_CHANGED,
                )
            )
        )
        assert len(events) == 1
        assert events[0].event_metadata == {"from": "new", "to": "qualified"}

    async def test_rejects_empty_update(
        self,
        client: AsyncClient,
        admin_headers: dict[str, str],
        created_lead: dict[str, str],
    ) -> None:
        response = await client.patch(
            f"/api/v1/admin/leads/{created_lead['id']}", headers=admin_headers, json={}
        )
        assert response.status_code == 422

    async def test_cannot_modify_submitted_content(
        self,
        client: AsyncClient,
        admin_headers: dict[str, str],
        created_lead: dict[str, str],
    ) -> None:
        """The enquiry body is a record of what was actually submitted and must be immutable."""
        response = await client.patch(
            f"/api/v1/admin/leads/{created_lead['id']}",
            headers=admin_headers,
            json={"requirement": "rewritten", "email": "attacker@example.org"},
        )
        assert response.status_code == 422

    async def test_rejects_unauthenticated_update(
        self, client: AsyncClient, created_lead: dict[str, str]
    ) -> None:
        response = await client.patch(
            f"/api/v1/admin/leads/{created_lead['id']}", json={"status": "closed"}
        )
        assert response.status_code == 401
