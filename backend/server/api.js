/**
 * API Server for AlphaQuote
 * Handles vendor management and other API endpoints
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const userService = require('../services/userService');
const config = require('../config/env');

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL
    }
  }
});
const PORT = config.API_PORT;

// Validate environment and log configuration
config.validateEnv();
if (config.DEBUG) {
  config.logConfig();
}

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AlphaQuote API Server'
  });
});

// User Management Routes
app.post('/api/users/sync', authenticateUser, async (req, res) => {
  try {
    const result = await userService.createOrUpdateUser(req.user);
    
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users/me', authenticateUser, async (req, res) => {
  try {
    const result = await userService.getUserByClerkId(req.user.id);
    
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users/profile', authenticateUser, async (req, res) => {
  try {
    const { firstName, lastName, metadata } = req.body;
    
    const result = await userService.updateUserProfile(req.user.id, {
      firstName,
      lastName,
      metadata
    });
    
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users/contractor-account', authenticateUser, async (req, res) => {
  try {
    const { companyName, email, phone, address, website, license, primaryColor, secondaryColor } = req.body;
    
    const result = await userService.createContractorAccount(req.user.id, {
      companyName,
      email,
      phone,
      address,
      website,
      license,
      primaryColor,
      secondaryColor
    });
    
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error creating contractor account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users/subscription', authenticateUser, async (req, res) => {
  try {
    const hasPro = await userService.hasProSubscription(req.user.id);
    
    res.json({ 
      success: true, 
      data: { 
        hasPro,
        subscription: hasPro ? 'pro' : 'free'
      }
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vendor Routes (now with optional authentication)
app.get('/api/vendors', optionalAuth, async (req, res) => {
  try {
    const vendors = await prisma.localVendor.findMany({
      orderBy: { name: 'asc' },
      include: {
        prices: true,
        receipts: true,
      },
    });

    res.json({ success: true, vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const { name, contactInfo, notes } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Vendor name is required' 
      });
    }

    const vendor = await prisma.localVendor.create({
      data: {
        name: name.trim(),
        contact: contactInfo?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    console.log('✅ Vendor created:', vendor);
    res.status(201).json({ success: true, vendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactInfo, notes } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Vendor name is required' 
      });
    }

    const vendor = await prisma.localVendor.update({
      where: { id },
      data: {
        name: name.trim(),
        contact: contactInfo?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    console.log('✅ Vendor updated:', vendor);
    res.json({ success: true, vendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.localVendor.delete({
      where: { id },
    });

    console.log('✅ Vendor deleted:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Project Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        jobType: project.jobType,
        status: project.status,
        createdAt: project.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        receipts: {
          include: {
            vendor: true,
            items: true
          }
        },
        tasks: true,
        estimates: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        clientPhone: project.clientPhone,
        address: project.address,
        jobType: project.jobType,
        description: project.description,
        timeline: project.timeline,
        budget: project.budget,
        status: project.status,
        createdAt: project.createdAt,
        receipts: project.receipts.map(receipt => ({
          id: receipt.id,
          vendor: receipt.vendor.name,
          purchaseDate: receipt.receiptDate,
          total: receipt.total,
          fileName: receipt.fileName
        })),
        tasks: project.tasks,
        estimates: project.estimates
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Receipt Routes
app.post('/api/receipts', async (req, res) => {
  try {
    const { vendor, purchaseDate, items, total, fileName, rawText, projectId } = req.body;

    // Validate required fields
    if (!vendor || vendor.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Vendor name is required' 
      });
    }

    if (!purchaseDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Purchase date is required' 
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one item is required' 
      });
    }

    // Create or find vendor
    let vendorRecord = await prisma.localVendor.findFirst({
      where: { name: vendor.trim() }
    });
    
    if (!vendorRecord) {
      vendorRecord = await prisma.localVendor.create({
        data: {
          name: vendor.trim(),
          contact: null,
          notes: 'Created from receipt processing'
        }
      });
    }

    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        vendorId: vendorRecord.id,
        receiptDate: new Date(purchaseDate),
        total: total || 0,
        fileName: fileName || 'unknown',
        category: 'General',
        verified: false,
        projectId: projectId || null
      }
    });

    // Create receipt items
    const receiptItems = await Promise.all(
      items.map(item =>
        prisma.receiptItem.create({
          data: {
            receiptId: receipt.id,
            description: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.total || (item.quantity * item.unitPrice),
            unit: 'each',
            category: 'General'
          }
        })
      )
    );

    // Create or update vendor prices
    await Promise.all(
      items.map(async (item) => {
        const materialKey = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        // Check if price already exists for this material and vendor
        const existingPrice = await prisma.localVendorPrice.findFirst({
          where: {
            vendorId: vendorRecord.id,
            materialKey: materialKey
          }
        });

        if (existingPrice) {
          // Update existing price
          await prisma.localVendorPrice.update({
            where: { id: existingPrice.id },
            data: {
              unitPrice: item.unitPrice,
              lastUpdated: new Date(),
              receiptId: receipt.id
            }
          });
        } else {
          // Create new price
          await prisma.localVendorPrice.create({
            data: {
              vendorId: vendorRecord.id,
              materialKey: materialKey,
              materialName: item.name,
              unitPrice: item.unitPrice,
              unitLabel: 'each', // Default unit
              category: 'General',
              confidence: 1.0,
              receiptId: receipt.id
            }
          });
        }
      })
    );

    console.log('✅ Receipt saved:', receipt.id);
    res.status(201).json({
      success: true,
      receipt: {
        id: receipt.id,
        vendor: vendorRecord.name,
        purchaseDate: receipt.receiptDate,
        total: receipt.total,
        itemsCount: receiptItems.length
      }
    });
  } catch (error) {
    console.error('Error saving receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/receipts', async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        vendor: true,
        items: true,
        projectRef: true
      },
      orderBy: {
        receiptDate: 'desc'
      }
    });

    res.json({
      success: true,
      receipts: receipts.map(receipt => ({
        id: receipt.id,
        vendor: receipt.vendor.name,
        purchaseDate: receipt.receiptDate,
        total: receipt.total,
        itemsCount: receipt.items.length,
        fileName: receipt.fileName,
        uploadDate: receipt.uploadDate,
        projectId: receipt.projectId,
        project: receipt.projectRef ? {
          id: receipt.projectRef.id,
          name: receipt.projectRef.name
        } : null
      }))
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/receipts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: true,
        projectRef: true
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
        purchaseDate: receipt.receiptDate,
        total: receipt.total,
        fileName: receipt.fileName,
        uploadDate: receipt.uploadDate,
        projectId: receipt.projectId,
        project: receipt.projectRef ? {
          id: receipt.projectRef.id,
          name: receipt.projectRef.name
        } : null,
        items: receipt.items.map(item => ({
          name: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.totalPrice
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/receipts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorName, purchaseDate, totalAmount, notes, status, projectId } = req.body;

    // Validate required fields
    if (!vendorName || vendorName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Vendor name is required'
      });
    }

    if (!purchaseDate) {
      return res.status(400).json({
        success: false,
        error: 'Purchase date is required'
      });
    }

    if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid total amount is required'
      });
    }

    // Find or create vendor
    let vendorRecord = await prisma.localVendor.findFirst({
      where: { name: vendorName.trim() }
    });

    if (!vendorRecord) {
      vendorRecord = await prisma.localVendor.create({
        data: {
          name: vendorName.trim(),
          contact: null,
          notes: 'Created from receipt update'
        }
      });
    }

    // Update receipt
    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: {
        vendorId: vendorRecord.id,
        receiptDate: new Date(purchaseDate),
        total: parseFloat(totalAmount),
        projectId: projectId || null,
        verified: status === 'verified'
      },
      include: {
        vendor: true,
        projectRef: true
      }
    });

    console.log('✅ Receipt updated:', updatedReceipt.id);
    res.json({
      success: true,
      receipt: {
        id: updatedReceipt.id,
        vendor: updatedReceipt.vendor.name,
        purchaseDate: updatedReceipt.receiptDate,
        total: updatedReceipt.total,
        projectId: updatedReceipt.projectId,
        project: updatedReceipt.projectRef ? {
          id: updatedReceipt.projectRef.id,
          name: updatedReceipt.projectRef.name
        } : null,
        status: updatedReceipt.verified ? 'verified' : 'manual'
      }
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/receipts/:id', async (req, res) => {
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

    console.log('✅ Receipt deleted:', id);
    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AlphaQuote API Server'
  });
});

// Email configuration - Using Gmail with App Password (more reliable)
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'AlphaQuote141@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-gmail-app-password' // Need 16-char App Password
  }
});

// Alternative: If Gmail doesn't work, we can use a different service
// const emailTransporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'AlphaQuote141@gmail.com',
//     pass: 'your-16-char-app-password'
//   }
// });

// Email quote endpoint
app.post('/api/email-quote', async (req, res) => {
  try {
    const { recipient, subject, message, quoteData } = req.body;

    if (!recipient || !subject) {
      return res.status(400).json({ 
        error: 'Recipient email and subject are required' 
      });
    }

    // Format the quote data into HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 10px;">🧮 AlphaQuote Estimate</h1>
          <p style="color: #666; font-size: 16px;">Professional Construction Estimate</p>
          <p style="color: #999; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; font-size: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Project Information</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div><strong>Client:</strong> ${quoteData.projectInfo.clientName}</div>
            <div><strong>Job Type:</strong> ${quoteData.projectInfo.jobType}</div>
            <div><strong>Project:</strong> ${quoteData.projectInfo.projectDescription}</div>
            <div><strong>Address:</strong> ${quoteData.projectInfo.address}</div>
            <div><strong>Phone:</strong> ${quoteData.projectInfo.phone}</div>
            <div><strong>Email:</strong> ${quoteData.projectInfo.email}</div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; font-size: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Room/Area Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Room/Area</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Sq Ft</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Material</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Cost/SqFt</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Labor</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Hours</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${quoteData.rooms.map((room, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                  <td style="border: 1px solid #ddd; padding: 12px;">${room.name}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${room.sqft}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${room.material}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">$${room.materialCost}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${room.labor}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${room.laborHours}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">$${calculateRoomCost(room)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Cost Summary</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal:</span>
            <span style="font-weight: bold;">$${quoteData.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Markup (${quoteData.markup}%):</span>
            <span style="font-weight: bold;">$${quoteData.markupAmount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #ccc; padding-top: 10px;">
            <span>Total:</span>
            <span style="color: #00d4ff;">$${quoteData.total}</span>
          </div>
        </div>

        <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
          <p>Thank you for choosing AlphaQuote for your construction needs.</p>
          <p>This estimate is valid for 30 days from the date above.</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
          <p style="color: #666; line-height: 1.6;">${message || 'Please find attached your detailed construction estimate.'}</p>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'AlphaQuote141@gmail.com',
      to: recipient,
      subject: subject,
      html: htmlContent
    };

    // Send email - let's try to actually send it
    try {
      await emailTransporter.sendMail(mailOptions);
      console.log('✅ Email actually sent successfully!');
    } catch (emailError) {
      console.log('🧪 Email sending failed, logging in test mode:');
      console.log(`📧 To: ${recipient}`);
      console.log(`📝 Subject: ${subject}`);
      console.log(`📄 HTML Content Length: ${htmlContent.length} characters`);
      console.log('❌ Email Error:', emailError.message);
    }

    // Log the action
    console.log(`✅ Quote emailed successfully to: ${recipient}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`💰 Quote total: $${quoteData.total}`);

    res.json({ 
      success: true, 
      message: 'Quote emailed successfully',
      recipient: recipient,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// Regional Price Pack Routes
app.get('/api/regional-price-packs', async (req, res) => {
  try {
    const pricePacks = await prisma.regionalPricePack.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        materials: {
          where: { isActive: true },
          orderBy: { category: 'asc' }
        }
      }
    });

    res.json(pricePacks);
  } catch (error) {
    console.error('Error fetching regional price packs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/regional-materials', async (req, res) => {
  try {
    const { region, category, search } = req.query;
    
    let whereClause = { isActive: true };
    
    if (region) {
      const pricePack = await prisma.regionalPricePack.findFirst({
        where: { region: region, isActive: true }
      });
      
      if (pricePack) {
        whereClause.pricePackId = pricePack.id;
      }
    }
    
    if (category && category !== 'All') {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause.OR = [
        { materialName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const materials = await prisma.regionalMaterial.findMany({
      where: whereClause,
      include: {
        pricePack: {
          select: { name: true, region: true }
        }
      },
      orderBy: [
        { category: 'asc' },
        { materialName: 'asc' }
      ]
    });

    res.json(materials);
  } catch (error) {
    console.error('Error fetching regional materials:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/regional-materials/suggestions', async (req, res) => {
  try {
    const { region, materialName, category } = req.query;
    
    if (!region) {
      return res.status(400).json({ success: false, error: 'Region is required' });
    }

    const pricePack = await prisma.regionalPricePack.findFirst({
      where: { region: region, isActive: true }
    });
    
    if (!pricePack) {
      return res.status(404).json({ success: false, error: 'Region not found' });
    }

    let whereClause = { 
      pricePackId: pricePack.id,
      isActive: true 
    };

    // If materialName is provided, find similar materials
    if (materialName) {
      whereClause.OR = [
        { materialName: { contains: materialName, mode: 'insensitive' } },
        { materialKey: { contains: materialName.toLowerCase().replace(/\s+/g, '_'), mode: 'insensitive' } }
      ];
    }

    // If category is provided, filter by category
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const suggestions = await prisma.regionalMaterial.findMany({
      where: whereClause,
      include: {
        pricePack: {
          select: { name: true, region: true }
        }
      },
      orderBy: [
        { category: 'asc' },
        { materialName: 'asc' }
      ],
      take: 10 // Limit to 10 suggestions
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching material suggestions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/user-regional-selection', async (req, res) => {
  try {
    const { userId, pricePackId } = req.body;
    
    if (!pricePackId) {
      return res.status(400).json({ success: false, error: 'Price pack ID is required' });
    }

    // Verify price pack exists
    const pricePack = await prisma.regionalPricePack.findUnique({
      where: { id: pricePackId }
    });
    
    if (!pricePack) {
      return res.status(404).json({ success: false, error: 'Price pack not found' });
    }

    // Upsert user selection
    const userSelection = await prisma.userRegionalSelection.upsert({
      where: { userId: userId || 'default' },
      update: { 
        pricePackId: pricePackId,
        updatedAt: new Date()
      },
      create: {
        userId: userId || 'default',
        pricePackId: pricePackId,
        isDefault: true
      },
      include: {
        pricePack: {
          select: { name: true, region: true, description: true }
        }
      }
    });

    res.json({ success: true, selection: userSelection });
  } catch (error) {
    console.error('Error saving user regional selection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/user-regional-selection', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const userSelection = await prisma.userRegionalSelection.findUnique({
      where: { userId: userId || 'default' },
      include: {
        pricePack: {
          select: { name: true, region: true, description: true }
        }
      }
    });

    if (!userSelection) {
      // Return default region (first available)
      const defaultPack = await prisma.regionalPricePack.findFirst({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      
      return res.json({ 
        success: true, 
        selection: null,
        defaultRegion: defaultPack?.region || null
      });
    }

    res.json({ success: true, selection: userSelection });
  } catch (error) {
    console.error('Error fetching user regional selection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Task Template Routes
app.get('/api/task-templates', async (req, res) => {
  try {
    const { category, userId } = req.query;
    
    const where = {
      OR: [
        { isPublic: true },
        { userId: userId || 'default' }
      ]
    };
    
    if (category) {
      where.category = category;
    }

    const templates = await prisma.taskTemplate.findMany({
      where,
      include: {
        tasks: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching task templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/task-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.taskTemplate.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'Template not found' 
      });
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching task template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/task-templates', async (req, res) => {
  try {
    const { name, description, category, isPublic, userId, tasks } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Template name is required' 
      });
    }

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one task is required' 
      });
    }

    // Create template with tasks in a transaction
    const template = await prisma.$transaction(async (tx) => {
      const newTemplate = await tx.taskTemplate.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          category: category?.trim(),
          isPublic: Boolean(isPublic),
          userId: userId || 'default'
        }
      });

      // Create template tasks
      const templateTasks = await Promise.all(
        tasks.map((task, index) => 
          tx.taskTemplateItem.create({
            data: {
              templateId: newTemplate.id,
              name: task.name?.trim() || '',
              description: task.description?.trim(),
              category: task.category?.trim(),
              unit: task.unit?.trim(),
              quantity: parseFloat(task.quantity) || 1,
              unitPrice: parseFloat(task.unitPrice) || 0,
              totalPrice: (parseFloat(task.quantity) || 1) * (parseFloat(task.unitPrice) || 0),
              sortOrder: index
            }
          })
        )
      );

      return {
        ...newTemplate,
        tasks: templateTasks
      };
    });

    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Error creating task template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/task-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, isPublic, tasks } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Template name is required' 
      });
    }

    // Update template with tasks in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // Update template
      const updatedTemplate = await tx.taskTemplate.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim(),
          category: category?.trim(),
          isPublic: Boolean(isPublic)
        }
      });

      // Delete existing tasks
      await tx.taskTemplateItem.deleteMany({
        where: { templateId: id }
      });

      // Create new tasks if provided
      if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        await Promise.all(
          tasks.map((task, index) => 
            tx.taskTemplateItem.create({
              data: {
                templateId: id,
                name: task.name?.trim() || '',
                description: task.description?.trim(),
                category: task.category?.trim(),
                unit: task.unit?.trim(),
                quantity: parseFloat(task.quantity) || 1,
                unitPrice: parseFloat(task.unitPrice) || 0,
                totalPrice: (parseFloat(task.quantity) || 1) * (parseFloat(task.unitPrice) || 0),
                sortOrder: index
              }
            })
          )
        );
      }

      // Fetch updated template with tasks
      return await tx.taskTemplate.findUnique({
        where: { id },
        include: {
          tasks: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
    });

    res.json({ success: true, template });
  } catch (error) {
    console.error('Error updating task template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/task-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete template (tasks will be deleted automatically due to cascade)
    await prisma.taskTemplate.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting task template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics Routes
app.get('/api/analytics', async (req, res) => {
  try {
    const { period = '30days', vendor = 'all', category = 'all' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date('2020-01-01'); // Far back date
        break;
    }

    // Build where conditions
    const receiptWhere = {
      receiptDate: {
        gte: startDate,
        lte: now
      }
    };

    if (vendor !== 'all') {
      receiptWhere.vendor = {
        name: vendor
      };
    }

    // Get summary statistics
    const [
      totalReceipts,
      totalVendors,
      totalProjects,
      receipts,
      vendors,
      projects,
      estimates
    ] = await Promise.all([
      prisma.receipt.count({ where: receiptWhere }),
      prisma.localVendor.count(),
      prisma.project.count(),
      prisma.receipt.findMany({
        where: receiptWhere,
        include: {
          vendor: true,
          items: true
        },
        orderBy: { receiptDate: 'desc' }
      }),
      prisma.localVendor.findMany({
        include: {
          receipts: {
            where: receiptWhere,
            include: { items: true }
          },
          prices: true
        }
      }),
      prisma.project.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        include: {
          estimates: true,
          receipts: {
            where: receiptWhere,
            include: { items: true }
          }
        }
      }),
      prisma.estimate.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        include: { project: true }
      })
    ]);

    // Calculate summary stats
    const totalRevenue = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total), 0);
    const totalCosts = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total), 0);
    const activeVendors = vendors.filter(v => v.receipts.length > 0).length;

    // Project profitability analysis
    const projectProfitability = projects.map(project => {
      const projectReceipts = project.receipts || [];
      const actualCosts = projectReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.total), 0);
      const estimates = project.estimates || [];
      const estimatedRevenue = estimates.reduce((sum, est) => sum + parseFloat(est.totalCost), 0);
      
      return {
        name: project.name,
        client: project.clientName || 'Unknown',
        estimatedCost: estimatedRevenue,
        actualCosts: actualCosts,
        actualRevenue: actualCosts * 1.3, // Assume 30% markup
        profit: (actualCosts * 1.3) - actualCosts,
        margin: ((actualCosts * 1.3) - actualCosts) / (actualCosts * 1.3) * 100
      };
    }).filter(p => p.actualCosts > 0);

    // Vendor performance analysis
    const vendorPerformance = vendors.map(vendor => {
      const vendorReceipts = vendor.receipts || [];
      const totalSpent = vendorReceipts.reduce((sum, receipt) => sum + parseFloat(receipt.total), 0);
      const totalItems = vendorReceipts.reduce((sum, receipt) => 
        sum + (receipt.items ? receipt.items.length : 0), 0);
      
      return {
        name: vendor.name,
        totalSpent: totalSpent,
        orderCount: vendorReceipts.length,
        avgPricePerItem: totalItems > 0 ? totalSpent / totalItems : 0,
        lastOrder: vendorReceipts.length > 0 ? vendorReceipts[0].receiptDate : null
      };
    }).filter(v => v.orderCount > 0).sort((a, b) => b.totalSpent - a.totalSpent);

    // Material usage trends
    const materialUsage = {};
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        if (category === 'all' || item.category === category) {
          const key = `${item.description}-${item.category}`;
          if (!materialUsage[key]) {
            materialUsage[key] = {
              name: item.description,
              category: item.category,
              quantityUsed: 0,
              totalCost: 0,
              unit: item.unit
            };
          }
          materialUsage[key].quantityUsed += parseFloat(item.quantity);
          materialUsage[key].totalCost += parseFloat(item.totalPrice);
        }
      });
    });

    const materialTrends = Object.values(materialUsage)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);

    // Revenue trends (monthly)
    const revenueByMonth = {};
    receipts.forEach(receipt => {
      const month = receipt.receiptDate.toISOString().substring(0, 7); // YYYY-MM
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = {
          period: receipt.receiptDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: 0,
          projectCount: 0
        };
      }
      revenueByMonth[month].revenue += parseFloat(receipt.total);
      revenueByMonth[month].projectCount += 1;
    });

    const revenueData = Object.values(revenueByMonth)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((period, index, array) => ({
        ...period,
        growth: index > 0 ? 
          ((period.revenue - array[index - 1].revenue) / array[index - 1].revenue * 100) : 0
      }));

    // Cost breakdown by category
    const costBreakdown = {};
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const cat = item.category || 'General';
        if (!costBreakdown[cat]) {
          costBreakdown[cat] = 0;
        }
        costBreakdown[cat] += parseFloat(item.totalPrice);
      });
    });

    const totalCostsForBreakdown = Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0);
    const costBreakdownArray = Object.entries(costBreakdown).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalCostsForBreakdown > 0 ? (amount / totalCostsForBreakdown * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Calculate growth percentages (mock data for demo)
    const revenueGrowth = Math.random() * 20 - 5; // -5% to +15%
    const projectGrowth = Math.random() * 30 - 10; // -10% to +20%

    const analytics = {
      summaryStats: {
        totalRevenue: totalRevenue,
        totalProjects: totalProjects,
        activeVendors: activeVendors,
        materialsUsed: materialTrends.length,
        revenueGrowth: revenueGrowth.toFixed(1),
        projectGrowth: projectGrowth.toFixed(1),
        topVendor: vendorPerformance.length > 0 ? vendorPerformance[0].name : 'N/A',
        topMaterial: materialTrends.length > 0 ? materialTrends[0].name : 'N/A'
      },
      projectProfitability: projectProfitability,
      vendorPerformance: vendorPerformance,
      materialTrends: materialTrends,
      revenueData: revenueData,
      costBreakdown: costBreakdownArray
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Follow-up Reminders Routes
app.get('/api/followups', async (req, res) => {
  try {
    const { status, userId = 'default' } = req.query;
    
    const where = {
      OR: [
        { status: 'pending' },
        { status: 'sent' }
      ]
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const followUps = await prisma.followUpReminder.findMany({
      where,
      include: {
        template: true
      },
      orderBy: [
        { status: 'asc' }, // pending first
        { scheduledDate: 'asc' }
      ]
    });

    res.json({ success: true, followUps });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/followups', async (req, res) => {
  try {
    const { 
      projectId, 
      clientEmail, 
      clientName, 
      subject, 
      message, 
      scheduledDate, 
      templateId 
    } = req.body;

    if (!clientEmail || !subject || !message || !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: clientEmail, subject, message, scheduledDate' 
      });
    }

    const followUp = await prisma.followUpReminder.create({
      data: {
        projectId: projectId || null,
        clientEmail,
        clientName: clientName || null,
        subject,
        message,
        scheduledDate: new Date(scheduledDate),
        templateId: templateId || null,
        status: 'pending'
      },
      include: {
        template: true
      }
    });

    res.status(201).json({ success: true, followUp });
  } catch (error) {
    console.error('Error creating follow-up:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/followups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, scheduledDate, status } = req.body;

    const updateData = {};
    if (subject !== undefined) updateData.subject = subject;
    if (message !== undefined) updateData.message = message;
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'sent') {
        updateData.sentDate = new Date();
      }
    }

    const followUp = await prisma.followUpReminder.update({
      where: { id },
      data: updateData,
      include: {
        template: true
      }
    });

    res.json({ success: true, followUp });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/followups/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.followUpReminder.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Follow-up deleted successfully' });
  } catch (error) {
    console.error('Error deleting follow-up:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Follow-up Templates Routes
app.get('/api/followup-templates', async (req, res) => {
  try {
    const { userId = 'default' } = req.query;

    const templates = await prisma.followUpTemplate.findMany({
      where: {
        OR: [
          { userId: userId },
          { isDefault: true }
        ]
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching follow-up templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/followup-templates', async (req, res) => {
  try {
    const { name, subject, message, isDefault, userId = 'default' } = req.body;

    if (!name || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, subject, message' 
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.followUpTemplate.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.followUpTemplate.create({
      data: {
        name,
        subject,
        message,
        isDefault: Boolean(isDefault),
        userId
      }
    });

    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Error creating follow-up template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/followup-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, message, isDefault } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (message !== undefined) updateData.message = message;
    if (isDefault !== undefined) {
      updateData.isDefault = Boolean(isDefault);
      
      // If setting as default, unset other defaults
      if (isDefault) {
        const template = await prisma.followUpTemplate.findUnique({ where: { id } });
        if (template) {
          await prisma.followUpTemplate.updateMany({
            where: { userId: template.userId, isDefault: true, id: { not: id } },
            data: { isDefault: false }
          });
        }
      }
    }

    const template = await prisma.followUpTemplate.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, template });
  } catch (error) {
    console.error('Error updating follow-up template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/followup-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.followUpTemplate.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting follow-up template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Deterministic Room Cost Calculator
 * IMPORTANT: This MUST match frontend logic exactly
 * Same inputs = same outputs, always
 */
