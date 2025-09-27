// src/api/receipts.js
// This file defines the API routes for receipt management.
// It's intended to be used by the Express server (server/api.js).

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for validating incoming receipt data
const receiptSchema = z.object({
  vendor: z.string().min(1, 'Vendor name is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().nonnegative('Unit price must be non-negative'),
    total: z.number().nonnegative('Total must be non-negative')
  })).min(1, 'At least one item is required'),
  total: z.number().nonnegative('Total must be non-negative'),
  fileName: z.string().optional(),
  rawText: z.string().optional()
});

export const saveReceipt = async (req, res) => {
  try {
    const validatedData = receiptSchema.parse(req.body);

    // Create or find vendor
    let vendor = await prisma.localVendor.findFirst({
      where: { name: validatedData.vendor }
    });

    if (!vendor) {
      vendor = await prisma.localVendor.create({
        data: {
          name: validatedData.vendor,
          contact: null,
          notes: 'Created from receipt processing'
        }
      });
    }

    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        vendorId: vendor.id,
        purchaseDate: new Date(validatedData.purchaseDate),
        totalAmount: validatedData.total,
        fileName: validatedData.fileName || 'unknown',
        rawText: validatedData.rawText || '',
        processedAt: new Date()
      }
    });

    // Create receipt items
    const receiptItems = await Promise.all(
      validatedData.items.map(item =>
        prisma.receiptItem.create({
          data: {
            receiptId: receipt.id,
            itemName: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.total
          }
        })
      )
    );

    // Create or update vendor prices
    await Promise.all(
      validatedData.items.map(async (item) => {
        const materialKey = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

        await prisma.localVendorPrice.create({
          data: {
            vendorId: vendor.id,
            materialKey,
            unitPrice: item.unitPrice,
            unit: 'each', // Default unit, could be enhanced
            isManual: false, // This came from receipt processing
            source: 'receipt',
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
          }
        });
      })
    );

    res.status(201).json({
      success: true,
      receipt: {
        id: receipt.id,
        vendor: vendor.name,
        purchaseDate: receipt.purchaseDate,
        total: receipt.totalAmount,
        itemsCount: receiptItems.length
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error saving receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save receipt'
    });
  }
};

export const getReceipts = async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        vendor: true,
        items: true
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    });

    res.json({
      success: true,
      receipts: receipts.map(receipt => ({
        id: receipt.id,
        vendor: receipt.vendor.name,
        purchaseDate: receipt.purchaseDate,
        total: receipt.totalAmount,
        itemsCount: receipt.items.length,
        fileName: receipt.fileName,
        processedAt: receipt.processedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipts'
    });
  }
};

export const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: true
      }
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      receipt: {
        id: receipt.id,
        vendor: receipt.vendor.name,
        purchaseDate: receipt.purchaseDate,
        total: receipt.totalAmount,
        fileName: receipt.fileName,
        rawText: receipt.rawText,
        processedAt: receipt.processedAt,
        items: receipt.items.map(item => ({
          name: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.totalPrice
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipt'
    });
  }
};

export const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete receipt items first (due to foreign key constraint)
    await prisma.receiptItem.deleteMany({
      where: { receiptId: id }
    });

    // Delete the receipt
    await prisma.receipt.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete receipt'
    });
  }
};


