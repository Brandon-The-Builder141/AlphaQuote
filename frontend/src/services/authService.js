/**
 * Authentication Service
 * Handles user authentication and profile management
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class AuthService {
  /**
   * Sync user data with backend
   * @param {Object} user - Clerk user object
   * @returns {Object} API response
   */
  async syncUser(user) {
    try {
      const token = await user.getToken();

      const response = await fetch(`${API_BASE_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error syncing user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user data
   * @param {Object} user - Clerk user object
   * @returns {Object} API response
   */
  async getCurrentUser(user) {
    try {
      const token = await user.getToken();

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile
   * @param {Object} user - Clerk user object
   * @param {Object} profileData - Profile data to update
   * @returns {Object} API response
   */
  async updateProfile(user, profileData) {
    try {
      const token = await user.getToken();

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create contractor account
   * @param {Object} user - Clerk user object
   * @param {Object} companyData - Company information
   * @returns {Object} API response
   */
  async createContractorAccount(user, companyData) {
    try {
      const token = await user.getToken();

      const response = await fetch(`${API_BASE_URL}/api/users/contractor-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating contractor account:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check user subscription status
   * @param {Object} user - Clerk user object
   * @returns {Object} API response
   */
  async checkSubscription(user) {
    try {
      const token = await user.getToken();

      const response = await fetch(`${API_BASE_URL}/api/users/subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Make authenticated API request
   * @param {Object} user - Clerk user object
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Object} API response
   */
  async authenticatedRequest(user, endpoint, options = {}) {
    try {
      const token = await user.getToken();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error making authenticated request:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user is in demo mode
   * @returns {boolean} Whether user is in demo mode
   */
  isDemoMode() {
    return localStorage.getItem('alphaquote_demo_mode') === 'true';
  }

  /**
   * Get demo user data
   * @returns {Object} Demo user data
   */
  getDemoUser() {
    if (this.isDemoMode()) {
      const demoUserData = localStorage.getItem('alphaquote_demo_user');
      return demoUserData ? JSON.parse(demoUserData) : null;
    }
    return null;
  }

  /**
   * Set demo mode
   * @param {boolean} enabled - Whether to enable demo mode
   */
  setDemoMode(enabled) {
    if (enabled) {
      localStorage.setItem('alphaquote_demo_mode', 'true');
    } else {
      localStorage.removeItem('alphaquote_demo_mode');
      localStorage.removeItem('alphaquote_demo_user');
    }
  }

  /**
   * Get user's subscription level
   * @param {Object} user - Clerk user object or demo user
   * @returns {Promise<string>} Subscription level
   */
  async getUserSubscription(user) {
    if (this.isDemoMode()) {
      return 'demo';
    }

    try {
      const result = await this.checkSubscription(user);
      return result.success ? result.data.subscription : 'free';
    } catch (error) {
      console.error('Error getting subscription:', error);
      return 'free';
    }
  }

  /**
   * Check if user has Pro features
   * @param {Object} user - Clerk user object or demo user
   * @returns {Promise<boolean>} Whether user has Pro features
   */
  async hasProFeatures(user) {
    const subscription = await this.getUserSubscription(user);
    return subscription === 'pro' || subscription === 'enterprise' || subscription === 'demo';
  }
}

const authService = new AuthService();
export default authService;
