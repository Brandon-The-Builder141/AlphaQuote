/**
 * Protected Route Component
 * Redirects unauthenticated users to sign-in page
 */

import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  // Always call hooks first (React rules)
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  // Check if Clerk is available
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasClerkKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY &&
                     process.env.REACT_APP_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_development' &&
                     (process.env.REACT_APP_CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') ||
                      process.env.REACT_APP_CLERK_PUBLISHABLE_KEY.startsWith('pk_live_'));

  // If no valid Clerk key in development, allow access (demo mode)
  if (isDevelopment && !hasClerkKey) {
    console.warn('🔧 Development Mode: Skipping authentication for protected routes');
    return children;
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading AlphaQuote...</h2>
          <p className="text-slate-400">Please wait while we authenticate your session</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check if user has completed profile setup
  if (!user.unsafeMetadata?.profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

export default ProtectedRoute;
