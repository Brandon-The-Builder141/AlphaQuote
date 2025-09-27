/**
 * Receipt Text Parser
 * Extracts structured data from raw receipt text using pattern matching
 */

// Vendor patterns for recognition
const VENDOR_PATTERNS = [
  { name: 'Home Depot', patterns: ['home depot', 'homedepot', 'the home depot'] },
  { name: "Lowe's", patterns: ["lowe's", 'lowes', 'lowes home improvement'] },
  { name: 'Menards', patterns: ['menards', 'menard'] },
  { name: 'Ace Hardware', patterns: ['ace hardware', 'acehardware', 'ace'] },
  { name: 'Walmart', patterns: ['walmart', 'wal-mart', 'wal mart'] },
  { name: 'Target', patterns: ['target', 'target store'] },
  { name: 'Costco', patterns: ['costco', 'costco wholesale'] },
  { name: 'Harbor Freight', patterns: ['harbor freight', 'harbor freight tools'] },
  { name: 'Northern Tool', patterns: ['northern tool', 'northern tool & equipment'] },
  { name: 'True Value', patterns: ['true value', 'truevalue'] },
  { name: 'Do It Best', patterns: ['do it best', 'doitbest'] },
  { name: 'Local Supply Co', patterns: ['local supply', 'supply co', 'lumber yard'] }
];

// Date patterns for extraction
const DATE_PATTERNS = [
  // MM/DD/YYYY or MM-DD-YYYY
  /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
  // Month DD, YYYY
  /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
  // DD Month YYYY
  /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
  // YYYY-MM-DD
  /(\d{4})-(\d{1,2})-(\d{1,2})/
];

// Month name to number mapping
const MONTH_NAMES = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12'
};

/**
 * Extract vendor name from receipt text
 * @param {string} text - Raw receipt text
 * @returns {string} - Vendor name or "Unknown Vendor"
 */
function extractVendor(text) {
  const lowerText = text.toLowerCase();

  for (const vendor of VENDOR_PATTERNS) {
    for (const pattern of vendor.patterns) {
      if (lowerText.includes(pattern)) {
        return vendor.name;
      }
    }
  }

  return 'Unknown Vendor';
}

/**
 * Extract purchase date from receipt text
 * @param {string} text - Raw receipt text
 * @returns {string|null} - Date in YYYY-MM-DD format or null
 */
function extractPurchaseDate(text) {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      try {
        if (pattern === DATE_PATTERNS[0]) {
          // MM/DD/YYYY or MM-DD-YYYY
          const [, month, day, year] = match;
          const fullYear = year.length === 2 ? `20${year}` : year;
          return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (pattern === DATE_PATTERNS[1]) {
          // Month DD, YYYY
          const [, monthName, day, year] = match;
          const month = MONTH_NAMES[monthName.toLowerCase()];
          return `${year}-${month}-${day.padStart(2, '0')}`;
        } else if (pattern === DATE_PATTERNS[2]) {
          // DD Month YYYY
          const [, day, monthName, year] = match;
          const month = MONTH_NAMES[monthName.toLowerCase()];
          return `${year}-${month}-${day.padStart(2, '0')}`;
        } else if (pattern === DATE_PATTERNS[3]) {
          // YYYY-MM-DD (already in correct format)
          return match[0];
        }
      } catch (error) {
        console.warn('Date parsing error:', error);
        continue;
      }
    }
  }

  // Default to today's date if no date found
  return new Date().toISOString().split('T')[0];
}

/**
 * Extract line items from receipt text
 * @param {string} text - Raw receipt text
 * @returns {Array} - Array of item objects
 */
