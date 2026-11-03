# AlphaQuote — Real Status

**Last verified: 2026-11-02.** This file is the source of truth for the state
of the product. Older docs in this repo (`docs/DEPLOYMENT_READY.md`,
`FINAL_SUCCESS.md`, `APPLICATION_READY.md`, and similar) predate the audits
below and **overstate readiness — do not rely on them.**

## What has actually been done

- **Pass One audit (2026-11-02)** — full security/product audit of the repo.
  Found, among other things: an auth bypass via a demo-mode header, most API
  routes unauthenticated with no per-account data scoping, a hardcoded default
  password, wide-open CORS, and a frontend that could not build for
  production. Report: internal audit notes, Pass One.
- **Pass Two lockdown (2026-11-02) — complete and verified.**
  - Demo-mode auth bypass removed; a regression test replays the original
    exploit and gets 401.
  - Every API route requires Clerk auth except `GET /api/health` and the
    signature-verified Clerk webhook (`POST /api/webhooks/clerk`).
  - All data queries are scoped to the caller's account; cross-account reads
    return 404.
  - Legacy local password system removed; Clerk is the only account system.
    Accounts are provisioned/linked by `clerkId` via webhook + sync.
  - Scraper service locked down the same way (auth + CORS allowlist);
    its SerpAPI key is env-only.
  - Frontend production build fixed and passing.
  - **24 automated tests, all passing** (`npm test` at repo root).
- **Pass Three storefront (2026-11-02) — built, then deployed to Railway.**
  - Public landing page at `/` for logged-out visitors; signed-in users land
    in the app as before.
  - Pricing: Free $0 / Solo $19/mo / Crew $39/mo, rendered from a single
    config (`frontend/src/config/pricing.js`).
  - Terms of Service (`/terms`) and Privacy Policy (`/privacy`) pages.
  - Railway deploy prep: Dockerfiles, Railway configs, and a full env
    checklist + Postgres cutover plan in `docs/DEPLOY.md`.
  - Deployed the same day from branch `pass2-lockdown` to Travis's Railway
    workspace (SQLite on a volume — the documented stopgap), including the
    live fixes for the receipts provisioning chain and exactly-once setup
    (**31 automated tests, all passing**). That Railway deployment is the
    current production system.
- **Pass Four prep (2026-11-02, branch `pass4-postgres`) — migration
  prepared, NOT executed.**
  - Postgres cutover done on this branch: `schema.prisma` targets
    PostgreSQL, the SQLite migration set is replaced by one baseline
    migration generated offline from the full schema, models unchanged.
  - Test suite still runs entirely on SQLite via the test-only schema
    variant `backend/prisma/schema.sqlite.prisma` (`prisma db push` in
    `backend/tests/helpers.js`); 31/31 tests pass on this branch and the
    frontend build passes. Application code is behavior-identical.
  - `render.yaml` Blueprint added: `alphaquote-api` (Docker, free plan)
    + `alphaquote-web` (static site, SPA rewrite). **No Render Postgres
    is defined** — Render's free Postgres expires after 30 days, so the
    database will be an external **Neon** project.
  - Migration-day checklist: `docs/DEPLOY-RENDER.md` (Neon setup → Blueprint
    apply → secrets → Clerk webhook move → verification → Railway
    retirement). Production stays on Railway/`pass2-lockdown` until that
    checklist is run and verified.

## What is NOT true yet

- **The Render + Neon migration has not been executed.** Production is the
  Railway deployment from `pass2-lockdown` (SQLite stopgap). The
  `pass4-postgres` branch is prep only — do not deploy from it until the
  `docs/DEPLOY-RENDER.md` checklist is run.
- **Payments are not wired.** No Stripe (deliberately — do not add it) and no
  Whop yet. Paid-plan buttons show a "checkout coming online" state and route
  to sign-up. Wiring happens after the Whop account is set up.
- **Production still runs SQLite** (Railway volume). The Postgres cutover
  exists only on `pass4-postgres`; Neon is not provisioned yet.
- **The support email on the legal pages is a placeholder**
  (`frontend/src/config/site.js`) — the domain/mailbox is not live yet.
- **Clerk end-to-end with real production keys is unverified** — it will be
  proven by the post-deploy smoke checklist in `docs/DEPLOY.md`.

## Known remaining items

- Wire Whop checkout into the pricing config (`checkoutUrl` fields) and gate
  Solo/Crew features on subscription state end-to-end.
