/**
 * Supplier Links Manager
 * Manage and launch supplier store links for cart building
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Plus, Trash2, Store } from 'lucide-react';
import { showSuccess, showError, showInfo } from '../utils/toastService';

// Default supplier links
const DEFAULT_SUPPLIERS = [
  { id: 1, label: 'Home Depot', url: 'https://www.homedepot.com' },
  { id: 2, label: 'Lowe\'s', url: 'https://www.lowes.com' },
  { id: 3, label: 'Menards', url: 'https://www.menards.com' },
  { id: 4, label: 'Ace Hardware', url: 'https://www.acehardware.com' }
];

export default function SupplierLinksManager({ onStepComplete }) {
  const [suppliers, setSuppliers] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [hasLaunched, setHasLaunched] = useState(false);

  // Load suppliers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alphaquote_suppliers');
    if (saved) {
      try {
        setSuppliers(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load suppliers:', error);
        setSuppliers(DEFAULT_SUPPLIERS);
      }
    } else {
      setSuppliers(DEFAULT_SUPPLIERS);
    }

    // Check if user has launched before
    const launched = localStorage.getItem('alphaquote_cart_launched');
    if (launched === 'true') {
      setHasLaunched(true);
      onStepComplete?.(1);
    }
  }, [onStepComplete]);

  // Save suppliers to localStorage
  const saveSuppliers = (updatedSuppliers) => {
    setSuppliers(updatedSuppliers);
    localStorage.setItem('alphaquote_suppliers', JSON.stringify(updatedSuppliers));
  };

  // Launch supplier cart in new tab
  const handleLaunchCart = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setHasLaunched(true);
    localStorage.setItem('alphaquote_cart_launched', 'true');
    onStepComplete?.(1);
    showInfo('Supplier site opened. Build your cart and come back to paste it!');
  };

  // Add new supplier
  const handleAddSupplier = (e) => {
    e.preventDefault();

    if (!newLabel.trim()) {
      showError('Please enter a supplier name');
      return;
    }

    if (!newUrl.trim()) {
      showError('Please enter a supplier URL');
      return;
    }

    // Validate URL
    try {
      new URL(newUrl);
    } catch (error) {
      showError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const newSupplier = {
      id: Date.now(),
      label: newLabel.trim(),
      url: newUrl.trim()
    };

    saveSuppliers([...suppliers, newSupplier]);
    setNewLabel('');
    setNewUrl('');
    showSuccess(`Added ${newSupplier.label}`);
  };

  // Delete supplier
  const handleDeleteSupplier = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    saveSuppliers(suppliers.filter(s => s.id !== id));
    showInfo(`Removed ${supplier.label}`);
  };

  return (
    <div className="space-y-6">
      {/* Helper Note */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Store className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white mb-1">How it works:</p>
            <p>Click a supplier link below to open their website in a new tab. Add items to your cart, then come back here to paste your cart text.</p>
          </div>
        </div>
      </div>

      {/* Saved Suppliers */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Your Suppliers</h3>
        <div className="grid gap-3">
          {suppliers.map((supplier) => (
            <motion.div
              key={supplier.id}
              className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-primary/30 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{supplier.label}</h4>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{supplier.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handleLaunchCart(supplier.url)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Launch Cart
                </motion.button>
                <button
                  onClick={() => handleDeleteSupplier(supplier.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add New Supplier Form */}
      <div className="border-t border-slate-700/50 pt-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Add Custom Supplier</h3>
        <form onSubmit={handleAddSupplier} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Supplier Name</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Local Hardware Store"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Website URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </motion.button>
        </form>
      </div>
    </div>
  );
}

