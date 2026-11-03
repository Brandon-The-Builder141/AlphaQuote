/**
 * Receipt Service — HTTP client for receipt-learned pricing.
 *
 * Pass Seven rewrite. This module used to import @prisma/client and run
 * `new PrismaClient()` in the BROWSER, against schema fields that no
 * longer exist (vendor.location, name_location, lastPurchase) — dead
 * code that could only ever throw. The receipt-price read path now goes
 * through the API like everything else:
 *
 *   GET /api/prices/by-material?material=<name>
 *
 * which returns this tenant's LocalVendorPrice rows (prices taught by
 * their own receipts) in the shape the price chain consumes:
 *   [{ unitPrice, unitLabel, lastUpdated, vendor: { name }, ... }]
 *
 * The API auth interceptor attaches the Clerk token automatically.
 */

import { API_BASE_URL } from '../config/env';

export const getPricesByMaterial = async (materialName) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/prices/by-material?material=${encodeURIComponent(materialName)}`
    );
    if (!response.ok) {
      console.warn(`Price lookup failed for "${materialName}": HTTP ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.prices || [];
  } catch (error) {
    console.error('Error getting prices by material:', error);
    return [];
  }
};

export const getPriceAnalytics = async (materialName) => {
  const prices = await getPricesByMaterial(materialName);

  if (prices.length === 0) {
    return null;
  }

  const priceValues = prices.map(p => parseFloat(p.unitPrice)).filter(n => Number.isFinite(n));
  if (priceValues.length === 0) {
    return null;
  }
  const average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
  const min = Math.min(...priceValues);
  const max = Math.max(...priceValues);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentPrices = prices.filter(p => new Date(p.lastUpdated) > thirtyDaysAgo);
  const olderPrices = prices.filter(p => new Date(p.lastUpdated) <= thirtyDaysAgo);

  const avgOf = (rows) => {
    const vals = rows.map(p => parseFloat(p.unitPrice)).filter(n => Number.isFinite(n));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const recentAvg = avgOf(recentPrices);
  const olderAvg = avgOf(olderPrices);
  const trend = recentAvg !== null && olderAvg !== null && olderAvg > 0
    ? ((recentAvg - olderAvg) / olderAvg) * 100
    : null;

  return { average, min, max, count: prices.length, trend, prices };
};

const receiptService = {
  getPricesByMaterial,
  getPriceAnalytics
};

export default receiptService;
