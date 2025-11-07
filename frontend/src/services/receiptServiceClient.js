/**
 * Receipt Service Client - HTTP API Operations with Offline Support
 * Handles all receipt operations via HTTP requests to the API server
 * Automatically falls back to offline storage when needed
 */

import offlineWrapper from './offlineWrapper';
import { API_BASE_URL } from '../config/env';

// Receipt API functions with offline support
export const createReceipt = async (receiptData) => {
  try {
    return await offlineWrapper.createReceipt(receiptData);
  } catch (error) {
    console.error('Error creating receipt:', error);
    return { success: false, error: error.message };
  }
};

export const getReceipts = async () => {
  try {
    return await offlineWrapper.getReceipts();
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return { success: false, error: error.message };
  }
};

export const getReceipt = async (receiptId) => {
  try {
    return await offlineWrapper.getReceipt(receiptId);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return { success: false, error: error.message };
  }
};

export const updateReceipt = async (receiptId, updateData) => {
  try {
    return await offlineWrapper.updateReceipt(receiptId, updateData);
  } catch (error) {
    console.error('Error updating receipt:', error);
    return { success: false, error: error.message };
  }
};

export const deleteReceipt = async (receiptId) => {
  try {
    return await offlineWrapper.deleteReceipt(receiptId);
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return { success: false, error: error.message };
  }
};

// Vendor API functions with offline support
export const getVendors = async () => {
  try {
    return await offlineWrapper.getVendors();
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return { success: false, error: error.message };
  }
};

export const createVendor = async (vendorData) => {
  try {
    return await offlineWrapper.createVendor(vendorData);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return { success: false, error: error.message };
  }
};

export const updateVendor = async (vendorId, updateData) => {
  try {
    return await offlineWrapper.updateVendor(vendorId, updateData);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return { success: false, error: error.message };
  }
};

export const deleteVendor = async (vendorId) => {
  try {
    return await offlineWrapper.deleteVendor(vendorId);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return { success: false, error: error.message };
  }
};

// Legacy functions for compatibility
export const createLocalVendor = createVendor;
export const getLocalVendors = getVendors;

// Email quote function (always requires online connection)
export const emailQuote = async (quoteData) => {
  try {
    return await offlineWrapper.emailQuote(quoteData);
  } catch (error) {
    console.error('Error emailing quote:', error);
    return { success: false, error: error.message };
  }
};

// Clear all receipt data (always requires online connection)
export const clearAllReceiptData = async () => {
  try {
    // This would need to be implemented in the API
    const response = await fetch(`${API_BASE_URL}/api/clear-all-receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error clearing receipt data:', error);
    return { success: false, error: error.message };
  }
};

// Placeholder functions that return mock data for features not yet implemented
export const getSmartPricingSuggestions = async (materialName, projectLocation) => {
  // Mock implementation - replace with actual API call when available
  return {
    success: true,
    suggestions: [
      {
        vendor: 'Mock Vendor',
        price: 25.99,
        confidence: 0.8,
        source: 'historical'
      }
    ]
  };
};

export const saveMaterialPrice = async (materialData) => {
  // Mock implementation - replace with actual API call when available
  return { success: true, price: materialData };
};

export const getMaterialPrices = async (materialName) => {
  // Mock implementation - replace with actual API call when available
  return {
    success: true,
    prices: [
      {
        id: '1',
        material: materialName,
        vendor: 'Mock Vendor',
        price: 25.99,
        lastUpdated: new Date().toISOString()
      }
    ]
  };
};

// Offline mode utilities
export const isOfflineModeEnabled = () => {
  return offlineWrapper.isOfflineModeEnabled();
};

export const getNetworkStatus = () => {
  return offlineWrapper.getNetworkStatus();
};

export const syncNow = async () => {
  try {
    return await offlineWrapper.syncNow();
  } catch (error) {
    console.error('Error syncing data:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createReceipt,
  getReceipts,
  getReceipt,
  updateReceipt,
  deleteReceipt,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  createLocalVendor,
  getLocalVendors,
  emailQuote,
  clearAllReceiptData,
  getSmartPricingSuggestions,
  saveMaterialPrice,
  getMaterialPrices,
  isOfflineModeEnabled,
  getNetworkStatus,
  syncNow
};
