/**
 * Shared test setup for the Pass Two lockdown tests.
 *
 * - Spins up a throwaway SQLite database and applies all migrations.
 * - Replaces @clerk/clerk-sdk-node's verifyToken with a deterministic fake
 *   BEFORE the API is required: a token of the form `valid:<email>`
 *   verifies as that identity; anything else throws (invalid token).
 * - Imports the Express app (it no longer listens on import) and serves it
 *   on an ephemeral port.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');

function localPrismaEngineEnv() {
  // In this sandbox the Prisma engines were provisioned manually (the npm
  // postinstall download is blocked). Point the CLI/client at them when
  // they exist; on a normal machine Prisma finds its own engines.
  const env = {};
  const schemaEngine = path.join(
    REPO_ROOT,
    'node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x'
  );
  if (fs.existsSync(schemaEngine)) {
    env.PRISMA_SCHEMA_ENGINE_BINARY = schemaEngine;
  }
  const queryEngine = path.join(
    REPO_ROOT,
    'node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node'
  );
  if (fs.existsSync(queryEngine)) {
    env.PRISMA_QUERY_ENGINE_LIBRARY = queryEngine;
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = queryEngine;
  }
  env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1';
  return env;
}

async function fakeVerifyToken(token) {
  if (typeof token === 'string' && token.startsWith('valid:')) {
    const email = token.slice('valid:'.length);
    return { sub: `clerk_${email}`, email };
  }
  throw new Error('Invalid token');
}

async function startTestServer() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alphaquote-pass2-'));
  const dbPath = path.join(tmpDir, 'test.db');

  process.env.DATABASE_URL = `file:${dbPath}`;
  process.env.CLERK_SECRET_KEY = 'test-secret-key';

  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'prisma',
      'migrate',
      'deploy',
      '--schema',
      path.join(REPO_ROOT, 'backend/prisma/schema.prisma')
    ],
    {
      cwd: REPO_ROOT,
      env: { ...process.env, ...localPrismaEngineEnv() },
      stdio: 'pipe'
    }
  );

  // Install the Clerk mock before anything requires the real SDK.
  const clerkPath = require.resolve('@clerk/clerk-sdk-node');
  require.cache[clerkPath] = {
    id: clerkPath,
    filename: clerkPath,
    loaded: true,
    exports: { verifyToken: fakeVerifyToken }
  };

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const app = require('../server/api.js');
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  return { prisma, server, baseUrl, tmpDir };
}

async function stopTestServer({ prisma, server, tmpDir }) {
  await prisma.$disconnect();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

module.exports = { startTestServer, stopTestServer };
