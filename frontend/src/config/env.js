/**
 * Environment Configuration
 * Centralized access to all environment variables
 *
 * All configuration values should be accessed through this file
 * to ensure consistency and easy updates.
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export const SCRAPER_URL = process.env.REACT_APP_SCRAPER_URL || 'http://localhost:5050';

export const API_ENDPOINTS = {
  VENDORS: `${API_BASE_URL}/api/vendors`,
  RECEIPTS: `${API_BASE_URL}/api/receipts`,
  PROJECTS: `${API_BASE_URL}/api/projects`,
  ESTIMATES: `${API_BASE_URL}/api/estimates`,
  FOLLOWUPS: `${API_BASE_URL}/api/followups`,
  FOLLOWUP_TEMPLATES: `${API_BASE_URL}/api/followup-templates`,
  TASK_TEMPLATES: `${API_BASE_URL}/api/task-templates`,
  SCHEDULED_JOBS: `${API_BASE_URL}/api/scheduled-jobs`,
  USERS: `${API_BASE_URL}/api/users`,
  HEALTH: `${API_BASE_URL}/api/health`,
  SCRAPER_HEALTH: `${SCRAPER_URL}/health`,
  SCRAPER_PRICE: `${SCRAPER_URL}/scrape-price`
};

// App Configuration
export const APP_VERSION = process.env.REACT_APP_VERSION || '3.0.0';
export const APP_NAME = 'AlphaQuote';

// Authentication
export const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || '';
export const IS_DEV_MODE = process.env.NODE_ENV === 'development' || !CLERK_PUBLISHABLE_KEY.startsWith('pk_live');

// Feature Flags
export const FEATURES = {
  RECEIPT_OCR: true,
  OFFLINE_MODE: true,
  ANALYTICS: true,
  JOB_SCHEDULING: true,
  CHANGE_ORDERS: true,
  TASK_TEMPLATES: true,
  REGIONAL_PRICING: true
};

// Default Values
export const DEFAULTS = {
  LABOR_RATE: 75.00,
  MARKUP: 15.00,
  TAX_RATE: 0.00
};

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Validate required environment variables
 * Call this on app startup to ensure all required vars are set
 */
export const validateEnv = () => {
  const errors = [];

  if (!API_BASE_URL) {
    errors.push('REACT_APP_API_URL is not set');
  }

  if (errors.length > 0) {
    console.error('Environment Validation Failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    return false;
  }

  console.log('✅ Environment variables validated successfully');
  return true;
};

/**
 * Get full API endpoint URL
 * @param {string} endpoint - Endpoint key from API_ENDPOINTS
 * @param {string} path - Additional path to append
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint, path = '') => {
  const base = API_ENDPOINTS[endpoint] || `${API_BASE_URL}/api/${endpoint.toLowerCase()}`;
  return path ? `${base}/${path}` : base;
};

/**
 * Log current configuration (for debugging)
 */
export const logConfig = () => {
  console.log('='.repeat(50));
  console.log('AlphaQuote Configuration');
  console.log('='.repeat(50));
  console.log(`App Version: ${APP_VERSION}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Development Mode: ${IS_DEV_MODE}`);
  console.log(`Clerk Auth: ${CLERK_PUBLISHABLE_KEY ? 'Configured' : 'Not Configured'}`);
  console.log('Features:', FEATURES);
  console.log('='.repeat(50));
};

export default {
  API_BASE_URL,
  SCRAPER_URL,
  API_ENDPOINTS,
  APP_VERSION,
  APP_NAME,
  CLERK_PUBLISHABLE_KEY,
  IS_DEV_MODE,
  FEATURES,
  DEFAULTS,
  STRIPE_PUBLISHABLE_KEY,
  validateEnv,
  getApiUrl,
  logConfig
};

