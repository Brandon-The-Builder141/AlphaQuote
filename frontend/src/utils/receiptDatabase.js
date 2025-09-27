/**
 * Local Receipt & Vendor Pricing Database
 * Implements the schema design for tracking vendor prices from receipts
 */

// Local storage keys
const VENDORS_KEY = 'alphaquote_local_vendors';
const PRICES_KEY = 'alphaquote_local_prices';
const RECEIPTS_KEY = 'alphaquote_receipts';
const TASKS_KEY = 'alphaquote_tasks';

// Generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Normalize material names for consistent tracking
const normalizeMaterialKey = (materialName) => {
  return materialName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
};

// LocalVendor operations
export const createLocalVendor = (vendorData) => {
  const vendors = getLocalVendors();
  const newVendor = {
    id: generateId(),
    name: vendorData.name,
    location: vendorData.location || '',
    storeNumber: vendorData.storeNumber || '',
    address: vendorData.address || '',
    phone: vendorData.phone || '',
    category: vendorData.category || 'General',
    createdAt: new Date().toISOString(),
    lastPurchase: new Date().toISOString(),
    totalPurchases: 0,
    totalSpent: 0
  };

  vendors.push(newVendor);
  localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
  return newVendor;
};

export const getLocalVendors = () => {
  try {
    return JSON.parse(localStorage.getItem(VENDORS_KEY)) || [];
  } catch {
    return [];
  }
};

export const findOrCreateVendor = (vendorName, location = '') => {
  const vendors = getLocalVendors();
  let vendor = vendors.find(v =>
    v.name.toLowerCase() === vendorName.toLowerCase() &&
    v.location === location
  );

  if (!vendor) {
    vendor = createLocalVendor({ name: vendorName, location });
  }

  return vendor;
};

// LocalVendorPrice operations
export const createLocalVendorPrice = (priceData) => {
  const prices = getLocalVendorPrices();
  const materialKey = normalizeMaterialKey(priceData.materialName);

  const newPrice = {
    id: generateId(),
    vendorId: priceData.vendorId,
    materialKey,
    materialName: priceData.materialName, // Keep original name for display
    unitPrice: parseFloat(priceData.unitPrice),
    unitLabel: priceData.unitLabel,
    lastUpdated: new Date().toISOString(),
    receiptId: priceData.receiptId || null,
    confidence: priceData.confidence || 1.0,
    category: priceData.category || 'General'
  };

  // Remove existing price for this vendor/material combination
  const filteredPrices = prices.filter(p =>
    !(p.vendorId === priceData.vendorId && p.materialKey === materialKey)
  );

  filteredPrices.push(newPrice);
  localStorage.setItem(PRICES_KEY, JSON.stringify(filteredPrices));
  return newPrice;
};

export const getLocalVendorPrices = () => {
  try {
    return JSON.parse(localStorage.getItem(PRICES_KEY)) || [];
  } catch {
    return [];
  }
};

export const getPricesByMaterial = (materialName) => {
  const materialKey = normalizeMaterialKey(materialName);
  const prices = getLocalVendorPrices();
  const vendors = getLocalVendors();

  return prices
    .filter(p => p.materialKey === materialKey)
    .map(price => ({
      ...price,
      vendor: vendors.find(v => v.id === price.vendorId)
    }))
    .sort((a, b) => a.unitPrice - b.unitPrice);
};

export const getPriceAnalytics = (materialName) => {
  const prices = getPricesByMaterial(materialName);

  if (prices.length === 0) {
    return null;
  }

  const priceValues = prices.map(p => p.unitPrice);
  const average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
  const min = Math.min(...priceValues);
  const max = Math.max(...priceValues);

  // Calculate trend (simplified)
  const recent = prices.filter(p =>
    new Date(p.lastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  let trend = 'stable';
  if (recent.length >= 2) {
    const recentAvg = recent.reduce((a, b) => a + b.unitPrice, 0) / recent.length;
    const oldAvg = prices.slice(0,  -recent.length).reduce((a,  b) => a + b.unitPrice,  0) / Math.max(1,
      prices.length - recent.length);

    if (recentAvg > oldAvg * 1.05) trend = 'increasing';
    else if (recentAvg < oldAvg * 0.95) trend = 'decreasing';
  }

  return {
    average,
    min,
    max,
    trend,
    sampleSize: prices.length,
    vendors: [...new Set(prices.map(p => p.vendor?.name).filter(Boolean))],
    lastUpdated: Math.max(...prices.map(p => new Date(p.lastUpdated).getTime())),
    priceHistory: prices.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated))
  };
};

