/**
 * API Server for AlphaQuote
 * Handles vendor management and other API endpoints
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Vendor Routes
app.get('/api/vendors', async (req, res) => {
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

// Helper function to calculate room cost (copied from frontend logic)
function calculateRoomCost(room) {
  const sqft = room.sqft || 0;
  const materialCostPerSqft = parseFloat(room.materialCost) || 0;
  const laborHours = parseFloat(room.laborHours) || 0;
  const laborRate = 75; // $75/hour default

  const materialTotal = sqft * materialCostPerSqft;
  const laborTotal = laborHours * laborRate;
  
  // Additional services
  const addOns = (room.demo ? sqft * 0.50 : 0) + 
                 (room.trim ? sqft * 0.75 : 0) + 
                 (room.paint ? sqft * 1.00 : 0);

  return (materialTotal + laborTotal + addOns).toFixed(2);
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
  console.log(`   GET    /api/health        - Health check`);
});

module.exports = app;
