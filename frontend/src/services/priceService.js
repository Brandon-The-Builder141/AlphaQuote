/**
 * Price Service - Unified Price Lookup System
 * Implements manual price priority: Manual > Receipt Database > Scraped Data > Fallback
 */

import { getCustomMaterialPrice, isCustomPricingEnabled } from '../utils/customPricing';
import { getPricesByMaterial } from './receiptService';

/**
 * Get the best available price for a material using priority system
 * @param {string} materialName - The material to look up
 * @param {Object} profile - User profile with custom pricing data
 * @returns {Object} Price result with source and pricing info
 */
export const getMaterialPrice = async (materialName, profile = null) => {
  // console.log(`🔍 Looking up price for: ${materialName}`);

  // 1. Check custom manual pricing first (highest priority)
  if (profile && isCustomPricingEnabled(profile)) {
    const customPrice = getCustomMaterialPrice(materialName, profile.customMaterials);
    if (customPrice) {
      // console.log(`✅ Found custom manual price: $${customPrice.price} ${customPrice.unit}`);
      return {
        price: customPrice.price,
        unit: customPrice.unit,
        source: 'manual',
        materialName: customPrice.name,
        vendor: profile.vendorName || 'Custom Vendor',
        confidence: 'high',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 2. Check receipt database (manual prices from receipts)
  try {
    const receiptPrices = await getPricesByMaterial(materialName);
    if (receiptPrices && receiptPrices.length > 0) {
      // Get the latest price (most recent by updatedAt)
      const latestPrice = receiptPrices.sort((a, b) =>
        new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt)
      )[0];

      // console.log(`📄 Found receipt price: $${latestPrice.unitPrice} ${latestPrice.unitLabel}`);
      return {
        price: parseFloat(latestPrice.unitPrice),
        unit: latestPrice.unitLabel,
        source: 'receipt',
        materialName,
        vendor: latestPrice.vendor.name,
        confidence: 'high',
        timestamp: latestPrice.lastUpdated || latestPrice.createdAt
      };
    }
  } catch (error) {
    console.warn('Error checking receipt prices:', error);
  }

  // 3. Fallback to scraped data (existing SerpAPI system)
  try {
    const scrapedPrice = await getScrapedPrice(materialName, profile);
    if (scrapedPrice && scrapedPrice.price > 0) {
      // console.log(`🌐 Using scraped price: $${scrapedPrice.price} ${scrapedPrice.unit}`);
      return scrapedPrice;
    }
  } catch (error) {
    console.warn('Error getting scraped price:', error);
  }

  // 4. Final fallback - show warning
  console.warn(`⚠️ No price found for: ${materialName}`);
  return {
    price: 0,
    unit: 'per sq ft',
    source: 'none',
    materialName,
    vendor: 'Unknown',
    confidence: 'none',
    warning: `No pricing data available for "${materialName}". Please add manual pricing or check your vendor setup.`,
    timestamp: new Date().toISOString()
  };
};

/**
 * Get scraped price from SerpAPI (existing system)
 * @param {string} materialName - Material to search for
 * @param {Object} profile - User profile
 * @returns {Object} Scraped price result
 */
const getScrapedPrice = async (materialName, profile = null) => {
  try {
    const zipCode = profile?.zipCode || '90210';
    const response = await fetch(`http://localhost:5050/scrape-price?search=${encodeURIComponent(materialName)}&zip=${zipCode}&sites=allStores`);
    const priceData = await response.json();

    if (priceData.results && priceData.results.length > 0) {
      const prices = priceData.results
        .map(item => parseFloat(item.price.replace(/[$,]/g, '')))
        .filter(p => !isNaN(p) && p > 0);

      if (prices.length > 0) {
        const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        return {
          price: averagePrice,
          unit: 'per sq ft',
          source: 'scraped',
          materialName,
          vendor: 'Multiple Retailers',
          confidence: 'medium',
          timestamp: new Date().toISOString(),
          rawData: priceData
        };
      }
    }
  } catch (error) {
    console.warn('Scraped price lookup failed:', error);
  }

  return null;
};

/**
 * Get multiple material prices at once
 * @param {Array} materialNames - Array of material names
 * @param {Object} profile - User profile
 * @returns {Object} Results object with material prices
 */
export const getMultipleMaterialPrices = async (materialNames, profile = null) => {
  const results = {};

  for (const materialName of materialNames) {
    results[materialName] = await getMaterialPrice(materialName, profile);
  }

  return results;
};

/**
 * Format price result for display
 * @param {Object} priceResult - Price result from getMaterialPrice
 * @returns {string} Formatted price string
 */
export const formatPriceResult = (priceResult) => {
  if (!priceResult || priceResult.price === 0) {
    return priceResult?.warning || 'No price available';
  }

  const priceStr = `$${priceResult.price.toFixed(2)} ${priceResult.unit}`;
  const sourceIcon = {
    'manual': '📝',
    'receipt': '🧾',
    'scraped': '🌐',
    'none': '⚠️'
  }[priceResult.source] || '❓';

  return `${sourceIcon} ${priceStr} (${priceResult.vendor})`;
};

/**
 * Get pricing summary for estimate generation
 * @param {Array} materials - Array of materials used in estimate
 * @param {Object} profile - User profile
 * @returns {string} Formatted pricing summary
 */
export const getPricingSummary = async (materials, profile = null) => {
  const materialPrices = await getMultipleMaterialPrices(materials, profile);

  let summary = '📊 Material Pricing Summary:\n';

  for (const [materialName, priceResult] of Object.entries(materialPrices)) {
    summary += `• ${materialName}: ${formatPriceResult(priceResult)}\n`;
  }

  // Add source breakdown
  const sources = {};
  Object.values(materialPrices).forEach(result => {
    sources[result.source] = (sources[result.source] || 0) + 1;
  });

  summary += '\n📋 Price Sources:\n';
  Object.entries(sources).forEach(([source, count]) => {
    const sourceName = {
      'manual': 'Custom Manual Pricing',
      'receipt': 'Receipt Database',
      'scraped': 'Live Web Scraping',
      'none': 'No Data Available'
    }[source] || source;
    summary += `• ${sourceName}: ${count} materials\n`;
  });

  return summary;
};

const priceService = {
  getMaterialPrice,
  getMultipleMaterialPrices,
  formatPriceResult,
  getPricingSummary
};

export default priceService;
