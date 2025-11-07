/**
 * User Service
 * Manages user data and synchronization with Clerk
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class UserService {
  /**
   * Create or update user from Clerk data
   * @param {Object} clerkUser - User data from Clerk
   * @returns {Object} User data
   */
  async createOrUpdateUser(clerkUser) {
    try {
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImageUrl: clerkUser.profileImageUrl,
        publicMetadata: clerkUser.publicMetadata,
        privateMetadata: clerkUser.privateMetadata
      };

      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: userData,
        create: userData
      });

      return {
        success: true,
        data: user
      };
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
        data: user
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
      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          publicMetadata: profileData.metadata || {}
        }
      });

      return {
        success: true,
        data: updatedUser
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
   * Create contractor account for user
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
          companyName: companyData.companyName,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          website: companyData.website,
          license: companyData.license,
          primaryColor: companyData.primaryColor || '#3b82f6',
          secondaryColor: companyData.secondaryColor || '#1e40af',
          users: {
            connect: { id: user.data.id }
          }
        }
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
   * Check if user has Pro subscription
   * @param {string} clerkId - Clerk user ID
   * @returns {boolean} Whether user has Pro subscription
   */
  async hasProSubscription(clerkId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          contractorAccount: true
        }
      });

      // Check public metadata for subscription status
      const subscriptionStatus = user?.publicMetadata?.subscription || 'free';
      return subscriptionStatus === 'pro' || subscriptionStatus === 'enterprise';
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Update user subscription status
   * @param {string} clerkId - Clerk user ID
   * @param {string} subscription - Subscription level
   * @returns {Object} Updated user data
   */
  async updateSubscription(clerkId, subscription) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const updatedMetadata = {
        ...user.publicMetadata,
        subscription
      };

      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: {
          publicMetadata: updatedMetadata
        }
      });

      return {
        success: true,
        data: updatedUser
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new UserService();
