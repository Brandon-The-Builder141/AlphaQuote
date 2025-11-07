/**
 * Vendor Actions - Server-side operations for vendor management
 * Adapted for React app with API endpoints and offline support
 */

import offlineWrapper from '../services/offlineWrapper';

/**
 * Create a new vendor
 * @param {Object} vendorData - Vendor data { name, contact, notes }
 * @returns {Object} Created vendor
 */
export const createVendor = async (vendorData) => {
  try {
    return await offlineWrapper.createVendor(vendorData);
  } catch (error) {
    console.error('❌ Error creating vendor:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all vendors
 * @returns {Array} Array of vendors
 */
export const getVendors = async () => {
  try {
    return await offlineWrapper.getVendors();
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a vendor
 * @param {string} vendorId - Vendor ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated vendor
 */
export const updateVendor = async (vendorId, updateData) => {
  try {
    return await offlineWrapper.updateVendor(vendorId, updateData);
  } catch (error) {
    console.error('❌ Error updating vendor:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a vendor
 * @param {string} vendorId - Vendor ID
 * @returns {Object} Success status
 */
export const deleteVendor = async (vendorId) => {
  try {
    return await offlineWrapper.deleteVendor(vendorId);
  } catch (error) {
    console.error('❌ Error deleting vendor:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createVendor,
  getVendors,
  updateVendor,
  deleteVendor
};