- Run the Render + Neon migration (checklist in `docs/DEPLOY-RENDER.md`),
  then retire the Railway services and merge `pass4-postgres`.
- Point the support-email constant at a real mailbox.
- A pre-existing route-order quirk means `GET /api/scheduled-jobs/statistics`
  is shadowed by the `:id` route — cosmetic, tracked from Pass Two.
- Dependency advisories are remediated to zero criticals in production deps;
  the frontend dev-toolchain backlog remains (build-time only).

## Pass Five — Iron Legion tailoring (2026-11-03, branch `pass5-iron-legion`)

AlphaQuote is now tailored to Iron Legion Contracting LLC, Brandon's
own company, as config / defaults / seed / templates / branding. The
multi-tenant lockdown is untouched — no auth, provisioning, tenant
scoping, webhook, scraper, plan, or payment code changed. NOT merged
to `pass4-postgres` and NOT pushed: Solen reviews and lands this
branch; only then does Render deploy it.

### What changed
- **Single source of defaults:** `backend/config/pricingDefaults.js`
  (mirrored in `frontend/src/utils/pricingConstants.js`): solo labor
  $60/hr, crew labor $90/hr, material markup 15%, overhead margin
  10%, minimum job $350, quotes valid 14 days, deposit 30–50% of
  materials. Every hardcoded $75/$50 labor default in the app (room
  calculator, schemas, change orders, accounting export, demo
  profile, PDF) now falls back to these values.
- **Service catalog:** Iron Legion's six trades only — Siding,
  Fencing, Decking, Framing, Landscaping, Flooring — in the seed,
  the template category picker, the profile industry picker, and the
  landing-page trades row. No plumbing or electrical anywhere in
  defaults, templates, or copy (the seeded regional packs no longer
  carry an electrical-outlet material either).
- **Starter templates (7):** one per trade from the Iron Legion
  pricing sheet, framing twice (package $16/sq ft + labor-only
  $6.50/sq ft): Siding $11,300 · Fencing $5,125 · Decking $10,100 ·
  Framing package $8,000 · Framing labor-only $3,250 · Landscaping
  $825 · Flooring $4,300 at default quantities. Seeded as the public
  template library and creatable per-tenant through the existing API.
- **Quote terms** print on the PDF and in the emailed quote: valid
  14 days; deposit 30–50% of materials up front, balance on
  completion; demolition damage/rot shown to the customer and agreed
  before repair (time & materials); "Iron Legion does not perform
  plumbing or electrical work." The old "valid for 30 days" lines
  are gone.
- **Branding:** `COMPANY_NAME` / `COMPANY_LEGAL_NAME` in
  `frontend/src/config/site.js`; landing page rewritten for Iron
  Legion (NW Ohio builder, six trades, first-person copy — pricing
  tiers section untouched); setup defaults the company name to
  "Iron Legion Contracting LLC"; PDF header/footer carry the company
  name; emailed quotes use the account's company name with the Iron
  Legion default. Support-email constant unchanged (placeholder).
- **Minimum job:** the estimate form warns when a quote total is
  above $0 but below the $350 Iron Legion minimum.

### Deliberately left as-is (with reasons)
- The app has **no margin field and no global settings store** — the
  10% overhead margin and the labor/markup rates live in the config
  modules above; building a settings table/API is a product change,
  not tailoring.
- The **setup form has no trades field** and the setup API stores
  none, so "six trades preselected" has nowhere to land — the
  catalog itself carries the six trades.
- **Demo sample data** (demo vendors/projects/receipts, the frontend
  demo profile, the frontend-only demo library) still shows generic
  sample content — demo-mode flavor text, not defaults or catalog.
  The demo profile's labor rate was still aligned to $60.
- No dedicated "what counts toward the $350 minimum" enforcement
  beyond the form warning — the app has no server-side total check
  to hook it to.

### Tests (38 total, all passing)
`backend/tests/pass5-iron-legion.test.js` adds 7: config values
pinned to the pricing sheet, catalog exactly six trades, quote terms
content, template line items (rates × quantities) per trade, a
no-plumbing/electrical guard over the template library, and an API
round-trip creating + reading back all seven templates with
computed totals. Frontend production build passes; local boot
against the SQLite test schema verified (health, sync, setup with
the Iron Legion name, template create, email-quote path).
