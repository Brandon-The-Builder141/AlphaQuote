/**
 * Enhanced Receipt Parser Utility
 * Provides improved parsing logic for receipt text extracted via OCR
 */

export const parseReceiptText = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      vendor: 'Unknown Vendor',
      purchaseDate: null,
      items: [],
      total: 0,
      confidence: 0,
      errors: ['No text provided for parsing'],
      warnings: []
    };
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const errors = [];
  const warnings = [];

  // Parse vendor name
  const vendor = extractVendorName(lines);

  // Parse purchase date
  const purchaseDate = extractPurchaseDate(text);

  // Parse items
  const items = extractItems(lines);

  // Parse total amount
  const total = extractTotalAmount(text, items);

  // Calculate confidence score
  const confidence = calculateConfidence(vendor, purchaseDate, items, total);

  return {
    vendor,
    purchaseDate,
    items,
    total,
    confidence,
    errors,
    warnings
  };
};

const extractVendorName = (lines) => {
  // Common store name patterns
  const storePatterns = [
    /home\s*depot/i,
    /lowes/i,
    /menards/i,
    /ace\s*hardware/i,
    /true\s*value/i,
    /walmart/i,
    /target/i,
    /costco/i,
    /sams\s*club/i,
    /kroger/i,
    /safeway/i
  ];

  // Look for store names in first few lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i];

    // Check for known store patterns
    for (const pattern of storePatterns) {
      if (pattern.test(line)) {
        return formatVendorName(line);
      }
    }

    // If line looks like a store name (contains common store words)
    if (/store|shop|market|center|depot|hardware|lumber|supply/i.test(line) && line.length < 50) {
      return formatVendorName(line);
    }
  }

  // Fallback to first line if it's not too long
  if (lines.length > 0 && lines[0].length < 50) {
    return formatVendorName(lines[0]);
  }

  return 'Unknown Vendor';
};

const formatVendorName = (name) => {
  return name
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const extractPurchaseDate = (text) => {
  // Date patterns to look for
  const datePatterns = [
    /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/g, // MM/DD/YYYY or MM-DD-YYYY
    /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/g, // YYYY/MM/DD or YYYY-MM-DD
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})/gi // DD Mon YYYY
  ];

  const monthNames = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  for (const pattern of datePatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];

      try {
        let month, day, year;

        if (pattern.source.includes('jan|feb')) {
          // Month name format
          day = match[1].padStart(2, '0');
          month = monthNames[match[2].toLowerCase()];
          year = match[3].length === 2 ? `20${match[3]}` : match[3];
        } else {
          // Numeric format
          if (pattern.source.startsWith('(\\d{4})')) {
            // YYYY/MM/DD format
            year = match[1];
            month = match[2].padStart(2, '0');
            day = match[3].padStart(2, '0');
          } else {
            // MM/DD/YYYY format
            month = match[1].padStart(2, '0');
            day = match[2].padStart(2, '0');
            year = match[3].length === 2 ? `20${match[3]}` : match[3];
          }
        }

        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime()) && date.getFullYear() > 2020 && date.getFullYear() < 2030) {
          return `${year}-${month}-${day}`;
        }
      } catch (error) {
        // Continue to next pattern
      }
    }
  }

  return null;
};

const extractItems = (lines) => {
  const items = [];

  // Patterns for item lines
  const itemPatterns = [
    // Pattern: Item Name $XX.XX
    /^(.+?)\s+\$(\d+\.?\d*)$/,
    // Pattern: Item Name XX.XX
    /^(.+?)\s+(\d+\.?\d*)$/,
    // Pattern: Qty Item Name $XX.XX
    /^(\d+)\s+(.+?)\s+\$(\d+\.?\d*)$/,
    // Pattern: Item Name @ $XX.XX
    /^(.+?)\s+@\s+\$(\d+\.?\d*)$/
  ];

  for (const line of lines) {
    // Skip lines that are clearly not items
    if (isNonItemLine(line)) continue;

    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        let name, price;

        if (pattern.source.includes('(\\d+)\\s+(.+?)')) {
          // Quantity pattern
          name = match[2].trim();
          price = parseFloat(match[3]);
        } else {
          // Regular pattern
          name = match[1].trim();
          price = parseFloat(match[2]);
        }

        // Validate the item
        if (name.length > 2 && price > 0 && price < 10000) {
          items.push({
            name: cleanItemName(name),
            unitPrice: price,
            quantity: 1
          });
        }
        break;
      }
    }
  }

  return items;
};

const isNonItemLine = (line) => {
  const nonItemPatterns = [
    /total|subtotal|tax|discount|change|cash|credit|debit/i,
    /thank\s*you|receipt|invoice|order/i,
    /store|address|phone|hours/i,
    /^[\d\s\-()]+$/, // Only numbers, spaces, dashes, parentheses
    /^\$?\d+\.?\d*$/, // Only price
    /^[a-z\s]+$/i && line.length < 3 // Very short text
  ];

  return nonItemPatterns.some(pattern => pattern.test(line));
};

const cleanItemName = (name) => {
  return name
    .replace(/^\d+\s*/, '') // Remove leading numbers
    .replace(/\s*\$\d+\.?\d*\s*$/, '') // Remove trailing prices
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

const extractTotalAmount = (text, items) => {
  // Look for total patterns
  const totalPatterns = [
    /total[:\s]+\$?(\d+\.?\d*)/i,
    /amount[:\s]+\$?(\d+\.?\d*)/i,
    /grand\s*total[:\s]+\$?(\d+\.?\d*)/i,
    /final\s*total[:\s]+\$?(\d+\.?\d*)/i
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

  // Fallback: sum up items if no total found
  if (items.length > 0) {
    const itemTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    if (itemTotal > 0) {
      return itemTotal;
    }
  }

  // Look for any price at the end of the text
  const endPrices = text.match(/\$(\d+\.?\d*)\s*$/);
  if (endPrices) {
    return parseFloat(endPrices[1]);
  }

  return 0;
};

const calculateConfidence = (vendor, purchaseDate, items, total) => {
  let confidence = 0;

  // Vendor confidence (30 points max)
  if (vendor && vendor !== 'Unknown Vendor') {
    confidence += 20;
    if (vendor.length > 5 && vendor.length < 50) {
      confidence += 10;
    }
  }

  // Date confidence (25 points max)
  if (purchaseDate) {
    confidence += 25;
  }

  // Items confidence (30 points max)
  if (items.length > 0) {
    confidence += Math.min(items.length * 5, 20);
    if (items.some(item => item.name.length > 3)) {
      confidence += 10;
    }
  }

  // Total confidence (15 points max)
  if (total > 0) {
    confidence += 15;
  }

  return Math.min(confidence, 100);
};

const receiptParserUtils = {
  parseReceiptText,
  extractVendorName,
  extractPurchaseDate,
  extractItems,
  extractTotalAmount
};

export default receiptParserUtils;
