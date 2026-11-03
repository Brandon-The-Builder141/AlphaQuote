/**
 * Shared test setup for the Pass Two lockdown tests.
 *
 * - Spins up a throwaway SQLite database. The application schema
 *   (backend/prisma/schema.prisma) targets PostgreSQL since the Pass Four
 *   cutover, so tests run against the SQLite schema variant
 *   (backend/prisma/schema.sqlite.prisma — identical models, sqlite
 *   provider): the Prisma client is generated from that variant and the
 *   tables are created with `prisma db push`. This keeps the suite on a
 *   local file DB with zero external services; app code is unchanged.
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

  // Test DB setup against the SQLite schema variant (see header comment):
  // generate the client from the variant, then push the schema into the
  // throwaway file DB. The app schema targets PostgreSQL and is never used
  // to build a test database.
  const testSchema = path.join(REPO_ROOT, 'backend/prisma/schema.sqlite.prisma');
  const prismaCliEnv = { ...process.env, ...localPrismaEngineEnv() };
  const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  execFileSync(
    npxBin,
    ['prisma', 'generate', '--schema', testSchema],
    { cwd: REPO_ROOT, env: prismaCliEnv, stdio: 'pipe' }
  );

  execFileSync(
    npxBin,
    ['prisma', 'db', 'push', '--schema', testSchema, '--skip-generate'],
    { cwd: REPO_ROOT, env: prismaCliEnv, stdio: 'pipe' }
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
