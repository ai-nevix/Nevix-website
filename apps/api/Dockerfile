# NEVIX API (FastAPI) production image.
#
# Instruction §43: non-root user, health check, no unnecessary packages, environment-driven
# configuration.

# ---------------------------------------------------------------------------------------------
# Stage 1 — build the dependency tree into a virtualenv
# ---------------------------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# build-essential is needed to compile any dependency without a manylinux wheel. It stays in this
# stage only — the runtime image never contains a compiler.
RUN apt-get update \
 && apt-get install --no-install-recommends -y build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY pyproject.toml ./
COPY app ./app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip setuptools wheel \
 && pip install .

# ---------------------------------------------------------------------------------------------
# Stage 2 — runtime
# ---------------------------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# libmagic backs content-type verification on uploads; curl backs the container health check.
RUN apt-get update \
 && apt-get install --no-install-recommends -y libmagic1 curl \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1001 nevix \
 && useradd --system --uid 1001 --gid nevix --create-home nevix

COPY --from=builder /opt/venv /opt/venv

WORKDIR /srv/api

COPY --chown=nevix:nevix app ./app
COPY --chown=nevix:nevix alembic.ini ./
COPY --chown=nevix:nevix docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Attachment storage. Owned by the application user; the rest of the image is not writable by it.
RUN mkdir -p /var/lib/nevix/uploads \
 && chown -R nevix:nevix /var/lib/nevix \
 && chmod +x /usr/local/bin/docker-entrypoint.sh

USER nevix

EXPOSE 8000

# Liveness only — deliberately does not touch the database, so a database outage does not cause a
# restart loop.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl --fail --silent http://127.0.0.1:8000/api/v1/health/live || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--no-server-header", "--proxy-headers", "--forwarded-allow-ips", "*"]
