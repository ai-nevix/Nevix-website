#!/bin/sh
# Container entrypoint.
#
# Applies database migrations before starting the server, so a deployment can never serve traffic
# against a schema older than the code expects.
#
# RUN_MIGRATIONS=false skips this — set it when several API replicas start together and a separate
# job owns migrations, so concurrent `alembic upgrade` runs cannot race.

set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Applying database migrations..."

  # The database may still be starting. Retry briefly rather than crash-looping the container.
  attempts=0
  until alembic upgrade head; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 10 ]; then
      echo "Migrations failed after ${attempts} attempts." >&2
      exit 1
    fi
    echo "Migration attempt ${attempts} failed; retrying in 3s..."
    sleep 3
  done

  echo "Migrations applied."
fi

exec "$@"
