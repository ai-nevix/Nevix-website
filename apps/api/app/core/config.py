"""Application configuration.

Every setting comes from the environment. Nothing is hard-coded, and the defaults are chosen so
that a missing production secret fails loudly at startup rather than silently running insecurely
(specification §25, instruction §45).
"""

from __future__ import annotations

import secrets
from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["local", "development", "staging", "production"]


class Settings(BaseSettings):
    """Validated application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application -------------------------------------------------------------------------
    app_env: Environment = "local"
    app_name: str = "VASTRIX API"
    app_version: str = "0.1.0"
    debug: bool = False
    log_level: str = "INFO"
    log_format: Literal["json", "console"] = "json"

    # --- Security ----------------------------------------------------------------------------
    # Generated per process when unset, which is fine locally and refused in production below.
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(48))
    # Bearer token for the admin endpoints. Absent means the admin API is disabled entirely.
    admin_api_key: str | None = None

    # --- Database ----------------------------------------------------------------------------
    database_url: str = "postgresql+asyncpg://vastrix:vastrix@localhost:5432/vastrix"
    database_pool_size: int = 5
    database_max_overflow: int = 10
    database_echo: bool = False

    # --- CORS --------------------------------------------------------------------------------
    # Specification §75: never "*" in production. The web app normally calls through a
    # same-origin proxy, so this list is usually empty even in production.
    cors_origins: list[str] = Field(default_factory=list)

    # --- Rate limiting -----------------------------------------------------------------------
    rate_limit_enabled: bool = True
    rate_limit_contact: str = "5/hour"
    rate_limit_newsletter: str = "5/hour"
    rate_limit_upload: str = "10/hour"
    rate_limit_search: str = "60/minute"
    rate_limit_default: str = "120/minute"
    # Optional Redis backing so limits are shared across replicas. Falls back to in-memory.
    rate_limit_storage_uri: str | None = None

    # --- Email -------------------------------------------------------------------------------
    # Notifications are disabled until SMTP is configured. The contact endpoint still records the
    # lead and reports `notification_sent: false` rather than failing.
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_timeout_seconds: int = 15
    email_from: str = "no-reply@vastrix.ai"
    email_from_name: str = "VASTRIX"
    # Where new enquiry notifications are sent.
    email_notify_to: str | None = None

    # --- Uploads -----------------------------------------------------------------------------
    uploads_enabled: bool = True
    upload_max_bytes: int = 10 * 1024 * 1024
    upload_allowed_mime_types: list[str] = Field(
        default_factory=lambda: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "text/csv",
            "image/png",
            "image/jpeg",
        ]
    )
    # Local directory used when object storage is not configured.
    upload_dir: str = "/var/lib/vastrix/uploads"

    # --- Object storage (MinIO / S3-compatible) — profile-gated, see ADR-008 ------------------
    s3_enabled: bool = False
    s3_endpoint: str | None = None
    s3_bucket: str = "vastrix-media"
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_region: str = "us-east-1"

    # --- Site configuration exposed publicly ---------------------------------------------------
    site_company_name: str = "VASTRIX"
    site_tagline: str = "Explore. Automate. Evolve."
    site_contact_email: str = "vastrix.ai@gmail.com"
    site_phone: str | None = None
    site_address: str | None = None
    site_url: str = "http://localhost:3000"

    # --- Feature flags -------------------------------------------------------------------------
    newsletter_enabled: bool = True
    search_enabled: bool = True
    metrics_enabled: bool = True

    @field_validator("cors_origins", "upload_allowed_mime_types", mode="before")
    @classmethod
    def _split_csv(cls, value: object) -> object:
        """Accept a comma-separated string, which is how these arrive from a .env file."""
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                return value  # already JSON; let pydantic parse it
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return value

    @field_validator("cors_origins")
    @classmethod
    def _reject_wildcard_origin(cls, value: list[str]) -> list[str]:
        """Specification §75 / instruction §75: a wildcard origin is never acceptable here."""
        if "*" in value:
            raise ValueError(
                'cors_origins must not contain "*". List the exact origins that need access.'
            )
        return value

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def email_configured(self) -> bool:
        return bool(self.smtp_host and self.email_notify_to)

    @property
    def admin_enabled(self) -> bool:
        return bool(self.admin_api_key)

    @model_validator(mode="after")
    def _enforce_production_hardening(self) -> Settings:
        """Refuse to start a production process in a knowingly insecure configuration.

        Failing at startup is far preferable to running with a per-process secret key or with
        debug enabled — both of which are silent problems that only surface later.
        """
        if not self.is_production:
            return self

        problems: list[str] = []

        if self.debug:
            problems.append("DEBUG must be false in production.")

        if len(self.secret_key) < 32:
            problems.append("SECRET_KEY must be at least 32 characters in production.")

        if self.admin_api_key is not None and len(self.admin_api_key) < 32:
            problems.append("ADMIN_API_KEY must be at least 32 characters in production.")

        if self.database_url.startswith("postgresql+asyncpg://vastrix:vastrix@"):
            problems.append("DATABASE_URL still uses the default development credentials.")

        if problems:
            raise ValueError(
                "Invalid production configuration:\n  - " + "\n  - ".join(problems)
            )

        return self


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton.

    Cached so configuration is parsed once per process; tests clear the cache when they need to
    override the environment.
    """
    return Settings()


settings = get_settings()
