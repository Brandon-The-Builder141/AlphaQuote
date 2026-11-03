/**
 * User Service
 * Manages user data and synchronization with Clerk
 *
 * Pass Two finish (provisioning): users are linked to Clerk by the
 * `clerkId` column on the User model. Provisioning accepts either shape:
 *   - a Clerk webhook user object ({ id, email_addresses: [{email_address}],
 *     first_name, last_name }), or
 *   - the verified-token identity built by middleware/auth.js
 *     ({ id, email, firstName, lastName }).
 *
 * Resolution order in createOrUpdateUser:
 *   1. existing row with this clerkId          -> update profile fields
 *   2. existing row with this email (legacy)   -> link clerkId, update
 *   3. no row at all                           -> create a ContractorAccount
 *      for the user plus their User row (User.contractorAccountId is
 *      required, so a brand-new identity needs both).
 *
 * The local `password` column is legacy (password sign-in was removed in
 * Pass Two); Clerk-provisioned users get a random, unusable value — Clerk
 * is the only credential authority.
 */

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizeClerkUser(clerkUser) {
  return {
    clerkId: clerkUser.id || clerkUser.sub,
    email:
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      clerkUser.email_addresses?.[0]?.email_address ||
      clerkUser.email,
    firstName: clerkUser.firstName ?? clerkUser.first_name ?? '',
    lastName: clerkUser.lastName ?? clerkUser.last_name ?? ''
  };
}

/**
 * Shape a User row for API responses: never expose the legacy password
 * column, and surface setup completion as a plain boolean the frontend
 * gate can read (setupCompletedAt stays the stored source of truth).
 */
function toPublicUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return { ...rest, setupCompleted: Boolean(user.setupCompletedAt) };
}

