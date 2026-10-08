/**
 * Clerk Authentication Provider
 * Wraps the app with Clerk authentication context
 */

import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Development mode fallback - allow app to run without Clerk keys
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const hasValidKey = PUBLISHABLE_KEY &&
  PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_development' &&
  (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_'));

// Environment variables are properly configured

if (!hasValidKey && !isDevelopment) {
  throw new Error('Missing Publishable Key. Please add REACT_APP_CLERK_PUBLISHABLE_KEY to your .env file');
}

export default function ClerkProviderWrapper({ children }) {
  // Always provide a ClerkProvider, even in development mode
  const keyToUse = hasValidKey ? PUBLISHABLE_KEY : 'pk_test_placeholder_key_for_development';

  if (!hasValidKey) {
    console.warn('🔧 Development Mode: Running with placeholder Clerk key. Add REACT_APP_CLERK_PUBLISHABLE_KEY to .env for full auth features.');
  }

  return (
    <ClerkProvider publishableKey={keyToUse}>
      {children}
    </ClerkProvider>
  );
}
