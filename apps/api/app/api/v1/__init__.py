"""API version 1.

Routers are registered here so `app.main` mounts one object and the URL prefix lives in one place.
"""

from fastapi import APIRouter

from app.api.v1 import admin, contact, health, newsletter, search, site_config, uploads

api_router = APIRouter()

# Public endpoints.
api_router.include_router(health.router)
api_router.include_router(contact.router)
api_router.include_router(newsletter.router)
api_router.include_router(uploads.router)
api_router.include_router(site_config.router)
api_router.include_router(search.router)

# Administrative endpoints. Authentication is enforced per route via the AdminPrincipal
# dependency, and the whole router 404s when no admin key is configured.
api_router.include_router(admin.router)

__all__ = ["api_router"]
