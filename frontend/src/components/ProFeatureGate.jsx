/**
 * Pro Feature Gate Component
 * Shows upgrade prompt for Pro-only features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Crown, Zap, X } from 'lucide-react';
import authService from '../services/authService';

const ProFeatureGate = ({
  children,
  feature,
  fallback = null,
  showUpgrade = true,
  className = ''
}) => {
  const { user } = useUser();
  const [hasPro, setHasPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const hasProFeatures = await authService.hasProFeatures(user);
        setHasPro(hasProFeatures);
      } catch (error) {
        console.error('Error checking Pro status:', error);
        setHasPro(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProStatus();
  }, [user]);

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasPro) {
    return <div className={className}>{children}</div>;
  }

  if (!showUpgrade) {
    return fallback;
  }

  return (
    <>
      <div
        className={`${className} relative group cursor-pointer`}
        onClick={() => setShowModal(true)}
      >
        {/* Blurred content */}
        <div className="blur-sm pointer-events-none">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-2xl mb-4">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Pro Feature</h3>
            <p className="text-slate-400 text-sm mb-4">
              {feature || 'This feature requires a Pro subscription'}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpgrade();
              }}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-800/50 shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/20 rounded-xl">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Unlock Pro Features</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-slate-300">AI-powered estimates</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-slate-300">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-slate-300">Custom branding</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-slate-300">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-slate-300">Team collaboration</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Start Pro Trial - $29/month
                </button>
                <button
                  onClick={handleCloseModal}
                  className="w-full text-slate-400 hover:text-white transition-colors py-2"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProFeatureGate;
