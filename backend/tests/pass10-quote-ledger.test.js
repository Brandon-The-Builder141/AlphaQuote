/**
 * Pass Ten suite — the Durable Quote Ledger (/api/quotes).
 *
 * Covers the spec's validation list:
 *  - creation with a stable, deterministic, per-tenant quote number
 *    (IL-0001, IL-0002, ... — sequential, never random)
 *  - autosave/update of drafts, and reopening a quote by durable id
 *    after a simulated refresh (a fresh GET with nothing but the id —
 *    no client state involved)
 *  - tenant isolation on every route
 *  - status transitions, incl. the refusal to set 'viewed' (no real
 *    view tracking exists, so the ledger never invents it)
 *  - versioning: editing a sent quote is refused; revising freezes the
 *    outgoing version and bumps the version instead of rewriting it
 *  - PDF snapshot integrity: the frozen snapshot carries the full
 *    document (customer, items, terms, company, totals, quote number)
 *    and its SHA-256 checksum verifies; tampering is detected
 *  - mechanical expiry from the quote's own validity window
 *  - lead link + project creation/link
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./helpers');

let ctx;
const USER = 'ledger@test.local';
const OTHER = 'ledger-other@test.local';
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

// The working quote document, in the exact shape the wizard/form build
// and the PDF renderer consumes.
function sampleData(total) {
  return {
    projectInfo: {
      clientName: 'Jane Miller',
      jobType: 'Siding',
      email: 'jane@example.com',
      phone: '(419) 555-0100',
      address: '12 Oak St, Defiance, OH',
      date: '11/4/2026'
    },
    workItems: [
      { id: 't1', type: 'task', name: 'Vinyl siding, installed', materialCost: 4000, laborCost: 3000 }
    ],
    rooms: [],
    markup: 15,
    taxEnabled: false,
    taxRate: 0,
    discount: 0,
    subtotal: '7000.00',
    markupAmount: '1050.00',
    taxAmount: '0.00',
    total: String(total),
    notes: 'Ledger test notes',
    estimateType: 'New Estimate'
  };
}

function samplePayload(total) {
  return {
    customerName: 'Jane Miller',
    customerEmail: 'jane@example.com',
    customerPhone: '(419) 555-0100',
    address: '12 Oak St, Defiance, OH',
    jobType: 'Siding',
    data: sampleData(total)
  };
}

after(async () => {
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

// ---------------- Creation + numbering ----------------

test('create: persists a draft with the first deterministic quote number', async () => {
  const res = await api(USER, 'POST', '/api/quotes', samplePayload('8050.00'));
  assert.equal(res.status, 201);
  const q = res.body.quote;
  assert.equal(q.quoteNumber, 'IL-0001');
  assert.equal(q.status, 'draft');
  assert.equal(q.version, 1);
  assert.equal(q.customerName, 'Jane Miller');
  assert.equal(q.total, 8050);
  assert.equal(q.subtotal, 7000);
  assert.equal(q.data.projectInfo.clientName, 'Jane Miller');
  ids.firstQuoteId = q.id;
});

test('create: numbers increment per tenant and are independent across tenants', async () => {
  const second = await api(USER, 'POST', '/api/quotes', samplePayload('100.00'));
  assert.equal(second.status, 201);
  assert.equal(second.body.quote.quoteNumber, 'IL-0002');

  const otherFirst = await api(OTHER, 'POST', '/api/quotes', samplePayload('200.00'));
  assert.equal(otherFirst.status, 201);
  assert.equal(otherFirst.body.quote.quoteNumber, 'IL-0001');
  ids.otherQuoteId = otherFirst.body.quote.id;
});

test('create: missing quote document is a 400, not a row', async () => {
  const res = await api(USER, 'POST', '/api/quotes', { customerName: 'No Data' });
  assert.equal(res.status, 400);
});

// ---------------- Autosave + reopen after refresh ----------------

test('autosave: PUT updates a draft in place; a fresh GET by id reopens it whole', async () => {
  const edited = samplePayload('9100.00');
  edited.data.notes = 'Updated while editing';
  edited.data.workItems.push({ id: 't2', type: 'task', name: 'House wrap', materialCost: 500, laborCost: 200 });
  const put = await api(USER, 'PUT', `/api/quotes/${ids.firstQuoteId}`, edited);
  assert.equal(put.status, 200);
  assert.equal(put.body.quote.total, 9100);
  assert.equal(put.body.quote.version, 1, 'draft edits do not create versions');

  // Simulated refresh / new browser: nothing but the durable id.
  const reopened = await api(USER, 'GET', `/api/quotes/${ids.firstQuoteId}`);
  assert.equal(reopened.status, 200);
  assert.equal(reopened.body.quote.quoteNumber, 'IL-0001');
  assert.equal(reopened.body.quote.data.notes, 'Updated while editing');
  assert.equal(reopened.body.quote.data.workItems.length, 2);
  assert.equal(reopened.body.quote.total, 9100);
});

test('list: filter by status and search by customer or quote number', async () => {
  const all = await api(USER, 'GET', '/api/quotes');
  assert.equal(all.status, 200);
  assert.ok(all.body.quotes.length >= 2);
  assert.ok(!('data' in all.body.quotes[0]), 'list rows are light (no data document)');

  const drafts = await api(USER, 'GET', '/api/quotes?status=draft');
  assert.ok(drafts.body.quotes.every((q) => q.status === 'draft'));

  const byNumber = await api(USER, 'GET', '/api/quotes?search=il-0001');
  assert.equal(byNumber.body.quotes.length, 1);
  assert.equal(byNumber.body.quotes[0].id, ids.firstQuoteId);

  const byCustomer = await api(USER, 'GET', '/api/quotes?search=miller');
  assert.ok(byCustomer.body.quotes.length >= 1);

  const badStatus = await api(USER, 'GET', '/api/quotes?status=bogus');
  assert.equal(badStatus.status, 400);
});

// ---------------- Tenant isolation ----------------

test('isolation: another tenant cannot see or touch the quote', async () => {
  const id = ids.firstQuoteId;
  assert.equal((await api(OTHER, 'GET', `/api/quotes/${id}`)).status, 404);
  assert.equal((await api(OTHER, 'PUT', `/api/quotes/${id}`, samplePayload('1.00'))).status, 404);
  assert.equal((await api(OTHER, 'POST', `/api/quotes/${id}/status`, { status: 'sent' })).status, 404);
  assert.equal((await api(OTHER, 'POST', `/api/quotes/${id}/revise`, {})).status, 404);
  assert.equal((await api(OTHER, 'DELETE', `/api/quotes/${id}`)).status, 404);
  assert.equal((await api(OTHER, 'GET', `/api/quotes/${id}/pdf-data`)).status, 404);

  const list = await api(OTHER, 'GET', '/api/quotes');
  assert.ok(list.body.quotes.every((q) => q.id !== id));
});

test('isolation: unauthenticated calls are rejected', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/quotes`);
  assert.equal(res.status, 401);
});

// ---------------- Status transitions ----------------

test('status: draft -> sent freezes the issued snapshot with validity window', async () => {
  const res = await api(USER, 'POST', `/api/quotes/${ids.firstQuoteId}/status`, { status: 'sent' });
  assert.equal(res.status, 200);
  const q = res.body.quote;
  assert.equal(q.status, 'sent');
  assert.ok(q.sentAt, 'sentAt stamped');
  assert.ok(q.expiresAt, 'expiresAt stamped');
  const days = (new Date(q.expiresAt) - new Date(q.sentAt)) / (24 * 60 * 60 * 1000);
  assert.equal(Math.round(days), 14, 'validity window is the pricing sheet 14 days');
  assert.equal(q.revisions.length, 1, 'one frozen revision');
  assert.equal(q.revisions[0].version, 1);
  assert.equal(q.revisions[0].status, 'sent');
  assert.equal(q.revisions[0].total, 9100);
});

test('status: illegal transitions and manual viewed are refused', async () => {
  const id = ids.firstQuoteId;
  const back = await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'draft' });
  assert.equal(back.status, 409);
  const viewed = await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'viewed' });
  assert.equal(viewed.status, 400, "'viewed' cannot be set without real view tracking");
  const bogus = await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'paid' });
  assert.equal(bogus.status, 400);
});

test('status: a fresh draft cannot jump straight to accepted', async () => {
  const created = await api(USER, 'POST', '/api/quotes', samplePayload('50.00'));
  const id = created.body.quote.id;
  const res = await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'accepted' });
  assert.equal(res.status, 409);
});

// ---------------- PDF snapshot integrity ----------------

test('pdf-data: frozen snapshot reproduces the issued quote and verifies its checksum', async () => {
  const res = await api(USER, 'GET', `/api/quotes/${ids.firstQuoteId}/pdf-data`);
  assert.equal(res.status, 200);
  assert.equal(res.body.checksumValid, true);
  const doc = res.body.pdfData;
  assert.equal(doc.quoteNumber, 'IL-0001');
  assert.equal(doc.version, 1);
  assert.equal(doc.customer.name, 'Jane Miller');
  assert.equal(doc.company.name, 'Iron Legion Contracting');
  assert.equal(doc.company.legalName, 'Iron Legion Contracting LLC');
  assert.ok(Array.isArray(doc.terms) && doc.terms.length === 4, 'Iron Legion terms frozen in');
  assert.ok(doc.terms[0].includes('valid for 14 days'));
  assert.equal(Number(doc.total), 9100);
  assert.equal(doc.workItems.length, 2);
  assert.ok(doc.issuedAt);
});

test('pdf-data: a draft that was never sent has no snapshot (404)', async () => {
  const created = await api(USER, 'POST', '/api/quotes', samplePayload('75.00'));
  const res = await api(USER, 'GET', `/api/quotes/${created.body.quote.id}/pdf-data`);
  assert.equal(res.status, 404);
});

test('pdf-data: tampering with the stored snapshot breaks checksum verification', async () => {
  const revision = await ctx.prisma.quoteRevision.findFirst({
    where: { quoteId: ids.firstQuoteId, version: 1 }
  });
  const snapshot = JSON.parse(revision.snapshot);
  snapshot.total = '1.00'; // someone rewrites history
  await ctx.prisma.quoteRevision.update({
    where: { id: revision.id },
    data: { snapshot: JSON.stringify(snapshot) }
  });
  const res = await api(USER, 'GET', `/api/quotes/${ids.firstQuoteId}/pdf-data?version=1`);
  assert.equal(res.status, 200);
  assert.equal(res.body.checksumValid, false, 'checksum catches the drift');
});

// ---------------- Versioning ----------------

test('versioning: editing a sent quote is refused; revise freezes v1 and opens v2 as draft', async () => {
  const id = ids.firstQuoteId;
  const put = await api(USER, 'PUT', `/api/quotes/${id}`, samplePayload('9999.00'));
  assert.equal(put.status, 409);
  assert.equal(put.body.code, 'REVISION_REQUIRED');

  const revised = await api(USER, 'POST', `/api/quotes/${id}/revise`, {});
  assert.equal(revised.status, 200);
  assert.equal(revised.body.quote.version, 2);
  assert.equal(revised.body.quote.status, 'draft');
  assert.equal(revised.body.quote.sentAt, null);
  // The v1 record (incl. the tampered snapshot from the integrity test)
  // is untouched by the revision — history is never rewritten.
  assert.equal(revised.body.quote.revisions.length, 1);
  assert.equal(revised.body.quote.revisions[0].version, 1);

  // Edit v2 and send it: a second frozen revision appears.
  const edited = await api(USER, 'PUT', `/api/quotes/${id}`, samplePayload('12000.00'));
  assert.equal(edited.status, 200);
  const sent = await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'sent' });
  assert.equal(sent.status, 200);
  assert.equal(sent.body.quote.revisions.length, 2);

  const v2 = await api(USER, 'GET', `/api/quotes/${id}/pdf-data?version=2`);
  assert.equal(v2.body.checksumValid, true);
  assert.equal(Number(v2.body.pdfData.total), 12000);
  assert.equal(v2.body.pdfData.version, 2);
});

test('versioning: revise refuses drafts and archived quotes; delete is draft-only', async () => {
  const created = await api(USER, 'POST', '/api/quotes', samplePayload('10.00'));
  const draftId = created.body.quote.id;
  assert.equal((await api(USER, 'POST', `/api/quotes/${draftId}/revise`, {})).status, 409);

  // The main quote is sent (v2): delete refused, archive allowed, then
  // revise refused on the archived record.
  const id = ids.firstQuoteId;
  assert.equal((await api(USER, 'DELETE', `/api/quotes/${id}`)).status, 409);
  const accepted = await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'accepted' });
  assert.equal(accepted.status, 200);
  assert.equal((await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'sent' })).status, 409);
  const archived = await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'archived' });
  assert.equal(archived.status, 200);
  assert.equal((await api(USER, 'POST', `/api/quotes/${id}/revise`, {})).status, 409);

  const del = await api(USER, 'DELETE', `/api/quotes/${draftId}`);
  assert.equal(del.status, 200);
  assert.equal((await api(USER, 'GET', `/api/quotes/${draftId}`)).status, 404);
});

// ---------------- Expiry (mechanical) ----------------

test('expiry: a sent quote past its validity window reads as expired', async () => {
  const created = await api(USER, 'POST', '/api/quotes', samplePayload('300.00'));
  const id = created.body.quote.id;
  await api(USER, 'POST', `/api/quotes/${id}/status`, { status: 'sent' });
  // Move the stored expiry into the past — the quote's own window has
  // closed; no customer activity is involved.
  await ctx.prisma.quote.update({
    where: { id },
    data: { expiresAt: new Date(Date.now() - 60 * 1000) }
  });
  const got = await api(USER, 'GET', `/api/quotes/${id}`);
  assert.equal(got.body.quote.status, 'expired');
  const list = await api(USER, 'GET', '/api/quotes?status=expired');
  assert.ok(list.body.quotes.some((q) => q.id === id));
});

// ---------------- Lead link + project ----------------

test('links: a quote can reference a lead and create/link its project', async () => {
  const lead = await api(USER, 'POST', '/api/leads', {
    name: 'LEDGER BUYER',
    address: '9 TEST LN',
    city: 'Defiance'
  });
  assert.equal(lead.status, 201);

  const payload = samplePayload('5000.00');
  payload.leadId = lead.body.lead.id;
  const created = await api(USER, 'POST', '/api/quotes', payload);
  assert.equal(created.status, 201);
  assert.equal(created.body.quote.leadId, lead.body.lead.id);
  const qid = created.body.quote.id;

  const badLink = await api(USER, 'POST', '/api/quotes', { ...samplePayload('1.00'), leadId: 'nope' });
  assert.equal(badLink.status, 400, 'links must resolve inside the tenant');

  const proj = await api(USER, 'POST', `/api/quotes/${qid}/project`, {});
  assert.equal(proj.status, 201);
  assert.equal(proj.body.created, true);
  assert.equal(proj.body.project.clientName, 'Jane Miller');

  const again = await api(USER, 'POST', `/api/quotes/${qid}/project`, {});
  assert.equal(again.status, 200);
  assert.equal(again.body.created, false);
  assert.equal(again.body.project.id, proj.body.project.id);

  const got = await api(USER, 'GET', `/api/quotes/${qid}`);
  assert.equal(got.body.quote.projectId, proj.body.project.id);
});

// ---------------- Summary integration ----------------

test('summary: quotesOut and the quotes block read the ledger, tenant-scoped', async () => {
  const res = await api(USER, 'GET', '/api/ops/summary');
  assert.equal(res.status, 200);
  const s = res.body.summary;
  // Sent-and-open right now: IL-0002 (draft, not counted), the accepted
  // main quote (not out), the expired one (not out) — plus the quote
  // created in the links test is a draft. A fresh sent quote makes the
  // expectation exact:
  const created = await api(USER, 'POST', '/api/quotes', samplePayload('4321.00'));
  await api(USER, 'POST', `/api/quotes/${created.body.quote.id}/status`, { status: 'sent' });
  // A second quote walked to accepted (the versioning suite's accepted
  // quote ended archived, so it must not be counted here).
  const won = await api(USER, 'POST', '/api/quotes', samplePayload('6000.00'));
  await api(USER, 'POST', `/api/quotes/${won.body.quote.id}/status`, { status: 'sent' });
  await api(USER, 'POST', `/api/quotes/${won.body.quote.id}/status`, { status: 'accepted' });
  const after = await api(USER, 'GET', '/api/ops/summary');
  const s2 = after.body.summary;
  assert.equal(s2.quotesOut.count, s.quotesOut.count + 1);
  assert.equal(s2.quotesOut.total, s.quotesOut.total + 4321);
  assert.ok(s2.quotes.accepted.count >= 1);
  assert.ok(s2.quotes.accepted.total >= 6000);
  assert.ok(s2.quotes.closedOut.count >= 1, 'the expired quote lands in closedOut');
  assert.ok(s2.quotes.drafts.count >= 1);

  const other = await api(OTHER, 'GET', '/api/ops/summary');
  assert.equal(other.body.summary.quotesOut.count, 0);
  assert.equal(other.body.summary.quotes.accepted.count, 0);
  assert.equal(other.body.summary.quotes.closedOut.count, 0);
  // OTHER sees exactly their own ledger: the single draft (their
  // IL-0001) from the numbering test, none of USER's activity.
  assert.equal(other.body.summary.quotes.drafts.count, 1);
  assert.equal(other.body.summary.quotes.drafts.total, 200);
});
