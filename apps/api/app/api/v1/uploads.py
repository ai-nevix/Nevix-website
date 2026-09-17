"""Attachment upload endpoint.

Instruction §32 and §41: type and size restrictions, safe storage, and no trust in the
client-supplied filename or content type.
"""

# NOTE: this module deliberately does NOT use `from __future__ import annotations`.
# FastAPI resolves string annotations against the decorated function's module globals. Where a
# route is wrapped by slowapi's rate-limit decorator, that resolution fails and dependencies such
# as `DbSession` are misclassified as request-body fields, producing a confusing 422 on every
# call. Real annotations avoid the problem entirely. See docs/architecture/backend.md.


import secrets
import unicodedata
from pathlib import Path
from typing import Final

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import limiter
from app.schemas.contact import ErrorResponse, UploadResponse

logger = get_logger(__name__)

router = APIRouter(tags=["uploads"])

# Read in chunks so a large or lying `content-length` cannot force the whole file into memory.
_CHUNK_SIZE: Final = 64 * 1024

# Magic-number prefixes for the formats we accept. The browser-supplied content type is a hint,
# not evidence — a renamed executable declares whatever the client wants it to.
_MAGIC_SIGNATURES: Final[dict[str, tuple[bytes, ...]]] = {
    "application/pdf": (b"%PDF-",),
    "image/png": (b"\x89PNG\r\n\x1a\n",),
    "image/jpeg": (b"\xff\xd8\xff",),
    # OOXML formats are ZIP containers.
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (b"PK\x03\x04",),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (b"PK\x03\x04",),
    # Legacy Office formats use the OLE compound-document header.
    "application/msword": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),
    "application/vnd.ms-excel": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),
}

# Extensions that must never be written, whatever the declared type.
_BLOCKED_EXTENSIONS: Final = frozenset(
    {
        ".exe", ".dll", ".so", ".dylib", ".bat", ".cmd", ".com", ".msi", ".scr",
        ".ps1", ".sh", ".bash", ".php", ".phtml", ".jsp", ".asp", ".aspx",
        ".js", ".mjs", ".jar", ".py", ".rb", ".pl", ".svg", ".html", ".htm",
    }
)

_EXTENSION_BY_TYPE: Final[dict[str, str]] = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "image/png": ".png",
    "image/jpeg": ".jpg",
}


def _safe_display_name(raw: str | None) -> str:
    """Produce a display name that is safe to store and to render in an email.

    The original name is never used as a path component — the stored filename is generated. This
    value exists only so a reviewer can see what the sender called the file.
    """
    if not raw:
        return "attachment"

    normalised = unicodedata.normalize("NFKD", raw)
    cleaned = "".join(
        char for char in normalised if char.isalnum() or char in {" ", ".", "-", "_"}
    ).strip()

    # Take the basename only; anything that looks like a path is discarded entirely.
    cleaned = Path(cleaned).name
    return cleaned[:120] or "attachment"


def _matches_magic(content_type: str, head: bytes) -> bool:
    """Check the file's leading bytes against the declared type.

    Plain text and CSV have no signature; they are accepted if they decode as UTF-8 and contain no
    NUL byte, which is a reasonable proxy for "actually text".
    """
    if content_type in {"text/plain", "text/csv"}:
        if b"\x00" in head:
            return False
        try:
            head.decode("utf-8")
        except UnicodeDecodeError:
            # A multi-byte character may be split across the chunk boundary.
            try:
                head[:-3].decode("utf-8")
            except UnicodeDecodeError:
                return False
        return True

    signatures = _MAGIC_SIGNATURES.get(content_type)
    if not signatures:
        return False
    return any(head.startswith(signature) for signature in signatures)


@router.post(
    "/uploads",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload an enquiry attachment",
    responses={
        400: {"model": ErrorResponse, "description": "Rejected file"},
        413: {"model": ErrorResponse, "description": "File too large"},
        415: {"model": ErrorResponse, "description": "Unsupported file type"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
    },
)
@limiter.limit(settings.rate_limit_upload)
async def upload_attachment(
    request: Request,
    file: UploadFile = File(...),
) -> UploadResponse:
    """Accept an enquiry attachment.

    Controls applied, in order:
    1. uploads must be enabled
    2. the declared content type must be on the allow-list
    3. the extension must not be on the block-list
    4. the leading bytes must match the declared type
    5. the size is enforced while streaming, not from the client-supplied header
    6. the stored filename is generated, never derived from client input
    """
    if not settings.uploads_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")

    content_type = (file.content_type or "").split(";")[0].strip().lower()

    if content_type not in settings.upload_allowed_mime_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="That file type is not accepted.",
        )

    display_name = _safe_display_name(file.filename)
    if Path(display_name).suffix.lower() in _BLOCKED_EXTENSIONS:
        logger.warning("upload_blocked_extension", content_type=content_type)
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="That file type is not accepted.",
        )

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generated name: random stem plus an extension derived from the verified type. A client
    # cannot influence the path, so directory traversal and extension smuggling are not possible.
    extension = _EXTENSION_BY_TYPE.get(content_type, ".bin")
    stored_name = f"{secrets.token_urlsafe(24)}{extension}"
    destination = upload_dir / stored_name

    size = 0
    first_chunk = True

    try:
        with destination.open("wb") as handle:
            while chunk := await file.read(_CHUNK_SIZE):
                if first_chunk:
                    if not _matches_magic(content_type, chunk):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="That file does not match the type it claims to be.",
                        )
                    first_chunk = False

                size += len(chunk)
                if size > settings.upload_max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail="That file is larger than the 10 MB limit.",
                    )

                handle.write(chunk)

        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="That file is empty."
            )
    except HTTPException:
        destination.unlink(missing_ok=True)
        raise
    except OSError as error:
        destination.unlink(missing_ok=True)
        logger.error("upload_write_failed", error_type=type(error).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="We could not store that file. Please try again.",
        ) from error
    finally:
        await file.close()

    logger.info("upload_stored", content_type=content_type, size_bytes=size)

    return UploadResponse(
        # Relative path. The contact schema accepts only `/uploads/...` references, so a caller
        # cannot substitute an external URL.
        url=f"/uploads/{stored_name}",
        filename=display_name,
        content_type=content_type,
        size_bytes=size,
    )
