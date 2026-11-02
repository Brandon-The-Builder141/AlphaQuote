/**
 * Tenant Resolution Middleware (Pass Two — lockdown; clerkId link finished
 * in the Pass Two follow-up)
 *
 * Runs after authenticateUser. Maps the verified Clerk identity to the
 * application's own User record and exposes the caller's tenant scope:
 *
 *   req.dbUser    — the application's User row
 *   req.tenantId  — that user's ContractorAccount id
 *
 * Resolution order:
 *   1. `clerkId` from the verified token subject — the durable link,
 *      written at provisioning time (POST /api/users/sync or the Clerk
 *      webhook).
 *   2. Email fallback for pre-existing rows that predate the clerkId
 *      column; on a hit the row's clerkId is backfilled so every later
 *      request resolves by step 1.
 *
 * All data routes must scope their queries with scopeWhere(req) so a user
 * can only ever see or touch rows owned by their own contractor account or
 * created by themselves.
 *
 * A Clerk-authenticated caller with no User record under either key has
 * not completed account provisioning, so data routes reject them with 403
 * instead of falling back to any shared/default account.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const resolveTenant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    let dbUser = null;

    // 1. Prefer the durable clerkId link.
    if (req.user.id) {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: req.user.id }
      });
    }

    // 2. Email fallback for legacy rows; backfill clerkId on first contact.
    if (!dbUser && req.user.email) {
      const byEmail = await prisma.user.findUnique({
        where: { email: req.user.email }
      });
      if (byEmail) {
        dbUser = byEmail;
        if (!byEmail.clerkId && req.user.id) {
          try {
            dbUser = await prisma.user.update({
              where: { id: byEmail.id },
              data: { clerkId: req.user.id }
            });
          } catch (backfillError) {
            // A concurrent request may have backfilled first (unique
            // constraint). The email match already established the tenant;
            // proceed with the row we have.
            console.warn('Tenant clerkId backfill skipped:', backfillError.message);
          }
        }
      }
    }

    if (!dbUser) {
      return res.status(403).json({
        success: false,
        error: 'Account is not provisioned for this application'
      });
    }

    req.dbUser = dbUser;
    req.tenantId = dbUser.contractorAccountId;

    next();
  } catch (error) {
    console.error('Tenant resolution error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resolve account scope'
    });
  }
};

/**
 * Prisma `where` fragment matching only rows owned by the caller's tenant:
 * rows stamped with the caller's contractor account, or created by the
 * caller themselves. Compose with route-specific filters via AND.
 */
const scopeWhere = (req) => ({
  OR: [
    { contractorAccountId: req.tenantId },
    { createdById: req.dbUser.id }
  ]
});

module.exports = {
  resolveTenant,
  scopeWhere
};
