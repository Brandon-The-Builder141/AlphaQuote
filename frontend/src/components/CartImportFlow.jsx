/**
 * Cart Import Flow
 * Guided workflow for importing materials from supplier carts
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, Circle, Link2, Store } from 'lucide-react';
import SupplierLinksManager from './SupplierLinksManager';
import CartLinkHandler from './CartLinkHandler';
import PasteCartInput from './PasteCartInput';

export default function CartImportFlow({ onImport, onClose }) {
  const [completedSteps, setCompletedSteps] = useState({
    1: false, // Launch supplier
    2: false, // Build cart (assumed when they paste)
    3: false  // Paste and import
  });
  const [step1Mode, setStep1Mode] = useState('link'); // 'link' or 'suppliers'

  const handleStepComplete = (step) => {
    setCompletedSteps(prev => ({ ...prev, [step]: true }));
  };

  const handleImport = (items) => {
    onImport(items);
    onClose();
  };

  const steps = [
    { number: 1, title: 'Open Your Cart', description: 'Use a cart link or browse to your supplier' },
    { number: 2, title: 'Build Your Cart', description: 'Add materials to your cart on the supplier site' },
    { number: 3, title: 'Paste & Import', description: 'Copy your cart text and paste it below' }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-800/50 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading text-white">Cart Import Flow</h2>
            <p className="text-sm text-slate-400">Import materials from your supplier carts</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Checklist */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Guide</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-3"
                  >
                    {completedSteps[step.number] ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${completedSteps[step.number] ? 'text-green-400' : 'text-white'}`}>
                        Step {step.number}: {step.title}
                      </p>
                      <p className="text-sm text-slate-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Open Your Cart */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  completedSteps[1] ? 'bg-green-500 text-white' : 'bg-primary text-white'
                }`}>
                  1
                </div>
                <h3 className="text-lg font-semibold text-white">Open Your Cart</h3>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setStep1Mode('link')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    step1Mode === 'link'
                      ? 'bg-primary text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Paste Cart Link
                </button>
                <button
                  onClick={() => setStep1Mode('suppliers')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    step1Mode === 'suppliers'
                      ? 'bg-primary text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Browse Suppliers
                </button>
              </div>

              {/* Content based on mode */}
              {step1Mode === 'link' ? (
                <CartLinkHandler onStepComplete={handleStepComplete} />
              ) : (
                <SupplierLinksManager onStepComplete={handleStepComplete} />
              )}
            </div>

            {/* Step 2 Reminder */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  completedSteps[2] ? 'bg-green-500 text-white' : 'bg-slate-600 text-white'
                }`}>
                  2
                </div>
                <h3 className="text-lg font-semibold text-white">Build Your Cart</h3>
              </div>
              <p className="text-sm text-slate-400 ml-10">
                {completedSteps[1]
                  ? 'Great! Now add materials to your cart on the supplier site, then come back here.'
                  : 'First, launch a supplier site above to start building your cart.'}
              </p>
            </div>

            {/* Paste Cart Input */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  completedSteps[3] ? 'bg-green-500 text-white' : 'bg-slate-600 text-white'
                }`}>
                  3
                </div>
                <h3 className="text-lg font-semibold text-white">Paste & Import Cart</h3>
              </div>
              <PasteCartInput onImport={handleImport} onStepComplete={handleStepComplete} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {completedSteps[3] ? '✅ Ready to import!' : 'Follow the steps above to import your cart'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

