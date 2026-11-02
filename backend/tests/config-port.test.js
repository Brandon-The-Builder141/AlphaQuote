/**
 * Deploy-prep config tests (Pass Three).
 *
 * backend/config/env.js resolves the listen port as API_PORT || PORT || 3001
 * so Railway's injected $PORT works while local dev keeps API_PORT. The
 * config module reads env at require time, so each case runs in a child
 * process with a controlled environment.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { execFileSync } = require('child_process');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'env.js');

function loadApiPort(env) {
  const out = execFileSync(
    process.execPath,
    ['-e', `const c = require(${JSON.stringify(CONFIG_PATH)}); process.stdout.write(String(c.API_PORT));`],
    { env: { ...process.env, ...env }, encoding: 'utf8' }
  );
  return out.trim();
}

test('API_PORT takes precedence over PORT', () => {
  assert.strictEqual(loadApiPort({ API_PORT: '4101', PORT: '4202' }), '4101');
});

test('PORT is used when API_PORT is unset (Railway-style inject)', () => {
  const env = { PORT: '4202' };
  // Ensure API_PORT really is absent rather than inherited.
  const out = execFileSync(
    process.execPath,
    ['-e', `delete process.env.API_PORT; const c = require(${JSON.stringify(CONFIG_PATH)}); process.stdout.write(String(c.API_PORT));`],
    { env: { ...process.env, ...env, API_PORT: '' }, encoding: 'utf8' }
  );
  // Empty-string API_PORT is falsy, so PORT must win.
  assert.strictEqual(out.trim(), '4202');
});

test('defaults to 3001 when neither is set', () => {
  const out = execFileSync(
    process.execPath,
    ['-e', `delete process.env.API_PORT; delete process.env.PORT; const c = require(${JSON.stringify(CONFIG_PATH)}); process.stdout.write(String(c.API_PORT));`],
    { env: { PATH: process.env.PATH }, encoding: 'utf8' }
  );
  assert.strictEqual(out.trim(), '3001');
});
