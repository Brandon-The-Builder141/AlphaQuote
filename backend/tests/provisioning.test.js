/**
 * Pass Two finish suite:
 * - Clerk webhook: valid Svix signature provisions/links users;
 *   bad signature or missing headers -> 401 and nothing is written
 * - POST /api/users/sync provisions a brand-new identity by clerkId
 *   (previously broken: the schema had no clerkId column)
 * - tenant resolution backfills clerkId onto legacy email-matched rows
 * - a provisioned user's data is scoped to them (cross-tenant -> 404)
 * - the scraper service rejects unauthenticated calls (401) and serves
 *   authenticated ones; its /health probe stays public
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { Webhook } = require('svix');
const { startTestServer, stopTestServer } = require('./helpers');

const WEBHOOK_SECRET = `whsec_${Buffer.from('provisioning-test-secret-material').toString('base64')}`;
process.env.CLERK_WEBHOOK_SECRET = WEBHOOK_SECRET;

let ctx;
let scraperServer;
let scraperBaseUrl;
let tenantA;

const tokenFor = (email) => ({
  Authorization: `Bearer valid:${email}`,
  'Content-Type': 'application/json'
});

function signedWebhookRequest(payloadObject) {
  const payload = JSON.stringify(payloadObject);
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = new Date();
  const signature = new Webhook(WEBHOOK_SECRET).sign(msgId, timestamp, payload);
  return {
    body: payload,
    headers: {
      'Content-Type': 'application/json',
      'svix-id': msgId,
      'svix-timestamp': Math.floor(timestamp.getTime() / 1000).toString(),
      'svix-signature': signature
    }
  };
}

before(async () => {
  ctx = await startTestServer();
  const { prisma } = ctx;

  // Tenant A: legacy-style row (clerkId still null until first contact).
  const contractor = await prisma.contractorAccount.create({
    data: { name: 'Alpha Co', email: 'alpha-co@test.local' }
  });
  const user = await prisma.user.create({
    data: {
      email: 'alpha@test.local',
      firstName: 'Alpha',
      lastName: 'User',
      password: 'not-a-real-password-hash',
      contractorAccountId: contractor.id
    }
  });
  const vendor = await prisma.localVendor.create({
    data: { name: 'Alpha Supply', contractorAccountId: contractor.id, createdById: user.id }
  });
  const receipt = await prisma.receipt.create({
    data: {
      vendorId: vendor.id,
      receiptDate: new Date(),
      total: 42.5,
      contractorAccountId: contractor.id,
      createdById: user.id
    }
  });
  tenantA = { contractor, user, vendor, receipt };

  // The scraper is a separate Express app; Clerk's verifyToken is already
  // mocked by startTestServer, and the scraper shares that middleware.
  const scraperApp = require('../server/scraper.js');
  scraperServer = await new Promise((resolve) => {
    const s = scraperApp.listen(0, '127.0.0.1', () => resolve(s));
  });
  scraperBaseUrl = `http://127.0.0.1:${scraperServer.address().port}`;
});

after(async () => {
  await new Promise((resolve) => scraperServer.close(resolve));
  await stopTestServer(ctx);
});

test('webhook: valid signature on user.created provisions user + contractor account', async () => {
  const { body, headers } = signedWebhookRequest({
    type: 'user.created',
    data: {
      id: 'user_webhook_1',
      email_addresses: [{ email_address: 'hooked@test.local' }],
      first_name: 'Hook',
      last_name: 'User'
    }
  });

  const res = await fetch(`${ctx.baseUrl}/api/webhooks/clerk`, {
    method: 'POST',
    headers,
    body
  });
  assert.equal(res.status, 200);

  const user = await ctx.prisma.user.findUnique({ where: { clerkId: 'user_webhook_1' } });
  assert.ok(user, 'user row should exist with the webhook clerkId');
  assert.equal(user.email, 'hooked@test.local');
  assert.ok(user.contractorAccountId, 'provisioning must create/link a contractor account');
});

test('webhook: bad signature is rejected 401 and writes nothing', async () => {
  const payload = JSON.stringify({
    type: 'user.created',
    data: {
      id: 'user_forged',
      email_addresses: [{ email_address: 'forged@test.local' }],
      first_name: 'Forged',
      last_name: 'User'
    }
  });

  const res = await fetch(`${ctx.baseUrl}/api/webhooks/clerk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'svix-id': 'msg_forged',
      'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
      'svix-signature': 'v1,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
    },
    body: payload
  });
  assert.equal(res.status, 401);

  const user = await ctx.prisma.user.findUnique({ where: { clerkId: 'user_forged' } });
  assert.equal(user, null);
});

test('webhook: missing Svix headers are rejected 401', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/webhooks/clerk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'user.created', data: { id: 'user_noheaders' } })
  });
  assert.equal(res.status, 401);

  const user = await ctx.prisma.user.findUnique({ where: { clerkId: 'user_noheaders' } });
  assert.equal(user, null);
});

test('webhook: user.created for an existing email links clerkId instead of duplicating', async () => {
  // A second legacy row (in its own contractor account), clerkId null.
  const contractor = await ctx.prisma.contractorAccount.create({
    data: { name: 'Legacy Co', email: 'legacy-co@test.local' }
  });
  const legacy = await ctx.prisma.user.create({
    data: {
      email: 'legacy@test.local',
      firstName: 'Legacy',
      lastName: 'User',
      password: 'not-a-real-password-hash',
      contractorAccountId: contractor.id
    }
  });
  assert.equal(legacy.clerkId, null);

  const { body, headers } = signedWebhookRequest({
    type: 'user.created',
    data: {
      id: 'user_legacy_link',
      email_addresses: [{ email_address: 'legacy@test.local' }],
      first_name: 'Legacy',
      last_name: 'User'
    }
  });

  const res = await fetch(`${ctx.baseUrl}/api/webhooks/clerk`, {
    method: 'POST',
    headers,
    body
  });
  assert.equal(res.status, 200);

  const after = await ctx.prisma.user.findUnique({ where: { email: 'legacy@test.local' } });
  assert.equal(after.id, legacy.id, 'must link the same row, not create a new one');
  assert.equal(after.clerkId, 'user_legacy_link');
});

test('tenant resolution backfills clerkId onto a legacy row on first authenticated contact', async () => {
  const beforeRow = await ctx.prisma.user.findUnique({ where: { email: 'alpha@test.local' } });
  assert.equal(beforeRow.clerkId, null);

  const res = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: tokenFor('alpha@test.local')
  });
  assert.equal(res.status, 200);

  const afterRow = await ctx.prisma.user.findUnique({ where: { email: 'alpha@test.local' } });
  // The fake verifier's subject for this token is clerk_alpha@test.local.
  assert.equal(afterRow.clerkId, 'clerk_alpha@test.local');
});

test('sync provisions a brand-new identity by clerkId from the verified token', async () => {
  // Before sync, the identity is unprovisioned: data routes answer 403.
  const pre = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: tokenFor('newbie@test.local')
  });
  assert.equal(pre.status, 403);

  const res = await fetch(`${ctx.baseUrl}/api/users/sync`, {
    method: 'POST',
    headers: tokenFor('newbie@test.local'),
    body: JSON.stringify({})
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.clerkId, 'clerk_newbie@test.local');
  assert.equal(body.data.email, 'newbie@test.local');

  // After sync, the same identity is provisioned: data routes answer 200.
  const post = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: tokenFor('newbie@test.local')
  });
  assert.equal(post.status, 200);
});

test('a sync-provisioned user is scoped to their own tenant (cross-tenant -> 404)', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/receipts/${tenantA.receipt.id}`, {
    headers: tokenFor('newbie@test.local')
  });
  assert.equal(res.status, 404);

  const list = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: tokenFor('newbie@test.local')
  });
  const body = await list.json();
  const ids = body.receipts.map((r) => r.id);
  assert.ok(!ids.includes(tenantA.receipt.id));
});

test('scraper: data routes return 401 without a token', async () => {
  for (const route of ['/sites', '/scrape-price?search=vinyl', '/scrape/homeDepot?search=vinyl']) {
    const res = await fetch(`${scraperBaseUrl}${route}`);
    assert.equal(res.status, 401, `GET ${route} should be 401, got ${res.status}`);
  }
});

test('scraper: data routes serve an authenticated caller; /health stays public', async () => {
  const sites = await fetch(`${scraperBaseUrl}/sites`, {
    headers: tokenFor('alpha@test.local')
  });
  assert.equal(sites.status, 200);

  const health = await fetch(`${scraperBaseUrl}/health`);
  assert.equal(health.status, 200);
});