class UserService {
  /**
   * Create or update user from Clerk data, linking by clerkId.
   * @param {Object} clerkUser - Clerk user object or verified-token identity
   * @returns {Object} User data
   */
  async createOrUpdateUser(clerkUser) {
    try {
      const { clerkId, email, firstName, lastName } = normalizeClerkUser(clerkUser);

      if (!clerkId || !email) {
        return { success: false, error: 'Clerk identity is missing an id or email' };
      }

      // 1. Already linked by clerkId.
      const byClerkId = await prisma.user.findUnique({ where: { clerkId } });
      if (byClerkId) {
        const user = await prisma.user.update({
          where: { id: byClerkId.id },
          data: { email, firstName, lastName, lastLogin: new Date() }
        });
        return { success: true, data: toPublicUser(user) };
      }

      // 2. Legacy row matched by email: link the clerkId onto it.
      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        const user = await prisma.user.update({
          where: { id: byEmail.id },
          data: { clerkId, firstName, lastName, lastLogin: new Date() }
        });
        return { success: true, data: toPublicUser(user) };
      }

      // 3. Brand-new identity: create their contractor account and user.
      const contractorAccount = await prisma.contractorAccount.create({
        data: {
          name: `${firstName || 'New'} ${lastName || 'Contractor'}`.trim() + ' Company',
          email
        }
      });

      const user = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          // No local password sign-in exists anymore; store an unusable
          // random placeholder to satisfy the legacy NOT NULL column.
          password: crypto.randomBytes(32).toString('hex'),
          role: 'admin',
          contractorAccountId: contractorAccount.id,
          lastLogin: new Date()
        }
      });

      return { success: true, data: toPublicUser(user) };
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user by Clerk ID
   * @param {string} clerkId - Clerk user ID
   * @returns {Object} User data
   */
  async getUserByClerkId(clerkId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          contractorAccount: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: toPublicUser(user)
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   * @param {string} clerkId - Clerk user ID
   * @param {Object} profileData - Profile data to update
   * @returns {Object} Updated user data
   */
  async updateUserProfile(clerkId, profileData) {
    try {
      const data = {};
      if (profileData.firstName !== undefined) data.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) data.lastName = profileData.lastName;

      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data
      });

      return {
        success: true,
        data: toPublicUser(updatedUser)
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete the one-time company setup (live fixes, 2026-11-02).
   *
   * Writes the company basics onto the user's EXISTING contractor
   * account (provisioning already created one — setup must never create
   * a second account or move the user) and stamps
   * User.setupCompletedAt. The stamp is the single source of truth the
   * frontend gate reads via GET /api/users/me, so setup runs exactly
   * once per user across devices and re-logins. Re-running setup (e.g.
   * editing company basics from the profile) updates the fields and
   * keeps the stamp.
   *
   * @param {Object} clerkUser - verified-token identity (req.user)
   * @param {Object} basics - { companyName, phone, address }
   * @returns {Object} Updated public user (with contractorAccount)
   */
  async completeSetup(clerkUser, basics = {}) {
    try {
      // Provision on first contact if needed (same path as /api/users/sync),
      // so setup can never dead-end on a missing user row.
      let result = await this.getUserByClerkId(clerkUser.id);
      if (!result.success) {
        const provisioned = await this.createOrUpdateUser(clerkUser);
        if (!provisioned.success) {
          return provisioned;
        }
        result = await this.getUserByClerkId(clerkUser.id);
        if (!result.success) {
          return result;
        }
      }

      const user = result.data;
      const accountData = {};
      const companyName = typeof basics.companyName === 'string' ? basics.companyName.trim() : '';
      if (companyName) accountData.name = companyName;
      if (typeof basics.phone === 'string') accountData.phone = basics.phone.trim() || null;
      if (typeof basics.address === 'string') accountData.address = basics.address.trim() || null;

      if (Object.keys(accountData).length > 0) {
        await prisma.contractorAccount.update({
          where: { id: user.contractorAccountId },
          data: accountData
        });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { setupCompletedAt: new Date() },
        include: { contractorAccount: true }
      });

      return { success: true, data: toPublicUser(updated) };
    } catch (error) {
      console.error('Error completing setup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create contractor account for user and move the user onto it.
   * (A user belongs to exactly one contractor account; the schema's
   * ContractorAccount has name/email/phone/address fields only.)
   * @param {string} clerkId - Clerk user ID
   * @param {Object} companyData - Company information
   * @returns {Object} Contractor account data
   */
  async createContractorAccount(clerkId, companyData) {
    try {
      const user = await this.getUserByClerkId(clerkId);
      if (!user.success) {
        return user;
      }

      const contractorAccount = await prisma.contractorAccount.create({
        data: {
          name: companyData.companyName || companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address
        }
      });

      await prisma.user.update({
        where: { id: user.data.id },
        data: { contractorAccountId: contractorAccount.id }
      });

      return {
        success: true,
        data: contractorAccount
      };
    } catch (error) {
      console.error('Error creating contractor account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's contractor account
   * @param {string} clerkId - Clerk user ID
   * @returns {Object} Contractor account data
   */
  async getUserContractorAccount(clerkId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          contractorAccount: true
        }
      });

      if (!user || !user.contractorAccount) {
        return {
          success: false,
          error: 'Contractor account not found'
        };
      }

      return {
        success: true,
        data: user.contractorAccount
      };
    } catch (error) {
      console.error('Error fetching contractor account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has Pro subscription.
   * Subscription status lives in Clerk public metadata, not in the app
   * database, so it is read from the verified token's metadata when the
   * caller passes it (see GET /api/users/subscription).
   * @param {string} clerkId - Clerk user ID
   * @param {Object} [tokenMetadata] - public_metadata from the verified token
   * @returns {boolean} Whether user has Pro subscription
   */
  async hasProSubscription(clerkId, tokenMetadata) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      });

      if (!user) {
        return false;
      }

      const subscriptionStatus = tokenMetadata?.subscription || 'free';
      return subscriptionStatus === 'pro' || subscriptionStatus === 'enterprise';
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Deactivate a user by Clerk ID (Clerk user.deleted webhook).
   * @param {string} clerkId - Clerk user ID
   * @returns {Object} Result
   */
  async deactivateUserByClerkId(clerkId) {
    try {
      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user) {
        return { success: true, data: null }; // nothing to deactivate
      }
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false }
      });
      return { success: true, data: updated };
    } catch (error) {
      console.error('Error deactivating user:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new UserService();