function extractLineItems(text) {
  const items = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  for (const line of lines) {
    // Skip lines that are clearly not items (totals, taxes, etc.)
    if (isNonItemLine(line)) continue;

    // Pattern 1: "Item Name Quantity @ $Price" or "Item Name Qty @ $Price"
    const pattern1 = /^(.+?)\s+(\d+(?:\.\d+)?)\s*@\s*\$?(\d+(?:\.\d+)?)$/i;
    const match1 = line.match(pattern1);
    if (match1) {
      const [, name, quantity, unitPrice] = match1;
      const item = {
        name: cleanItemName(name.trim()),
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice)
      };

      if (isValidItem(item)) {
        items.push(item);
      }
      continue;
    }

    // Pattern 2: "Item Name $Total" (quantity = 1)
    const pattern2 = /^(.+?)\s+\$?(\d+(?:\.\d+)?)$/;
    const match2 = line.match(pattern2);
    if (match2) {
      const [, name, total] = match2;

      // Skip if it looks like a total line
      if (isTotalLine(name.toLowerCase())) continue;

      const item = {
        name: cleanItemName(name.trim()),
        quantity: 1,
        unitPrice: parseFloat(total)
      };

      if (isValidItem(item)) {
        items.push(item);
      }
      continue;
    }

    // Pattern 3: "Quantity Item Name $Price" (less common)
    const pattern3 = /^(\d+(?:\.\d+)?)\s+(.+?)\s+\$?(\d+(?:\.\d+)?)$/i;
    const match3 = line.match(pattern3);
    if (match3) {
      const [, quantity, name, unitPrice] = match3;
      const item = {
        name: cleanItemName(name.trim()),
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice)
      };

      if (isValidItem(item)) {
        items.push(item);
      }
      continue;
    }

    // Pattern 4: Look for lines with just a price (try to extract item name from context)
    const priceOnlyPattern = /^\$?(\d+(?:\.\d+)?)$/;
    const priceMatch = line.match(priceOnlyPattern);
    if (priceMatch && items.length > 0) {
      // This might be a price for the previous item
      const price = parseFloat(priceMatch[1]);
      if (price > 0 && price < 10000) {
        const lastItem = items[items.length - 1];
        if (lastItem && !lastItem.unitPrice) {
          lastItem.unitPrice = price;
        }
      }
    }
  }

  return items;
}

/**
 * Extract total amount from receipt text
 * @param {string} text - Raw receipt text
 * @returns {number} - Total amount or 0
 */
function extractTotal(text) {
  const totalPatterns = [
    /total[:\s]+\$?(\d+(?:\.\d+)?)/i,
    /amount[:\s]+\$?(\d+(?:\.\d+)?)/i,
    /grand total[:\s]+\$?(\d+(?:\.\d+)?)/i,
    /final total[:\s]+\$?(\d+(?:\.\d+)?)/i,
    /subtotal[:\s]+\$?(\d+(?:\.\d+)?)/i,
    /balance[:\s]+\$?(\d+(?:\.\d+)?)/i
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (amount > 0 && amount < 100000) {
        return amount;
      }
    }
  }

  // If no total found, try to sum the items
  const items = extractLineItems(text);
  const calculatedTotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);

  return calculatedTotal > 0 ? calculatedTotal : 0;
}

/**
 * Check if a line is clearly not an item (totals, taxes, etc.)
 * @param {string} line - Line to check
 * @returns {boolean} - True if line should be skipped
 */
function isNonItemLine(line) {
  const lowerLine = line.toLowerCase();

  const skipPatterns = [
    /^total/i,
    /^subtotal/i,
    /^tax/i,
    /^discount/i,
    /^coupon/i,
    /^receipt/i,
    /^thank you/i,
    /^store/i,
    /^phone/i,
    /^address/i,
    /^date/i,
    /^time/i,
    /^cashier/i,
    /^register/i,
    /^transaction/i,
    /^card/i,
    /^cash/i,
    /^change/i,
    /^balance/i,
    /^amount/i,
    /^grand total/i,
    /^final total/i
  ];

  return skipPatterns.some(pattern => pattern.test(lowerLine));
}

/**
 * Check if a line looks like a total line
 * @param {string} line - Line to check
 * @returns {boolean} - True if line looks like a total
 */
