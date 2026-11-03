/**
 * Pass Seven suite (hardening: Vendors / Scraper contract / Receipts).
 *
 * Reproduction-first coverage for the three areas Brandon flagged from
 * live use, exercised through the real API on the test harness:
 *
 *  VENDORS
 *   - GET /api/vendors/:id exists (the Vendors page Edit flow needs it)
 *   - deleting a vendor that has receipts answers an honest 409 with a
 *     count (was: opaque 500 from the database FK — nearly every real
 *     vendor has receipts, because receipts auto-create vendors)
 *   - a vendor with no receipts deletes cleanly; tenant isolation holds
 *
 *  RECEIPTS
 *   - a manual receipt (vendor/date/total, NO line items — the
 *     ReceiptNew manual path) saves with one synthetic reconciling line
 *     and teaches NO vendor price (was: 400, could never be saved)
 *   - line totals are computed on the server (qty x unitPrice), so a
 *     wrong client-sent item total cannot desync the receipt
 *   - invalid items are 400s, not 500s; the total derives from the
 *     items when the client sends none
 *   - vendor matching is case-insensitive (no "Home Depot" /
 *     "home depot" duplicates)
 *   - PUT can replace line items, derives the total, and re-teaches
 *     vendor prices; PUT without items leaves them untouched
 *   - the list carries the receipt status (the page filter needs it)
 *   - deleting a receipt that taught prices succeeds and the learned
 *     price survives with its receipt link nulled
 *
 *  PRICES / SCRAPER CONTRACT
 *   - /api/prices/by-material serves this tenant's learned prices only
 *   - /api/prices/lookup degrades honestly: unconfigured -> price null,
 *     scraper 503 -> unconfigured, scraper down -> unavailable, live ->
 *     the real averaged price with the shared secret sent server-side
 *   - /api/prices/status reports the three states truthfully
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { startTestServer, stopTestServer } = require('./helpers');

let ctx;
let stubServer;
let stubMode = 'live';
let lastScraperSecret = null;

const tokenFor = (email) => ({
  Authorization: `Bearer valid:${email}`,
  'Content-Type': 'application/json'
});

const USER = 'pass7@test.local';
const OTHER = 'pass7-other@test.local';

async function sync(email) {
  const res = await fetch(`${ctx.baseUrl}/api/users/sync`, {
    method: 'POST',
    headers: tokenFor(email),
    body: JSON.stringify({})
  });
  assert.equal(res.status, 200);
}

async function api(email, method, path, body) {
  const res = await fetch(`${ctx.baseUrl}${path}`, {
    method,
    headers: tokenFor(email),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

before(async () => {
  ctx = await startTestServer();
  await sync(USER);
  await sync(OTHER);

  // Stub scraper service: stands in for the real one so the API-side
  // contract (secret header, status mapping, timeouts) is testable
  // without a SerpAPI key or the network.
  stubServer = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url.startsWith('/health')) {
      res.writeHead(200);
      return res.end(JSON.stringify({ status: 'healthy', serpApiConfigured: true, secretConfigured: true }));
    }
    if (req.url.startsWith('/scrape-price')) {
      lastScraperSecret = req.headers['x-scraper-secret'] || null;
      if (stubMode === 'live') {
        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          source: 'serpapi',
          results: [
            { title: 'LVP Plank - Store A', price: '$10.00', priceValue: 10, source: 'Store A' },
            { title: 'LVP Plank - Store B', price: '$20.00', priceValue: 20, source: 'Store B' }
          ]
        }));
      }
      if (stubMode === 'unconfigured') {
        res.writeHead(503);
        return res.end(JSON.stringify({ success: false, source: 'unconfigured', results: [] }));
      }
      res.writeHead(502);
      return res.end(JSON.stringify({ success: false, source: 'error', results: [] }));
    }
    res.writeHead(404);
    return res.end('{}');
  });
  await new Promise((resolve) => stubServer.listen(0, '127.0.0.1', resolve));
});

after(async () => {
  delete process.env.SCRAPER_SERVICE_URL;
  delete process.env.SCRAPER_SHARED_SECRET;
  await new Promise((resolve) => stubServer.close(resolve));
  await stopTestServer(ctx);
});

// ---------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------

test('vendors: full CRUD incl. GET-one for the edit flow', async () => {
  const created = await api(USER, 'POST', '/api/vendors', {
    name: 'Pass7 Supply', contactInfo: '555-0100', notes: 'counter pickup'
  });
  assert.equal(created.status, 201);
  const id = created.body.vendor.id;

  const fetched = await api(USER, 'GET', `/api/vendors/${id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.vendor.name, 'Pass7 Supply');
  assert.equal(fetched.body.vendor.contact, '555-0100');

  const updated = await api(USER, 'PUT', `/api/vendors/${id}`, {
    name: 'Pass7 Supply Co', contactInfo: '555-0101', notes: ''
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.vendor.name, 'Pass7 Supply Co');

  const deleted = await api(USER, 'DELETE', `/api/vendors/${id}`);
  assert.equal(deleted.status, 200);

  const gone = await api(USER, 'GET', `/api/vendors/${id}`);
  assert.equal(gone.status, 404);
});

test('vendors: another tenant cannot read, edit, or delete my vendor', async () => {
  const created = await api(USER, 'POST', '/api/vendors', { name: 'Mine Only' });
  const id = created.body.vendor.id;

  assert.equal((await api(OTHER, 'GET', `/api/vendors/${id}`)).status, 404);
  assert.equal((await api(OTHER, 'PUT', `/api/vendors/${id}`, { name: 'Hijack' })).status, 404);
  assert.equal((await api(OTHER, 'DELETE', `/api/vendors/${id}`)).status, 404);
});

test('vendors: delete with receipts on file -> honest 409, vendor survives; after receipts go, delete works', async () => {
  const receipt = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Receipt Holder Supply',
    purchaseDate: '2026-10-01',
    total: 25,
    items: [{ name: 'Wood Screws 1lb', quantity: 1, unitPrice: 25 }]
  });
  assert.equal(receipt.status, 201);
  const receiptId = receipt.body.receipt.id;

  const list = await api(USER, 'GET', '/api/vendors');
  const vendor = list.body.vendors.find((v) => v.name === 'Receipt Holder Supply');
  assert.ok(vendor, 'receipt should have auto-created the vendor');

  const blocked = await api(USER, 'DELETE', `/api/vendors/${vendor.id}`);
  assert.equal(blocked.status, 409);
  assert.match(blocked.body.error, /1 receipt/);

  const stillThere = await api(USER, 'GET', `/api/vendors/${vendor.id}`);
  assert.equal(stillThere.status, 200);

  assert.equal((await api(USER, 'DELETE', `/api/receipts/${receiptId}`)).status, 200);
  const freed = await api(USER, 'DELETE', `/api/vendors/${vendor.id}`);
  assert.equal(freed.status, 200);
});

// ---------------------------------------------------------------------
// Receipts
// ---------------------------------------------------------------------

test('receipts: manual receipt (no line items) saves, reconciles, and teaches no price', async () => {
  const created = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Manual Entry Mart',
    purchaseDate: '2026-10-02',
    total: 87.5,
    items: []
  });
  assert.equal(created.status, 201);
  assert.equal(parseFloat(created.body.receipt.total), 87.5);
  assert.equal(created.body.receipt.itemsCount, 1);

  const detail = await api(USER, 'GET', `/api/receipts/${created.body.receipt.id}`);
  assert.equal(detail.body.receipt.items.length, 1);
  assert.equal(detail.body.receipt.items[0].name, 'Receipt total');
  assert.equal(parseFloat(detail.body.receipt.items[0].total), 87.5);

  const prices = await api(USER, 'GET', '/api/prices/by-material?material=Receipt%20total');
  assert.equal(prices.status, 200);
  assert.deepEqual(prices.body.prices, []);
});

test('receipts: no items and no usable total is still a 400', async () => {
  const res = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Empty Mart',
    purchaseDate: '2026-10-02',
    items: []
  });
  assert.equal(res.status, 400);
});

test('receipts: line totals are computed on the server; total derives from items', async () => {
  const created = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Reconcile Lumber',
    purchaseDate: '2026-10-03',
    // client sends a WRONG item total and NO receipt total
    items: [{ name: 'Pine Board 2x4', quantity: 3, unitPrice: 10, total: 9999 }]
  });
  assert.equal(created.status, 201);
  assert.equal(parseFloat(created.body.receipt.total), 30);

  const detail = await api(USER, 'GET', `/api/receipts/${created.body.receipt.id}`);
  assert.equal(parseFloat(detail.body.receipt.items[0].total), 30);
});

test('receipts: invalid items are a 400, not a 500', async () => {
  for (const bad of [
    { name: 'Nails', quantity: 'lots', unitPrice: 5 },
    { name: 'Nails', quantity: 0, unitPrice: 5 },
    { name: 'Nails', quantity: 1, unitPrice: -2 },
    { quantity: 1, unitPrice: 5 }
  ]) {
    const res = await api(USER, 'POST', '/api/receipts', {
      vendor: 'Bad Items Depot',
      purchaseDate: '2026-10-03',
      items: [bad]
    });
    assert.equal(res.status, 400, `item ${JSON.stringify(bad)} should be 400, got ${res.status}`);
  }
});

test('receipts: vendor matching is case-insensitive — no duplicate vendors', async () => {
  const first = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Case Test Depot',
    purchaseDate: '2026-10-04',
    items: [{ name: 'Hinges', quantity: 2, unitPrice: 4 }]
  });
  assert.equal(first.status, 201);

  const second = await api(USER, 'POST', '/api/receipts', {
    vendor: 'case test depot',
    purchaseDate: '2026-10-05',
    items: [{ name: 'Hinges', quantity: 1, unitPrice: 4.5 }]
  });
  assert.equal(second.status, 201);

  const list = await api(USER, 'GET', '/api/vendors');
  const matches = list.body.vendors.filter(
    (v) => v.name.trim().toLowerCase() === 'case test depot'
  );
  assert.equal(matches.length, 1);
  assert.equal(matches[0].receipts.length, 2);
});

test('receipts: price learning — create teaches, second receipt updates, by-material serves my tenant only', async () => {
  await api(USER, 'POST', '/api/receipts', {
    vendor: 'Learning Lumber',
    purchaseDate: '2026-10-06',
    items: [{ name: 'LVP Flooring', quantity: 10, unitPrice: 3 }]
  });

  let prices = await api(USER, 'GET', '/api/prices/by-material?material=LVP%20Flooring');
  assert.equal(prices.body.prices.length, 1);
  assert.equal(parseFloat(prices.body.prices[0].unitPrice), 3);
  assert.equal(prices.body.prices[0].vendor.name, 'Learning Lumber');

  await api(USER, 'POST', '/api/receipts', {
    vendor: 'Learning Lumber',
    purchaseDate: '2026-10-07',
    items: [{ name: 'LVP Flooring', quantity: 5, unitPrice: 3.4 }]
  });

  prices = await api(USER, 'GET', '/api/prices/by-material?material=LVP%20Flooring');
  assert.equal(prices.body.prices.length, 1, 'same vendor+material updates in place');
  assert.equal(parseFloat(prices.body.prices[0].unitPrice), 3.4);

  const otherView = await api(OTHER, 'GET', '/api/prices/by-material?material=LVP%20Flooring');
  assert.deepEqual(otherView.body.prices, [], 'learned prices are tenant-scoped');
});

test('receipts: PUT replaces items, derives the total, and re-teaches prices', async () => {
  const created = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Put Path Paint',
    purchaseDate: '2026-10-08',
    items: [{ name: 'Primer Gallon', quantity: 1, unitPrice: 20 }]
  });
  const id = created.body.receipt.id;

  const updated = await api(USER, 'PUT', `/api/receipts/${id}`, {
    vendorName: 'Put Path Paint',
    purchaseDate: '2026-10-09',
    // no totalAmount: total must derive from the replacement items
    items: [
      { name: 'Primer Gallon', quantity: 2, unitPrice: 21 },
      { name: 'Roller Cover', quantity: 3, unitPrice: 2 }
    ]
  });
  assert.equal(updated.status, 200);
  assert.equal(parseFloat(updated.body.receipt.total), 48);

  const detail = await api(USER, 'GET', `/api/receipts/${id}`);
  assert.equal(detail.body.receipt.items.length, 2);

  const prices = await api(USER, 'GET', '/api/prices/by-material?material=Primer%20Gallon');
  assert.equal(parseFloat(prices.body.prices[0].unitPrice), 21);
});

test('receipts: PUT without items keeps the existing items and honors status', async () => {
  const created = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Keep Items Co',
    purchaseDate: '2026-10-10',
    items: [{ name: 'Caulk Tube', quantity: 4, unitPrice: 6 }]
  });
  const id = created.body.receipt.id;

  const updated = await api(USER, 'PUT', `/api/receipts/${id}`, {
    vendorName: 'Keep Items Co',
    purchaseDate: '2026-10-11',
    totalAmount: 24,
    status: 'verified'
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.receipt.status, 'verified');

  const detail = await api(USER, 'GET', `/api/receipts/${id}`);
  assert.equal(detail.body.receipt.items.length, 1);
  assert.equal(detail.body.receipt.status, 'verified');

  const list = await api(USER, 'GET', '/api/receipts');
  const row = list.body.receipts.find((r) => r.id === id);
  assert.equal(row.status, 'verified', 'list rows carry status for the page filter');
});

test('receipts: deleting a receipt that taught prices succeeds; the learned price survives unlinked', async () => {
  const created = await api(USER, 'POST', '/api/receipts', {
    vendor: 'Delete Path Tile',
    purchaseDate: '2026-10-12',
    items: [{ name: 'Grout Bag', quantity: 1, unitPrice: 12 }]
  });
  const id = created.body.receipt.id;

  const deleted = await api(USER, 'DELETE', `/api/receipts/${id}`);
  assert.equal(deleted.status, 200);

  const prices = await api(USER, 'GET', '/api/prices/by-material?material=Grout%20Bag');
  assert.equal(prices.body.prices.length, 1);
  assert.equal(parseFloat(prices.body.prices[0].unitPrice), 12);
});

// ---------------------------------------------------------------------
// Prices / scraper contract
// ---------------------------------------------------------------------

test('prices/lookup: unconfigured deployment answers honestly (no invented price)', async () => {
  delete process.env.SCRAPER_SERVICE_URL;
  delete process.env.SCRAPER_SHARED_SECRET;

  const res = await api(USER, 'GET', '/api/prices/lookup?material=LVP%20Flooring');
  assert.equal(res.status, 200);
  assert.equal(res.body.source, 'unconfigured');
  assert.equal(res.body.price, null);
  assert.deepEqual(res.body.results, []);

  const status = await api(USER, 'GET', '/api/prices/status');
  assert.deepEqual(
    { configured: status.body.configured, reachable: status.body.reachable },
    { configured: false, reachable: false }
  );
});

test('prices/lookup: live scraper returns the real averaged price, secret sent server-side', async () => {
  stubMode = 'live';
  process.env.SCRAPER_SERVICE_URL = `http://127.0.0.1:${stubServer.address().port}`;
  process.env.SCRAPER_SHARED_SECRET = 'api-side-secret';

  const res = await api(USER, 'GET', '/api/prices/lookup?material=LVP%20Flooring&zip=43078');
  assert.equal(res.status, 200);
  assert.equal(res.body.source, 'live');
  assert.equal(res.body.price, 15); // (10 + 20) / 2 from the stub's real results
  assert.equal(res.body.results.length, 2);
  assert.equal(lastScraperSecret, 'api-side-secret', 'API must present the shared secret');

  const status = await api(USER, 'GET', '/api/prices/status');
  assert.deepEqual(
    { configured: status.body.configured, reachable: status.body.reachable, serp: status.body.serpApiConfigured },
    { configured: true, reachable: true, serp: true }
  );
});

test('prices/lookup: scraper 503 maps to unconfigured; scraper 502/down maps to unavailable', async () => {
  process.env.SCRAPER_SERVICE_URL = `http://127.0.0.1:${stubServer.address().port}`;
  process.env.SCRAPER_SHARED_SECRET = 'api-side-secret';

  stubMode = 'unconfigured';
  let res = await api(USER, 'GET', '/api/prices/lookup?material=LVP%20Flooring');
  assert.equal(res.body.source, 'unconfigured');
  assert.equal(res.body.price, null);

  stubMode = 'error';
  res = await api(USER, 'GET', '/api/prices/lookup?material=LVP%20Flooring');
  assert.equal(res.body.source, 'unavailable');
  assert.equal(res.body.price, null);

  process.env.SCRAPER_SERVICE_URL = 'http://127.0.0.1:1'; // nothing listens there
  res = await api(USER, 'GET', '/api/prices/lookup?material=LVP%20Flooring');
  assert.equal(res.body.source, 'unavailable');
  assert.equal(res.body.price, null);

  const status = await api(USER, 'GET', '/api/prices/status');
  assert.equal(status.body.configured, true);
  assert.equal(status.body.reachable, false);

  delete process.env.SCRAPER_SERVICE_URL;
  delete process.env.SCRAPER_SHARED_SECRET;
});
