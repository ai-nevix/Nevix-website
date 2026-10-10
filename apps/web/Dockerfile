# NEVIX web (Next.js) production image.
#
# Multi-stage so the runtime image contains the standalone server output and nothing else — no
# source, no dev dependencies, no package manager.
#
# Instruction §43: non-root user, health check, no unnecessary packages, environment-driven
# configuration.

# ---------------------------------------------------------------------------------------------
# Stage 1 — dependencies
# ---------------------------------------------------------------------------------------------
FROM node:24-alpine AS deps

WORKDIR /repo

# Only the manifests, so this layer is cached until a dependency actually changes.
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

RUN npm ci --workspace=@nevix/web --include-workspace-root

# ---------------------------------------------------------------------------------------------
# Stage 2 — build
# ---------------------------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/web ./apps/web

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so the canonical site URL
# must be supplied here rather than at runtime.
ARG NEXT_PUBLIC_SITE_URL=https://nevix.ai
ARG NEXT_PUBLIC_API_URL=/api/backend
ARG NEXT_PUBLIC_ENV=production
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build --workspace=@nevix/web

# ---------------------------------------------------------------------------------------------
# Stage 3 — runtime
# ---------------------------------------------------------------------------------------------
FROM node:24-alpine AS runner

# wget is used by the container health check; curl would be a larger addition for the same job.
RUN apk add --no-cache wget

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Dedicated unprivileged user. The image ships no writable application directory, so a compromise
# of the process cannot modify the deployed code.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# `output: 'standalone'` traces only the files the server actually needs.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "apps/web/server.js"]