function isTotalLine(line) {
  const totalKeywords = ['total', 'subtotal', 'amount', 'balance', 'due', 'paid'];
  return totalKeywords.some(keyword => line.includes(keyword));
}

/**
 * Clean and normalize item name
 * @param {string} name - Raw item name
 * @returns {string} - Cleaned item name
 */
function cleanItemName(name) {
  return name
    .replace(/^\d+[x×]\s*/, '') // Remove leading quantity like "2x "
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-&().]/g, '') // Remove special characters except common ones
    .trim();
}

/**
 * Validate if an extracted item is reasonable
 * @param {Object} item - Item object to validate
 * @returns {boolean} - True if item is valid
 */
function isValidItem(item) {
  return (
    item.name &&
    item.name.length >= 2 &&
    item.name.length <= 100 &&
    item.quantity > 0 &&
    item.quantity <= 1000 &&
    item.unitPrice > 0 &&
    item.unitPrice < 10000
  );
}

/**
 * Main parsing function
 * @param {string} receiptText - Raw receipt text from OCR
 * @returns {Object} - Parsed receipt data
 */
export function parseReceiptText(receiptText) {
  if (!receiptText || typeof receiptText !== 'string') {
    return {
      vendor: 'Unknown Vendor',
      purchaseDate: new Date().toISOString().split('T')[0],
      items: [],
      total: 0,
      errors: ['Invalid receipt text provided']
    };
  }

  try {
    const vendor = extractVendor(receiptText);
    const purchaseDate = extractPurchaseDate(receiptText);
    const items = extractLineItems(receiptText);
    const total = extractTotal(receiptText);

    const result = {
      vendor,
      purchaseDate,
      items,
      total: parseFloat(total.toFixed(2)),
      rawText: receiptText,
      parsedAt: new Date().toISOString(),
      confidence: calculateConfidence(vendor, items, total)
    };

    return result;
  } catch (error) {
    console.error('Receipt parsing error:', error);
    return {
      vendor: 'Unknown Vendor',
      purchaseDate: new Date().toISOString().split('T')[0],
      items: [],
      total: 0,
      errors: [`Parsing error: ${error.message}`],
      rawText: receiptText
    };
  }
}

/**
 * Calculate parsing confidence score
 * @param {string} vendor - Extracted vendor name
 * @param {Array} items - Extracted items
 * @param {number} total - Extracted total
 * @returns {number} - Confidence score 0-100
 */
function calculateConfidence(vendor, items, total) {
  let confidence = 0;

  // Vendor confidence (30 points)
  if (vendor !== 'Unknown Vendor') {
    confidence += 30;
  }

  // Items confidence (50 points)
  if (items.length > 0) {
    confidence += Math.min(50, items.length * 10);
  }

  // Total confidence (20 points)
  if (total > 0) {
    confidence += 20;
  }

  return Math.min(100, confidence);
}

/**
 * Parse receipt text with enhanced error handling
 * @param {string} receiptText - Raw receipt text
 * @param {Object} options - Parsing options
 * @returns {Object} - Enhanced parsing result
 */
export function parseReceiptTextAdvanced(receiptText, options = {}) {
  const {
    strictMode = false,
    includeRawText = true,
    maxItems = 50
  } = options;

  const basicResult = parseReceiptText(receiptText);

  // Apply strict mode filtering
  if (strictMode) {
    basicResult.items = basicResult.items.filter(item =>
      item.name.length >= 3 &&
      item.unitPrice >= 0.01
    );
  }

  // Limit number of items
  if (basicResult.items.length > maxItems) {
    basicResult.items = basicResult.items.slice(0, maxItems);
    basicResult.warnings = basicResult.warnings || [];
    basicResult.warnings.push(`Limited to ${maxItems} items`);
  }

  // Remove raw text if not requested
  if (!includeRawText) {
    delete basicResult.rawText;
  }

  return basicResult;
}

const receiptParser = {
  parseReceiptText,
  parseReceiptTextAdvanced,
  extractVendor,
  extractPurchaseDate,
  extractLineItems,
  extractTotal
};

export default receiptParser;
