/**
 * Clerk Authentication Provider
 * Wraps the app with Clerk authentication context
 */

import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Check if key is valid (not a placeholder)
const hasValidKey = PUBLISHABLE_KEY &&
  !PUBLISHABLE_KEY.includes('your_') &&
  !PUBLISHABLE_KEY.includes('_here') &&
  !PUBLISHABLE_KEY.includes('placeholder') &&
  (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_'));

// Export whether Clerk is enabled
export const CLERK_ENABLED = hasValidKey;

export default function ClerkProviderWrapper({ children }) {
  // Always wrap in ClerkProvider but use a dummy key if not configured
  // This prevents useAuth errors in ProtectedRoute
  const keyToUse = hasValidKey ? PUBLISHABLE_KEY : 'pk_test_development_mode_only';

  if (!hasValidKey) {
    console.warn('🔓 Running in development mode without Clerk authentication.');
  }

  return (
    <ClerkProvider publishableKey={keyToUse}>
      {children}
    </ClerkProvider>
  );
}
