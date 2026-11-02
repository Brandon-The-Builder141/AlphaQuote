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
- **Pass Three storefront (2026-11-02) — built, not deployed.**
  - Public landing page at `/` for logged-out visitors; signed-in users land
    in the app as before.
  - Pricing: Free $0 / Solo $19/mo / Crew $39/mo, rendered from a single
    config (`frontend/src/config/pricing.js`).
  - Terms of Service (`/terms`) and Privacy Policy (`/privacy`) pages.
  - Railway deploy prep: Dockerfiles, Railway configs, and a full env
    checklist + Postgres cutover plan in `docs/DEPLOY.md`.

## What is NOT true yet

- **Nothing is deployed.** There is no production URL, no live users.
- **Payments are not wired.** No Stripe (deliberately — do not add it) and no
  Whop yet. Paid-plan buttons show a "checkout coming online" state and route
  to sign-up. Wiring happens after the Whop account is set up.
- **Production database is not set up.** Dev runs on SQLite; the Postgres
  cutover steps are documented in `docs/DEPLOY.md` and have not been run.
- **The support email on the legal pages is a placeholder**
  (`frontend/src/config/site.js`) — the domain/mailbox is not live yet.
- **Clerk end-to-end with real production keys is unverified** — it will be
  proven by the post-deploy smoke checklist in `docs/DEPLOY.md`.

## Known remaining items

- Wire Whop checkout into the pricing config (`checkoutUrl` fields) and gate
  Solo/Crew features on subscription state end-to-end.
- Run the Postgres cutover before onboarding real customers.
- Point the support-email constant at a real mailbox.
- A pre-existing route-order quirk means `GET /api/scheduled-jobs/statistics`
  is shadowed by the `:id` route — cosmetic, tracked from Pass Two.
- Dependency advisories are remediated to zero criticals in production deps;
  the frontend dev-toolchain backlog remains (build-time only).
