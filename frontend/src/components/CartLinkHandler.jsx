/**
 * Cart Link Handler Component
 * Handles cart share links from retailers with smart detection and instructions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Info,
  Sparkles
} from 'lucide-react';
import { showSuccess, showError, showInfo } from '../utils/toastService';
import { detectRetailer, isValidUrl, isCartUrl, generateBookmarklet } from '../utils/retailerHelpers';

export default function CartLinkHandler({ onStepComplete }) {
  const [cartUrl, setCartUrl] = useState('');
  const [detectedRetailer, setDetectedRetailer] = useState(null);
  const [hasOpened, setHasOpened] = useState(false);
  const [showBookmarklet, setShowBookmarklet] = useState(false);

  // Detect retailer when URL changes
  useEffect(() => {
    if (cartUrl && isValidUrl(cartUrl)) {
      const retailer = detectRetailer(cartUrl);
      setDetectedRetailer(retailer);
    } else {
      setDetectedRetailer(null);
    }
  }, [cartUrl]);

  // Handle opening the cart link
  const handleOpenLink = () => {
    if (!cartUrl) {
      showError('Please enter a cart link');
      return;
    }

    if (!isValidUrl(cartUrl)) {
      showError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    // Open in new tab
    window.open(cartUrl, '_blank', 'noopener,noreferrer');
    setHasOpened(true);
    onStepComplete?.(1);

    if (isCartUrl(cartUrl)) {
      showSuccess('Cart page opened! Follow the instructions below to copy your items.');
    } else {
      showInfo('Link opened! Make sure it\'s your cart page, then copy the items.');
    }
  };

  // Copy bookmarklet to clipboard
  const handleCopyBookmarklet = () => {
    const bookmarklet = generateBookmarklet();
    navigator.clipboard.writeText(bookmarklet).then(() => {
      showSuccess('Bookmarklet copied! Drag it to your bookmarks bar.');
    }).catch(() => {
      showError('Failed to copy. Please try again.');
    });
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Link2 className="w-4 h-4 inline mr-2" />
          Paste Cart Link
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={cartUrl}
            onChange={(e) => setCartUrl(e.target.value)}
            placeholder="https://www.homedepot.com/mycart/share/ABC123"
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <motion.button
            onClick={handleOpenLink}
            disabled={!cartUrl}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ExternalLink className="w-5 h-5" />
            Open Cart
          </motion.button>
        </div>

        {/* URL Validation Feedback */}
        {cartUrl && !isValidUrl(cartUrl) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 mt-2 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Please enter a valid URL starting with http:// or https://
          </motion.p>
        )}

        {cartUrl && isValidUrl(cartUrl) && !isCartUrl(cartUrl) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-yellow-400 mt-2 flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            This doesn't look like a cart link. Make sure it's your shopping cart page.
          </motion.p>
        )}
      </div>

      {/* Detected Retailer Info */}
      <AnimatePresence>
        {detectedRetailer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                {detectedRetailer.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  {detectedRetailer.name}
                  {hasOpened && <CheckCircle className="w-5 h-5 text-green-400" />}
                </h4>
                <p className="text-sm text-slate-400">Detected from link</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-white mb-3">
                📋 How to Copy Your Cart:
              </h5>
              <ol className="space-y-2">
                {detectedRetailer.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            {hasOpened && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-green-400 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Cart page opened! Follow the steps above, then paste in Step 3 below.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmarklet Section */}
      <div className="border-t border-slate-700 pt-6">
        <button
          onClick={() => setShowBookmarklet(!showBookmarklet)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {showBookmarklet ? 'Hide' : 'Show'} Advanced: One-Click Bookmarklet
        </button>

        <AnimatePresence>
          {showBookmarklet && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 overflow-hidden"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-white mb-1">
                    AlphaQuote Cart Extractor
                  </h5>
                  <p className="text-xs text-slate-400">
                    Drag this bookmarklet to your bookmarks bar. When you're on a cart page, click it to automatically extract and copy cart data!
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-400 font-mono overflow-hidden">
                  📚 AlphaQuote Cart Extract
                </div>
                <motion.button
                  onClick={handleCopyBookmarklet}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold text-sm transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Copy className="w-4 h-4" />
                  Copy Code
                </motion.button>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                <p className="mb-1">📖 How to use:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Copy Code" above</li>
                  <li>Create a new bookmark in your browser</li>
                  <li>Paste the code as the URL</li>
                  <li>Name it "AlphaQuote Cart Extract"</li>
                  <li>Visit any cart page and click the bookmark!</li>
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h5 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Quick Tips
        </h5>
        <ul className="space-y-1 text-xs text-slate-300">
          <li>• Most retailers let you share your cart with a special link</li>
          <li>• Look for "Share Cart" or "Email Cart" buttons on the cart page</li>
          <li>• Some links expire after a few days, so import soon!</li>
          <li>• If the link doesn't work, you can still paste cart text manually in Step 3</li>
        </ul>
      </div>
    </div>
  );
}

