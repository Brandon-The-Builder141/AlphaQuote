/**
 * Live fixes suite (2026-11-02) — the two bugs Brandon hit on the
 * production app the night it launched:
 *
 * Bug 1 (Receipts "errors out, doesn't load anything"): a signed-in
 * user who had never been provisioned (no Clerk webhook configured
 * yet, and the frontend never called POST /api/users/sync) got 403
 * from GET /api/receipts. The frontend fix wires sync into
 * ProtectedRoute via services/provisioning.js; these tests lock the
 * API contract that flow depends on: sync -> receipts list answers
 * 200, including the clean empty state, and then returns real rows.
 *
 * Bug 2 (setup ran twice): completion used to live in two client-side
 * stores (localStorage wizard flag + Clerk metadata flag) driven by
 * two different setup flows; the 2026-11-02 fix moved it server-side
 * (User.setupCompletedAt, stamped by POST /api/users/setup).
 *
 * Pass Six (2026-11-03) supersedes that fix by deleting setup
 * entirely — Brandon's order: "get rid of the setup… it should be
 * strictly for me. I shouldn't have to run through a setup process."
 * Provisioning now creates the account under
 * "Iron Legion Contracting LLC" and stamps User.setupCompletedAt at
 * creation; POST /api/users/setup is gone and no client call can set
 * the stamp. These tests prove a fresh user is setup-complete from
 * the first sync, per-user, and that re-sync never resets, renames,
 * or duplicates the provisioned company.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./helpers');

let ctx;

const tokenFor = (email) => ({
  Authorization: `Bearer valid:${email}`,
  'Content-Type': 'application/json'
});

const sync = (email) =>
  fetch(`${ctx.baseUrl}/api/users/sync`, {
    method: 'POST',
    headers: tokenFor(email),
    body: JSON.stringify({})
  });

const me = async (email) => {
  const res = await fetch(`${ctx.baseUrl}/api/users/me`, { headers: tokenFor(email) });
  assert.equal(res.status, 200);
  return (await res.json()).data;
};

before(async () => {
  ctx = await startTestServer();
});

after(async () => {
  await stopTestServer(ctx);
});

test('pass six: POST /api/users/setup no longer exists — there is no setup step', async () => {
  // Unauthenticated: the route is gone entirely (404 — not the old 401
  // of a live-but-guarded endpoint).
  const noAuth = await fetch(`${ctx.baseUrl}/api/users/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName: 'Nope Co' })
  });
  assert.equal(noAuth.status, 404);

  // Authenticated callers get the same 404: no client call can stamp
  // setup completion or rewrite the provisioned company basics.
  const email = 'setup-gone@test.local';
  await sync(email);
  const authed = await fetch(`${ctx.baseUrl}/api/users/setup`, {
    method: 'POST',
    headers: tokenFor(email),
    body: JSON.stringify({ companyName: 'Nope Co', phone: '419-555-0100' })
  });
  assert.equal(authed.status, 404);

  // And the attempt changed nothing.
  const data = await me(email);
  assert.equal(data.contractorAccount.name, 'Iron Legion Contracting LLC');
});

test('bug 1: receipts list loads for a newly provisioned tenant — empty state, then real rows', async () => {
  const email = 'receipts-user@test.local';

  // Before provisioning, the list route rejects the identity — this is
  // the 403 Brandon's browser got on the Receipts tab.
  const pre = await fetch(`${ctx.baseUrl}/api/receipts`, { headers: tokenFor(email) });
  assert.equal(pre.status, 403);

  // The frontend gate now performs this call at sign-in.
  const syncRes = await sync(email);
  assert.equal(syncRes.status, 200);

  // Empty state: a provisioned tenant with zero receipts gets a clean
  // 200 with an empty list (the page renders its empty state).
  const empty = await fetch(`${ctx.baseUrl}/api/receipts`, { headers: tokenFor(email) });
  assert.equal(empty.status, 200);
  const emptyBody = await empty.json();
  assert.equal(emptyBody.success, true);
  assert.deepEqual(emptyBody.receipts, []);

  // After a receipt is created, the list returns it in the shape the
  // page renders (vendor as a plain string, itemsCount, total).
  const create = await fetch(`${ctx.baseUrl}/api/receipts`, {
    method: 'POST',
    headers: tokenFor(email),
    body: JSON.stringify({
      vendor: 'Defiance Lumber',
      purchaseDate: '2026-11-02',
      total: 123.45,
      items: [{ name: '2x4 stud', quantity: 10, unitPrice: 12.345, total: 123.45 }]
    })
  });
  assert.equal(create.status, 201);

  const list = await fetch(`${ctx.baseUrl}/api/receipts`, { headers: tokenFor(email) });
  assert.equal(list.status, 200);
  const listBody = await list.json();
  assert.equal(listBody.receipts.length, 1);
  assert.equal(listBody.receipts[0].vendor, 'Defiance Lumber');
  assert.equal(listBody.receipts[0].itemsCount, 1);
  assert.equal(Number(listBody.receipts[0].total), 123.45);
});

test('pass six: a newly provisioned user is already setup-complete under Iron Legion Contracting LLC', async () => {
  const email = 'setup-user@test.local';

  // The very first sync — the call the frontend makes at sign-in —
  // already returns a finished account. No setup call exists or is
  // needed between sync and a usable dashboard.
  const syncRes = await sync(email);
  assert.equal(syncRes.status, 200);
  const syncBody = await syncRes.json();
  assert.equal(syncBody.data.setupCompleted, true);
  assert.ok(syncBody.data.setupCompletedAt);

  // /me agrees: setup complete, company already Iron Legion, and the
  // legacy password column is never exposed.
  const data = await me(email);
  assert.equal(data.setupCompleted, true);
  assert.ok(data.setupCompletedAt);
  assert.equal(data.password, undefined);
  assert.equal(data.contractorAccount.name, 'Iron Legion Contracting LLC');

  // The stamp is a real stored value, written server-side at
  // provisioning — not something the client supplied.
  const row = await ctx.prisma.user.findUnique({ where: { email } });
  assert.ok(row.setupCompletedAt instanceof Date);
  assert.equal(row.contractorAccountId, data.contractorAccountId);
});

test('pass six regression: re-provisioning (re-sync) never resets or duplicates the company', async () => {
  const email = 'resync-user@test.local';
  await sync(email);
  const first = await me(email);
  const accountCountBefore = await ctx.prisma.contractorAccount.count();

  // Every sign-in re-runs sync; it must stay a pure profile refresh.
  await sync(email);
  await sync(email);

  const after = await me(email);
  assert.equal(after.setupCompleted, true);
  assert.ok(after.setupCompletedAt);
  assert.equal(after.contractorAccountId, first.contractorAccountId);
  assert.equal(after.contractorAccount.name, 'Iron Legion Contracting LLC');
  assert.equal(await ctx.prisma.contractorAccount.count(), accountCountBefore);

  // Exactly one user row for the identity, too.
  assert.equal(await ctx.prisma.user.count({ where: { email } }), 1);
});

test('pass six: provisioning is per-user — each new user gets their own ready Iron Legion account', async () => {
  const firstEmail = 'first-user@test.local';
  const secondEmail = 'second-user@test.local';
  await sync(firstEmail);
  await sync(secondEmail);

  const first = await me(firstEmail);
  const second = await me(secondEmail);

  // Both are setup-complete from birth, under the Iron Legion name...
  assert.equal(first.setupCompleted, true);
  assert.equal(second.setupCompleted, true);
  assert.equal(first.contractorAccount.name, 'Iron Legion Contracting LLC');
  assert.equal(second.contractorAccount.name, 'Iron Legion Contracting LLC');

  // ...but tenant isolation is untouched: separate accounts per user.
  assert.notEqual(second.contractorAccountId, first.contractorAccountId);
});
