/**
 * Auth Wrapper Component
 * Provides fallback authentication state when Clerk is not available
 */

import React from 'react';

const AuthWrapper = ({ children }) => {
  // Check if Clerk is available
  const hasClerkKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY && 
                     process.env.REACT_APP_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_development';

  if (!hasClerkKey) {
    // Mock authentication state for development
    const MockAuthProvider = ({ children }) => {
      // Create mock context values
      const mockAuthContext = {
        isSignedIn: false,
        isLoaded: true,
        userId: null,
        sessionId: null,
        signOut: () => {},
        signIn: () => {},
        signUp: () => {}
      };

      const mockUserContext = {
        user: null,
        isLoaded: true
      };

      return children;
    };

    return (
      <MockAuthProvider>
        {children}
      </MockAuthProvider>
    );
  }

  // If Clerk is available, render children normally
  return children;
};

export default AuthWrapper;