// Receipt operations
export const saveReceipt = (receiptData) => {
  const receipts = getReceipts();
  const newReceipt = {
    id: generateId(),
    ...receiptData,
    uploadDate: new Date().toISOString()
  };

  receipts.push(newReceipt);
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));

  // Process items and update pricing
  if (receiptData.items) {
    const vendor = findOrCreateVendor(receiptData.vendor, receiptData.location);

    receiptData.items.forEach(item => {
      createLocalVendorPrice({
        vendorId: vendor.id,
        materialName: item.name,
        unitPrice: item.unitPrice,
        unitLabel: item.unit,
        receiptId: newReceipt.id,
        confidence: item.confidence || 0.9,
        category: receiptData.category
      });
    });

    // Update vendor statistics
    updateVendorStats(vendor.id, receiptData.total, receiptData.items.length);
  }

  return newReceipt;
};

export const getReceipts = () => {
  try {
    return JSON.parse(localStorage.getItem(RECEIPTS_KEY)) || [];
  } catch {
    return [];
  }
};

// Task operations (for associating vendors with projects)
export const createTask = (taskData) => {
  const tasks = getTasks();
  const newTask = {
    id: generateId(),
    name: taskData.name,
    description: taskData.description || '',
    localVendorId: taskData.localVendorId || null,
    estimatedCost: taskData.estimatedCost || 0,
    actualCost: taskData.actualCost || 0,
    status: taskData.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return newTask;
};

export const getTasks = () => {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  } catch {
    return [];
  }
};

export const getTasksWithVendors = () => {
  const tasks = getTasks();
  const vendors = getLocalVendors();

  return tasks.map(task => ({
    ...task,
    localVendor: task.localVendorId ? vendors.find(v => v.id === task.localVendorId) : null
  }));
};

// Utility functions
const updateVendorStats = (vendorId, purchaseAmount) => {
  const vendors = getLocalVendors();
  const vendorIndex = vendors.findIndex(v => v.id === vendorId);

  if (vendorIndex !== -1) {
    vendors[vendorIndex].totalPurchases += 1;
    vendors[vendorIndex].totalSpent += purchaseAmount;
    vendors[vendorIndex].lastPurchase = new Date().toISOString();

    localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
  }
};

// Smart pricing suggestions
export const getSmartPricingSuggestions = (materialName) => {
  const analytics = getPriceAnalytics(materialName);

  if (!analytics) {
    return {
      suggestion: 'No local pricing data available',
      confidence: 0,
      recommendations: ['Upload receipts to build pricing intelligence']
    };
  }

  const recommendations = [];

  // Price recommendations
  if (analytics.trend === 'increasing') {
    recommendations.push(`Prices trending up - current avg: $${analytics.average.toFixed(2)}`);
  } else if (analytics.trend === 'decreasing') {
    recommendations.push(`Prices trending down - good time to buy at $${analytics.average.toFixed(2)}`);
  }

  // Vendor recommendations
  const bestVendor = analytics.priceHistory[0]?.vendor?.name;
  if (bestVendor) {
    recommendations.push(`Best price historically from ${bestVendor}`);
  }

  // Sample size confidence
  if (analytics.sampleSize < 3) {
    recommendations.push('Upload more receipts for better accuracy');
  }

  return {
    suggestion: `Suggested price: $${analytics.average.toFixed(2)} (${analytics.unitLabel || 'per unit'})`,
    confidence: Math.min(analytics.sampleSize / 10, 1), // Max confidence at 10 samples
    priceRange: `$${analytics.min.toFixed(2)} - $${analytics.max.toFixed(2)}`,
    trend: analytics.trend,
    sampleSize: analytics.sampleSize,
    recommendations
  };
};

// Export all pricing data for estimates
export const exportPricingData = () => {
  return {
    vendors: getLocalVendors(),
    prices: getLocalVendorPrices(),
    receipts: getReceipts(),
    tasks: getTasks(),
    exportDate: new Date().toISOString()
  };
};

// Import pricing data
export const importPricingData = (data) => {
  try {
    if (data.vendors) localStorage.setItem(VENDORS_KEY, JSON.stringify(data.vendors));
    if (data.prices) localStorage.setItem(PRICES_KEY, JSON.stringify(data.prices));
    if (data.receipts) localStorage.setItem(RECEIPTS_KEY, JSON.stringify(data.receipts));
    if (data.tasks) localStorage.setItem(TASKS_KEY, JSON.stringify(data.tasks));
    return true;
  } catch (error) {
    console.error('Failed to import pricing data:', error);
    return false;
  }
};

// Clear all data (for testing)
export const clearAllReceiptData = () => {
  localStorage.removeItem(VENDORS_KEY);
  localStorage.removeItem(PRICES_KEY);
  localStorage.removeItem(RECEIPTS_KEY);
  localStorage.removeItem(TASKS_KEY);
};

export default {
  createLocalVendor,
  getLocalVendors,
  findOrCreateVendor,
  createLocalVendorPrice,
  getLocalVendorPrices,
  getPricesByMaterial,
  getPriceAnalytics,
  saveReceipt,
  getReceipts,
  createTask,
  getTasks,
  getTasksWithVendors,
  getSmartPricingSuggestions,
  exportPricingData,
  importPricingData,
  clearAllReceiptData
};


