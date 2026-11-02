/**
 * Regression test for the Pass One CRITICAL finding: the demo-mode auth
 * bypass.
 *
 * Before Pass Two, backend/middleware/auth.js authenticated ANY caller as
 * a built-in demo user when Clerk token verification failed and the
 * request carried the header `x-demo-mode: true`. The Pass One audit
 * verified the exploit live: a garbage token plus that header passed
 * authentication.
 *
 * These tests reproduce the original exploit exactly and prove it now
 * returns 401.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, stopTestServer } = require('./helpers');

let ctx;

before(async () => {
  ctx = await startTestServer();
});

after(async () => {
  await stopTestServer(ctx);
});

const EXPLOIT_HEADERS = {
  Authorization: 'Bearer this-is-a-garbage-token',
  'x-demo-mode': 'true',
  'Content-Type': 'application/json'
};

test('original exploit: garbage token + x-demo-mode header on POST /api/users/sync returns 401', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/users/sync`, {
    method: 'POST',
    headers: EXPLOIT_HEADERS,
    body: JSON.stringify({})
  });
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.success, false);
});

test('original exploit: garbage token + x-demo-mode header on GET /api/receipts returns 401', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/receipts`, {
    headers: EXPLOIT_HEADERS
  });
  assert.equal(res.status, 401);
});

test('x-demo-mode header with no token at all returns 401', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/vendors`, {
    headers: { 'x-demo-mode': 'true' }
  });
  assert.equal(res.status, 401);
});

test('garbage token without the header also returns 401 (no fallback of any kind)', async () => {
  const res = await fetch(`${ctx.baseUrl}/api/vendors`, {
    headers: { Authorization: 'Bearer this-is-a-garbage-token' }
  });
  assert.equal(res.status, 401);
});
