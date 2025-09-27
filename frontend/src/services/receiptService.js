/**
 * Receipt Service - Prisma Database Operations
 * Handles all receipt upload and pricing intelligence operations
 */

import { PrismaClient } from '@prisma/client';
import { toMaterialKey } from '../lib/materialKey';

const prisma = new PrismaClient();

// LocalVendor operations
export const createLocalVendor = async (vendorData) => {
  try {
    const vendor = await prisma.localVendor.create({
      data: {
        name: vendorData.name,
        location: vendorData.location || null,
        storeNumber: vendorData.storeNumber || null,
        address: vendorData.address || null,
        phone: vendorData.phone || null,
        category: vendorData.category || 'General'
      }
    });
    return vendor;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

export const findOrCreateVendor = async (vendorName, location = null) => {
  try {
    // Try to find existing vendor
    let vendor = await prisma.localVendor.findUnique({
      where: {
        name_location: {
          name: vendorName,
          location
        }
      }
    });

    // Create if doesn't exist
    if (!vendor) {
      vendor = await createLocalVendor({
        name: vendorName,
        location
      });
    }

    return vendor;
  } catch (error) {
    console.error('Error finding/creating vendor:', error);
    throw error;
  }
};

export const getLocalVendors = async () => {
  try {
    return await prisma.localVendor.findMany({
      include: {
        prices: true,
        _count: {
          select: {
            receipts: true,
            prices: true
          }
        }
      },
      orderBy: {
        lastPurchase: 'desc'
      }
    });
  } catch (error) {
    console.error('Error getting vendors:', error);
    return [];
  }
};

// LocalVendorPrice operations
export const createLocalVendorPrice = async (priceData) => {
  try {
    const materialKey = toMaterialKey(priceData.materialName);

    const price = await prisma.localVendorPrice.upsert({
      where: {
        vendorId_materialKey: {
          vendorId: priceData.vendorId,
          materialKey
        }
      },
      update: {
        unitPrice: priceData.unitPrice,
        unitLabel: priceData.unitLabel,
        confidence: priceData.confidence || 1.0,
        lastUpdated: new Date(),
        receiptId: priceData.receiptId
      },
      create: {
        vendorId: priceData.vendorId,
        materialKey,
        materialName: priceData.materialName,
        unitPrice: priceData.unitPrice,
        unitLabel: priceData.unitLabel,
        category: priceData.category || 'General',
        confidence: priceData.confidence || 1.0,
        receiptId: priceData.receiptId
      }
    });

    return price;
  } catch (error) {
    console.error('Error creating/updating price:', error);
    throw error;
  }
};

export const getPricesByMaterial = async (materialName) => {
  try {
    const materialKey = toMaterialKey(materialName);

    const prices = await prisma.localVendorPrice.findMany({
      where: {
        materialKey
      },
      include: {
        vendor: true,
        receipt: true
      },
      orderBy: {
        unitPrice: 'asc'
      }
    });

    return prices;
  } catch (error) {
    console.error('Error getting prices by material:', error);
    return [];
  }
};

export const getPriceAnalytics = async (materialName) => {
  try {
    const prices = await getPricesByMaterial(materialName);

    if (prices.length === 0) {
      return null;
    }

    const priceValues = prices.map(p => parseFloat(p.unitPrice));
    const average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);

    // Calculate trend (last 30 days vs older)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPrices = prices.filter(p => new Date(p.lastUpdated) > thirtyDaysAgo);
    const olderPrices = prices.filter(p => new Date(p.lastUpdated) <= thirtyDaysAgo);

    let trend = 'stable';
    if (recentPrices.length >= 2 && olderPrices.length >= 1) {
      const recentAvg = recentPrices.reduce((a, b) => a + parseFloat(b.unitPrice), 0) / recentPrices.length;
      const olderAvg = olderPrices.reduce((a, b) => a + parseFloat(b.unitPrice), 0) / olderPrices.length;

      if (recentAvg > olderAvg * 1.05) trend = 'increasing';
      else if (recentAvg < olderAvg * 0.95) trend = 'decreasing';
    }

    return {
      average,
      min,
      max,
      trend,
      sampleSize: prices.length,
      vendors: [...new Set(prices.map(p => p.vendor.name))],
      lastUpdated: Math.max(...prices.map(p => new Date(p.lastUpdated).getTime())),
      priceHistory: prices.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated))
    };
  } catch (error) {
    console.error('Error getting price analytics:', error);
    return null;
  }
};

