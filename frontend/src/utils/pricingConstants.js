/**
 * Static Pricing Constants
 * All pricing data is deterministic and consistent across the application
 *
 * IMPORTANT: These values are static and will always produce the same results
 * for the same inputs. Do not add random values or timestamps.
 */

// Labor Rates ($/hour) — Pass Five (Iron Legion tailoring):
// SOLO is one man on the tools, CREW is a two-person crew. DEFAULT is
// the solo rate; it is what the estimate calculator falls back to.
// Mirrors backend/config/pricingDefaults.js.
export const LABOR_RATES = {
  SOLO: 60.00,
  CREW: 90.00,
  DEFAULT: 60.00,
  SKILLED: 90.00,
  BASIC: 60.00
};

// Iron Legion service catalog — the only trades offered. Iron Legion
// does NOT do plumbing or electrical work.
export const SERVICE_CATEGORIES = [
  'Siding',
  'Fencing',
  'Decking',
  'Framing',
  'Landscaping',
  'Flooring'
];

// Iron Legion pricing defaults (editable in the app; these are the
// starting values from the Iron Legion pricing sheet, Oct 2026).
export const MATERIAL_MARKUP_PERCENT = 15; // materials at cost + 15%
export const OVERHEAD_MARGIN_PERCENT = 10; // margin on the subtotal
export const MINIMUM_JOB_AMOUNT = 350; // quotes below this get a warning
export const QUOTE_VALIDITY_DAYS = 14;

// Customer-facing terms printed on quotes (PDF + email footers).
// Mirrors QUOTE_TERMS in backend/config/pricingDefaults.js.
export const QUOTE_TERMS = [
  `This quote is valid for ${QUOTE_VALIDITY_DAYS} days from the date above.`,
  'Deposit: 30\u201350% of materials due up front. Balance due on completion.',
  'Damage or rot found during demolition will be shown to the customer and agreed before any repair work begins. Repairs are billed as time & materials.',
  'Iron Legion does not perform plumbing or electrical work.'
];

// Material Cost Multipliers (per sqft)
export const MATERIAL_COSTS = {
  // Flooring
  LUXURY_VINYL: 4.50,
  LAMINATE: 3.25,
  HARDWOOD: 8.75,
  TILE: 6.50,
  CARPET: 3.00,

  // Paint
  INTERIOR_PAINT: 0.75,
  EXTERIOR_PAINT: 1.25,
  PRIMER: 0.50,

  // Drywall
  DRYWALL: 1.50,
  TAPE_MUD: 0.75,

  // Default fallback
  DEFAULT: 5.00
};

// Add-on Service Costs (per sqft)
export const ADDON_COSTS = {
  DEMO: 0.50,
  TRIM: 0.75,
  PAINT: 1.00,
  DISPOSAL: 25.00,  // flat fee
  DELIVERY: 40.00   // flat fee
};

// Tax Rates by State (percentage)
export const TAX_RATES = {
  DEFAULT: 0.00,
  CA: 7.25,
  TX: 6.25,
  NY: 8.00,
  FL: 6.00,
  IL: 6.25
};

// Default Markup Percentage
export const DEFAULT_MARKUP = 15.00;

// Pricing tiers for different quality levels
export const PRICING_TIERS = {
  BUDGET: {
    multiplier: 0.75,
    label: 'Budget'
  },
  STANDARD: {
    multiplier: 1.00,
    label: 'Standard'
  },
  PREMIUM: {
    multiplier: 1.35,
    label: 'Premium'
  }
};

/**
 * Get labor rate by type
 * @param {string} type - 'default', 'skilled', or 'basic'
 * @returns {number} Labor rate in dollars per hour
 */
export const getLaborRate = (type = 'default') => {
  const key = type.toUpperCase();
  return LABOR_RATES[key] || LABOR_RATES.DEFAULT;
};

/**
 * Get material cost per square foot
 * @param {string} materialType - Type of material
 * @returns {number} Cost per square foot
 */
export const getMaterialCost = (materialType = 'default') => {
  const key = materialType.toUpperCase().replace(/\s+/g, '_');
  return MATERIAL_COSTS[key] || MATERIAL_COSTS.DEFAULT;
};

/**
 * Get addon cost
 * @param {string} addonType - Type of addon
 * @returns {number} Cost for addon
 */
export const getAddonCost = (addonType) => {
  const key = addonType.toUpperCase();
  return ADDON_COSTS[key] || 0;
};

/**
 * Get tax rate for state
 * @param {string} state - Two-letter state code
 * @returns {number} Tax rate as decimal (e.g., 0.0725 for 7.25%)
 */
export const getTaxRate = (state = 'DEFAULT') => {
  return (TAX_RATES[state.toUpperCase()] || TAX_RATES.DEFAULT) / 100;
};

export default {
  LABOR_RATES,
  MATERIAL_COSTS,
  ADDON_COSTS,
  TAX_RATES,
  DEFAULT_MARKUP,
  PRICING_TIERS,
  getLaborRate,
  getMaterialCost,
  getAddonCost,
  getTaxRate
};

