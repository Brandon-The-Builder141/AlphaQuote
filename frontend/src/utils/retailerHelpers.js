/**
 * Retailer Helper Utilities
 * Detect retailers from URLs and provide specific instructions
 */

// Retailer configurations
export const RETAILERS = {
  homedepot: {
    id: 'homedepot',
    name: 'Home Depot',
    domain: 'homedepot.com',
    cartUrl: 'https://www.homedepot.com/mycart/home',
    color: '#F96302',
    icon: '🏬',
    instructions: [
      'Look for your cart items in the list',
      'Select all text on the page (Ctrl+A or Cmd+A)',
      'Copy the text (Ctrl+C or Cmd+C)',
      'Return to AlphaQuote and paste in Step 3'
    ],
    patterns: [
      /homedepot\.com/i
    ]
  },
  lowes: {
    id: 'lowes',
    name: "Lowe's",
    domain: 'lowes.com',
    cartUrl: 'https://www.lowes.com/cart',
    color: '#004990',
    icon: '🛒',
    instructions: [
      'Find your cart items on the page',
      'Select all the cart text (Ctrl+A or Cmd+A)',
      'Copy it (Ctrl+C or Cmd+C)',
      'Come back to AlphaQuote and paste in Step 3'
    ],
    patterns: [
      /lowes\.com/i
    ]
  },
  menards: {
    id: 'menards',
    name: 'Menards',
    domain: 'menards.com',
    cartUrl: 'https://www.menards.com/main/cart.html',
    color: '#FFD100',
    icon: '🏪',
    instructions: [
      'View your shopping cart',
      'Select all items and prices (Ctrl+A or Cmd+A)',
      'Copy the selection (Ctrl+C or Cmd+C)',
      'Return here and paste in Step 3'
    ],
    patterns: [
      /menards\.com/i
    ]
  },
  acehardware: {
    id: 'acehardware',
    name: 'Ace Hardware',
    domain: 'acehardware.com',
    cartUrl: 'https://www.acehardware.com/cart',
    color: '#CC0000',
    icon: '🔧',
    instructions: [
      'Open your cart page',
      'Select all cart content (Ctrl+A or Cmd+A)',
      'Copy the text (Ctrl+C or Cmd+C)',
      'Paste in AlphaQuote Step 3'
    ],
    patterns: [
      /acehardware\.com/i
    ]
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    domain: 'amazon.com',
    cartUrl: 'https://www.amazon.com/gp/cart/view.html',
    color: '#FF9900',
    icon: '📦',
    instructions: [
      'View your shopping cart',
      'Select all items (Ctrl+A or Cmd+A)',
      'Copy the selection (Ctrl+C or Cmd+C)',
      'Paste back in AlphaQuote Step 3'
    ],
    patterns: [
      /amazon\.com/i,
      /amzn\.to/i
    ]
  },
  generic: {
    id: 'generic',
    name: 'Generic Retailer',
    domain: '',
    cartUrl: '',
    color: '#6B7280',
    icon: '🛍️',
    instructions: [
      'Open the cart link in a new tab',
      'Find your items and prices on the page',
      'Select and copy all the cart text',
      'Return to AlphaQuote and paste in Step 3'
    ],
    patterns: []
  }
};

/**
 * Detect retailer from URL
 */
export const detectRetailer = (url) => {
  if (!url) return RETAILERS.generic;

  const lowerUrl = url.toLowerCase();

  for (const retailer of Object.values(RETAILERS)) {
    if (retailer.patterns) {
      for (const pattern of retailer.patterns) {
        if (pattern.test(lowerUrl)) {
          return retailer;
        }
      }
    }
  }

  return RETAILERS.generic;
};

/**
 * Validate URL format
 */
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Check if URL is likely a cart link
 */
export const isCartUrl = (url) => {
  const cartKeywords = ['cart', 'mycart', 'basket', 'bag', 'checkout'];
  const lowerUrl = url.toLowerCase();
  return cartKeywords.some(keyword => lowerUrl.includes(keyword));
};

/**
 * Generate bookmarklet code for extracting cart data
 */
export const generateBookmarklet = () => {
  // This bookmarklet will run on any retailer page and try to extract cart data
  const code = `
javascript:(function(){
  try {
    let items = [];
    
    // Try to find cart items in common HTML structures
    const cartSelectors = [
      '.cart-item',
      '[data-cart-item]',
      '.line-item',
      '[class*="cart"]',
      '[class*="item"]'
    ];
    
    let foundElements = null;
    for (let selector of cartSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundElements = elements;
        break;
      }
    }
    
    if (!foundElements) {
      // Fallback: just get all text from main/body
      const text = document.body.innerText;
      // Copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('Cart data copied! Go back to AlphaQuote and paste it.');
      });
      return;
    }
    
    // Try to extract structured data
    foundElements.forEach(el => {
      const text = el.innerText;
      const priceMatch = text.match(/\\$?([\\d,]+\\.\\d{2})/);
      const qtyMatch = text.match(/qty:?\\s*(\\d+)|quantity:?\\s*(\\d+)/i);
      
      items.push({
        text: text.trim(),
        hasPrice: !!priceMatch,
        hasQty: !!qtyMatch
      });
    });
    
    // Format as text and copy
    const formattedText = items.map(item => item.text).join('\\n');
    navigator.clipboard.writeText(formattedText).then(() => {
      alert('Found ' + items.length + ' items! Data copied to clipboard.\\n\\nGo back to AlphaQuote and paste it in Step 3.');
    }).catch(() => {
      // Fallback if clipboard API fails
      const textarea = document.createElement('textarea');
      textarea.value = formattedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Cart data copied! Go back to AlphaQuote and paste it.');
    });
  } catch (err) {
    alert('Error extracting cart data: ' + err.message + '\\n\\nTry manually selecting and copying the cart items instead.');
  }
})();
`;

  return code.replace(/\s+/g, ' ').trim();
};

/**
 * Get list of all supported retailers
 */
export const getSupportedRetailers = () => {
  return Object.values(RETAILERS).filter(r => r.id !== 'generic');
};

