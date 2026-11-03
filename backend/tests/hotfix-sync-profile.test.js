/**
 * Hotfix suite (2026-11-03) — real Clerk sign-ins bounced at sync.
 *
 * Root cause: Clerk's DEFAULT session token carries the user id (sub)
 * and nothing else — no email, no name, no public_metadata. The auth
 * middleware built req.user from payload.email / given_name /
 * family_name (all undefined for real tokens), and
 * userService.createOrUpdateUser hard-requires an email, so
 * POST /api/users/sync answered 400 for EVERY real sign-in (the app
 * showed "We couldn't load your account"). The old harness fake always
 * returned full claims, so no test ever saw the real token shape.
 *
 * The fix: when the verified identity has no email, sync fetches the
 * full profile from Clerk's Backend API (users.getUser) and provisions
 * from it; if that fetch fails or yields no primary email, sync
 * answers 502 and creates nothing.
 *
 * These tests use the harness's `bare:<email>` tokens (payload =
 * { sub } only, mirroring real tokens) plus the stubbed Backend client
 * (helpers.js → clerkProfileStub).
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer, clerkProfileStub } = require('./helpers');

let ctx;

const headersFor = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

const syncWith = (token) =>
  fetch(`${ctx.baseUrl}/api/users/sync`, {
    method: 'POST',
    headers: headersFor(token),
    body: JSON.stringify({})
  });

before(async () => {
  ctx = await startTestServer();
});

after(async () => {
  await stopTestServer(ctx);
});

test('hotfix: sub-only token (real Clerk shape) provisions via the Backend profile fetch', async () => {
  clerkProfileStub.reset();
  const email = 'bare-token@test.local';

  const res = await syncWith(`bare:${email}`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);

  // Provisioned with the FETCHED profile, not the (empty) token claims.
  assert.equal(body.data.email, email);
  assert.equal(body.data.firstName, 'Stub');
  assert.equal(body.data.lastName, 'Profile');

  // Pass Six still holds: setup-complete from creation.
  assert.equal(body.data.setupCompleted, true);
  assert.ok(body.data.setupCompletedAt);

  // Exactly one profile lookup, for the token's subject.
  assert.deepEqual(clerkProfileStub.calls, [`clerk_${email}`]);

  // The account is the Iron Legion company, reachable via /me with the
  // same sub-only token (identity resolution is by clerkId).
  const meRes = await fetch(`${ctx.baseUrl}/api/users/me`, {
    headers: headersFor(`bare:${email}`)
  });
  assert.equal(meRes.status, 200);
  const me = (await meRes.json()).data;
  assert.equal(me.email, email);
  assert.equal(me.contractorAccount.name, 'Iron Legion Contracting LLC');
});

test('hotfix: sub-only token re-sync is idempotent (no duplicate user or account)', async () => {
  clerkProfileStub.reset();
  const email = 'bare-resync@test.local';

  const first = await syncWith(`bare:${email}`);
  assert.equal(first.status, 200);
  const firstData = (await first.json()).data;

  const second = await syncWith(`bare:${email}`);
  assert.equal(second.status, 200);
  const secondData = (await second.json()).data;

  assert.equal(secondData.id, firstData.id);
  const users = await ctx.prisma.user.findMany({ where: { email } });
  assert.equal(users.length, 1);
  const accounts = await ctx.prisma.contractorAccount.findMany({ where: { email } });
  assert.equal(accounts.length, 1);
});

test('hotfix: token WITH claims provisions as before — no profile fetch', async () => {
  clerkProfileStub.reset();
  const email = 'full-claims@test.local';

  const res = await syncWith(`valid:${email}`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.email, email);
  assert.equal(body.data.setupCompleted, true);

  // The Backend profile lookup must not run when the token has an email.
  assert.deepEqual(clerkProfileStub.calls, []);
});

test('hotfix: profile fetch failure -> 502 and nothing is created', async () => {
  clerkProfileStub.reset();
  clerkProfileStub.fail = true;
  const email = 'bare-fail@test.local';

  const usersBefore = await ctx.prisma.user.count();
  const accountsBefore = await ctx.prisma.contractorAccount.count();

  try {
    const res = await syncWith(`bare:${email}`);
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /profile/i);
  } finally {
    clerkProfileStub.fail = false;
  }

  // The lookup was attempted exactly once...
  assert.deepEqual(clerkProfileStub.calls, [`clerk_${email}`]);

  // ...and no partial rows exist: no user, no contractor account.
  assert.equal(await ctx.prisma.user.findUnique({ where: { email } }), null);
  assert.equal(
    await ctx.prisma.user.findUnique({ where: { clerkId: `clerk_${email}` } }),
    null
  );
  assert.equal(await ctx.prisma.user.count(), usersBefore);
  assert.equal(await ctx.prisma.contractorAccount.count(), accountsBefore);
});
