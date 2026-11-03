/**
 * Pass Five suite (Iron Legion tailoring).
 *
 * Two layers, matching the suite's existing patterns:
 *
 * 1. Config tests (direct require, like config-port.test.js):
 *    backend/config/pricingDefaults.js is the single source for the
 *    tailoring defaults — six trades only, Iron Legion rates, the
 *    customer-facing quote terms, and the starter template library.
 *    These tests pin the values to the Iron Legion pricing sheet so
 *    a future edit cannot silently drift them (or sneak plumbing /
 *    electrical back into the catalog).
 *
 * 2. API round-trip (test server, like live-fixes.test.js): every
 *    starter template is created through POST /api/task-templates
 *    for a provisioned tenant and read back through the list route,
 *    proving the templates are valid in the shape the app models.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./helpers');
const defaults = require('../config/pricingDefaults');

// ---------- 1. Config: rates & rules ----------

test('pricing defaults match the Iron Legion pricing sheet', () => {
  assert.equal(defaults.SOLO_LABOR_RATE, 60);
  assert.equal(defaults.CREW_LABOR_RATE, 90);
  assert.equal(defaults.MATERIAL_MARKUP_PERCENT, 15);
  assert.equal(defaults.OVERHEAD_MARGIN_PERCENT, 10);
  assert.equal(defaults.MINIMUM_JOB_AMOUNT, 350);
  assert.equal(defaults.QUOTE_VALIDITY_DAYS, 14);
  assert.equal(defaults.DEPOSIT_MATERIALS_PERCENT_MIN, 30);
  assert.equal(defaults.DEPOSIT_MATERIALS_PERCENT_MAX, 50);
  assert.equal(defaults.COMPANY_DISPLAY_NAME, 'Iron Legion Contracting');
  assert.equal(defaults.COMPANY_LEGAL_NAME, 'Iron Legion Contracting LLC');
});

test('service catalog is exactly the six Iron Legion trades', () => {
  assert.deepEqual(defaults.SERVICE_CATEGORIES, [
    'Siding',
    'Fencing',
    'Decking',
    'Framing',
    'Landscaping',
    'Flooring'
  ]);
});

test('quote terms carry the four Iron Legion terms', () => {
  const terms = defaults.QUOTE_TERMS.join('\n');
  assert.equal(defaults.QUOTE_TERMS.length, 4);
  assert.match(terms, /valid for 14 days/);
  assert.match(terms, /of materials due up front/);
  assert.match(terms, /shown to the customer and agreed/);
  assert.match(terms, /time & materials/);
  assert.match(terms, /Iron Legion does not perform plumbing or electrical work/);
});

// ---------- 1b. Config: starter templates ----------

const byCategory = (cat) =>
  defaults.STARTER_TEMPLATES.filter((t) => t.category === cat);

const line = (template, unitPrice) =>
  template.tasks.find((t) => t.unitPrice === unitPrice);

test('starter templates: one per trade, framing gets two, categories stay in-catalog', () => {
  assert.equal(defaults.STARTER_TEMPLATES.length, 7);
  for (const cat of defaults.SERVICE_CATEGORIES) {
    assert.ok(byCategory(cat).length >= 1, `missing a template for ${cat}`);
  }
  assert.equal(byCategory('Framing').length, 2); // package + labor-only
  for (const t of defaults.STARTER_TEMPLATES) {
    assert.ok(defaults.SERVICE_CATEGORIES.includes(t.category), `bad category ${t.category}`);
    assert.ok(t.tasks.length >= 1, `${t.name} has no line items`);
  }
});

test('starter templates never mention plumbing or electrical work', () => {
  const blob = JSON.stringify(defaults.STARTER_TEMPLATES);
  assert.doesNotMatch(blob, /plumb/i);
  assert.doesNotMatch(blob, /electric/i);
});

test('starter template line items match the pricing sheet mid-band numbers', () => {
  const siding = byCategory('Siding')[0];
  assert.equal(line(siding, 6.50).quantity, 1200); // vinyl installed
  assert.equal(line(siding, 1.50).quantity, 1200); // old siding demo
  assert.equal(line(siding, 0.75).quantity, 1200); // house wrap
  assert.equal(line(siding, 800).quantity, 1);     // trim, flat

  const fencing = byCategory('Fencing')[0];
  assert.equal(line(fencing, 27).quantity, 150);   // PT wood privacy
  assert.equal(line(fencing, 400).quantity, 1);    // walk gate
  assert.equal(line(fencing, 4.50).quantity, 150); // old fence removal

  const decking = byCategory('Decking')[0];
  assert.equal(line(decking, 28).quantity, 300);   // PT deck installed
  assert.equal(line(decking, 375).quantity, 4);    // stairs, per step
  assert.equal(line(decking, 200).quantity, 1);    // permit, flat

  const pkg = byCategory('Framing').find((t) => /Package/.test(t.name));
  assert.equal(line(pkg, 16).quantity, 500);       // framing package
  const laborOnly = byCategory('Framing').find((t) => /Labor Only/.test(t.name));
  assert.equal(line(laborOnly, 6.50).quantity, 500); // framing labor only

  const landscaping = byCategory('Landscaping')[0];
  assert.equal(line(landscaping, 70).quantity, 3);  // mulch installed
  assert.equal(line(landscaping, 275).quantity, 1); // bed cleanup + edge
  assert.equal(line(landscaping, 85).unit, 'hour'); // crew labor rate

  const flooring = byCategory('Flooring')[0];
  assert.equal(line(flooring, 6.00).quantity, 500); // LVP installed
  assert.equal(line(flooring, 2.00).quantity, 500); // old floor removal
  assert.equal(line(flooring, 300).quantity, 1);    // trim/transitions
});

// ---------- 2. API round-trip ----------

let ctx;

const tokenFor = (email) => ({
  Authorization: `Bearer valid:${email}`,
  'Content-Type': 'application/json'
});

before(async () => {
  ctx = await startTestServer();
});

after(async () => {
  await stopTestServer(ctx);
});

test('public starter library self-populates on first list (production-safe, no demo seed)', async () => {
  // Runs before the round-trip test below, so this file's database is still
  // virgin: no public templates exist until the first list request.
  const email = 'pass5-library@test.local';

  const syncRes = await fetch(`${ctx.baseUrl}/api/users/sync`, {
    method: 'POST',
    headers: tokenFor(email),
    body: JSON.stringify({})
  });
  assert.equal(syncRes.status, 200);

  const first = await fetch(`${ctx.baseUrl}/api/task-templates`, {
    headers: tokenFor(email)
  });
  assert.equal(first.status, 200);
  const firstBody = await first.json();
  assert.equal(firstBody.templates.length, defaults.STARTER_TEMPLATES.length);
  const names = firstBody.templates.map((t) => t.name).sort();
  assert.deepEqual(names, defaults.STARTER_TEMPLATES.map((t) => t.name).sort());
  for (const t of firstBody.templates) {
    assert.equal(t.isPublic, true);
    assert.equal(t.userId, 'system');
    assert.ok(t.tasks.length > 0, `${t.name} has line items`);
  }
  const fencing = firstBody.templates.find((t) => t.category === 'Fencing');
  const firstLine = fencing.tasks.find((task) => Number(task.unitPrice) === 27);
  assert.equal(Number(firstLine.totalPrice), 4050);

  // Second list: idempotent — no duplicates appear.
  const second = await fetch(`${ctx.baseUrl}/api/task-templates`, {
    headers: tokenFor(email)
  });
  const secondBody = await second.json();
  assert.equal(secondBody.templates.length, firstBody.templates.length);
});

test('starter templates round-trip through the task-templates API', async () => {
  const email = 'pass5-templates@test.local';

  const syncRes = await fetch(`${ctx.baseUrl}/api/users/sync`, {
    method: 'POST',
    headers: tokenFor(email),
    body: JSON.stringify({})
  });
  assert.equal(syncRes.status, 200);

  for (const t of defaults.STARTER_TEMPLATES) {
    const res = await fetch(`${ctx.baseUrl}/api/task-templates`, {
      method: 'POST',
      headers: tokenFor(email),
      body: JSON.stringify({
        name: t.name,
        description: t.description,
        category: t.category,
        isPublic: t.isPublic,
        tasks: t.tasks
      })
    });
    assert.equal(res.status, 201, `creating ${t.name}`);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.template.tasks.length, t.tasks.length);
  }

  const list = await fetch(`${ctx.baseUrl}/api/task-templates`, {
    headers: tokenFor(email)
  });
  assert.equal(list.status, 200);
  const listBody = await list.json();
  const names = listBody.templates.map((t) => t.name);
  for (const t of defaults.STARTER_TEMPLATES) {
    assert.ok(names.includes(t.name), `list is missing ${t.name}`);
  }

  // Spot-check computed totals come back the way the app models them:
  // the fencing template's first line is 150 LF x $27 = $4,050.
  const fencing = listBody.templates.find((t) => t.category === 'Fencing');
  const first = fencing.tasks.find((task) => Number(task.unitPrice) === 27);
  assert.equal(Number(first.quantity), 150);
  assert.equal(Number(first.totalPrice), 4050);
});
