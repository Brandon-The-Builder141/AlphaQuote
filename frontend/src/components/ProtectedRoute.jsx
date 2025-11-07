/**
 * Protected Route Component
 * Redirects unauthenticated users to sign-in page
 * Currently set to development mode (authentication bypassed)
 */

import React from 'react';

const ProtectedRoute = ({ children }) => {
  // Development mode: bypass authentication
  // To enable Clerk authentication, configure REACT_APP_CLERK_PUBLISHABLE_KEY in .env
  console.log('🔓 Development mode: Authentication bypassed');
  return <>{children}</>;
};

export default ProtectedRoute;
