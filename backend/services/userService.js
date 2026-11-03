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
 * Pass Six (no setup): there is no setup flow anymore. This deployment
 * is Iron Legion's own tool, so a brand-new account is created
 * ready-to-use: the contractor account is named
 * pricingDefaults.COMPANY_LEGAL_NAME ("Iron Legion Contracting LLC")
 * and the User row is stamped setupCompletedAt at creation. The stamp
 * is written only here, server-side — no endpoint accepts it from a
 * client (POST /api/users/setup was removed in Pass Six).
 *
 * The local `password` column is legacy (password sign-in was removed in
 * Pass Two); Clerk-provisioned users get a random, unusable value — Clerk
 * is the only credential authority.
 */

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const pricingDefaults = require('../config/pricingDefaults');

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
 * column, and surface setup completion as a plain boolean
 * (setupCompletedAt stays the stored source of truth). Since Pass Six
 * every provisioned user is setup-complete from creation; the boolean
 * is informational only — nothing gates on it anymore.
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
      // Pass Six: this deployment is Iron Legion's own tool — the
      // account is created under the company's legal name and the user
      // is stamped setup-complete right here. No placeholder name, no
      // wizard, no gate: sign-in lands on a ready dashboard.
      const contractorAccount = await prisma.contractorAccount.create({
        data: {
          name: pricingDefaults.COMPANY_LEGAL_NAME,
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
          setupCompletedAt: new Date(),
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
