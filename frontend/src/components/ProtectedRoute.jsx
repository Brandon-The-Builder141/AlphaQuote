/**
 * Protected Route Component
 * Redirects unauthenticated users to the sign-in page. Signed-in users
 * are provisioned once per session (POST /api/users/sync via
 * services/provisioning) so the account exists before any data page
 * asks for its rows — without it the API answers 403 and pages like
 * Receipts fail.
 *
 * Pass Six: there is no setup gate anymore. Provisioning creates the
 * account ready-to-use, so a signed-in user lands straight on the
 * dashboard — no wizard, no redirect, no nag.
 */

import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ensureProvisioned } from '../services/provisioning';

const LoadingScreen = ({ message }) => (
  <div className="min-h-screen iron-bg flex items-center justify-center">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-display uppercase tracking-wide text-white mb-2">Loading AlphaQuote...</h2>
      <p className="text-slate-400">{message || 'Please wait while we authenticate your session'}</p>
    </motion.div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  // Always call hooks first (React rules)
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const [gate, setGate] = useState({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);

  const clerkUserId = user?.id || null;

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUserId) {
      return;
    }
    let cancelled = false;
    setGate({ status: 'loading' });
    ensureProvisioned(clerkUserId)
      .then(() => {
        if (!cancelled) {
          setGate({ status: 'ready' });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setGate({ status: 'error', error });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, clerkUserId, retryCount]);

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
    return <LoadingScreen />;
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Signed in but the Clerk user object has not arrived yet
  if (!clerkUserId || gate.status === 'loading') {
    return <LoadingScreen message="Loading your account..." />;
  }

  if (gate.status === 'error') {
    return (
      <div className="min-h-screen iron-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-display uppercase tracking-wide text-white mb-2">We couldn't load your account</h2>
          <p className="text-slate-400 mb-6">
            AlphaQuote couldn't reach the server to set up your account. Check your connection and try again.
          </p>
          <button
            onClick={() => setRetryCount((count) => count + 1)}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
