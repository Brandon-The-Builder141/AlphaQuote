/**
 * Pass Two lockdown suite:
 * - every non-public API route rejects unauthenticated requests with 401
 * - the only public route left is GET /api/health
 * - the legacy password account system is gone (404 with and without auth)
 * - data queries are scoped to the authenticated user's tenant
 * - an authenticated but unprovisioned identity gets 403 on data routes
 * - CORS answers only allowlisted origins
 * - the HTML escaper used by the email endpoint neutralizes markup
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./helpers');
const { escapeHtml, sanitizeHeaderValue } = require('../utils/escapeHtml');

let ctx;
let tenantA;
let tenantB;

const tokenFor = (email) => ({
  Authorization: `Bearer valid:${email}`,
  'Content-Type': 'application/json'
});

before(async () => {
  ctx = await startTestServer();
  const { prisma } = ctx;

  async function makeTenant(slug) {
    const contractor = await prisma.contractorAccount.create({
      data: { name: `${slug} Co`, email: `${slug}-co@test.local` }
    });
    const user = await prisma.user.create({
      data: {
        email: `${slug}@test.local`,
        firstName: slug,
        lastName: 'User',
        password: 'not-a-real-password-hash',
        contractorAccountId: contractor.id
      }
    });
    const vendor = await prisma.localVendor.create({
      data: {
        name: `${slug} Supply`,
        contractorAccountId: contractor.id,
        createdById: user.id
      }
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
    return { contractor, user, vendor, receipt };
  }

  tenantA = await makeTenant('alpha');
  tenantB = await makeTenant('bravo');
});

after(async () => {
  await stopTestServer(ctx);
});

const PROTECTED_ROUTES = [
  ['POST', '/api/users/sync'],
  ['GET', '/api/users/me'],
  ['PUT', '/api/users/profile'],
  ['POST', '/api/users/contractor-account'],
  ['GET', '/api/users/subscription'],
  ['GET', '/api/vendors'],
  ['POST', '/api/vendors'],
  ['PUT', '/api/vendors/some-id'],
  ['DELETE', '/api/vendors/some-id'],
  ['GET', '/api/projects'],
  ['GET', '/api/projects/some-id'],
  ['GET', '/api/receipts'],
  ['POST', '/api/receipts'],
  ['GET', '/api/receipts/some-id'],
  ['PUT', '/api/receipts/some-id'],
  ['DELETE', '/api/receipts/some-id'],
  ['POST', '/api/email-quote'],
  ['GET', '/api/regional-price-packs'],
  ['GET', '/api/regional-materials'],
  ['GET', '/api/regional-materials/suggestions'],
  ['POST', '/api/user-regional-selection'],
  ['GET', '/api/user-regional-selection'],
  ['GET', '/api/task-templates'],
  ['GET', '/api/task-templates/some-id'],
  ['POST', '/api/task-templates'],
  ['PUT', '/api/task-templates/some-id'],
  ['DELETE', '/api/task-templates/some-id'],
  ['GET', '/api/analytics'],
  ['GET', '/api/followups'],
  ['POST', '/api/followups'],
  ['PUT', '/api/followups/some-id'],
  ['DELETE', '/api/followups/some-id'],
  ['GET', '/api/followup-templates'],
  ['POST', '/api/followup-templates'],
  ['PUT', '/api/followup-templates/some-id'],
  ['DELETE', '/api/followup-templates/some-id'],
  ['GET', '/api/scheduled-jobs'],
  ['GET', '/api/scheduled-jobs/some-id'],
  ['POST', '/api/scheduled-jobs'],
  ['PUT', '/api/scheduled-jobs/some-id'],
  ['DELETE', '/api/scheduled-jobs/some-id'],
  ['POST', '/api/scheduled-jobs/some-id/sync'],
  ['DELETE', '/api/scheduled-jobs/some-id/sync'],
  ['GET', '/api/scheduled-jobs/statistics'],
  ['GET', '/api/calendar-sync-settings'],
  ['PUT', '/api/calendar-sync-settings']
];

test('sweep: every non-public route returns 401 without a token', async () => {
  const failures = [];
  for (const [method, route] of PROTECTED_ROUTES) {
    const res = await fetch(`${ctx.baseUrl}${route}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' || method === 'DELETE' ? undefined : '{}'
    });
    if (res.status !== 401) {
      failures.push(`${method} ${route} -> ${res.status}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('health check stays public', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/health`);
  assert.equal(res.status, 200);
});

const LEGACY_ROUTES = [
  ['POST', '/api/auth/login'],
  ['POST', '/api/auth/register'],
  ['GET', '/api/users'],
  ['POST', '/api/users'],
  ['PUT', '/api/users/some-id'],
  ['DELETE', '/api/users/some-id']
];

test('legacy password account routes are gone (404, with and without a token)', async () => {
  for (const [method, route] of LEGACY_ROUTES) {
    for (const headers of [{ 'Content-Type': 'application/json' }, tokenFor('alpha@test.local')]) {
      const res = await fetch(`${ctx.baseUrl}${route}`, {
        method,
        headers,
        body: method === 'GET' || method === 'DELETE' ? undefined : '{}'
      });
      assert.equal(res.status, 404, `${method} ${route} should be 404, got ${res.status}`);
    }
  }
});

test('receipts list is scoped to the caller tenant', async () => {
  const resA = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: tokenFor('alpha@test.local')
  });
  assert.equal(resA.status, 200);
  const bodyA = await resA.json();
  const idsA = bodyA.receipts.map((r) => r.id);
  assert.ok(idsA.includes(tenantA.receipt.id));
  assert.ok(!idsA.includes(tenantB.receipt.id));

  const resB = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: tokenFor('bravo@test.local')
  });
  const bodyB = await resB.json();
  const idsB = bodyB.receipts.map((r) => r.id);
  assert.ok(idsB.includes(tenantB.receipt.id));
  assert.ok(!idsB.includes(tenantA.receipt.id));
});

test('cross-tenant receipt read returns 404', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/receipts/${tenantB.receipt.id}`, {
    headers: tokenFor('alpha@test.local')
  });
  assert.equal(res.status, 404);
});

test('cross-tenant vendor delete returns 404 and deletes nothing', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/vendors/${tenantB.vendor.id}`, {
    method: 'DELETE',
    headers: tokenFor('alpha@test.local')
  });
  assert.equal(res.status, 404);
  const stillThere = await ctx.prisma.localVendor.findUnique({
    where: { id: tenantB.vendor.id }
  });
  assert.ok(stillThere);
});

test('authenticated but unprovisioned identity gets 403 on tenant data routes', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: tokenFor('ghost@test.local')
  });
  assert.equal(res.status, 403);
});

test('shared catalog routes need only authentication, not provisioning', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/regional-price-packs`, {
    headers: tokenFor('ghost@test.local')
  });
  assert.equal(res.status, 200);
});

test('CORS: unlisted origin gets no allow header, dev origin does', async () => {
  const evil = await fetch(`${ctx.baseUrl}/api/health`, {
    headers: { Origin: 'https://evil.example.com' }
  });
  assert.equal(evil.headers.get('access-control-allow-origin'), null);

  const dev = await fetch(`${ctx.baseUrl}/api/health`, {
    headers: { Origin: 'http://localhost:3000' }
  });
  assert.equal(
    dev.headers.get('access-control-allow-origin'),
    'http://localhost:3000'
  );
});

test('escapeHtml neutralizes markup and quotes', () => {
  assert.equal(
    escapeHtml(`<script>alert("x")</script> & 'quotes'`),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quotes&#39;'
  );
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(42.5), '42.5');
});

test('sanitizeHeaderValue strips CR/LF (header injection)', () => {
  assert.equal(sanitizeHeaderValue('Quote\r\nBcc: victim@example.com'), 'Quote Bcc: victim@example.com');
});
