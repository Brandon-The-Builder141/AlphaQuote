# AlphaQuote API service (backend/server/api.js)
# Build context: REPO ROOT — the backend's dependencies live in the root
# package.json (long-standing repo layout), and Prisma's schema is under
# backend/prisma. Used by the Railway "api" service (see docs/DEPLOY.md).
FROM node:20-bookworm-slim

# Prisma engines need OpenSSL at generate/runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY backend ./backend

RUN npx prisma generate --schema backend/prisma/schema.prisma

ENV NODE_ENV=production
EXPOSE 3001

# Apply migrations, then start. Listens on $PORT when the host injects one
# (backend/config/env.js: API_PORT || PORT || 3001).
CMD ["sh", "-c", "npx prisma migrate deploy --schema backend/prisma/schema.prisma && node backend/server/api.js"]