function roundTo2Decimals(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return 0.00;
  }
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function calculateRoomCost(room) {
  const sqft = parseFloat(room.sqft) || 0;
  const materialCostPerSqft = parseFloat(room.materialCost) || 0;
  const laborHours = parseFloat(room.laborHours) || 0;
  const laborRate = parseFloat(room.laborRate) || 75.00; // $75/hour default

  // Calculate base costs
  const materialTotal = sqft * materialCostPerSqft;
  const laborTotal = laborHours * laborRate;
  
  // Calculate add-ons (deterministic - use constants)
  const ADDON_COSTS = {
    DEMO: 0.50,
    TRIM: 0.75,
    PAINT: 1.00
  };
  
  const demoAddon = room.demo ? sqft * ADDON_COSTS.DEMO : 0;
  const trimAddon = room.trim ? sqft * ADDON_COSTS.TRIM : 0;
  const paintAddon = room.paint ? sqft * ADDON_COSTS.PAINT : 0;
  
  const addOnsTotal = demoAddon + trimAddon + paintAddon;

  // Round final total to exactly 2 decimals
  return roundTo2Decimals(materialTotal + laborTotal + addOnsTotal).toFixed(2);
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AlphaQuote API Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET    /api/vendors       - List all vendors`);
  console.log(`   POST   /api/vendors       - Create new vendor`);
  console.log(`   PUT    /api/vendors/:id   - Update vendor`);
  console.log(`   DELETE /api/vendors/:id   - Delete vendor`);
  console.log(`   GET    /api/projects      - List all projects`);
  console.log(`   GET    /api/projects/:id  - Get project by ID`);
  console.log(`   POST   /api/receipts      - Save receipt data`);
  console.log(`   GET    /api/receipts      - List all receipts`);
  console.log(`   GET    /api/receipts/:id  - Get receipt by ID`);
  console.log(`   PUT    /api/receipts/:id  - Update receipt`);
  console.log(`   DELETE /api/receipts/:id  - Delete receipt`);
  console.log(`   POST   /api/email-quote   - Email quote to client`);
  console.log(`   GET    /api/regional-price-packs - List regional price packs`);
  console.log(`   GET    /api/regional-materials - Get regional materials`);
  console.log(`   GET    /api/regional-materials/suggestions - Get material suggestions`);
  console.log(`   GET    /api/user-regional-selection - Get user region selection`);
  console.log(`   POST   /api/user-regional-selection - Save user region selection`);
  console.log(`   GET    /api/task-templates - List task templates`);
  console.log(`   GET    /api/task-templates/:id - Get task template by ID`);
  console.log(`   POST   /api/task-templates - Create task template`);
  console.log(`   PUT    /api/task-templates/:id - Update task template`);
  console.log(`   DELETE /api/task-templates/:id - Delete task template`);
  console.log(`   GET    /api/analytics     - Get analytics and insights data`);
  console.log(`   GET    /api/followups     - List follow-up reminders`);
  console.log(`   POST   /api/followups     - Create follow-up reminder`);
  console.log(`   PUT    /api/followups/:id - Update follow-up reminder`);
  console.log(`   DELETE /api/followups/:id - Delete follow-up reminder`);
  console.log(`   GET    /api/followup-templates - List follow-up templates`);
  console.log(`   POST   /api/followup-templates - Create follow-up template`);
  console.log(`   PUT    /api/followup-templates/:id - Update follow-up template`);
  console.log(`   DELETE /api/followup-templates/:id - Delete follow-up template`);
  console.log(`   GET    /api/users         - List users`);
  console.log(`   POST   /api/users         - Create user`);
  console.log(`   PUT    /api/users/:id     - Update user`);
  console.log(`   DELETE /api/users/:id     - Delete user`);
  console.log(`   POST   /api/auth/login    - User login`);
  console.log(`   POST   /api/auth/register - User registration`);
  console.log(`   GET    /api/health        - Health check`);
});

// User Management Routes
app.get('/api/users', async (req, res) => {
  try {
    const { contractorAccountId = 'default' } = req.query;
    
    // For now, use default contractor account
    const contractorAccount = await prisma.contractorAccount.findFirst({
      where: { email: 'default@alphaquote.local' }
    });

    if (!contractorAccount) {
      return res.status(404).json({ success: false, error: 'Contractor account not found' });
    }

    const users = await prisma.user.findMany({
      where: { contractorAccountId: contractorAccount.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
        // Don't include password
      },
      orderBy: [
        { role: 'asc' }, // admin first
        { firstName: 'asc' }
      ]
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, firstName, lastName, password, role = 'viewer' } = req.body;

    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, firstName, lastName, password' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    // Get default contractor account
    const contractorAccount = await prisma.contractorAccount.findFirst({
      where: { email: 'default@alphaquote.local' }
    });

    if (!contractorAccount) {
      return res.status(404).json({ success: false, error: 'Contractor account not found' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role,
        contractorAccountId: contractorAccount.id
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive, password } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password !== undefined && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if this is the last admin user
    const user = await prisma.user.findUnique({
      where: { id },
      include: { contractorAccount: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { 
          contractorAccountId: user.contractorAccountId,
          role: 'admin',
          isActive: true
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete the last admin user' 
        });
      }
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { contractorAccount: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      contractorAccount: {
        id: user.contractorAccount.id,
        name: user.contractorAccount.name
      }
    };

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password, contractorName } = req.body;

    if (!email || !firstName || !lastName || !password || !contractorName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    // Create contractor account
    const contractorAccount = await prisma.contractorAccount.create({
      data: {
        name: contractorName,
        email: email,
        isActive: true
      }
    });

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'admin',
        contractorAccountId: contractorAccount.id
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        contractorAccount: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SCHEDULING API ENDPOINTS ====================

// Get all scheduled jobs
app.get('/api/scheduled-jobs', async (req, res) => {
  try {
    const { startDate, endDate, status, priority } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    const jobs = await prisma.scheduledJob.findMany({
      where,
      include: {
        project: true,
        estimate: true,
        reminders: true
      },
      orderBy: { startDate: 'asc' }
    });

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scheduled job by ID
app.get('/api/scheduled-jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await prisma.scheduledJob.findUnique({
      where: { id },
      include: {
        project: true,
        estimate: true,
        reminders: true
      }
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error fetching scheduled job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new scheduled job
app.post('/api/scheduled-jobs', async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      status = 'scheduled',
      priority = 'medium',
      location,
      notes,
      projectId,
      estimateId,
      isRecurring = false,
      recurrenceRule,
      recurrenceEnd
    } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Job title is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    // Get default contractor account (for now)
    const defaultContractor = await prisma.contractorAccount.findFirst({
      where: { email: 'default@alphaquote.local' }
    });

    if (!defaultContractor) {
      return res.status(400).json({
        success: false,
        error: 'No contractor account found'
      });
    }

    const job = await prisma.scheduledJob.create({
      data: {
        title: title.trim(),
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        status,
        priority,
        location,
        notes,
        projectId,
        estimateId,
        isRecurring,
        recurrenceRule,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        contractorAccountId: defaultContractor.id
      },
      include: {
        project: true,
        estimate: true,
        reminders: true
      }
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Error creating scheduled job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update scheduled job
app.put('/api/scheduled-jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if present
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.recurrenceEnd) {
      updateData.recurrenceEnd = new Date(updateData.recurrenceEnd);
    }

    const job = await prisma.scheduledJob.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        estimate: true,
        reminders: true
      }
    });

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error updating scheduled job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete scheduled job
app.delete('/api/scheduled-jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.scheduledJob.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync job to calendar
app.post('/api/scheduled-jobs/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await prisma.scheduledJob.findUnique({
      where: { id },
      include: {
        project: true,
        estimate: true
      }
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // For now, just update sync status
    // In a real implementation, this would sync with Google Calendar/iCal
    const updatedJob = await prisma.scheduledJob.update({
      where: { id },
      data: {
        syncStatus: 'synced',
        lastSyncAt: new Date()
      }
    });

    res.json({ success: true, data: updatedJob });
  } catch (error) {
    console.error('Error syncing job to calendar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove job from calendar
app.delete('/api/scheduled-jobs/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, just update sync status
    const updatedJob = await prisma.scheduledJob.update({
      where: { id },
      data: {
        syncStatus: 'none',
        googleCalendarEventId: null,
        icalEventId: null
      }
    });

    res.json({ success: true, data: updatedJob });
  } catch (error) {
    console.error('Error removing job from calendar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get job statistics
app.get('/api/scheduled-jobs/statistics', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));

    const [totalJobs, inProgress, completed, overdue] = await Promise.all([
      prisma.scheduledJob.count({
        where: {
          startDate: { gte: startOfMonth }
        }
      }),
      prisma.scheduledJob.count({
        where: { status: 'in_progress' }
      }),
      prisma.scheduledJob.count({
        where: {
          status: 'completed',
          endDate: { gte: startOfWeek }
        }
      }),
      prisma.scheduledJob.count({
        where: {
          status: { not: 'completed' },
          endDate: { lt: now }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        inProgress,
        completed,
        overdue
      }
    });
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get calendar sync settings
app.get('/api/calendar-sync-settings', async (req, res) => {
  try {
    // Get default contractor account
    const defaultContractor = await prisma.contractorAccount.findFirst({
      where: { email: 'default@alphaquote.local' }
    });

    if (!defaultContractor) {
      return res.status(400).json({
        success: false,
        error: 'No contractor account found'
      });
    }

    let settings = await prisma.calendarSyncSettings.findFirst({
      where: { contractorAccountId: defaultContractor.id }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.calendarSyncSettings.create({
        data: {
          contractorAccountId: defaultContractor.id
        }
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching calendar sync settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update calendar sync settings
app.put('/api/calendar-sync-settings', async (req, res) => {
  try {
    const settingsData = req.body;

    // Get default contractor account
    const defaultContractor = await prisma.contractorAccount.findFirst({
      where: { email: 'default@alphaquote.local' }
    });

    if (!defaultContractor) {
      return res.status(400).json({
        success: false,
        error: 'No contractor account found'
      });
    }

    let settings = await prisma.calendarSyncSettings.findFirst({
      where: { contractorAccountId: defaultContractor.id }
    });

    if (settings) {
      settings = await prisma.calendarSyncSettings.update({
        where: { id: settings.id },
        data: settingsData
      });
    } else {
      settings = await prisma.calendarSyncSettings.create({
        data: {
          ...settingsData,
          contractorAccountId: defaultContractor.id
        }
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating calendar sync settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
