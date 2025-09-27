/**
 * Custom Pricing Utility Functions
 * Handles custom material pricing for local vendors
 */

/**
 * Get custom material price if available
 * @param {string} materialName - The material to look up
 * @param {Array} customMaterials - Array of custom materials from profile
 * @returns {Object|null} - Material pricing object or null if not found
 */
export const getCustomMaterialPrice = (materialName, customMaterials = []) => {
  if (!materialName || !customMaterials || customMaterials.length === 0) {
    return null;
  }

  // Normalize material name for comparison (lowercase, remove special chars)
  const normalizeName = (name) =>
    name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const normalizedSearch = normalizeName(materialName);

  // Find exact match first
  let material = customMaterials.find(m =>
    normalizeName(m.name) === normalizedSearch
  );

  // If no exact match, try partial match
  if (!material) {
    material = customMaterials.find(m =>
      normalizeName(m.name).includes(normalizedSearch) ||
      normalizedSearch.includes(normalizeName(m.name))
    );
  }

  if (material && material.name && material.price) {
    return {
      name: material.name,
      price: parseFloat(material.price) || 0,
      unit: material.unit || 'per sq ft',
      source: 'custom'
    };
  }

  return null;
};

/**
 * Get all custom materials for a vendor
 * @param {Array} customMaterials - Array of custom materials from profile
 * @returns {Array} - Array of formatted custom materials
 */
export const getAllCustomMaterials = (customMaterials = []) => {
  return customMaterials
    .filter(m => m.name && m.price)
    .map(m => ({
      name: m.name,
      price: parseFloat(m.price) || 0,
      unit: m.unit || 'per sq ft',
      source: 'custom'
    }));
};

/**
 * Check if user has custom pricing enabled
 * @param {Object} profile - User profile object
 * @returns {boolean} - True if custom pricing is enabled
 */
export const isCustomPricingEnabled = (profile) => {
  return profile &&
         profile.preferredVendor === 'custom' &&
         profile.useCustomPricing === true &&
         profile.customMaterials &&
         profile.customMaterials.length > 0;
};

/**
 * Get pricing suggestion text for custom materials
 * @param {string} materialName - The material to look up
 * @param {Array} customMaterials - Array of custom materials from profile
 * @returns {string|null} - Pricing suggestion text or null
 */
export const getCustomPricingSuggestion = (materialName, customMaterials = []) => {
  const customPrice = getCustomMaterialPrice(materialName, customMaterials);

  if (customPrice) {
    return `Custom pricing: $${customPrice.price.toFixed(2)} ${customPrice.unit}`;
  }

  return null;
};

/**
 * Format custom material for display
 * @param {Object} material - Custom material object
 * @returns {string} - Formatted string
 */
export const formatCustomMaterial = (material) => {
  if (!material || !material.name || !material.price) {
    return '';
  }

  return `${material.name}: $${parseFloat(material.price).toFixed(2)} ${material.unit || 'per sq ft'}`;
};

const customPricing = {
  getCustomMaterialPrice,
  getAllCustomMaterials,
  isCustomPricingEnabled,
  getCustomPricingSuggestion,
  formatCustomMaterial
};

export default customPricing;
