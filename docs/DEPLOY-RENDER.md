# AlphaQuote — Migration Day Checklist (Railway/SQLite → Render + Neon)

> Prepared 2026-11-02 on branch `pass4-postgres` (Pass Four prep).
> Everything below is executed in one sitting, in order. Until step 7 is
> done and verified, the Railway deployment from `pass2-lockdown` stays up
> and remains the production system — nothing here touches it.
>
> What `pass4-postgres` already contains: PostgreSQL Prisma schema with a
> fresh baseline migration (`20261102150000_init_postgres`), a `render.yaml`
> Blueprint, and a test suite that still runs on SQLite via the test-only
> schema variant (`backend/prisma/schema.sqlite.prisma`).

## 0. Decide the data question first

The Railway SQLite database holds only early/smoke-test data. The Neon
database starts **empty** — Clerk still owns the user accounts themselves,
and AlphaQuote DB rows (contractor account, receipts, projects) are
re-provisioned at first sign-in via webhook/sync. Quotes/receipts entered
into the SQLite deployment do **not** carry over automatically.

- Recommended while data is disposable: fresh start on Neon.
- If anything in the SQLite DB must survive, stop here and export it
  *before* step 7; importing is a separate, manual job.

## 1. Create the Neon project

1. Sign in at neon.tech → **New Project** (name: `alphaquote`).
2. Create a database (default `neondb` is fine).
3. Copy the **pooled** connection string (host contains `-pooler`), it
   looks like `postgresql://<user>:<password>@<host>-pooler.<region>.aws.neon.tech/neondb?sslmode=require`.
   Keep it in a password manager — it is a secret and is never committed.

## 2. Apply the Render Blueprint

1. Render dashboard → **New** → **Blueprint** → connect the GitHub repo
   (`Brandon-The-Builder141/AlphaQuote` — or the `seed0001` copy, whichever
   is canonical by migration day) and select the branch carrying this prep
   (`pass4-postgres`, or `main`/`pass2-lockdown` if it has been merged by
   then).
2. Render reads `render.yaml` and proposes two services:
   - `alphaquote-api` — Docker (root `Dockerfile`), free plan.
   - `alphaquote-web` — static site, free plan.
3. Apply. First builds will start before secrets are set; the api will
   fail to boot until step 3 — that is expected, fix it there.

## 3. Set the secret env values (Render dashboard, per service)

**`alphaquote-api`:**
- `DATABASE_URL` — the Neon pooled connection string from step 1.
- `CLERK_SECRET_KEY` — production Clerk instance secret key.
- `CORS_ALLOWED_ORIGINS` — the web service's public origin from step 2,
  e.g. `https://alphaquote-web.onrender.com` (no trailing slash, no
  wildcards).
- `CLERK_WEBHOOK_SECRET` — set in step 5; leave unset for now.
- `NODE_ENV` is already `production` from the Blueprint.

**`alphaquote-web`** (build-time — baked into the bundle):
- `REACT_APP_CLERK_PUBLISHABLE_KEY` — publishable key from the same Clerk
  instance.
- `REACT_APP_API_URL` — the api service's public URL, e.g.
  `https://alphaquote-api.onrender.com`.

After saving: redeploy **api first, then web** (web needs the final api
URL at build time).

## 4. Point Clerk at the new deployment

1. Clerk dashboard → the production instance → allowed origins: add the
   new web origin (`https://alphaquote-web.onrender.com`).
2. Webhooks: edit the existing endpoint (or create one) so it points at
   `https://alphaquote-api.onrender.com/api/webhooks/clerk`, subscribed to
   `user.created`, `user.updated`, `user.deleted`.
3. Copy the endpoint's **signing secret** into `CLERK_WEBHOOK_SECRET` on
   `alphaquote-api` in Render, then redeploy the api service.

## 5. Verify (all must pass before step 6)

- [ ] `GET https://<api-domain>/api/health` → 200
- [ ] `GET https://<api-domain>/api/receipts` with **no** token → 401
- [ ] Demo-header bypass replay (invalid token + demo header) → 401
- [ ] Web root `/` shows the landing page logged-out; `/pricing`,
      `/terms`, `/privacy` load
- [ ] Sign up a fresh test account → the account is provisioned in the
      Neon DB (webhook) and `/api/users/sync` returns the linked `clerkId`
- [ ] Sign in as Brandon's real account → first-run setup appears
      **exactly once**; Receipts tab loads (no 403 error screen)
- [ ] Create a quote and upload a receipt; both are invisible to the
      second test account (tenant scoping intact on Postgres)
- [ ] `npm test` on this branch: 31/31 (suite runs on the SQLite variant;
      production parity is covered by the checks above)

## 6. Retire the Railway deployment

Only after every box in step 5 is checked:

1. In the Railway workspace (project `marketplace`), delete (or stop) the
   `AlphaQuote` (api), `AlphaQuote-web`, and scraper services.
2. Remove the Railway domains from anywhere they were shared; the
   `*.up.railway.app` URLs stop resolving.
3. Note the retirement date in `STATUS.md` and merge this branch so the
   Postgres schema + `render.yaml` become the canonical line.

## Notes / known gaps

- The **scraper** service is not part of the initial Render migration.
  The app works without it (material prices fall back to estimates). If it
  is wanted later, it needs its own Render service (paid — free services
  are limited) or stays behind on a host of its own.
- Render free web services **spin down when idle**; the first request
  after idle can take ~a minute. Expected on the free plan.
- Neon free tier scales to zero when idle and wakes on first query —
  also expected.
- Payments (Whop) remain unwired, exactly as on Railway. Nothing about
  this migration changes that.
