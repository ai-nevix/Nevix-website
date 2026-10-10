"""Health, newsletter, site-config, search and upload endpoint tests."""

from __future__ import annotations

import io

from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import ConsentStatus, NewsletterSubscriber

# Minimal valid files: the upload endpoint verifies leading bytes, not just the declared type.
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
    b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)
PDF_BYTES = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n"


class TestHealth:
    async def test_health_reports_ok(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200

        body = response.json()
        assert body["status"] == "ok"
        assert body["checks"]["database"]["status"] == "ok"
        assert body["version"]
        assert body["environment"] == "local"

    async def test_health_discloses_no_connection_details(self, client: AsyncClient) -> None:
        body = (await client.get("/api/v1/health")).text.lower()
        for secret in ("password", "sqlite+", "postgresql", "secret", "@"):
            assert secret not in body, f"health response leaked {secret!r}"

    async def test_liveness_does_not_touch_the_database(self, client: AsyncClient) -> None:
        """A liveness probe that checks the database turns an outage into a restart loop."""
        response = await client.get("/api/v1/health/live")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    async def test_readiness_reports_ready(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/health/ready")
        assert response.status_code == 200
        assert response.json()["status"] == "ready"


class TestSiteConfig:
    async def test_returns_public_configuration(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/site-config")
        assert response.status_code == 200

        body = response.json()
        assert body["company_name"] == "NEVIX"
        assert body["tagline"] == "Explore. Automate. Evolve."
        assert set(body["features"]) == {
            "newsletter_enabled",
            "attachments_enabled",
            "search_enabled",
        }

    async def test_does_not_expose_internal_settings(self, client: AsyncClient) -> None:
        body = (await client.get("/api/v1/site-config")).json()
        for leaked in ("secret_key", "admin_api_key", "database_url", "smtp_password"):
            assert leaked not in body


class TestNewsletter:
    async def test_subscription_creates_pending_subscriber(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        response = await client.post(
            "/api/v1/newsletter",
            json={"email": "reader@example.org", "consent": True, "source": "footer"},
        )

        assert response.status_code == 202
        assert response.json()["status"] == "pending_confirmation"

        subscriber = await session.scalar(
            select(NewsletterSubscriber).where(
                NewsletterSubscriber.email == "reader@example.org"
            )
        )
        assert subscriber is not None
        # Nothing is sent until the address is confirmed.
        assert subscriber.consent_status is ConsentStatus.PENDING
        assert subscriber.confirmation_token
        assert subscriber.confirmed_at is None

    async def test_requires_consent(self, client: AsyncClient) -> None:
        response = await client.post(
            "/api/v1/newsletter", json={"email": "reader@example.org", "consent": False}
        )
        assert response.status_code == 422

    async def test_response_does_not_reveal_existing_subscription(
        self, client: AsyncClient
    ) -> None:
        """Identical responses stop this endpoint acting as a subscription oracle."""
        payload = {"email": "known@example.org", "consent": True}

        first = await client.post("/api/v1/newsletter", json=payload)
        await client.post("/api/v1/newsletter/confirm", json={"token": "x" * 32})
        second = await client.post("/api/v1/newsletter", json=payload)

        assert first.json()["message"] == second.json()["message"]

    async def test_confirmation_activates_subscription(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        await client.post(
            "/api/v1/newsletter", json={"email": "reader@example.org", "consent": True}
        )
        subscriber = await session.scalar(
            select(NewsletterSubscriber).where(
                NewsletterSubscriber.email == "reader@example.org"
            )
        )
        assert subscriber is not None
        token = subscriber.confirmation_token
        assert token

        response = await client.post("/api/v1/newsletter/confirm", json={"token": token})
        assert response.status_code == 200

        await session.refresh(subscriber)
        assert subscriber.consent_status is ConsentStatus.CONFIRMED
        assert subscriber.confirmed_at is not None
        # Single-use: the token is cleared so the link cannot be replayed.
        assert subscriber.confirmation_token is None

    async def test_invalid_confirmation_token_is_rejected(self, client: AsyncClient) -> None:
        response = await client.post(
            "/api/v1/newsletter/confirm", json={"token": "not-a-real-token-but-long-enough"}
        )
        assert response.status_code == 400

    async def test_honeypot_returns_success_without_subscribing(
        self, client: AsyncClient, session: AsyncSession
    ) -> None:
        response = await client.post(
            "/api/v1/newsletter",
            json={"email": "bot@example.org", "consent": True, "website": "spam"},
        )

        assert response.status_code == 202
        subscriber = await session.scalar(
            select(NewsletterSubscriber).where(NewsletterSubscriber.email == "bot@example.org")
        )
        assert subscriber is None


class TestUploads:
    async def test_accepts_a_valid_png(self, client: AsyncClient, tmp_path, monkeypatch) -> None:
        monkeypatch.setattr("app.core.config.settings.upload_dir", str(tmp_path))

        response = await client.post(
            "/api/v1/uploads",
            files={"file": ("diagram.png", io.BytesIO(PNG_BYTES), "image/png")},
        )

        assert response.status_code == 201
        body = response.json()
        # The stored path is generated, never derived from the supplied filename.
        assert body["url"].startswith("/uploads/")
        assert "diagram" not in body["url"]
        assert body["url"].endswith(".png")
        assert body["filename"] == "diagram.png"

    async def test_rejects_disallowed_content_type(
        self, client: AsyncClient, tmp_path, monkeypatch
    ) -> None:
        monkeypatch.setattr("app.core.config.settings.upload_dir", str(tmp_path))

        response = await client.post(
            "/api/v1/uploads",
            files={"file": ("payload.exe", io.BytesIO(b"MZ\x90\x00"), "application/x-msdownload")},
        )
        assert response.status_code == 415

    async def test_rejects_content_that_does_not_match_declared_type(
        self, client: AsyncClient, tmp_path, monkeypatch
    ) -> None:
        """A renamed executable declaring image/png must not be written to disk."""
        monkeypatch.setattr("app.core.config.settings.upload_dir", str(tmp_path))

        response = await client.post(
            "/api/v1/uploads",
            files={"file": ("innocent.png", io.BytesIO(b"MZ\x90\x00\x03\x00"), "image/png")},
        )

        assert response.status_code == 400
        # Nothing was left behind by the rejected upload.
        assert list(tmp_path.iterdir()) == []

    async def test_rejects_oversized_file(
        self, client: AsyncClient, tmp_path, monkeypatch
    ) -> None:
        monkeypatch.setattr("app.core.config.settings.upload_dir", str(tmp_path))
        monkeypatch.setattr("app.core.config.settings.upload_max_bytes", 100)

        oversized = PDF_BYTES + b"0" * 500
        response = await client.post(
            "/api/v1/uploads",
            files={"file": ("big.pdf", io.BytesIO(oversized), "application/pdf")},
        )

        assert response.status_code == 413
        assert list(tmp_path.iterdir()) == []

    async def test_path_traversal_filename_cannot_escape_upload_dir(
        self, client: AsyncClient, tmp_path, monkeypatch
    ) -> None:
        monkeypatch.setattr("app.core.config.settings.upload_dir", str(tmp_path))

        response = await client.post(
            "/api/v1/uploads",
            files={
                "file": ("../../../../etc/passwd.png", io.BytesIO(PNG_BYTES), "image/png")
            },
        )

        assert response.status_code == 201
        written = list(tmp_path.iterdir())
        assert len(written) == 1
        assert ".." not in written[0].name
        assert "passwd" not in response.json()["url"]


class TestSearch:
    async def test_requires_a_minimum_query_length(self, client: AsyncClient) -> None:
        assert (await client.get("/api/v1/search", params={"q": "a"})).status_code == 422

    async def test_returns_the_expected_envelope(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/search", params={"q": "automation"})
        assert response.status_code == 200

        body = response.json()
        assert body["query"] == "automation"
        assert set(body) == {"query", "count", "results"}


class TestSecurityHeaders:
    async def test_api_responses_carry_security_headers(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/health")

        assert response.headers["x-content-type-options"] == "nosniff"
        assert response.headers["x-frame-options"] == "DENY"
        assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
        assert "default-src 'none'" in response.headers["content-security-policy"]
        assert response.headers["cache-control"] == "no-store"

    async def test_every_response_carries_a_request_id(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/health")
        assert response.headers.get("x-request-id")

    async def test_unknown_route_uses_the_shared_error_envelope(
        self, client: AsyncClient
    ) -> None:
        response = await client.get("/api/v1/does-not-exist")
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "not_found"
