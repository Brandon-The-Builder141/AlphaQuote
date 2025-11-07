/**
 * Backend Environment Configuration
 * Centralized access to all backend environment variables
 */

// API Configuration
const API_PORT = process.env.API_PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Database Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'REMOVED_LOCAL_SECRET';

// Authentication
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';

// Email Configuration
const EMAIL_CONFIG = {
  enabled: process.env.EMAIL_ENABLED === 'true',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  from: process.env.EMAIL_FROM || 'AlphaQuote <noreply@alphaquote.com>'
};

// Stripe Configuration (Optional)
const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
};

// Feature Flags
const FEATURES = {
  emailEnabled: process.env.EMAIL_ENABLED === 'true',
  stripeEnabled: !!process.env.STRIPE_SECRET_KEY
};

// Development Settings
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const DEBUG = process.env.DEBUG === 'true' || IS_DEVELOPMENT;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const errors = [];
  const warnings = [];

  // Check required variables
  if (!DATABASE_URL) {
    errors.push('DATABASE_URL is not set');
  }

  // Check optional but recommended variables
  if (!CLERK_SECRET_KEY && !IS_DEVELOPMENT) {
    warnings.push('CLERK_SECRET_KEY not set (authentication will not work)');
  }

  if (EMAIL_CONFIG.enabled && (!EMAIL_CONFIG.user || !EMAIL_CONFIG.pass)) {
    warnings.push('EMAIL_ENABLED is true but credentials are missing');
  }

  // Log results
  if (errors.length > 0) {
    console.error('❌ Environment Validation Failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    return false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment Warnings:');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  if (DEBUG) {
    console.log('✅ Environment variables validated');
  }

  return true;
};

/**
 * Log current configuration (for debugging)
 */
const logConfig = () => {
  if (!DEBUG) return;

  console.log('='.repeat(50));
  console.log('AlphaQuote Backend Configuration');
  console.log('='.repeat(50));
  console.log(`API Port: ${API_PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Database: ${DATABASE_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Email Enabled: ${EMAIL_CONFIG.enabled}`);
  console.log(`Stripe Enabled: ${FEATURES.stripeEnabled}`);
  console.log(`Debug Mode: ${DEBUG}`);
  console.log('='.repeat(50));
};

module.exports = {
  API_PORT,
  FRONTEND_URL,
  DATABASE_URL,
  CLERK_SECRET_KEY,
  EMAIL_CONFIG,
  STRIPE_CONFIG,
  FEATURES,
  IS_DEVELOPMENT,
  DEBUG,
  LOG_LEVEL,
  validateEnv,
  logConfig
};




