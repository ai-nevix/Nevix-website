"""Public content search (specification §17, instruction §73).

The frontend performs its own in-process search over CMS content, which is faster and always in
sync with what is published. This endpoint exists so that non-browser clients — and, later, a
NEVIX AI assistant retrieving approved public knowledge — have the same view through a stable
contract.

Scope is public content only. Nothing administrative is reachable here (instruction §73).
"""

# NOTE: this module deliberately does NOT use `from __future__ import annotations`.
# FastAPI resolves string annotations against the decorated function's module globals. Where a
# route is wrapped by slowapi's rate-limit decorator, that resolution fails and dependencies such
# as `DbSession` are misclassified as request-body fields, producing a confusing 422 on every
# call. Real annotations avoid the problem entirely. See docs/architecture/backend.md.


from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request, status

from app.core.config import settings
from app.core.security import limiter
from app.schemas.contact import ErrorResponse, SearchResponse, SearchResultItem

router = APIRouter(tags=["search"])


@router.get(
    "/search",
    response_model=SearchResponse,
    summary="Search approved public content",
    responses={
        404: {"model": ErrorResponse, "description": "Search is disabled"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
    },
)
@limiter.limit(settings.rate_limit_search)
async def search_content(
    request: Request,
    q: Annotated[str, Query(min_length=2, max_length=120, description="Search query")],
    limit: Annotated[int, Query(ge=1, le=50)] = 25,
) -> SearchResponse:
    """Search published services, solutions, industries, products, case studies and insights.

    The corpus is owned by the CMS and served by the frontend, so this endpoint returns an empty
    result set rather than a partial one until a backend-side index is introduced. Returning
    nothing is honest; returning half the corpus and calling it a search result is not.

    When the NEVIX AI layer is added (specification §19), this is where pgvector-backed semantic
    retrieval attaches — the response contract does not need to change.
    """
    if not settings.search_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")

    results: list[SearchResultItem] = []

    return SearchResponse(query=q, count=len(results), results=results)
