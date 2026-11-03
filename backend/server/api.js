/**
 * API Server for AlphaQuote
 * Handles vendor management and other API endpoints
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { authenticateUser } = require('../middleware/auth');
const { resolveTenant, scopeWhere } = require('../middleware/tenant');
const { escapeHtml, sanitizeHeaderValue } = require('../utils/escapeHtml');
const { Webhook } = require('svix');
const userService = require('../services/userService');
// Pass Five (Iron Legion tailoring): editable pricing/catalog defaults —
// labor rates, quote terms, company display name. See that module for
// the source of the numbers (Iron Legion pricing sheet, Oct 2026).
const pricingDefaults = require('../config/pricingDefaults');

// Data routes require a verified Clerk identity AND a provisioned tenant.
const requireTenantAuth = [authenticateUser, resolveTenant];
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
// CORS: explicit allowlist only (Pass Two). Origins come from the
// CORS_ALLOWED_ORIGINS env var (comma-separated); by default only the
// configured frontend URL and the local dev origins are allowed.
// Requests with no Origin header (curl, server-to-server) are not browser
// CORS requests and pass; browser requests from unlisted origins receive
// no CORS headers, so browsers block them.
const corsAllowlist = (
  process.env.CORS_ALLOWED_ORIGINS ||
  [config.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].join(',')
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsAllowlist.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));
// Clerk webhook (Pass Two finish). This is the ONE new public route: it is
// registered BEFORE express.json() because Svix signature verification
// needs the exact raw request body. It is not token-authenticated —
// authenticity comes from the Svix signature, verified against
// CLERK_WEBHOOK_SECRET. Unsigned or invalidly-signed deliveries get 401,
// and the endpoint fails closed when the secret is not configured.
app.post(
  '/api/webhooks/clerk',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    if (!webhookSecret || !svixId || !svixTimestamp || !svixSignature) {
      return res.status(401).json({ success: false, error: 'Webhook signature verification failed' });
    }

    let evt;
    try {
      const rawBody = req.body.toString('utf8');
      // svix v2: verify() throws on an invalid signature and returns
      // nothing on success, so the event is parsed from the raw body
      // only after the signature has been verified.
      new Webhook(webhookSecret).verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature
      });
      evt = JSON.parse(rawBody);
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Webhook signature verification failed' });
    }

    try {
      if (evt.type === 'user.created' || evt.type === 'user.updated') {
        const result = await userService.createOrUpdateUser(evt.data);
        if (!result.success) {
          console.error('Clerk webhook provisioning failed:', result.error);
          return res.status(500).json({ success: false, error: 'Provisioning failed' });
        }
      } else if (evt.type === 'user.deleted') {
        if (evt.data && evt.data.id) {
          await userService.deactivateUserByClerkId(evt.data.id);
        }
      }
      // Any other event type is acknowledged and ignored.
      return res.json({ success: true });
    } catch (error) {
      console.error('Clerk webhook handling error:', error);
      return res.status(500).json({ success: false, error: 'Webhook handling failed' });
    }
  }
);

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

// Clerk's default session token carries the user id (sub) but NOT the
// email/name claims — those only appear if the instance's session token
// has been customized. Provisioning (userService.createOrUpdateUser)
// hard-requires an email, so a verified identity without one can never
// provision: sync resolves the full profile from Clerk's Backend API
// first. The returned user object is the Backend API shape, which
// createOrUpdateUser's normalizer already accepts (same family as the
// webhook user object). The client is built lazily so importing this
// module never requires credentials (and tests can stub the SDK first).
let clerkBackendClient = null;
function fetchClerkUserProfile(userId) {
  if (!clerkBackendClient) {
    const { Clerk } = require('@clerk/clerk-sdk-node');
    clerkBackendClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
  }
  return clerkBackendClient.users.getUser(userId);
}

app.post('/api/users/sync', authenticateUser, async (req, res) => {
  try {
    let identity = req.user;

    if (!identity.email) {
      let clerkUser = null;
      try {
        clerkUser = await fetchClerkUserProfile(identity.id);
      } catch (error) {
        console.error('Clerk profile fetch failed during sync:', error);
      }

      const profileEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
      if (!profileEmail) {
        // No profile (or no primary email on it): provisioning cannot
        // proceed. Answer 502 and create nothing — no partial user or
        // contractor-account rows.
        return res.status(502).json({
          success: false,
          error: 'Could not load your account profile from Clerk. Please try again.'
        });
      }

      identity = clerkUser;
    }

    const result = await userService.createOrUpdateUser(identity);

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

// Pass Six (no setup): POST /api/users/setup is gone. There is no setup
// step to complete — provisioning (userService.createOrUpdateUser)
// creates the account under the Iron Legion name and stamps setup
// completion server-side at creation. Nothing a client sends can set
// that stamp.

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
    const hasPro = await userService.hasProSubscription(req.user.id, req.user.metadata);
    
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

// Vendor Routes (tenant auth required, like every data route)
app.get('/api/vendors', requireTenantAuth, async (req, res) => {
  try {
    const vendors = await prisma.localVendor.findMany({
      where: scopeWhere(req),
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

app.get('/api/vendors/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.localVendor.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] },
      include: {
        prices: true,
        receipts: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/vendors', requireTenantAuth, async (req, res) => {
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
        contractorAccountId: req.tenantId,
        createdById: req.dbUser.id,
      },
    });

    console.log('✅ Vendor created:', vendor);
    res.status(201).json({ success: true, vendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/vendors/:id', requireTenantAuth, async (req, res) => {
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

    const ownedVendor = await prisma.localVendor.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedVendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
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

app.delete('/api/vendors/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedVendor = await prisma.localVendor.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedVendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Receipts cannot exist without a vendor (Receipt.vendorId is a
    // required relation), so a vendor with receipts on file cannot be
    // deleted. Answer honestly with a 409 and the count instead of
    // letting the database foreign key fail as an opaque 500 (Pass
    // Seven: this was a live "vendors page wasn't working" cause —
    // receipts auto-create vendors, so nearly every real vendor hit it).
    const receiptCount = await prisma.receipt.count({
      where: { vendorId: id }
    });
    if (receiptCount > 0) {
      return res.status(409).json({
        success: false,
        error: `This vendor has ${receiptCount} receipt${receiptCount === 1 ? '' : 's'} on file. Delete those receipts first, then delete the vendor.`
      });
    }

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
app.get('/api/projects', requireTenantAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: scopeWhere(req),
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

app.get('/api/projects/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] },
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
//
// Pass Seven (receipts maintainable) helpers. Two dialect notes drove
// their shape:
//  - Vendor matching is case-insensitive and done in JS over the
//    tenant's (small) vendor list: exact `=` matching is case-sensitive
//    in Postgres, so "Home Depot" vs "home depot" used to create
//    duplicate vendors depending on who typed the receipt.
//  - Line totals are computed on the server from quantity x unitPrice,
//    so stored receipts always reconcile no matter what the client sent.

function normalizeReceiptItems(rawItems) {
  // Returns { items } or { error }. Each item is validated and its line
  // total computed server-side.
  const items = [];
  for (const item of rawItems) {
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    const quantity = parseFloat(item?.quantity);
    const unitPrice = parseFloat(item?.unitPrice);
    if (!name || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      return { error: 'Each item needs a name, a quantity above 0, and a valid unit price' };
    }
    items.push({
      name,
      quantity,
      unitPrice,
      total: roundTo2Decimals(quantity * unitPrice),
      unit: typeof item.unit === 'string' && item.unit.trim() ? item.unit.trim() : 'each',
      synthetic: false
    });
  }
  return { items };
}

async function findTenantVendorByName(req, name) {
  const target = name.trim().toLowerCase();
  const vendors = await prisma.localVendor.findMany({ where: scopeWhere(req) });
  return vendors.find((v) => v.name.trim().toLowerCase() === target) || null;
}

async function learnVendorPrices(vendorRecord, receiptId, lineItems) {
  // Receipt -> vendor price learning: the vendor's latest unit price for
  // each material on the receipt. Synthetic "Receipt total" lines are
  // not materials and never teach a price.
  for (const item of lineItems) {
    if (item.synthetic) continue;
    const materialKey = toMaterialKey(item.name);
    if (!materialKey) continue;

    const existingPrice = await prisma.localVendorPrice.findFirst({
      where: { vendorId: vendorRecord.id, materialKey }
    });

    if (existingPrice) {
      await prisma.localVendorPrice.update({
        where: { id: existingPrice.id },
        data: {
          unitPrice: item.unitPrice,
          materialName: item.name,
          lastUpdated: new Date(),
          receiptId
        }
      });
    } else {
      await prisma.localVendorPrice.create({
        data: {
          vendorId: vendorRecord.id,
          materialKey,
          materialName: item.name,
          unitPrice: item.unitPrice,
          unitLabel: item.unit,
          category: 'General',
          confidence: 1.0,
          receiptId
        }
      });
    }
  }
}

app.post('/api/receipts', requireTenantAuth, async (req, res) => {
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

    const parsedDate = new Date(purchaseDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Purchase date is invalid'
      });
    }

    // Validate + normalize line items (server computes the line totals).
    const normalized = normalizeReceiptItems(Array.isArray(items) ? items : []);
    if (normalized.error) {
      return res.status(400).json({ success: false, error: normalized.error });
    }
    const lineItems = normalized.items;

    const clientTotal = parseFloat(total);
    if (lineItems.length === 0) {
      // Manual receipt: vendor/date/total typed by hand with no line
      // items (the ReceiptNew manual path). Keep exactly one line item
      // for the total so the receipt reconciles; it is flagged synthetic
      // and excluded from price learning. Without a usable total there
      // is nothing to save.
      if (!Number.isFinite(clientTotal) || clientTotal <= 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one item is required'
        });
      }
      lineItems.push({
        name: 'Receipt total',
        quantity: 1,
        unitPrice: clientTotal,
        total: roundTo2Decimals(clientTotal),
        unit: 'each',
        synthetic: true
      });
    }

    const itemsTotal = roundTo2Decimals(lineItems.reduce((sum, item) => sum + item.total, 0));
    const receiptTotal = Number.isFinite(clientTotal) && clientTotal > 0
      ? roundTo2Decimals(clientTotal)
      : itemsTotal;

    // Create or find vendor (case-insensitive within this tenant)
    let vendorRecord = await findTenantVendorByName(req, vendor);

    if (!vendorRecord) {
      vendorRecord = await prisma.localVendor.create({
        data: {
          name: vendor.trim(),
          contact: null,
          notes: 'Created from receipt processing',
          contractorAccountId: req.tenantId,
          createdById: req.dbUser.id
        }
      });
    }

    // If a project is referenced, it must belong to the caller's tenant
    if (projectId) {
      const ownedProject = await prisma.project.findFirst({
        where: { AND: [{ id: projectId }, scopeWhere(req)] }
      });
      if (!ownedProject) {
        return res.status(400).json({
          success: false,
          error: 'Project not found'
        });
      }
    }

    // Create receipt record (total reconciled above)
    const receipt = await prisma.receipt.create({
      data: {
        vendorId: vendorRecord.id,
        receiptDate: parsedDate,
        total: receiptTotal,
        fileName: fileName || 'unknown',
        category: 'General',
        verified: false,
        projectId: projectId || null,
        contractorAccountId: req.tenantId,
        createdById: req.dbUser.id
      }
    });

    // Create receipt items with the server-computed line totals
    const receiptItems = await Promise.all(
      lineItems.map(item =>
        prisma.receiptItem.create({
          data: {
            receiptId: receipt.id,
            description: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.total,
            unit: item.unit,
            category: 'General'
          }
        })
      )
    );

    // Receipt -> vendor price learning
    await learnVendorPrices(vendorRecord, receipt.id, lineItems);

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

app.get('/api/receipts', requireTenantAuth, async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      where: scopeWhere(req),
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
        status: receipt.verified ? 'verified' : 'manual',
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

app.get('/api/receipts/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] },
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
        status: receipt.verified ? 'verified' : 'manual',
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

app.put('/api/receipts/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorName, purchaseDate, totalAmount, notes, status, projectId, items } = req.body;

    const ownedReceipt = await prisma.receipt.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedReceipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }

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

    const parsedDate = new Date(purchaseDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Purchase date is invalid'
      });
    }

    // Optional line-item replacement (Pass Seven): when `items` is sent,
    // it fully replaces the receipt's items with server-computed totals,
    // and the total is derived from them unless explicitly provided.
    let lineItems = null;
    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: 'Items must be an array'
        });
      }
      const normalized = normalizeReceiptItems(items);
      if (normalized.error) {
        return res.status(400).json({ success: false, error: normalized.error });
      }
      lineItems = normalized.items;
    }

    let receiptTotal;
    if (totalAmount !== undefined && totalAmount !== null && totalAmount !== '') {
      const parsedTotal = parseFloat(totalAmount);
      if (isNaN(parsedTotal) || parsedTotal <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid total amount is required'
        });
      }
      receiptTotal = roundTo2Decimals(parsedTotal);
    } else if (lineItems) {
      if (lineItems.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid total amount is required'
        });
      }
      receiptTotal = roundTo2Decimals(lineItems.reduce((sum, item) => sum + item.total, 0));
    } else {
      return res.status(400).json({
        success: false,
        error: 'Valid total amount is required'
      });
    }

    if (lineItems && lineItems.length === 0) {
      // Same manual-receipt rule as POST: keep one synthetic line for
      // the total so the receipt reconciles.
      lineItems.push({
        name: 'Receipt total',
        quantity: 1,
        unitPrice: receiptTotal,
        total: receiptTotal,
        unit: 'each',
        synthetic: true
      });
    }

    // If a project is referenced, it must belong to the caller's tenant
    if (projectId) {
      const ownedProject = await prisma.project.findFirst({
        where: { AND: [{ id: projectId }, scopeWhere(req)] }
      });
      if (!ownedProject) {
        return res.status(400).json({
          success: false,
          error: 'Project not found'
        });
      }
    }

    // Find or create vendor (case-insensitive within this tenant)
    let vendorRecord = await findTenantVendorByName(req, vendorName);

    if (!vendorRecord) {
      vendorRecord = await prisma.localVendor.create({
        data: {
          name: vendorName.trim(),
          contact: null,
          notes: 'Created from receipt update',
          contractorAccountId: req.tenantId,
          createdById: req.dbUser.id
        }
      });
    }

    // Update receipt (verified only changes when status is sent)
    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: {
        vendorId: vendorRecord.id,
        receiptDate: parsedDate,
        total: receiptTotal,
        projectId: projectId || null,
        ...(status !== undefined ? { verified: status === 'verified' } : {})
      },
      include: {
        vendor: true,
        projectRef: true
      }
    });

    // Replace line items when provided, then re-teach vendor prices
    let itemsCount = undefined;
    if (lineItems) {
      await prisma.receiptItem.deleteMany({ where: { receiptId: id } });
      await Promise.all(
        lineItems.map(item =>
          prisma.receiptItem.create({
            data: {
              receiptId: id,
              description: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.total,
              unit: item.unit,
              category: 'General'
            }
          })
        )
      );
      itemsCount = lineItems.length;
      await learnVendorPrices(vendorRecord, id, lineItems);
    }

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
        status: updatedReceipt.verified ? 'verified' : 'manual',
        ...(itemsCount !== undefined ? { itemsCount } : {})
      }
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/receipts/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedReceipt = await prisma.receipt.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedReceipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found'
      });
    }

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

// ---------------------------------------------------------------------------
// Price lookup routes (Pass Seven)
//
// The browser never talks to the scraper service directly. These routes
// are the only path to live pricing:
//   - /api/prices/by-material — prices this tenant's receipts have taught
//     (LocalVendorPrice rows), the receipt-price step of the estimate
//     price chain.
//   - /api/prices/lookup — server-to-server proxy to the scraper service
//     (SCRAPER_SERVICE_URL + SCRAPER_SHARED_SECRET). Degradation is
//     honest: unconfigured or unreachable returns price:null with a
//     source explaining why — never an invented number.
//   - /api/prices/status — what the frontend status widget reads.
// ---------------------------------------------------------------------------

const toMaterialKey = (name) =>
  String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const getScraperConfig = () => ({
  url: (process.env.SCRAPER_SERVICE_URL || '').replace(/\/+$/, ''),
  secret: process.env.SCRAPER_SHARED_SECRET || ''
});

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One scraper call with a single retry on transport failure or a 502
 * (upstream SerpAPI error). A 503 from the scraper means "not
 * configured" — retrying cannot help, so it is returned as-is.
 * Throws only when both attempts fail at the transport level.
 */
