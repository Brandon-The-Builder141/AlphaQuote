/**
 * Pass Nine suite — the Command Center surfaces.
 *
 * Covers the new tenant-scoped modules:
 *  - Lead Board (/api/leads): the auditor-sale seed self-populates on a
 *    tenant's first list (32 unique parcels from leadSeed.json, 8 with
 *    researched phone numbers), is idempotent, and CRUD + status flow
 *    are tenant-isolated.
 *  - Approval queue (/api/ops/items): starts EMPTY (no seeded/demo
 *    items), CRUD + status transitions, tenant-isolated.
 *  - Today card (/api/ops/day): empty default, PUT upserts one row per
 *    tenant per date, tenant-isolated.
 *  - Command summary (/api/ops/summary): real aggregates over the
 *    existing engine models, tenant-isolated.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./helpers');

let ctx;
const USER = 'command@test.local';
const OTHER = 'command-other@test.local';
const ids = {};

const tokenFor = (email) => ({
  Authorization: ['Bea', 'rer valid:', email].join(''),
  'Content-Type': 'application/json'
});

async function api(email, method, path, body) {
  const res = await fetch(`${ctx.baseUrl}${path}`, {
    method,
    headers: tokenFor(email),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

after(async () => {
  // Force-close keep-alive sockets first: this suite holds more of them
  // than most (two seeded boards), and server.close() inside
  // stopTestServer would otherwise wait on undici's agent.
  ctx.server.closeAllConnections();
  await stopTestServer(ctx);
});

before(async () => {
  ctx = await startTestServer();
  for (const email of [USER, OTHER]) {
    const res = await fetch(`${ctx.baseUrl}/api/users/sync`, {
      method: 'POST',
      headers: tokenFor(email),
      body: JSON.stringify({})
    });
    assert.equal(res.status, 200, `sync for ${email}`);
  }
  const me = await ctx.prisma.user.findUnique({ where: { email: USER } });
  ids.tenantId = me.contractorAccountId;
  ids.userId = me.id;
});

// ---------------- Leads: seed ----------------

test('leads: first list self-seeds the auditor board (32 unique parcels, 8 with phones)', async () => {
  const res = await api(USER, 'GET', '/api/leads');
  assert.equal(res.status, 200);
  assert.equal(res.body.leads.length, 32);
  const withPhone = res.body.leads.filter((l) => l.phone);
  assert.equal(withPhone.length, 8);
  const hannon = res.body.leads.find((l) => l.parcelId === 'J03-0179-0-050-00');
  assert.ok(hannon, 'Hannon parcel present');
  assert.equal(hannon.phone, '(419) 785-4389');
  assert.equal(hannon.status, 'new');
  assert.equal(hannon.source, 'Auditor sales');
  // The duplicate-parcel variant rows collapsed into one row per parcel.
  const parcels = res.body.leads.map((l) => l.parcelId);
  assert.equal(new Set(parcels).size, parcels.length);
});

test('leads: seed is idempotent — second list still returns 32', async () => {
  const res = await api(USER, 'GET', '/api/leads');
  assert.equal(res.status, 200);
  assert.equal(res.body.leads.length, 32);
});

// ---------------- Leads: CRUD + isolation ----------------

test('leads: create, read, status update, filter, delete', async () => {
  const created = await api(USER, 'POST', '/api/leads', {
    name: 'TEST BUYER',
    address: '1 TEST WAY',
    city: 'Defiance City',
    phone: '(419) 555-0100'
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.lead.status, 'new');
  const id = created.body.lead.id;

  const got = await api(USER, 'GET', `/api/leads/${id}`);
  assert.equal(got.status, 200);
  assert.equal(got.body.lead.name, 'TEST BUYER');

  const updated = await api(USER, 'PUT', `/api/leads/${id}`, { status: 'calling' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.lead.status, 'calling');

  const filtered = await api(USER, 'GET', '/api/leads?status=calling');
  assert.equal(filtered.status, 200);
  assert.deepEqual(filtered.body.leads.map((l) => l.id), [id]);

  const badStatus = await api(USER, 'PUT', `/api/leads/${id}`, { status: 'bogus' });
  assert.equal(badStatus.status, 400);

  const del = await api(USER, 'DELETE', `/api/leads/${id}`);
  assert.equal(del.status, 200);
  const gone = await api(USER, 'GET', `/api/leads/${id}`);
  assert.equal(gone.status, 404);
});

test('leads: create validates name and address', async () => {
  const res = await api(USER, 'POST', '/api/leads', { name: 'NO ADDRESS' });
  assert.equal(res.status, 400);
});

test('leads: cross-tenant isolation — B cannot see or touch A\'s lead', async () => {
  const created = await api(USER, 'POST', '/api/leads', {
    name: 'A ONLY BUYER',
    address: '9 PRIVATE LN',
    city: 'Defiance City'
  });
  const id = created.body.lead.id;

  // B's own board seeds for B, but A's hand-made lead is not in it.
  const bList = await api(OTHER, 'GET', '/api/leads');
  assert.equal(bList.status, 200);
  assert.equal(bList.body.leads.some((l) => l.id === id), false);

  assert.equal((await api(OTHER, 'GET', `/api/leads/${id}`)).status, 404);
  assert.equal((await api(OTHER, 'PUT', `/api/leads/${id}`, { status: 'dead' })).status, 404);
  assert.equal((await api(OTHER, 'DELETE', `/api/leads/${id}`)).status, 404);

  // A's lead is untouched.
  const stillThere = await api(USER, 'GET', `/api/leads/${id}`);
  assert.equal(stillThere.status, 200);
  assert.equal(stillThere.body.lead.status, 'new');
  await api(USER, 'DELETE', `/api/leads/${id}`);
});

test('leads: unauthenticated request is rejected', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/leads`);
  assert.equal(res.status, 401);
});

// ---------------- Approval queue ----------------

test('queue: starts empty — no seeded or demo items, ever', async () => {
  const res = await api(USER, 'GET', '/api/ops/items');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.items, []);
});

test('queue: create, approve, done, dismiss, filter, delete', async () => {
  const created = await api(USER, 'POST', '/api/ops/items', {
    kind: 'followup',
    title: 'Follow-up draft: Smith deck quote',
    body: 'Hi — checking in on the deck quote from Tuesday.'
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.item.status, 'queued');
  const id = created.body.item.id;

  const approved = await api(USER, 'PUT', `/api/ops/items/${id}`, { status: 'approved' });
  assert.equal(approved.status, 200);
  assert.equal(approved.body.item.status, 'approved');

  const queuedOnly = await api(USER, 'GET', '/api/ops/items?status=queued');
  assert.equal(queuedOnly.body.items.some((i) => i.id === id), false);

  const done = await api(USER, 'PUT', `/api/ops/items/${id}`, { status: 'done' });
  assert.equal(done.body.item.status, 'done');

  const badKind = await api(USER, 'POST', '/api/ops/items', { kind: 'spam', title: 'x' });
  assert.equal(badKind.status, 400);
  const noTitle = await api(USER, 'POST', '/api/ops/items', { kind: 'note' });
  assert.equal(noTitle.status, 400);

  const second = await api(USER, 'POST', '/api/ops/items', { kind: 'ad', title: 'Ad draft', body: '...' });
  const dismissed = await api(USER, 'PUT', `/api/ops/items/${second.body.item.id}`, { status: 'dismissed' });
  assert.equal(dismissed.body.item.status, 'dismissed');

  assert.equal((await api(USER, 'DELETE', `/api/ops/items/${id}`)).status, 200);
  assert.equal((await api(USER, 'DELETE', `/api/ops/items/${second.body.item.id}`)).status, 200);
  const empty = await api(USER, 'GET', '/api/ops/items');
  assert.deepEqual(empty.body.items, []);
});

test('queue: cross-tenant isolation', async () => {
  const created = await api(USER, 'POST', '/api/ops/items', {
    kind: 'lead-scan',
    title: 'A only scan',
    body: 'private'
  });
  const id = created.body.item.id;
  const bList = await api(OTHER, 'GET', '/api/ops/items');
  assert.equal(bList.body.items.some((i) => i.id === id), false);
  assert.equal((await api(OTHER, 'PUT', `/api/ops/items/${id}`, { status: 'approved' })).status, 404);
  assert.equal((await api(OTHER, 'DELETE', `/api/ops/items/${id}`)).status, 404);
  await api(USER, 'DELETE', `/api/ops/items/${id}`);
});

// ---------------- Today card ----------------

test('day: empty default, PUT upserts one row per tenant per date', async () => {
  const date = '2026-11-03';
  const empty = await api(USER, 'GET', `/api/ops/day?date=${date}`);
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.day, { date, mustWin: '', brick: '' });

  const saved = await api(USER, 'PUT', '/api/ops/day', {
    date,
    mustWin: 'Send the Miller quote',
    brick: 'One follow-up call'
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.day.mustWin, 'Send the Miller quote');

  const edited = await api(USER, 'PUT', '/api/ops/day', {
    date,
    mustWin: 'Send the Miller quote v2',
    brick: 'One follow-up call'
  });
  assert.equal(edited.status, 200);
  assert.equal(edited.body.day.id, saved.body.day.id, 'upsert reuses the same row');

  const count = await ctx.prisma.dayCard.count({
    where: { contractorAccountId: ids.tenantId, date }
  });
  assert.equal(count, 1);

  const reread = await api(USER, 'GET', `/api/ops/day?date=${date}`);
  assert.equal(reread.body.day.mustWin, 'Send the Miller quote v2');

  const badDate = await api(USER, 'GET', '/api/ops/day?date=11-03-2026');
  assert.equal(badDate.status, 400);
});

test('day: cross-tenant isolation — B has its own empty card for the same date', async () => {
  const date = '2026-11-03';
  const bView = await api(OTHER, 'GET', `/api/ops/day?date=${date}`);
  assert.equal(bView.status, 200);
  assert.equal(bView.body.day.mustWin, '');
  await api(OTHER, 'PUT', '/api/ops/day', { date, mustWin: 'B day', brick: '' });
  const aView = await api(USER, 'GET', `/api/ops/day?date=${date}`);
  assert.equal(aView.body.day.mustWin, 'Send the Miller quote v2');
});

// ---------------- Command summary ----------------

test('summary: aggregates real engine data for the tenant only', async () => {
  const now = new Date();
  // A project + estimate on an 'active' project (quotes out).
  const project = await ctx.prisma.project.create({
    data: {
      name: 'Summary Test Job',
      status: 'active',
      contractorAccountId: ids.tenantId,
      createdById: ids.userId
    }
  });
  await ctx.prisma.estimate.create({
    data: {
      projectId: project.id,
      estimateType: 'manual',
      totalCost: 5000,
      contractorAccountId: ids.tenantId,
      createdById: ids.userId
    }
  });
  // A due follow-up (pending, scheduled in the past).
  await api(USER, 'POST', '/api/followups', {
    clientEmail: 'client@test.local',
    clientName: 'Client',
    subject: 'Checking in',
    message: 'Following up.',
    scheduledDate: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    status: 'pending'
  });
  // A receipt dated this month.
  const vendor = await api(USER, 'POST', '/api/vendors', { name: 'Summary Vendor' });
  await ctx.prisma.receipt.create({
    data: {
      vendorId: vendor.body.vendor.id,
      receiptDate: now,
      total: 250,
      contractorAccountId: ids.tenantId,
      createdById: ids.userId
    }
  });
  // A job scheduled today.
  const start = new Date(now); start.setHours(9, 0, 0, 0);
  const end = new Date(now); end.setHours(17, 0, 0, 0);
  await api(USER, 'POST', '/api/scheduled-jobs', {
    title: 'Summary Job',
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    status: 'scheduled'
  });

  const res = await api(USER, 'GET', '/api/ops/summary');
  assert.equal(res.status, 200);
  const s = res.body.summary;
  assert.equal(s.quotesOut.count, 1);
  assert.equal(s.quotesOut.total, 5000);
  assert.equal(s.followUpsDue.count, 1);
  assert.equal(s.receiptsThisMonth.count, 1);
  assert.equal(s.receiptsThisMonth.total, 250);
  assert.equal(s.jobsToday.count, 1);
  assert.ok(s.leadsNew.count >= 32, 'seeded board counts as new leads');
  assert.equal(s.queueQueued.count, 0);

  // Tenant B sees none of A's business.
  const bRes = await api(OTHER, 'GET', '/api/ops/summary');
  assert.equal(bRes.body.summary.quotesOut.count, 0);
  assert.equal(bRes.body.summary.followUpsDue.count, 0);
  assert.equal(bRes.body.summary.receiptsThisMonth.total, 0);
  assert.equal(bRes.body.summary.jobsToday.count, 0);
});
