# VASTRIX CMS (Strapi Community Edition) production image.
#
# Strapi builds its admin panel at image build time, so the runtime image serves a prebuilt
# bundle rather than compiling on start.

# ---------------------------------------------------------------------------------------------
# Stage 1 — build
# ---------------------------------------------------------------------------------------------
FROM node:22-alpine AS builder

# sharp (image processing) needs these to build on Alpine.
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1

WORKDIR /srv/cms

ENV NODE_ENV=development \
    STRAPI_TELEMETRY_DISABLED=true

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

# Build-time placeholders. Strapi refuses to build without them; the real values are injected at
# runtime from the environment, so these never reach a running deployment.
RUN APP_KEYS=build,build,build,build \
    API_TOKEN_SALT=build \
    ADMIN_JWT_SECRET=build \
    TRANSFER_TOKEN_SALT=build \
    JWT_SECRET=build \
    DATABASE_CLIENT=sqlite \
    DATABASE_FILENAME=.tmp/build.db \
    npm run build

# ---------------------------------------------------------------------------------------------
# Stage 2 — runtime
# ---------------------------------------------------------------------------------------------
FROM node:22-alpine AS runner

RUN apk add --no-cache vips-dev wget > /dev/null 2>&1 \
 && addgroup --system --gid 1001 strapi \
 && adduser --system --uid 1001 --ingroup strapi strapi

WORKDIR /srv/cms

ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true \
    HOST=0.0.0.0 \
    PORT=1337

COPY --from=builder --chown=strapi:strapi /srv/cms/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /srv/cms/build ./build
COPY --from=builder --chown=strapi:strapi /srv/cms/dist ./dist
COPY --from=builder --chown=strapi:strapi /srv/cms/config ./config
COPY --from=builder --chown=strapi:strapi /srv/cms/src ./src
COPY --from=builder --chown=strapi:strapi /srv/cms/database ./database
COPY --from=builder --chown=strapi:strapi /srv/cms/package.json ./package.json

# Media uploads. Mounted as a volume in compose so content survives a container rebuild.
RUN mkdir -p public/uploads .tmp && chown -R strapi:strapi public .tmp

USER strapi

EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:1337/_health || exit 1

CMD ["npm", "run", "start"]
