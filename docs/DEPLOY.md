# AlphaQuote — Production Deploy Guide (Railway)

> Status as of 2026-11-02: **nothing is deployed yet.** This is the prepared
> path. See `STATUS.md` at the repo root for the verified state of the code.
>
> **Free-hosting migration (Pass Four prep, branch `pass4-postgres`):** the
> move to Render + Neon — Postgres cutover done on that branch, with a
> `render.yaml` Blueprint and a step-by-step checklist — lives in
> [`docs/DEPLOY-RENDER.md`](DEPLOY-RENDER.md). This document remains the
> reference for the Railway deployment it migrates away from.

## Services

| Service | Root / config | Build | Start | Health check |
|---|---|---|---|---|
| `api` | repo root, `railway.json` | root `Dockerfile` | image CMD (migrate + `node backend/server/api.js`) | `GET /api/health` |
| `web` | `frontend/`, config file `frontend/railway.json` | `frontend/Dockerfile` (nginx) | nginx on port 80 — set the service's target/public port to **80** | `GET /` |
| `scraper` (optional) | repo root, root `Dockerfile` | same image as `api`, start command overridden to `node backend/server/scraper.js` | — | `GET /health` |

The scraper is a real feature (material price lookups from the frontend), not
dead code — but the app works without it (prices fall back to estimates).

## Environment checklist (names only — set values in Railway, never commit them)

### `api` service
- `DATABASE_URL` — **required.** See "Database" below.
- `CLERK_SECRET_KEY` — **required.** From the production Clerk instance.
- `CLERK_WEBHOOK_SECRET` — **required** for automatic account provisioning.
  Without it the webhook endpoint rejects everything (fails closed) and users
  are provisioned only via in-app sync at sign-in.
- `CORS_ALLOWED_ORIGINS` — **required in production.** Comma-separated list of
  the web service's public origin(s), e.g. the Railway web domain and any
  custom domain. No wildcards.
- `FRONTEND_URL` — optional; only used as a CORS fallback default.
- `NODE_ENV` — set to `production`.
- `PORT` — injected by Railway automatically. Leave `API_PORT` unset (the app
  reads `API_PORT || PORT || 3001`).
- Email (optional — quote-by-email stays off until enabled):
  `EMAIL_ENABLED=true`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`,
  `EMAIL_PASS`, `EMAIL_FROM`.

### `scraper` service (if deployed)
- `CLERK_SECRET_KEY` — **required.** It verifies the same Clerk tokens as the
  API; without it every data route returns 401.
- `SERPAPI_KEY` — optional. Without it the scraper returns clearly-labeled
  estimated prices instead of live lookups.
- `CORS_ALLOWED_ORIGINS` — same value as the `api` service.
- `PORT` — injected by Railway; leave `SCRAPER_PORT` unset there.

### `web` service (build-time — baked into the JS bundle; changing one means a rebuild)
- `REACT_APP_CLERK_PUBLISHABLE_KEY` — **required.** The *publishable* key
  (`pk_live_...`) from the same production Clerk instance.
- `REACT_APP_API_URL` — **required.** Public URL of the `api` service.
- `REACT_APP_SCRAPER_URL` — public URL of the `scraper` service (optional;
  price lookups degrade gracefully without it).

### Explicitly NOT used — do not set
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `REACT_APP_STRIPE_PUBLISHABLE_KEY`
  — leftovers from an abandoned plan. Stripe is not integrated anywhere.
  Payments will be Whop; checkout is **not wired yet** (pricing page buttons
  show a "checkout coming online" state).
- `DEFAULT_ADMIN_PASSWORD` — not a server variable. It is read only by the
  one-time legacy script `backend/prisma/migrate-multiuser.js`, which aborts
  without it. You should not need that script at all on a fresh production DB.

## Clerk production setup
1. Create (or switch to) the production Clerk instance.
2. Set `CLERK_SECRET_KEY` on `api`/`scraper` and the publishable key on `web`.
3. Add the web service's domain to Clerk's allowed origins.
4. Create a webhook endpoint pointing at
   `https://<api-domain>/api/webhooks/clerk`, subscribed to `user.created`,
   `user.updated`, `user.deleted`; put its signing secret in
   `CLERK_WEBHOOK_SECRET` on the `api` service.

## Database

> **On branch `pass4-postgres` the cutover below has already been done:**
> `schema.prisma` targets PostgreSQL with a single baseline migration,
> and the test suite runs on the test-only SQLite variant
> (`backend/prisma/schema.sqlite.prisma`). The text below is the original
> plan, kept for the Railway line (`pass2-lockdown`).

Local dev uses **SQLite** (`provider = "sqlite"` in
`backend/prisma/schema.prisma`, `DATABASE_URL` env holds the file URL from
`backend/env.example`). SQLite is the default so local dev and the test suite
keep working with zero setup.

**Production should run Postgres.** Prisma's datasource provider is a literal
in the schema — it cannot be switched by environment variable — so the
cutover is a deliberate one-time change, not a config flip:

### Postgres cutover (do this before real customer data exists)
1. Add a Postgres database (e.g. Railway Postgres) and copy its connection
   string as the new `DATABASE_URL`.
2. In `backend/prisma/schema.prisma`, change the datasource to
   `provider = "postgresql"` (the `url = env("DATABASE_URL")` line stays).
3. The committed migrations are SQLite SQL — replace them: delete
   `backend/prisma/migrations/*`, then, with `DATABASE_URL` pointing at the
   Postgres database, run `npx prisma migrate dev --name init_postgres` to
   generate a fresh baseline migration, and commit it. (The schema models use
   only portable field types — String/Int/Float/Boolean/DateTime — so no
   model changes are needed.)
4. Regenerate the client: `npx prisma generate`.
5. Deploy. The `api` image runs `prisma migrate deploy` on boot.
6. Smoke-test: `GET /api/health` → 200, sign up a user, confirm the Clerk
   webhook provisions the account and `/api/users/sync` returns the linked
   `clerkId`.

### SQLite stopgap (only if Postgres must wait)
Mount a Railway **volume** and point `DATABASE_URL` at a file inside it.
Without a volume, the container filesystem is wiped on every deploy and all
data is lost. Not recommended beyond a private demo.

## After deploy — smoke checklist
- [ ] `GET https://<api-domain>/api/health` → 200
- [ ] Web root `/` shows the landing page logged-out; signing in lands in the app
- [ ] `/pricing`, `/terms`, `/privacy` load
- [ ] New sign-up provisions a DB account (webhook), data routes return 200
      for the new user and 401 without a token
- [ ] A quote can be created, a receipt uploaded, and both are invisible to a
      second test account
