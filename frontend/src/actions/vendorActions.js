/**
 * Vendor Actions - Server-side operations for vendor management
 * Adapted for React app with API endpoints
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new vendor
 * @param {Object} vendorData - Vendor data { name, contact, notes }
 * @returns {Object} Created vendor
 */
export const createVendor = async (vendorData) => {
  try {
    const vendor = await prisma.localVendor.create({
      data: {
        name: vendorData.name,
        contact: vendorData.contactInfo || null,
        notes: vendorData.notes || null
      }
    });

    // console.log('✅ Vendor created:', vendor);
    return { success: true, vendor };
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
    const vendors = await prisma.localVendor.findMany({
      orderBy: { name: 'asc' },
      include: {
        prices: true,
        receipts: true
      }
    });

    return { success: true, vendors };
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
    const vendor = await prisma.localVendor.update({
      where: { id: vendorId },
      data: {
        name: updateData.name,
        contact: updateData.contactInfo || null,
        notes: updateData.notes || null
      }
    });

    // console.log('✅ Vendor updated:', vendor);
    return { success: true, vendor };
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
    await prisma.localVendor.delete({
      where: { id: vendorId }
    });

    // console.log('✅ Vendor deleted:', vendorId);
    return { success: true };
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