async function callScraper(search, zip) {
  const { url, secret } = getScraperConfig();
  const timeoutMs = parseInt(process.env.SCRAPER_TIMEOUT_MS || '15000', 10);
  const target = `${url}/scrape-price?search=${encodeURIComponent(search)}&zip=${encodeURIComponent(zip || '')}&sites=allStores`;

  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout(
        target,
        { headers: { 'x-scraper-secret': secret } },
        timeoutMs
      );
      if (response.status === 502 && attempt === 0) {
        continue; // one retry on upstream failure
      }
      const body = await response.json().catch(() => null);
      return { status: response.status, body };
    } catch (error) {
      lastError = error; // transport failure / timeout — retry once
    }
  }
  throw lastError || new Error('Scraper request failed');
}

app.get('/api/prices/by-material', requireTenantAuth, async (req, res) => {
  try {
    const material = typeof req.query.material === 'string' ? req.query.material.trim() : '';
    if (!material) {
      return res.status(400).json({ success: false, error: 'Query parameter "material" is required' });
    }

    // Tenant-scoped: only prices learned from THIS tenant's vendors.
    const tenantVendors = await prisma.localVendor.findMany({
      where: scopeWhere(req),
      select: { id: true }
    });
    const vendorIds = tenantVendors.map((v) => v.id);
    if (vendorIds.length === 0) {
      return res.json({ success: true, prices: [] });
    }

    const prices = await prisma.localVendorPrice.findMany({
      where: {
        vendorId: { in: vendorIds },
        materialKey: toMaterialKey(material)
      },
      include: { vendor: { select: { name: true } } },
      orderBy: { lastUpdated: 'desc' }
    });

    res.json({
      success: true,
      prices: prices.map((p) => ({
        id: p.id,
        materialName: p.materialName,
        materialKey: p.materialKey,
        unitPrice: p.unitPrice,
        unitLabel: p.unitLabel,
        category: p.category,
        lastUpdated: p.lastUpdated,
        vendor: { name: p.vendor.name }
      }))
    });
  } catch (error) {
    console.error('Error fetching material prices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/prices/lookup', requireTenantAuth, async (req, res) => {
  const material = typeof req.query.material === 'string' ? req.query.material.trim() : '';
  if (!material) {
    return res.status(400).json({ success: false, error: 'Query parameter "material" is required' });
  }
  if (material.length > 120) {
    return res.status(400).json({ success: false, error: 'Query parameter "material" is too long (max 120 characters)' });
  }
  const zip = typeof req.query.zip === 'string' ? req.query.zip.trim() : '';

  const { url, secret } = getScraperConfig();
  if (!url || !secret) {
    // Honest degradation: live lookup is not wired up on this deployment.
    return res.json({
      success: true,
      source: 'unconfigured',
      query: material,
      price: null,
      results: [],
      message: 'Live price lookup is not configured on this server'
    });
  }

  try {
    const { status, body } = await callScraper(material, zip);

    if (status === 503 || body?.source === 'unconfigured') {
      return res.json({
        success: true,
        source: 'unconfigured',
        query: material,
        price: null,
        results: [],
        message: 'Live price lookup is not configured on the scraper service'
      });
    }

    if (status !== 200 || !body || body.success === false) {
      return res.json({
        success: true,
        source: 'unavailable',
        query: material,
        price: null,
        results: [],
        message: 'Live price lookup is temporarily unavailable'
      });
    }

    const results = (body.results || [])
      .filter((r) => typeof r.priceValue === 'number' && r.priceValue > 0)
      .slice(0, 10)
      .map((r) => ({
        title: r.title,
        price: r.price,
        priceValue: r.priceValue,
        source: r.source
      }));

    const price = results.length > 0
      ? results.reduce((sum, r) => sum + r.priceValue, 0) / results.length
      : null;

    return res.json({
      success: true,
      source: price !== null ? 'live' : 'unavailable',
      query: material,
      price,
      results,
      message: price !== null ? undefined : 'No live prices found for this material'
    });
  } catch (error) {
    console.error('Scraper lookup failed:', error.message);
    return res.json({
      success: true,
      source: 'unavailable',
      query: material,
      price: null,
      results: [],
      message: 'Live price lookup is temporarily unavailable'
    });
  }
});

app.get('/api/prices/status', requireTenantAuth, async (req, res) => {
  const { url, secret } = getScraperConfig();
  if (!url || !secret) {
    return res.json({ success: true, configured: false, reachable: false, serpApiConfigured: false });
  }
  try {
    const response = await fetchWithTimeout(`${url}/health`, {}, 3000);
    if (!response.ok) {
      return res.json({ success: true, configured: true, reachable: false, serpApiConfigured: false });
    }
    const body = await response.json().catch(() => ({}));
    return res.json({
      success: true,
      configured: true,
      reachable: true,
      serpApiConfigured: Boolean(body.serpApiConfigured)
    });
  } catch (error) {
    return res.json({ success: true, configured: true, reachable: false, serpApiConfigured: false });
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
app.post('/api/email-quote', authenticateUser, async (req, res) => {
  try {
    const { recipient, subject, message, quoteData } = req.body;

    if (!recipient || !subject) {
      return res.status(400).json({ 
        error: 'Recipient email and subject are required' 
      });
    }

    if (!quoteData || !quoteData.projectInfo || !Array.isArray(quoteData.rooms)) {
      return res.status(400).json({
        error: 'Quote data with project info and rooms is required'
      });
    }

    // Pass Two: every caller-supplied value that lands in the email is
    // sanitized first — headers get CR/LF stripped, HTML body values are
    // escaped. Previously this endpoint interpolated raw caller data into
    // HTML and required no authentication at all.
    const safeSubject = sanitizeHeaderValue(subject);
    const safeRecipient = sanitizeHeaderValue(recipient);
    const safeMessage = escapeHtml(message || 'Please find attached your detailed construction estimate.');
    const info = quoteData.projectInfo;
    const safeQuoteData = {
      projectInfo: {
        clientName: escapeHtml(info.clientName),
        jobType: escapeHtml(info.jobType),
        projectDescription: escapeHtml(info.projectDescription),
        address: escapeHtml(info.address),
        phone: escapeHtml(info.phone),
        email: escapeHtml(info.email)
      },
      rooms: quoteData.rooms.map((room) => ({
        ...room,
        name: escapeHtml(room.name),
        sqft: escapeHtml(room.sqft),
        material: escapeHtml(room.material),
        materialCost: escapeHtml(room.materialCost),
        labor: escapeHtml(room.labor),
        laborHours: escapeHtml(room.laborHours)
      })),
      subtotal: escapeHtml(quoteData.subtotal),
      markup: escapeHtml(quoteData.markup),
      markupAmount: escapeHtml(quoteData.markupAmount),
      total: escapeHtml(quoteData.total)
    };

    // Pass Five: the quote carries the sender's own company name.
    // Resolve it from the caller's provisioned contractor account;
    // fall back to the Iron Legion default when there is no account
    // row to read (e.g. the identity has not been provisioned yet).
    let companyName = pricingDefaults.COMPANY_DISPLAY_NAME;
    try {
      const meResult = await userService.getUserByClerkId(req.user.id);
      if (meResult.success && meResult.data.contractorAccount?.name) {
        companyName = meResult.data.contractorAccount.name;
      }
    } catch (lookupError) {
      console.log('Company name lookup failed, using default:', lookupError.message);
    }
    const safeCompanyName = escapeHtml(companyName);
    const termsHtml = pricingDefaults.QUOTE_TERMS
      .map((term) => `<p style="margin: 4px 0;">${escapeHtml(term)}</p>`)
      .join('');

    // Format the quote data into HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00d4ff; font-size: 28px; margin-bottom: 10px;">🧮 ${safeCompanyName} Estimate</h1>
          <p style="color: #666; font-size: 16px;">Professional Construction Estimate</p>
          <p style="color: #999; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; font-size: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Project Information</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div><strong>Client:</strong> ${safeQuoteData.projectInfo.clientName}</div>
            <div><strong>Job Type:</strong> ${safeQuoteData.projectInfo.jobType}</div>
            <div><strong>Project:</strong> ${safeQuoteData.projectInfo.projectDescription}</div>
            <div><strong>Address:</strong> ${safeQuoteData.projectInfo.address}</div>
            <div><strong>Phone:</strong> ${safeQuoteData.projectInfo.phone}</div>
            <div><strong>Email:</strong> ${safeQuoteData.projectInfo.email}</div>
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
              ${safeQuoteData.rooms.map((room, index) => `
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
            <span style="font-weight: bold;">$${safeQuoteData.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Markup (${safeQuoteData.markup}%):</span>
            <span style="font-weight: bold;">$${safeQuoteData.markupAmount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #ccc; padding-top: 10px;">
            <span>Total:</span>
            <span style="color: #00d4ff;">$${safeQuoteData.total}</span>
          </div>
        </div>

        <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
          <p>Thank you for choosing ${safeCompanyName} for your construction needs.</p>
          ${termsHtml}
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
          <p style="color: #666; line-height: 1.6;">${safeMessage}</p>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'AlphaQuote141@gmail.com',
      to: safeRecipient,
      subject: safeSubject,
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
    console.log(`💰 Quote total: $${safeQuoteData.total}`);

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
app.get('/api/regional-price-packs', authenticateUser, async (req, res) => {
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

app.get('/api/regional-materials', authenticateUser, async (req, res) => {
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

    let materials = await prisma.regionalMaterial.findMany({
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

    // Case-insensitive search is filtered in JS (Pass Seven): Prisma's
    // `mode: 'insensitive'` is Postgres-only — on SQLite it throws a
    // validation error and the route 500s, so the two dialects could
    // never share one query. The catalog is small; identical semantics
    // on both dialects beats a dialect-specific query.
    if (search) {
      const needle = search.toLowerCase();
      materials = materials.filter((m) =>
        (m.materialName || '').toLowerCase().includes(needle) ||
        (m.category || '').toLowerCase().includes(needle) ||
        (m.description || '').toLowerCase().includes(needle)
      );
    }

    res.json(materials);
  } catch (error) {
    console.error('Error fetching regional materials:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/regional-materials/suggestions', authenticateUser, async (req, res) => {
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

    // If category is provided, filter by category
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    let suggestions = await prisma.regionalMaterial.findMany({
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

    // Material-name matching is case-insensitive and done in JS for the
    // same reason as /api/regional-materials above (Prisma's insensitive
    // mode is Postgres-only and 500s on SQLite).
    if (materialName) {
      const nameNeedle = materialName.toLowerCase();
      const keyNeedle = materialName.toLowerCase().replace(/\s+/g, '_');
      suggestions = suggestions.filter((m) =>
        (m.materialName || '').toLowerCase().includes(nameNeedle) ||
        (m.materialKey || '').toLowerCase().includes(keyNeedle)
      );
    }

    res.json(suggestions.slice(0, 10)); // Limit to 10 suggestions
  } catch (error) {
    console.error('Error fetching material suggestions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/user-regional-selection', authenticateUser, async (req, res) => {
  try {
    const { pricePackId } = req.body;
    const userId = req.user.id; // Pass Two: identity comes from the verified token, never the request body
    
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
      where: { userId },
      update: { 
        pricePackId: pricePackId,
        updatedAt: new Date()
      },
      create: {
        userId,
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

app.get('/api/user-regional-selection', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // Pass Two: identity from the verified token, never the query string

    const userSelection = await prisma.userRegionalSelection.findUnique({
      where: { userId },
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
// Pass Five landing addendum: the starter-template library must exist in
// every environment, but the demo seed (prisma/seed.js) wipes data and must
// never run in production. So the public library self-populates lazily:
// the first template-list request in a database with no public templates
// creates the Iron Legion starters from config (public, system-owned).
// Idempotent (count-guarded) and concurrency-safe (shared in-flight promise;
// a failure resets the guard so a later request can retry).
let starterTemplatesPromise = null;
function ensureStarterTemplates() {
  if (!starterTemplatesPromise) {
    starterTemplatesPromise = (async () => {
      const existing = await prisma.taskTemplate.count({ where: { isPublic: true } });
      if (existing > 0) return;
      for (const t of pricingDefaults.STARTER_TEMPLATES) {
        await prisma.taskTemplate.create({
          data: {
            name: t.name,
            description: t.description,
            category: t.category,
            isPublic: true,
            userId: 'system',
            tasks: {
              create: t.tasks.map((task, index) => ({
                name: task.name,
                description: task.description,
                category: task.category,
                unit: task.unit,
                quantity: task.quantity,
                unitPrice: task.unitPrice,
                totalPrice: task.quantity * task.unitPrice,
                sortOrder: index
              }))
            }
          }
        });
      }
      console.log(`📋 Starter template library created (${pricingDefaults.STARTER_TEMPLATES.length} templates)`);
    })().catch((error) => {
      console.error('Starter template ensure failed:', error.message);
      starterTemplatesPromise = null;
    });
  }
  return starterTemplatesPromise;
}

app.get('/api/task-templates', requireTenantAuth, async (req, res) => {
  try {
    await ensureStarterTemplates();
    const { category } = req.query;

    // Visible set (Pass Two): public templates plus the caller's own
    const visibility = {
      OR: [
        { isPublic: true },
        { userId: req.user.id },
        scopeWhere(req)
      ]
    };

    const where = category
      ? { AND: [visibility, { category }] }
      : visibility;

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

app.get('/api/task-templates/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.taskTemplate.findFirst({
      where: {
        AND: [
          { id },
          { OR: [{ isPublic: true }, { userId: req.user.id }, scopeWhere(req)] }
        ]
      },
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

app.post('/api/task-templates', requireTenantAuth, async (req, res) => {
  try {
    const { name, description, category, isPublic, tasks } = req.body;

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
          userId: req.user.id,
          contractorAccountId: req.tenantId,
          createdById: req.dbUser.id
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

app.put('/api/task-templates/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, isPublic, tasks } = req.body;

    const ownedTemplate = await prisma.taskTemplate.findFirst({
      where: { AND: [{ id }, { OR: [{ userId: req.user.id }, scopeWhere(req)] }] }
    });
    if (!ownedTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

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

app.delete('/api/task-templates/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedTemplate = await prisma.taskTemplate.findFirst({
      where: { AND: [{ id }, { OR: [{ userId: req.user.id }, scopeWhere(req)] }] }
    });
    if (!ownedTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

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
app.get('/api/analytics', requireTenantAuth, async (req, res) => {
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

    // Build where conditions (Pass Two: always tenant-scoped)
    const receiptConditions = [
      {
        receiptDate: {
          gte: startDate,
          lte: now
        }
      },
      scopeWhere(req)
    ];

    if (vendor !== 'all') {
      receiptConditions.push({
        vendor: {
          name: vendor
        }
      });
    }

    const receiptWhere = { AND: receiptConditions };

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
      prisma.localVendor.count({ where: scopeWhere(req) }),
      prisma.project.count({ where: scopeWhere(req) }),
      prisma.receipt.findMany({
        where: receiptWhere,
        include: {
          vendor: true,
          items: true
        },
        orderBy: { receiptDate: 'desc' }
      }),
      prisma.localVendor.findMany({
        where: scopeWhere(req),
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
          AND: [
            {
              createdAt: {
                gte: startDate,
                lte: now
              }
            },
            scopeWhere(req)
          ]
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
          AND: [
            {
              createdAt: {
                gte: startDate,
                lte: now
              }
            },
            scopeWhere(req)
          ]
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

    // Growth percentages (Pass Seven: computed, never fabricated).
    // Compare this period against the immediately preceding period of
    // the same length, tenant-scoped, from real receipts and projects.
    // With no previous-period baseline the growth is 100 when the
    // current period has activity and 0 when both are empty — a
    // deterministic convention, not a random number dressed as data
    // (the old code returned Math.random() growth on every load).
    const periodMs = now.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - periodMs);
    const [prevReceipts, prevProjectCount] = await Promise.all([
      prisma.receipt.findMany({
        where: {
          AND: [
            { receiptDate: { gte: prevStart, lt: startDate } },
            scopeWhere(req)
          ]
        },
        select: { total: true }
      }),
      prisma.project.count({
        where: {
          AND: [
            { createdAt: { gte: prevStart, lt: startDate } },
            scopeWhere(req)
          ]
        }
      })
    ]);
    const prevRevenue = prevReceipts.reduce((sum, r) => sum + parseFloat(r.total), 0);
    const growthPct = (current, previous) =>
      previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0);
    const revenueGrowth = growthPct(totalRevenue, prevRevenue);
    const projectGrowth = growthPct(projects.length, prevProjectCount);

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
app.get('/api/followups', requireTenantAuth, async (req, res) => {
  try {
    const { status } = req.query;

    const conditions = [
      {
        OR: [
          { status: 'pending' },
          { status: 'sent' }
        ]
      },
      scopeWhere(req)
    ];

    if (status && status !== 'all') {
      conditions.push({ status });
    }

    const where = { AND: conditions };

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

app.post('/api/followups', requireTenantAuth, async (req, res) => {
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

    if (projectId) {
      const ownedProject = await prisma.project.findFirst({
        where: { AND: [{ id: projectId }, scopeWhere(req)] }
      });
      if (!ownedProject) {
        return res.status(400).json({
          success: false,
          error: 'Project not found'
        });
      }
    }

    const followUp = await prisma.followUpReminder.create({
      data: {
        contractorAccountId: req.tenantId,
        createdById: req.dbUser.id,
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

app.put('/api/followups/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, scheduledDate, status } = req.body;

    const ownedFollowUp = await prisma.followUpReminder.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedFollowUp) {
      return res.status(404).json({ success: false, error: 'Follow-up not found' });
    }

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

app.delete('/api/followups/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedFollowUp = await prisma.followUpReminder.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedFollowUp) {
      return res.status(404).json({ success: false, error: 'Follow-up not found' });
    }

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
app.get('/api/followup-templates', requireTenantAuth, async (req, res) => {
  try {
    const templates = await prisma.followUpTemplate.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { isDefault: true },
          scopeWhere(req)
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

app.post('/api/followup-templates', requireTenantAuth, async (req, res) => {
  try {
    const { name, subject, message, isDefault } = req.body;
    const userId = req.user.id;

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
        userId,
        contractorAccountId: req.tenantId,
        createdById: req.dbUser.id
      }
    });

    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Error creating follow-up template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/followup-templates/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, message, isDefault } = req.body;

    const ownedTemplate = await prisma.followUpTemplate.findFirst({
      where: { AND: [{ id }, { OR: [{ userId: req.user.id }, scopeWhere(req)] }] }
    });
    if (!ownedTemplate) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

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

app.delete('/api/followup-templates/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedTemplate = await prisma.followUpTemplate.findFirst({
      where: { AND: [{ id }, { OR: [{ userId: req.user.id }, scopeWhere(req)] }] }
    });
    if (!ownedTemplate) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

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
  const laborRate = parseFloat(room.laborRate) || pricingDefaults.SOLO_LABOR_RATE; // Iron Legion solo rate, $60/hour default

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

// Start server (only when run directly, so tests can import the app)
if (require.main === module) {
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
  console.log(`   GET    /api/health        - Health check`);
});
}

// Pass Two (lockdown): the legacy password-based account system that used
// to live here — GET/POST /api/users, PUT/DELETE /api/users/:id, and
// POST /api/auth/login|register — has been removed entirely. Clerk is the
// only account system. (The Clerk-backed routes /api/users/sync|me|profile|
// contractor-account|subscription remain near the top of this file.)

// ==================== SCHEDULING API ENDPOINTS ====================

// Get all scheduled jobs
app.get('/api/scheduled-jobs', requireTenantAuth, async (req, res) => {
  try {
    const { startDate, endDate, status, priority } = req.query;

    // Pass Two: results are always scoped to the caller's tenant
    const conditions = [scopeWhere(req)];

    if (startDate && endDate) {
      conditions.push({
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      });
    }

    if (status && status !== 'all') {
      conditions.push({ status });
    }

    if (priority && priority !== 'all') {
      conditions.push({ priority });
    }

    const where = { AND: conditions };

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

// NOTE (Pass Seven): /statistics must be registered BEFORE /:id —
// Express matches in registration order, so as originally written
// this route was unreachable (every call was captured by :id and
// answered 404).
// Get job statistics
app.get('/api/scheduled-jobs/statistics', requireTenantAuth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));

    const scope = scopeWhere(req);
    const [totalJobs, inProgress, completed, overdue] = await Promise.all([
      prisma.scheduledJob.count({
        where: { AND: [{ startDate: { gte: startOfMonth } }, scope] }
      }),
      prisma.scheduledJob.count({
        where: { AND: [{ status: 'in_progress' }, scope] }
      }),
      prisma.scheduledJob.count({
        where: { AND: [{ status: 'completed', endDate: { gte: startOfWeek } }, scope] }
      }),
      prisma.scheduledJob.count({
        where: { AND: [{ status: { not: 'completed' }, endDate: { lt: now } }, scope] }
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


// Get scheduled job by ID
app.get('/api/scheduled-jobs/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.scheduledJob.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] },
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
app.post('/api/scheduled-jobs', requireTenantAuth, async (req, res) => {
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

    if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date must be valid dates'
      });
    }

    // Referenced project/estimate must belong to the caller's tenant
    // (same rule the receipts and follow-ups routes already enforce)
    if (projectId) {
      const ownedProject = await prisma.project.findFirst({
        where: { AND: [{ id: projectId }, scopeWhere(req)] }
      });
      if (!ownedProject) {
        return res.status(400).json({ success: false, error: 'Project not found' });
      }
    }
    if (estimateId) {
      const ownedEstimate = await prisma.estimate.findFirst({
        where: { AND: [{ id: estimateId }, scopeWhere(req)] }
      });
      if (!ownedEstimate) {
        return res.status(400).json({ success: false, error: 'Estimate not found' });
      }
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
        contractorAccountId: req.tenantId,
        createdById: req.dbUser.id
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
app.put('/api/scheduled-jobs/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedJob = await prisma.scheduledJob.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedJob) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const updateData = { ...req.body };
    // Ownership fields are never client-writable (Pass Two)
    delete updateData.id;
    delete updateData.contractorAccountId;
    delete updateData.createdById;

    // Referenced project/estimate must belong to the caller's tenant
    if (updateData.projectId) {
      const ownedProject = await prisma.project.findFirst({
        where: { AND: [{ id: updateData.projectId }, scopeWhere(req)] }
      });
      if (!ownedProject) {
        return res.status(400).json({ success: false, error: 'Project not found' });
      }
    }
    if (updateData.estimateId) {
      const ownedEstimate = await prisma.estimate.findFirst({
        where: { AND: [{ id: updateData.estimateId }, scopeWhere(req)] }
      });
      if (!ownedEstimate) {
        return res.status(400).json({ success: false, error: 'Estimate not found' });
      }
    }

    // Convert date strings to Date objects if present
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
      if (isNaN(updateData.startDate.getTime())) {
        return res.status(400).json({ success: false, error: 'Start date must be a valid date' });
      }
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
      if (isNaN(updateData.endDate.getTime())) {
        return res.status(400).json({ success: false, error: 'End date must be a valid date' });
      }
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
app.delete('/api/scheduled-jobs/:id', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedJob = await prisma.scheduledJob.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedJob) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

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
app.post('/api/scheduled-jobs/:id/sync', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.scheduledJob.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] },
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
app.delete('/api/scheduled-jobs/:id/sync', requireTenantAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownedJob = await prisma.scheduledJob.findFirst({
      where: { AND: [{ id }, scopeWhere(req)] }
    });
    if (!ownedJob) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

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

// Get calendar sync settings
app.get('/api/calendar-sync-settings', requireTenantAuth, async (req, res) => {
  try {
    let settings = await prisma.calendarSyncSettings.findFirst({
      where: { contractorAccountId: req.tenantId }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.calendarSyncSettings.create({
        data: {
          contractorAccountId: req.tenantId
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
app.put('/api/calendar-sync-settings', requireTenantAuth, async (req, res) => {
  try {
    // Whitelist the model's writable fields (Pass Seven): the body used
    // to be spread straight into Prisma, so any stale or extra field a
    // client sent failed the whole update with a validation 500.
    // Ownership fields are never client-writable (Pass Two).
    const WRITABLE = [
      'googleCalendarEnabled', 'googleCalendarId', 'googleCalendarToken',
      'googleCalendarRefreshToken', 'icalEnabled', 'icalUrl',
      'icalUsername', 'icalPassword', 'autoSync', 'syncFrequency',
      'syncDirection'
    ];
    const settingsData = {};
    for (const field of WRITABLE) {
      if (req.body[field] !== undefined) {
        settingsData[field] = req.body[field];
      }
    }

    let settings = await prisma.calendarSyncSettings.findFirst({
      where: { contractorAccountId: req.tenantId }
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
          contractorAccountId: req.tenantId
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
