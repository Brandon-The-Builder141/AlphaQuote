/**
 * Protected Route Component
 * Redirects unauthenticated users to sign-in page, and signed-in users
 * through the one-time provisioning + setup gate:
 *
 *   1. POST /api/users/sync runs once per session (services/provisioning)
 *      so the account exists before any data page asks for its rows —
 *      without it the API answers 403 and pages like Receipts fail.
 *   2. If the server says setup is not completed, the user is sent to
 *      /setup. Completion is stamped on the User row server-side, so
 *      this fires exactly once per user — not once per browser.
 */

import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ensureProvisioned } from '../services/provisioning';

const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-white mb-2">Loading AlphaQuote...</h2>
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
      .then((state) => {
        if (!cancelled) {
          setGate({ status: 'ready', setupCompleted: state.setupCompleted });
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
    return <LoadingScreen message="Setting up your account..." />;
  }

  if (gate.status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">We couldn't load your account</h2>
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

  // One-time setup gate: server-side completion is the only source of
  // truth. The setup page itself is exempt, or it could never render.
  if (!gate.setupCompleted && location.pathname !== '/setup') {
    return <Navigate to="/setup" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
