/**
 * Pass Seven sweep suite: EVERY authenticated API route, exercised with
 * one provisioned tenant and real seeded resources, asserting the exact
 * expected status per route. This is the route-by-route smoke the pass
 * brief requires — if a route is added or breaks, this file says so.
 *
 * It also pins two regressions found during the sweep itself:
 *  - GET /api/scheduled-jobs/statistics was registered AFTER /:id and
 *    was unreachable (Express matches in order; :id ate it -> 404).
 *  - GET /api/analytics returned Math.random() growth numbers; two
 *    consecutive calls must now agree exactly.
 *
 * And one dialect probe: /api/regional-materials?search= uses Prisma
 * `mode: 'insensitive'` contains — it must answer 200 with real matches
 * on the test dialect too.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./helpers');

let ctx;
const USER = 'sweep@test.local';
const OTHER = 'sweep-other@test.local';
const ids = {};

const tokenFor = (email) => ({
  Authorization: `Bearer valid:${email}`,
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

function expectStatus(label, actual, expected) {
  assert.equal(actual, expected, `${label}: expected HTTP ${expected}, got ${actual}`);
}

before(async () => {
  ctx = await startTestServer();

  for (const email of [USER, OTHER]) {
    const res = await fetch(`${ctx.baseUrl}/api/users/sync`, {
      method: 'POST',
      headers: tokenFor(email),
      body: JSON.stringify({})
    });
    assert.equal(res.status, 200);
  }

  const me = await ctx.prisma.user.findUnique({ where: { email: USER } });
  const other = await ctx.prisma.user.findUnique({ where: { email: OTHER } });
  ids.tenantId = me.contractorAccountId;
  ids.userId = me.id;

  // Resources the API has no create-route for are seeded directly.
  const project = await ctx.prisma.project.create({
    data: {
      name: 'Sweep Project',
      clientName: 'Sweep Client',
      contractorAccountId: ids.tenantId,
      createdById: ids.userId
    }
  });
  ids.projectId = project.id;

  const otherProject = await ctx.prisma.project.create({
    data: {
      name: 'Other Tenant Project',
      contractorAccountId: other.contractorAccountId,
      createdById: other.id
    }
  });
  ids.otherProjectId = otherProject.id;

  const pack = await ctx.prisma.regionalPricePack.create({
    data: { name: 'Ohio Valley', region: 'US-OH', description: 'sweep pack' }
  });
  ids.packId = pack.id;
  await ctx.prisma.regionalMaterial.create({
    data: {
      pricePackId: pack.id,
      materialKey: 'vinyl_siding',
      materialName: 'Vinyl Siding',
      category: 'Siding',
      unit: 'sqft',
      unitPrice: 6.5,
      unitLabel: 'per sq ft'
    }
  });
});

after(async () => {
  await stopTestServer(ctx);
});

test('sweep: health + user routes', async () => {
  const health = await fetch(`${ctx.baseUrl}/api/health`);
  expectStatus('GET /api/health (public)', health.status, 200);

  expectStatus('POST /api/users/sync', (await api(USER, 'POST', '/api/users/sync', {})).status, 200);
  expectStatus('GET /api/users/me', (await api(USER, 'GET', '/api/users/me')).status, 200);
  expectStatus('PUT /api/users/profile', (await api(USER, 'PUT', '/api/users/profile', { firstName: 'Sweep', lastName: 'Tester' })).status, 200);
  expectStatus('GET /api/users/subscription', (await api(USER, 'GET', '/api/users/subscription')).status, 200);

  const unauthenticated = await fetch(`${ctx.baseUrl}/api/users/me`);
  expectStatus('GET /api/users/me without a token', unauthenticated.status, 401);
});

test('sweep: vendor + project routes', async () => {
  const created = await api(USER, 'POST', '/api/vendors', { name: 'Sweep Vendor', contactInfo: 'x', notes: '' });
  expectStatus('POST /api/vendors', created.status, 201);
  ids.vendorId = created.body.vendor.id;

  expectStatus('GET /api/vendors', (await api(USER, 'GET', '/api/vendors')).status, 200);
  expectStatus('GET /api/vendors/:id', (await api(USER, 'GET', `/api/vendors/${ids.vendorId}`)).status, 200);
  expectStatus('PUT /api/vendors/:id', (await api(USER, 'PUT', `/api/vendors/${ids.vendorId}`, { name: 'Sweep Vendor 2' })).status, 200);

  expectStatus('GET /api/projects', (await api(USER, 'GET', '/api/projects')).status, 200);
  const one = await api(USER, 'GET', `/api/projects/${ids.projectId}`);
  expectStatus('GET /api/projects/:id', one.status, 200);
  assert.equal(one.body.project.name, 'Sweep Project');
  expectStatus('GET /api/projects/:id (other tenant)', (await api(USER, 'GET', `/api/projects/${ids.otherProjectId}`)).status, 404);
});

test('sweep: receipt routes', async () => {
  const created = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Sweep Vendor 2',
    purchaseDate: '2026-10-15',
    projectId: ids.projectId,
    items: [{ name: 'Sweep Nails', quantity: 2, unitPrice: 5 }]
  });
  expectStatus('POST /api/receipts', created.status, 201);
  ids.receiptId = created.body.receipt.id;

  expectStatus('GET /api/receipts', (await api(USER, 'GET', '/api/receipts')).status, 200);
  expectStatus('GET /api/receipts/:id', (await api(USER, 'GET', `/api/receipts/${ids.receiptId}`)).status, 200);
  expectStatus('PUT /api/receipts/:id', (await api(USER, 'PUT', `/api/receipts/${ids.receiptId}`, {
    vendorName: 'Sweep Vendor 2', purchaseDate: '2026-10-16', totalAmount: 10, status: 'verified'
  })).status, 200);
});

test('sweep: price routes', async () => {
  expectStatus('GET /api/prices/by-material', (await api(USER, 'GET', '/api/prices/by-material?material=Sweep%20Nails')).status, 200);
  expectStatus('GET /api/prices/lookup', (await api(USER, 'GET', '/api/prices/lookup?material=Sweep%20Nails')).status, 200);
  expectStatus('GET /api/prices/status', (await api(USER, 'GET', '/api/prices/status')).status, 200);
  expectStatus('GET /api/prices/by-material without material', (await api(USER, 'GET', '/api/prices/by-material')).status, 400);
});

test('sweep: regional routes (incl. insensitive-search dialect probe)', async () => {
  expectStatus('GET /api/regional-price-packs', (await api(USER, 'GET', '/api/regional-price-packs')).status, 200);

  const materials = await api(USER, 'GET', '/api/regional-materials?search=vinyl');
  expectStatus('GET /api/regional-materials?search=vinyl', materials.status, 200);
  assert.ok(
    Array.isArray(materials.body) && materials.body.some((m) => m.materialName === 'Vinyl Siding'),
    'case-insensitive search should find "Vinyl Siding" for query "vinyl"'
  );

  expectStatus('GET /api/regional-materials', (await api(USER, 'GET', '/api/regional-materials')).status, 200);

  const suggestions = await api(USER, 'GET', '/api/regional-materials/suggestions?region=US-OH&materialName=vinyl');
  expectStatus('GET /api/regional-materials/suggestions', suggestions.status, 200);
  assert.ok(suggestions.body.some((m) => m.materialName === 'Vinyl Siding'));

  expectStatus('POST /api/user-regional-selection', (await api(USER, 'POST', '/api/user-regional-selection', { pricePackId: ids.packId })).status, 200);
  expectStatus('GET /api/user-regional-selection', (await api(USER, 'GET', '/api/user-regional-selection')).status, 200);
});

test('sweep: task template routes', async () => {
  const list = await api(USER, 'GET', '/api/task-templates');
  expectStatus('GET /api/task-templates', list.status, 200);
  assert.ok(list.body.templates.length >= 7, 'starter library self-populates');

  const created = await api(USER, 'POST', '/api/task-templates', {
    name: 'Sweep Template',
    category: 'Fencing',
    tasks: [{ name: 'Post hole', quantity: 4, unitPrice: 25, unit: 'each' }]
  });
  expectStatus('POST /api/task-templates', created.status, 201);
  ids.templateId = created.body.template.id;

  expectStatus('GET /api/task-templates/:id', (await api(USER, 'GET', `/api/task-templates/${ids.templateId}`)).status, 200);
  expectStatus('PUT /api/task-templates/:id', (await api(USER, 'PUT', `/api/task-templates/${ids.templateId}`, {
    name: 'Sweep Template v2',
    tasks: [{ name: 'Post hole', quantity: 5, unitPrice: 25, unit: 'each' }]
  })).status, 200);
  expectStatus('DELETE /api/task-templates/:id', (await api(USER, 'DELETE', `/api/task-templates/${ids.templateId}`)).status, 200);
});

test('sweep: analytics is deterministic (no random growth)', async () => {
  const first = await api(USER, 'GET', '/api/analytics?period=30days');
  expectStatus('GET /api/analytics', first.status, 200);
  const second = await api(USER, 'GET', '/api/analytics?period=30days');
  assert.equal(
    second.body.analytics.summaryStats.revenueGrowth,
    first.body.analytics.summaryStats.revenueGrowth,
    'revenueGrowth must not change between identical calls'
  );
  assert.equal(
    second.body.analytics.summaryStats.projectGrowth,
    first.body.analytics.summaryStats.projectGrowth
  );
});

test('sweep: follow-up + follow-up template routes', async () => {
  const created = await api(USER, 'POST', '/api/followups', {
    clientEmail: 'client@example.com',
    clientName: 'Client',
    subject: 'Checking in',
    message: 'How is the project?',
    scheduledDate: '2026-11-10',
    projectId: ids.projectId
  });
  expectStatus('POST /api/followups', created.status, 201);
  ids.followUpId = created.body.followUp.id;

  expectStatus('GET /api/followups', (await api(USER, 'GET', '/api/followups')).status, 200);
  expectStatus('PUT /api/followups/:id', (await api(USER, 'PUT', `/api/followups/${ids.followUpId}`, { status: 'sent' })).status, 200);
  expectStatus('DELETE /api/followups/:id', (await api(USER, 'DELETE', `/api/followups/${ids.followUpId}`)).status, 200);

  const tpl = await api(USER, 'POST', '/api/followup-templates', {
    name: 'Sweep Template', subject: 'S', message: 'M'
  });
  expectStatus('POST /api/followup-templates', tpl.status, 201);
  ids.followTplId = tpl.body.template.id;

  expectStatus('GET /api/followup-templates', (await api(USER, 'GET', '/api/followup-templates')).status, 200);
  expectStatus('PUT /api/followup-templates/:id', (await api(USER, 'PUT', `/api/followup-templates/${ids.followTplId}`, { name: 'Sweep Template 2' })).status, 200);
  expectStatus('DELETE /api/followup-templates/:id', (await api(USER, 'DELETE', `/api/followup-templates/${ids.followTplId}`)).status, 200);
});

test('sweep: scheduled job + calendar routes (statistics reachable)', async () => {
  const created = await api(USER, 'POST', '/api/scheduled-jobs', {
    title: 'Sweep Job',
    startDate: '2026-11-12',
    endDate: '2026-11-13',
    projectId: ids.projectId
  });
  expectStatus('POST /api/scheduled-jobs', created.status, 201);
  ids.jobId = created.body.data.id;

  expectStatus('GET /api/scheduled-jobs', (await api(USER, 'GET', '/api/scheduled-jobs')).status, 200);

  // Regression: this used to 404 forever — /:id was registered first
  // and captured 'statistics' as an id.
  const stats = await api(USER, 'GET', '/api/scheduled-jobs/statistics');
  expectStatus('GET /api/scheduled-jobs/statistics', stats.status, 200);
  assert.equal(stats.body.data.totalJobs, 1);

  expectStatus('GET /api/scheduled-jobs/:id', (await api(USER, 'GET', `/api/scheduled-jobs/${ids.jobId}`)).status, 200);
  expectStatus('PUT /api/scheduled-jobs/:id', (await api(USER, 'PUT', `/api/scheduled-jobs/${ids.jobId}`, { status: 'in_progress' })).status, 200);
  expectStatus('POST /api/scheduled-jobs/:id/sync', (await api(USER, 'POST', `/api/scheduled-jobs/${ids.jobId}/sync`, {})).status, 200);
  expectStatus('DELETE /api/scheduled-jobs/:id/sync', (await api(USER, 'DELETE', `/api/scheduled-jobs/${ids.jobId}/sync`)).status, 200);
  expectStatus('DELETE /api/scheduled-jobs/:id', (await api(USER, 'DELETE', `/api/scheduled-jobs/${ids.jobId}`)).status, 200);

  const foreign = await api(USER, 'POST', '/api/scheduled-jobs', {
    title: 'Foreign Link Job',
    startDate: '2026-11-12',
    endDate: '2026-11-13',
    projectId: ids.otherProjectId
  });
  expectStatus('POST /api/scheduled-jobs with another tenant\'s project', foreign.status, 400);

  expectStatus('GET /api/calendar-sync-settings', (await api(USER, 'GET', '/api/calendar-sync-settings')).status, 200);
  const settings = await api(USER, 'PUT', '/api/calendar-sync-settings', { autoSync: false });
  expectStatus('PUT /api/calendar-sync-settings', settings.status, 200);
  assert.equal(settings.body.data.autoSync, false);
  // Regression: an unknown extra field used to fail the whole update
  // with a Prisma validation 500 — it is now ignored by the whitelist.
  const withBogus = await api(USER, 'PUT', '/api/calendar-sync-settings', { autoSync: true, notARealField: 'x' });
  expectStatus('PUT /api/calendar-sync-settings with an unknown field', withBogus.status, 200);
  assert.equal(withBogus.body.data.autoSync, true);
});

test('sweep: email-quote validates and answers (send falls back to log without SMTP)', async () => {
  const bad = await api(USER, 'POST', '/api/email-quote', { recipient: 'a@b.co' });
  expectStatus('POST /api/email-quote (missing fields)', bad.status, 400);

  const ok = await api(USER, 'POST', '/api/email-quote', {
    recipient: 'client@example.com',
    subject: 'Your estimate',
    message: 'Here you go',
    quoteData: {
      projectInfo: {
        clientName: 'Client', jobType: 'Fencing', projectDescription: 'Fence',
        address: '1 Main St', phone: '555', email: 'client@example.com'
      },
      rooms: [{ name: 'Back yard', sqft: 100, material: 'PT wood', materialCost: 5, labor: 60, laborHours: 2 }],
      subtotal: 620, markup: 15, markupAmount: 93, total: 713
    }
  });
  expectStatus('POST /api/email-quote', ok.status, 200);
});

test('sweep: deletes left for last (receipt, vendor)', async () => {
  expectStatus('DELETE /api/receipts/:id', (await api(USER, 'DELETE', `/api/receipts/${ids.receiptId}`)).status, 200);
  expectStatus('DELETE /api/vendors/:id', (await api(USER, 'DELETE', `/api/vendors/${ids.vendorId}`)).status, 200);
});
