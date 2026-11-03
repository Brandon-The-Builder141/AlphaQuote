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
 * two different setup flows. Completion now lives server-side in
 * User.setupCompletedAt, stamped by POST /api/users/setup and read
 * via GET /api/users/me. These tests prove it persists across
 * re-login/sync, is per-user, and never creates a second contractor
 * account or moves the user.
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

test('POST /api/users/setup requires auth (401 without a token)', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/users/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName: 'Nope Co' })
  });
  assert.equal(res.status, 401);
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

test('bug 2: setup completion persists server-side across re-login and re-sync', async () => {
  const email = 'setup-user@test.local';
  const syncRes = await sync(email);
  assert.equal(syncRes.status, 200);
  const syncBody = await syncRes.json();

  // /me is the gate's source of truth: not completed yet, and the
  // legacy password column is never exposed.
  const before = await me(email);
  assert.equal(before.setupCompleted, false);
  assert.equal(before.password, undefined);
  const accountIdBefore = before.contractorAccountId;
  const accountCountBefore = await ctx.prisma.contractorAccount.count();

  const setupRes = await fetch(`${ctx.baseUrl}/api/users/setup`, {
    method: 'POST',
    headers: tokenFor(email),
    body: JSON.stringify({
      companyName: 'Iron Legion Contracting LLC',
      phone: '419-555-0100',
      address: 'Defiance, OH'
    })
  });
  assert.equal(setupRes.status, 200);
  const setupBody = await setupRes.json();
  assert.equal(setupBody.success, true);
  assert.equal(setupBody.data.setupCompleted, true);
  assert.equal(setupBody.data.contractorAccount.name, 'Iron Legion Contracting LLC');
  assert.equal(setupBody.data.contractorAccount.phone, '419-555-0100');
  assert.equal(setupBody.data.contractorAccount.address, 'Defiance, OH');

  // Setup updated the EXISTING account: no new account, no move.
  assert.equal(setupBody.data.contractorAccountId, accountIdBefore);
  assert.equal(await ctx.prisma.contractorAccount.count(), accountCountBefore);
  const row = await ctx.prisma.user.findUnique({ where: { email } });
  assert.ok(row.setupCompletedAt instanceof Date);

  // A fresh "login" (new /me read) still reports completion...
  const afterLogin = await me(email);
  assert.equal(afterLogin.setupCompleted, true);

  // ...and re-running sync (every sign-in does) must not reset it.
  await sync(email);
  const afterResync = await me(email);
  assert.equal(afterResync.setupCompleted, true);
  assert.equal(syncBody.data.setupCompleted, false); // sync itself predates setup
});

test('bug 2: setup completion is per-user — a second user still owes setup', async () => {
  const email = 'second-user@test.local';
  await sync(email);
  const data = await me(email);
  assert.equal(data.setupCompleted, false);
});
