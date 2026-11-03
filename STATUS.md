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

## Pass Six — No setup (2026-11-03, branch `pass6-no-setup`)

Brandon's direct order: "get rid of the setup… you pretty much already
know everything… This would be my own dashboard. It should be strictly
for me. I shouldn't have to run through a setup process." This
deployment is his tool, so sign-in now lands on a ready dashboard —
no wizard, no gate, no setup prompts anywhere.

### What changed
- **Provisioning pre-completes the account** (`userService.createOrUpdateUser`):
  a brand-new account is created with
  `name = pricingDefaults.COMPANY_LEGAL_NAME` ("Iron Legion Contracting
  LLC") instead of the auto-generated "<First> <Last> Company"
  placeholder, and the User row is stamped `setupCompletedAt` at
  creation. Existing accounts keep their data untouched. Auth, Clerk
  verification, and tenant scoping unchanged; the stamp is written
  only in this server-side path — no client input can set it.
- **Setup endpoint deleted:** `POST /api/users/setup` and
  `userService.completeSetup` are removed. Evidence for the decision:
  the only caller in the codebase was the setup wizard itself
  (`SetupWizard.jsx` → `provisioning.js completeSetup()`). Profile's
  company editing never used the endpoint — it reads/writes its
  localStorage profile store, exactly as before, and stays untouched.
  (The `POST /api/users/contractor-account` endpoint was NOT used as
  an edit path: it creates a brand-new account and moves the user
  onto it, which would duplicate accounts.)
- **Frontend wizard + gates deleted:** `components/SetupWizard.jsx`
  removed; `ProtectedRoute` no longer redirects to `/setup` (it only
  provisions and renders); `provisioning.js` lost its `completeSetup`
  export; the `/setup` and `/profile-setup` routes now redirect to
  `/dashboard`; Profile's "Run Setup Wizard" button and legacy "Setup
  Information" panel removed; the dashboard header's "Setup" button
  removed. Sign-in gate behavior (landing for signed-out, app for
  signed-in) unchanged.

### Tests (40 total, all passing)
`backend/tests/live-fixes.test.js` rewritten to the new contract:
`POST /api/users/setup` answers 404 with and without a token; a newly
provisioned user is setup-complete from the first sync with the Iron
Legion account name; a regression test proves re-sync never resets,
renames, or duplicates the company; a per-user test proves each new
user gets their own ready account (tenant isolation intact). All
lockdown tests (401s, tenant isolation, bypass regression) pass
unchanged. Frontend production build passes, and the built bundle
contains no setup-wizard strings. Boot smoke verified: fresh-user
sync → `GET /api/users/me` shows `setupCompletedAt` set and the
"Iron Legion Contracting LLC" account.

---

## Pass Seven — Vendors, Scraper, Receipts + full sweep (Nov 3, 2026)

Branch `pass7-hardening` (off `pass4-postgres` @ 6e24d21). NOT merged,
NOT pushed — Solen reviews and lands. Full report:
`~/workspace/alphaquote/pass7-report-2026-11-03.md`.

### Vendors — fixed
- **Edit was impossible:** the page's Edit button navigated to
  `/vendors/:id/edit`, a route that did not exist. Added the route, a
  `VendorEdit` page, and the `GET /api/vendors/:id` read it needs.
- **Delete died with an opaque 500** for any vendor with receipts
  (Receipt.vendorId is a required FK; receipts auto-create vendors, so
  nearly every real vendor hit it). DELETE now answers an honest 409
  with the receipt count and the remedy.

### Scraper — rebuilt contract, deploy-ready
- The old contract could never work live: the service demanded a
  browser-held Clerk token the frontend never sent, and it was never
  deployed. New contract: only the API calls it, server-to-server,
  with `SCRAPER_SHARED_SECRET` in an `x-scraper-secret` header
  (constant-time compare; unset secret fails closed 503).
- Fabricated random "fallback prices" deleted. No SERPAPI_KEY ->
  honest 503 `unconfigured`, zero results. Upstream errors -> 502.
  SerpAPI calls carry a hard timeout; inputs are validated.
- API gained `GET /api/prices/lookup` (timeout + one retry, honest
  `unconfigured`/`unavailable` degradation, price null — never a fake
  number), `GET /api/prices/by-material` (tenant's learned prices),
  and `GET /api/prices/status`. The frontend price chain (receipt DB
  step + scraped step) and the status widget now run through these.
- `render.yaml` gains the `alphaquote-scraper` service additively;
  the secret is `generateValue` on the scraper and a `fromService`
  reference on the API. One Brandon step remains (Blueprint apply +
  one SERPAPI_KEY paste) — detailed in the report.

### Receipts — maintainable
- Manual receipts (no line items — the ReceiptNew manual path) save
  with one synthetic reconciling line; it never teaches a price.
- Line totals are computed server-side; totals reconcile by
  construction. Invalid items/dates are 400s, not 500s.
- Vendor matching is case-insensitive (JS-side over the tenant's
  vendors — identical on SQLite and Postgres).
- PUT can replace line items (total derives; prices re-taught),
  validates project ownership like POST, and only touches `verified`
  when status is sent. List/detail carry `status` (the page filter
  and badges needed it); the edit form's date field gets YYYY-MM-DD.

### Sweep — all 50 authenticated routes exercised, three more bugs caught
- `GET /api/scheduled-jobs/statistics` was registered after `/:id`
  and unreachable (404 forever). Moved above it.
- Regional-material search used Prisma `mode: 'insensitive'`
  (Postgres-only; 500s on SQLite). Matching now happens in JS with
  identical semantics on both dialects. No local Postgres was
  available in the sandbox; the dialect review is code-level and is
  itemized in the report.
- `PUT /api/calendar-sync-settings` spread the raw body into Prisma
  (any extra field = 500). Now whitelisted.
- Scheduled-job create/update validate referenced project/estimate
  ownership and date sanity.
- `/api/analytics` growth was `Math.random()` per load; now computed
  period-over-period from real tenant data (determinism test).

### Tests
68/68 passing (40 at pass start; +15 pass7-hardening, +11
pass7-sweep, +2 net scraper-contract tests in provisioning).
Frontend production build passes.

## Pass Eight — IRON UI overhaul (2026-11-03, branch `pass8-ui`)

Branch `pass8-ui` (off `pass4-postgres` @ f1aaf4d). NOT merged, NOT
pushed — Solen reviews and lands. Full report:
`~/workspace/alphaquote/pass8-report-2026-11-03.md`.

Presentation only: no service, API, route, field-name, or handler
changes (`git diff` touches nothing under `frontend/src/services/` or
`backend/`).

- **Design system ("IRON"):** new `frontend/src/styles/theme.css` —
  blackened-steel tokens (--bg #0B0C0E, --panel #141519, --raised
  #1B1D22, --steel #26282E, --bone #F2EFE9, --muted #9BA0A6, ember
  #FF5C1A → amber #FF9E2C gradient, ember glow), Barlow Condensed
  display type + Inter UI type (loaded in `public/index.html`),
  brushed-steel/blueprint-grid textures from pure CSS gradients, and
  shared classes: `.btn-ember` / `.btn-steel` / `.btn-ghost`, `.card`,
  `.stat-card` (ember top hairline, oversized condensed numbers),
  `.badge` variants, `.iron-table`.
- **Palette remap:** `tailwind.config.js` maps the slate/gray scales
  the app was built on onto the iron neutrals, `primary` to the ember
  scale, `accent` to amber, and the legacy `neon-blue` alias to ember;
  blue/purple muted to steel tones. Every existing utility class now
  renders in IRON without rewriting hundreds of classNames.
- **Shell:** `Layout.jsx` rebuilt — IL monogram tile, active nav with
  ember left bar + glow, sticky topbar (page title + company name).
  Mobile (≤860px, the primary viewport): sidebar hides, bottom tab bar
  appears — Dashboard, Estimates, Templates (→ /estimate/advanced,
  where TaskTemplates lives), Vendors, Receipts, Profile; tap targets
  ≥44px; content padded clear of the tab bar.
- **Landing rebuilt as the showpiece:** blueprint-grid hero with ember
  radial glow, "BUILT RIGHT. / QUOTED STRAIGHT." in giant condensed
  type (second line ember-gradient), the six trades as chips,
  starter-template cards at the real totals ($11,300 / $10,100 /
  $8,000 / $5,125 / $4,300 / $825), the four Pass Five quote terms as a
  strip, pricing tiers restyled from the same config.
- **Dashboard is a command center:** command band with the New
  Estimate CTA, Iron Legion stat cards ($60 solo / $90 crew / $350
  minimum / 14-day validity), quick-action cards to every work
  surface (module gating preserved).
- **Tables** on ReceiptDetail, ProjectBudget, and ReceiptConfirm are
  `.iron-table` with `data-label` cells — dark rows, steel dividers,
  hover state, and stacked-card layout on small screens.
- **Light-module conversions:** ChangeOrderManager and
  RegionalPricePack were light panels inside the dark estimator;
  converted to dark steel. The customer quote PDF's accent hex moved
  teal → ember to match (colors only).
- **Copy consistency (flagged, not logic):** the EstimateForm paper
  preview now says Iron Legion Contracting and 14-day validity,
  matching the Pass Five quote terms already on the PDF/email; the
  advanced estimator's header reads "Advanced Estimator".
- Verified: `npm run build` passes; production bundle contains the
  fonts, theme tokens, shell/tabbar/table classes, and route-specific
  strings for every page.
