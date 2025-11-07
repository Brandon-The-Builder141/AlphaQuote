/**
 * Paste Cart Input Component
 * Text area for pasting cart text and parsing materials
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardPaste, Check, X } from 'lucide-react';
import { showSuccess, showError } from '../utils/toastService';

export default function PasteCartInput({ onImport, onStepComplete }) {
  const [cartText, setCartText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Universal cart parser (works with Home Depot, Lowe's, and more)
  const parseCartText = (text) => {
    const items = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    console.log('Parsing cart text, total lines:', lines.length);

    // Skip phrases (won't use these as product names)
    const skipInName = [
      /^details$/i,
      /^save for later$/i,
      /^item #/i,
      /^model #/i,
      /^quantity$/i,
      /^pickup$/i,
      /^at /i,
      /^delivery to$/i,
      /^check out/i,
      /^ladder rating:/i,
      /^nominal product/i,
      /^color\/finish:/i,
      /^screw length:/i,
      /^size:/i,
      /^package quantity:/i,
      /^product length/i,
      /^product weight/i,
      /^joist hanger size:/i,
      /^approximate length/i,
      /^pickup at/i,
      /^delivering to/i,
      /^check nearby/i,
      /^get it delivered/i,
      /^schedule your/i,
      /^get bulk pricing/i,
      /^save \d+%/i,
      /^\(.*\/item\)$/,
      /^your delivery cost/i,
      /^this cost covers/i,
      /^product$/i
    ];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Look for "Quantity" keyword (Lowe's format) or standalone number (Home Depot format)
      if (line.toLowerCase() === 'quantity') {
        // Lowe's format: "Quantity" followed by number on next line
        if (i + 1 < lines.length && /^\d+$/.test(lines[i + 1])) {
          const quantity = parseInt(lines[i + 1]);

          // Look back for product name (should be within previous 5 lines)
          let productName = null;
          for (let k = Math.max(0, i - 5); k < i; k++) {
            const prevLine = lines[k];
            if (prevLine.length > 15 &&
                !skipInName.some(pattern => pattern.test(prevLine)) &&
                !/^[\d\s\$\-#]+$/.test(prevLine)) {
              productName = prevLine;
              break; // Take the first good product name we find
            }
          }

          // Look ahead for price - find both unit price and total
          let unitPrice = null;
          let totalPrice = null;

          for (let k = i + 2; k < Math.min(i + 15, lines.length); k++) {
            const line = lines[k];

            // Match "$XX.XX/ea" (per-item price)
            const perItemMatch = line.match(/^\$?([\d,]+\.\d{2})\/ea$/i);
            if (perItemMatch && !unitPrice) {
              unitPrice = parseFloat(perItemMatch[1].replace(/,/g, ''));
              console.log('Found Lowe\'s per-item price:', unitPrice);
              continue;
            }

            // Match standalone "$XX.XX" (might be total)
            const priceMatch = line.match(/^\$?([\d,]+\.\d{2})$/);
            if (priceMatch && !line.includes('/')) {
              const foundPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
              if (foundPrice > 0 && foundPrice < 50000) {
                // If we have unit price, this is the total
                if (unitPrice && !totalPrice) {
                  totalPrice = foundPrice;
                } else if (!unitPrice) {
                  // First price found - might be unit or total
                  unitPrice = foundPrice;
                }
              }
            }
          }

          // Calculate missing value
          if (unitPrice && !totalPrice) {
            totalPrice = quantity * unitPrice;
          } else if (totalPrice && !unitPrice && quantity > 0) {
            unitPrice = totalPrice / quantity;
          }

          if (productName && unitPrice) {
            items.push({
              name: productName,
              quantity,
              unitPrice,
              totalPrice: totalPrice || (quantity * unitPrice)
            });
            console.log('Found (Lowe\'s):', productName, 'Qty:', quantity, 'Unit:', unitPrice, 'Total:', totalPrice || (quantity * unitPrice));
          }
        }
      }
      else if (/^\d+$/.test(line)) {
        // Home Depot format: standalone number is quantity
        const quantity = parseInt(line);

        // Skip if this looks like an item number or model number
        if (i > 0 && /item|model/i.test(lines[i - 1])) {
          i++;
          continue;
        }

        // Look ahead for product name (1-2 lines with substantial text)
        const nameLines = [];
        let j = i + 1;

        while (j < lines.length && nameLines.length < 2) {
          const nextLine = lines[j];

          // Stop at price
          if (/^\$[\d,]+\.?\d*$/.test(nextLine)) {
            break;
          }

          // Stop at another standalone number (next item)
          if (/^\d+$/.test(nextLine) && j > i + 2) {
            break;
          }

          // Add substantial lines that aren't attributes
          if (nextLine.length > 10 &&
              !skipInName.some(pattern => pattern.test(nextLine)) &&
              !/^\$/.test(nextLine) &&
              !/^[\d\s\-#]+$/.test(nextLine)) {
            nameLines.push(nextLine);
          }

          j++;
        }

        // Look for price - prioritize per-item price over total
        let unitPrice = null;
        let totalPrice = null;

        for (let k = j; k < Math.min(j + 15, lines.length); k++) {
          const line = lines[k];

          // Look for per-item price: ($X.XX/item) or ($X.XX/ea)
          const perItemMatch = line.match(/\(\$?([\d,]+\.?\d*)\s*\/\s*(?:item|ea)\)/i);
          if (perItemMatch && !unitPrice) {
            unitPrice = parseFloat(perItemMatch[1].replace(/,/g, ''));
            console.log('Found per-item price:', unitPrice);
          }

          // Look for standalone price (might be total or unit)
          const priceMatch = line.match(/^\$?([\d,]+\.\d{2})$/);
          if (priceMatch) {
            const foundPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
            if (foundPrice > 0 && foundPrice < 50000) {
              // If we already have a unit price, this is probably the total
              if (unitPrice) {
                totalPrice = foundPrice;
              } else {
                // Otherwise, use this as unit price for now
                if (!unitPrice) {
                  unitPrice = foundPrice;
                }
              }
            }
          }
        }

        // Calculate total if we have unit price but not total
        if (unitPrice && !totalPrice) {
          totalPrice = quantity * unitPrice;
        }

        // If we only have total, calculate unit price
        if (totalPrice && !unitPrice && quantity > 0) {
          unitPrice = totalPrice / quantity;
        }

        if (nameLines.length > 0 && unitPrice) {
          const name = nameLines.join(' ').replace(/\s+/g, ' ').trim();
          items.push({
            name,
            quantity,
            unitPrice,
            totalPrice: totalPrice || (quantity * unitPrice)
          });
          console.log('Found (Home Depot):', name, 'Qty:', quantity, 'Unit:', unitPrice, 'Total:', totalPrice || (quantity * unitPrice));
        }
      }

      i++;
    }

    console.log('Total items found:', items.length);

    // Remove duplicates
    const itemMap = new Map();
    items.forEach(item => {
      const key = item.name.toLowerCase();
      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        existing.quantity += item.quantity;
        existing.totalPrice = existing.quantity * existing.unitPrice;
      } else {
        itemMap.set(key, item);
      }
    });

    return Array.from(itemMap.values());
  };

  // Handle import
  const handleImport = () => {
    if (!cartText.trim()) {
      showError('Please paste cart text to import');
      return;
    }

    setIsProcessing(true);

    try {
      const items = parseCartText(cartText);

      if (items.length === 0) {
        console.log('Raw cart text:', cartText.substring(0, 500)); // Log first 500 chars
        showError('No valid items found. Try copying just the product lines with prices and quantities.');
        setIsProcessing(false);
        return;
      }

      setParsedItems(items);
      onStepComplete?.(3);
      showSuccess(`Parsed ${items.length} items from cart!`);
    } catch (error) {
      console.error('Parse error:', error);
      showError(`Error parsing cart: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and add to estimate
  const handleConfirmImport = () => {
    onImport(parsedItems);
    setCartText('');
    setParsedItems([]);
    showSuccess(`Imported ${parsedItems.length} items to estimate`);
  };

  // Remove item from preview
  const handleRemoveItem = (index) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Helpful Tip */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h5 className="text-sm font-semibold text-blue-400 mb-2">💡 How to Copy Your Cart:</h5>
        <ol className="text-xs text-slate-300 space-y-1 ml-4 list-decimal">
          <li>Go to your cart page (Home Depot, Lowe's, etc.)</li>
          <li>Select ALL the text on the page (Ctrl+A or Cmd+A)</li>
          <li>Copy it (Ctrl+C or Cmd+C)</li>
          <li>Paste it in the box below</li>
          <li>Click "Parse Cart Text"</li>
        </ol>
        <p className="text-xs text-slate-400 mt-2">
          ✓ Works with Home Depot, Lowe's, and most other retailers!
        </p>
      </div>

      {/* Text Area */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Paste Your Cart Text
        </label>
        <textarea
          value={cartText}
          onChange={(e) => setCartText(e.target.value)}
          placeholder="Paste all the text from your cart page here...&#10;&#10;The parser will automatically find:&#10;• Product names&#10;• Quantities&#10;• Prices&#10;&#10;Just Ctrl+A, Ctrl+C on the cart page, then paste here!"
          rows={10}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm"
          disabled={isProcessing || parsedItems.length > 0}
        />
      </div>

      {/* Parse Button */}
      {parsedItems.length === 0 && (
        <motion.button
          onClick={handleImport}
          disabled={isProcessing || !cartText.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ClipboardPaste className="w-5 h-5" />
          {isProcessing ? 'Parsing...' : 'Parse Cart Text'}
        </motion.button>
      )}

      {/* Preview Table */}
      {parsedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              Preview ({parsedItems.length} items)
            </h3>
          </div>

          {/* Helpful explanation */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-green-400">
              ✓ Parsed successfully! Each row shows: <strong>Qty × Unit Price = Total</strong>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Example: 24 items × $1.98 each = $47.52 total
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Name</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {parsedItems.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-300">
                      <span className="font-semibold text-primary">{item.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-300">
                      ${item.unitPrice.toFixed(2)}
                      <span className="text-xs text-slate-500 ml-1">ea</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-white font-semibold">
                      ${item.totalPrice.toFixed(2)}
                      <div className="text-xs text-slate-500 mt-0.5">
                        ({item.quantity} × ${item.unitPrice.toFixed(2)})
                      </div>
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

          {/* Confirm Import Button */}
          <div className="flex gap-3">
            <motion.button
              onClick={() => {
                setParsedItems([]);
                setCartText('');
              }}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Over
            </motion.button>
            <motion.button
              onClick={handleConfirmImport}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl font-semibold transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check className="w-5 h-5" />
              Import to Estimate
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

