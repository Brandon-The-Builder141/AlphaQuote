/**
 * Cart Import Component
 * Allows users to import materials from CSV files or pasted cart text
 * Supports Home Depot, Lowe's, and other retailer cart formats
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import {
  Upload,
  FileText,
  ShoppingCart,
  X,
  Check,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { showSuccess, showError, showInfo } from '../utils/toastService';

export default function CartImport({ onImport, onClose }) {
  const [importMode, setImportMode] = useState('csv'); // 'csv' or 'text'
  const [cartText, setCartText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse CSV file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showError('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const items = parseCSVData(results.data);
          setParsedItems(items);
          if (items.length > 0) {
            showSuccess(`Successfully parsed ${items.length} items from CSV`);
          } else {
            showError('No valid items found in CSV');
          }
        } catch (error) {
          showError(`Error parsing CSV: ${error.message}`);
          setErrors([error.message]);
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        showError(`Failed to read CSV file: ${error.message}`);
        setErrors([error.message]);
        setIsProcessing(false);
      }
    });
  };

  // Parse CSV data into standardized format
  const parseCSVData = (data) => {
    const items = [];
    const newErrors = [];

    data.forEach((row, index) => {
      try {
        // Try to identify columns by common names
        const item = {
          name: row.name || row.Name || row.item || row.Item || row.description || row.Description || row.product || row.Product,
          quantity: parseFloat(row.quantity || row.Quantity || row.qty || row.Qty || 1),
          unitPrice: parseFloat(row.price || row.Price || row.unitPrice || row['Unit Price'] || row.cost || row.Cost || 0),
          sku: row.sku || row.SKU || row.id || row.ID || '',
          link: row.link || row.Link || row.url || row.URL || ''
        };

        // Validate required fields
        if (!item.name) {
          newErrors.push(`Row ${index + 1}: Missing item name`);
          return;
        }

        if (isNaN(item.quantity) || item.quantity <= 0) {
          newErrors.push(`Row ${index + 1}: Invalid quantity for "${item.name}"`);
          return;
        }

        if (isNaN(item.unitPrice) || item.unitPrice < 0) {
          newErrors.push(`Row ${index + 1}: Invalid price for "${item.name}"`);
          return;
        }

        item.totalPrice = item.quantity * item.unitPrice;
        items.push(item);
      } catch (error) {
        newErrors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    setErrors(newErrors);
    return items;
  };

  // Parse pasted cart text (Home Depot, Lowe's format)
  const handleTextImport = () => {
    if (!cartText.trim()) {
      showError('Please paste cart text to import');
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const items = parseCartText(cartText);
      setParsedItems(items);
      if (items.length > 0) {
        showSuccess(`Successfully parsed ${items.length} items from cart text`);
      } else {
        showError('No valid items found in cart text');
      }
    } catch (error) {
      showError(`Error parsing cart text: ${error.message}`);
      setErrors([error.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse cart text with improved filtering and validation
  const parseCartText = (text) => {
    const items = [];
    const newErrors = [];

    // Split by lines and process
    const lines = text.split('\n').filter(line => line.trim());

    // Phrases to skip (delivery messages, instructions, attributes)
    const skipPhrases = [
      /^delivering to/i,
      /^get it delivered/i,
      /^schedule your delivery/i,
      /^your delivery cost/i,
      /^this cost covers/i,
      /^get bulk pricing/i,
      /^when you purchase/i,
      /^add to cart/i,
      /^view details/i,
      /^see more/i,
      /^product details/i,
      /^specifications/i,
      /^reviews/i,
      /^questions/i,
      /^nominal/i,
      /^approximate/i,
      /^\(\/item\)$/i,
      /^package quantity:/i,
      /^screw length:/i,
      /^joist hanger size:/i,
      /^lumber size:/i,
      /^color:/i,
      /^material:/i,
      /^finish:/i,
      /^brand:/i,
      /^model #/i,
      /^sku:/i,
      /^internet #/i
    ];

    // Pattern 1: Home Depot format
    // Example: "2x4x8 Lumber    Qty: 10    $5.98 each    Total: $59.80"
    const hdPattern = /^(.+?)\s+(?:Qty:|Quantity:)?\s*(\d+)\s+\$?([\d,]+\.?\d*)\s*(?:each|ea)?\s*(?:Total:)?\s*\$?([\d,]+\.?\d*)?/i;

    // Pattern 2: Lowe's format
    // Example: "Item Name | 5 | $12.99 | $64.95"
    const lowesPattern = /^(.+?)\s*[|\t]\s*(\d+)\s*[|\t]\s*\$?([\d,]+\.?\d*)\s*[|\t]?\s*\$?([\d,]+\.?\d*)?/;

    // Pattern 3: Simple format
    // Example: "Lumber 2x4    10    $5.98"
    const simplePattern = /^(.+?)\s+(\d+)\s+\$?([\d,]+\.?\d*)/;

    lines.forEach((line, index) => {
      try {
        const match = line.match(hdPattern) || line.match(lowesPattern) || line.match(simplePattern);

        if (match) {
          let name = match[1].trim();
          const quantity = parseFloat(match[2]) || 1;
          const unitPrice = parseFloat(match[3].replace(/,/g, '')) || 0;
          const totalPrice = match[4] ? parseFloat(match[4].replace(/,/g, '')) : quantity * unitPrice;

          // Skip if clearly junk (but be lenient for real products)
          if (skipPhrases.some(pattern => pattern.test(line))) {
            return;
          }

          // Basic validation only (don't be too strict)
          if (!name || name.length < 2) return;
          if (isNaN(quantity) || quantity <= 0) return;
          if (isNaN(unitPrice) || unitPrice <= 0) return;

          // Skip unreasonably high prices (likely parsing errors)
          if (unitPrice > 50000) return;

          // Clean up the name
          name = name.replace(/\s+/g, ' ').trim();

          // Valid item - add it!
          items.push({
            name,
            quantity,
            unitPrice,
            totalPrice,
            sku: '',
            link: ''
          });
        }
      } catch (error) {
        newErrors.push(`Line ${index + 1}: ${error.message}`);
      }
    });

    // Check for duplicates and merge
    const seen = new Map();
    const dedupedItems = [];
    items.forEach((item) => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) {
        const existing = seen.get(key);
        existing.quantity += item.quantity;
        existing.totalPrice = existing.quantity * existing.unitPrice;
        newErrors.push(`Duplicate item "${item.name}" - quantities merged`);
      } else {
        seen.set(key, item);
        dedupedItems.push(item);
      }
    });

    setErrors(newErrors);
    return dedupedItems;
  };

  // Remove item from preview
  const handleRemoveItem = (index) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
    showInfo('Item removed');
  };

  // Import items into estimate
  const handleImportToEstimate = () => {
    if (parsedItems.length === 0) {
      showError('No items to import');
      return;
    }

    onImport(parsedItems);
    showSuccess(`Imported ${parsedItems.length} items to estimate`);
    onClose();
  };

  // Clear all data
  const handleClear = () => {
    setParsedItems([]);
    setCartText('');
    setErrors([]);
    showInfo('Cleared import data');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-800/50 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-white">Import Cart Materials</h2>
              <p className="text-sm text-slate-400">Import from CSV or pasted cart text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Import Mode Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setImportMode('csv')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                importMode === 'csv'
                  ? 'bg-primary text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              CSV File
            </button>
            <button
              onClick={() => setImportMode('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                importMode === 'text'
                  ? 'bg-primary text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Text
            </button>
          </div>

          {/* CSV Upload Mode */}
          {importMode === 'csv' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Upload CSV File</p>
                    <p className="text-sm text-slate-400">
                      Expected columns: name, quantity, price
                    </p>
                  </div>
                </label>
              </div>

              {/* Example CSV format */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Example CSV format:</p>
                <pre className="text-xs text-slate-300 font-mono">
name,quantity,price,sku{'\n'}
2x4x8 Lumber,10,5.98,SKU123{'\n'}
Paint Gallon,5,32.99,SKU456{'\n'}
Drywall Sheet,20,12.50,SKU789
                </pre>
              </div>
            </motion.div>
          )}

          {/* Text Paste Mode */}
          {importMode === 'text' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paste Cart Text
                </label>
                <textarea
                  value={cartText}
                  onChange={(e) => setCartText(e.target.value)}
                  placeholder="Paste your cart text here (from Home Depot, Lowe's, etc.)&#10;&#10;Example:&#10;2x4x8 Lumber    Qty: 10    $5.98 each    Total: $59.80&#10;Paint Gallon | 5 | $32.99 | $164.95"
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm"
                  disabled={isProcessing}
                />
              </div>
              <button
                onClick={handleTextImport}
                disabled={isProcessing || !cartText.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5" />
                Parse Cart Text
              </button>
            </motion.div>
          )}

          {/* Errors Display */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-red-400 font-semibold">Parsing Issues</h3>
              </div>
              <ul className="space-y-1 text-sm text-red-300">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Preview Table */}
          {parsedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Preview ({parsedItems.length} items)
                </h3>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Item Name</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {parsedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">
                          {item.name}
                          {item.sku && (
                            <span className="text-xs text-slate-500 ml-2">({item.sku})</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-slate-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-300">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-white font-semibold">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-800/50 border-t border-slate-700">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right text-sm font-semibold text-white">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-primary">
                        ${parsedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImportToEstimate}
            disabled={parsedItems.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            Import {parsedItems.length > 0 && `(${parsedItems.length})`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