// Receipt operations
export const saveReceipt = async (receiptData) => {
  try {
    // Find or create vendor
    const vendor = await findOrCreateVendor(receiptData.vendor, receiptData.location);

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        vendorId: vendor.id,
        receiptDate: new Date(receiptData.date),
        total: receiptData.total,
        subtotal: receiptData.subtotal || receiptData.total,
        tax: receiptData.tax || 0,
        category: receiptData.category || 'General',
        project: receiptData.project || null,
        ocrConfidence: receiptData.ocrConfidence || 0.0,
        fileName: receiptData.fileName || null,
        fileSize: receiptData.fileSize || null,
        mimeType: receiptData.mimeType || null,
        items: {
          create: receiptData.items.map(item => ({
            description: item.name,
            category: item.category || receiptData.category,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
            sku: item.sku || null,
            confidence: item.confidence || 0.0
          }))
        }
      },
      include: {
        items: true,
        vendor: true
      }
    });

    // Create/update vendor prices for each item
    for (const item of receiptData.items) {
      await createLocalVendorPrice({
        vendorId: vendor.id,
        materialName: item.name,
        unitPrice: item.unitPrice,
        unitLabel: item.unit,
        category: item.category || receiptData.category,
        confidence: item.confidence || 0.9,
        receiptId: receipt.id
      });
    }

    // Update vendor statistics
    await prisma.localVendor.update({
      where: { id: vendor.id },
      data: {
        totalPurchases: { increment: 1 },
        totalSpent: { increment: receiptData.total },
        lastPurchase: new Date()
      }
    });

    return receipt;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

export const getReceipts = async () => {
  try {
    return await prisma.receipt.findMany({
      include: {
        vendor: true,
        items: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });
  } catch (error) {
    console.error('Error getting receipts:', error);
    return [];
  }
};

// Task operations
export const createTask = async (taskData) => {
  try {
    const task = await prisma.task.create({
      data: {
        name: taskData.name,
        description: taskData.description || null,
        estimatedCost: taskData.estimatedCost || 0,
        actualCost: taskData.actualCost || 0,
        status: taskData.status || 'pending',
        localVendorId: taskData.localVendorId || null,
        projectId: taskData.projectId || null
      },
      include: {
        localVendor: true,
        project: true
      }
    });

    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getTasks = async () => {
  try {
    return await prisma.task.findMany({
      include: {
        localVendor: true,
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

// Project operations
export const createProject = async (projectData) => {
  try {
    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        clientName: projectData.clientName || null,
        clientEmail: projectData.clientEmail || null,
        clientPhone: projectData.clientPhone || null,
        address: projectData.address || null,
        jobType: projectData.jobType || null,
        description: projectData.description || null,
        timeline: projectData.timeline || null,
        budget: projectData.budget || null
      }
    });

    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Smart pricing suggestions
export const getSmartPricingSuggestions = async (materialName) => {
  try {
    const analytics = await getPriceAnalytics(materialName);

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
      suggestion: `Suggested price: $${analytics.average.toFixed(2)} per ${analytics.priceHistory[0]?.unitLabel || 'unit'}`,

      confidence: Math.min(analytics.sampleSize / 10, 1),
      priceRange: `$${analytics.min.toFixed(2)} - $${analytics.max.toFixed(2)}`,
      trend: analytics.trend,
      sampleSize: analytics.sampleSize,
      recommendations,
      vendorPrices: analytics.priceHistory.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting pricing suggestions:', error);
    return {
      suggestion: 'Error loading pricing data',
      confidence: 0,
      recommendations: ['Check database connection']
    };
  }
};

// Database utilities
export const clearAllReceiptData = async () => {
  try {
    await prisma.receiptItem.deleteMany();
    await prisma.localVendorPrice.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.task.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.project.deleteMany();
    await prisma.localVendor.deleteMany();

    // console.log('All receipt data cleared successfully');
  } catch (error) {
    console.error('Error clearing receipt data:', error);
    throw error;
  }
};

export const getReceiptStats = async () => {
  try {
    const stats = await prisma.$transaction([
      prisma.receipt.count(),
      prisma.localVendor.count(),
      prisma.localVendorPrice.count(),
      prisma.receiptItem.count()
    ]);

    return {
      receipts: stats[0],
      vendors: stats[1],
      prices: stats[2],
      items: stats[3]
    };
  } catch (error) {
    console.error('Error getting receipt stats:', error);
    return { receipts: 0, vendors: 0, prices: 0, items: 0 };
  }
};

// Close Prisma connection
export const closePrisma = async () => {
  await prisma.$disconnect();
};

const receiptService = {
  createLocalVendor,
  findOrCreateVendor,
  getLocalVendors,
  createLocalVendorPrice,
  getPricesByMaterial,
  getPriceAnalytics,
  saveReceipt,
  getReceipts,
  createTask,
  getTasks,
  createProject,
  getSmartPricingSuggestions,
  clearAllReceiptData,
  getReceiptStats,
  closePrisma,
  toMaterialKey
};

export default receiptService;
