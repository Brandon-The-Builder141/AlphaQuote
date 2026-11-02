# AlphaQuote frontend (Create React App) — static build served by nginx.
# Build context: frontend/. Used by the Railway "web" service
# (service config file: frontend/railway.json — see docs/DEPLOY.md).
FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# REACT_APP_* values are baked into the bundle at build time. Provide them as
# build arguments (Railway: service variables marked as build-time / shared
# variables). Changing them requires a rebuild.
ARG REACT_APP_CLERK_PUBLISHABLE_KEY
ARG REACT_APP_API_URL
ARG REACT_APP_SCRAPER_URL
ENV REACT_APP_CLERK_PUBLISHABLE_KEY=$REACT_APP_CLERK_PUBLISHABLE_KEY \
    REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_SCRAPER_URL=$REACT_APP_SCRAPER_URL \
    CI=false

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
