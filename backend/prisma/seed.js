/**
 * Prisma Database Seeder
 * Populates the database with demo receipt and pricing data
 */

const { PrismaClient } = require('@prisma/client');
const pricingDefaults = require('../config/pricingDefaults');
const prisma = new PrismaClient();

const demoData = {
  vendors: [
    {
      name: 'Home Depot',
      contact: '(217) 793-8400',
      notes: 'Store #6847 - 2855 S MacArthur Blvd, Springfield, IL 62704'
    },
    {
      name: "Lowe's",
      contact: '(217) 787-9600',
      notes: 'Store #1847 - 3183 Montvale Dr, Springfield, IL 62704'
    },
    {
      name: 'Menards',
      contact: '(217) 793-9600',
      notes: 'Store #3021 - 2760 Prairie Crossing Dr, Springfield, IL 62711'
    }
  ],

  regionalPricePacks: [
    {
      name: 'Northeast',
      region: 'US-NE',
      description: 'Regional pricing for Northeast US (NY, MA, CT, NJ, etc.)',
      materials: [
        { materialKey: 'luxury_vinyl_plank', materialName: 'Luxury Vinyl Plank Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 4.75, unitLabel: 'per sq ft', description: 'High-quality LVP with premium finish' },
        { materialKey: 'hardwood_oak', materialName: 'Oak Hardwood Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 8.50, unitLabel: 'per sq ft', description: 'Solid oak hardwood, pre-finished' },
        { materialKey: 'ceramic_tile', materialName: 'Ceramic Tile', category: 'Flooring', unit: 'sqft', unitPrice: 3.25, unitLabel: 'per sq ft', description: 'Standard ceramic tile installation' },
        { materialKey: 'quartz_countertop', materialName: 'Quartz Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 85.00, unitLabel: 'per sq ft', description: 'Premium quartz countertop material' },
        { materialKey: 'granite_countertop', materialName: 'Granite Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 65.00, unitLabel: 'per sq ft', description: 'Natural granite countertop material' },
        { materialKey: 'interior_paint', materialName: 'Premium Interior Paint', category: 'Paint', unit: 'gallon', unitPrice: 52.00, unitLabel: 'per gallon', description: 'High-quality interior paint with primer' },
        { materialKey: 'exterior_paint', materialName: 'Exterior Paint', category: 'Paint', unit: 'gallon', unitPrice: 48.00, unitLabel: 'per gallon', description: 'Weather-resistant exterior paint' },
        { materialKey: 'drywall', materialName: 'Drywall Sheets', category: 'Wall Materials', unit: 'sheet', unitPrice: 12.50, unitLabel: 'per sheet', description: 'Standard 1/2" drywall sheets' },
        { materialKey: 'insulation_batt', materialName: 'Fiberglass Insulation', category: 'Insulation', unit: 'sqft', unitPrice: 1.25, unitLabel: 'per sq ft', description: 'R-13 fiberglass batt insulation' },
      ]
    },
    {
      name: 'Southeast',
      region: 'US-SE',
      description: 'Regional pricing for Southeast US (FL, GA, SC, NC, etc.)',
      materials: [
        { materialKey: 'luxury_vinyl_plank', materialName: 'Luxury Vinyl Plank Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 4.25, unitLabel: 'per sq ft', description: 'High-quality LVP with premium finish' },
        { materialKey: 'hardwood_oak', materialName: 'Oak Hardwood Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 7.25, unitLabel: 'per sq ft', description: 'Solid oak hardwood, pre-finished' },
        { materialKey: 'ceramic_tile', materialName: 'Ceramic Tile', category: 'Flooring', unit: 'sqft', unitPrice: 2.85, unitLabel: 'per sq ft', description: 'Standard ceramic tile installation' },
        { materialKey: 'quartz_countertop', materialName: 'Quartz Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 75.00, unitLabel: 'per sq ft', description: 'Premium quartz countertop material' },
        { materialKey: 'granite_countertop', materialName: 'Granite Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 55.00, unitLabel: 'per sq ft', description: 'Natural granite countertop material' },
        { materialKey: 'interior_paint', materialName: 'Premium Interior Paint', category: 'Paint', unit: 'gallon', unitPrice: 45.00, unitLabel: 'per gallon', description: 'High-quality interior paint with primer' },
        { materialKey: 'exterior_paint', materialName: 'Exterior Paint', category: 'Paint', unit: 'gallon', unitPrice: 42.00, unitLabel: 'per gallon', description: 'Weather-resistant exterior paint' },
        { materialKey: 'drywall', materialName: 'Drywall Sheets', category: 'Wall Materials', unit: 'sheet', unitPrice: 10.50, unitLabel: 'per sheet', description: 'Standard 1/2" drywall sheets' },
        { materialKey: 'insulation_batt', materialName: 'Fiberglass Insulation', category: 'Insulation', unit: 'sqft', unitPrice: 1.15, unitLabel: 'per sq ft', description: 'R-13 fiberglass batt insulation' },
      ]
    },
    {
      name: 'West Coast',
      region: 'US-WC',
      description: 'Regional pricing for West Coast US (CA, OR, WA, etc.)',
      materials: [
        { materialKey: 'luxury_vinyl_plank', materialName: 'Luxury Vinyl Plank Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 5.25, unitLabel: 'per sq ft', description: 'High-quality LVP with premium finish' },
        { materialKey: 'hardwood_oak', materialName: 'Oak Hardwood Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 9.75, unitLabel: 'per sq ft', description: 'Solid oak hardwood, pre-finished' },
        { materialKey: 'ceramic_tile', materialName: 'Ceramic Tile', category: 'Flooring', unit: 'sqft', unitPrice: 3.85, unitLabel: 'per sq ft', description: 'Standard ceramic tile installation' },
        { materialKey: 'quartz_countertop', materialName: 'Quartz Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 95.00, unitLabel: 'per sq ft', description: 'Premium quartz countertop material' },
        { materialKey: 'granite_countertop', materialName: 'Granite Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 75.00, unitLabel: 'per sq ft', description: 'Natural granite countertop material' },
        { materialKey: 'interior_paint', materialName: 'Premium Interior Paint', category: 'Paint', unit: 'gallon', unitPrice: 58.00, unitLabel: 'per gallon', description: 'High-quality interior paint with primer' },
        { materialKey: 'exterior_paint', materialName: 'Exterior Paint', category: 'Paint', unit: 'gallon', unitPrice: 55.00, unitLabel: 'per gallon', description: 'Weather-resistant exterior paint' },
        { materialKey: 'drywall', materialName: 'Drywall Sheets', category: 'Wall Materials', unit: 'sheet', unitPrice: 14.25, unitLabel: 'per sheet', description: 'Standard 1/2" drywall sheets' },
        { materialKey: 'insulation_batt', materialName: 'Fiberglass Insulation', category: 'Insulation', unit: 'sqft', unitPrice: 1.45, unitLabel: 'per sq ft', description: 'R-13 fiberglass batt insulation' },
      ]
    },
    {
      name: 'Midwest',
      region: 'US-MW',
      description: 'Regional pricing for Midwest US (IL, OH, MI, IN, etc.)',
      materials: [
        { materialKey: 'luxury_vinyl_plank', materialName: 'Luxury Vinyl Plank Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 4.50, unitLabel: 'per sq ft', description: 'High-quality LVP with premium finish' },
        { materialKey: 'hardwood_oak', materialName: 'Oak Hardwood Flooring', category: 'Flooring', unit: 'sqft', unitPrice: 8.00, unitLabel: 'per sq ft', description: 'Solid oak hardwood, pre-finished' },
        { materialKey: 'ceramic_tile', materialName: 'Ceramic Tile', category: 'Flooring', unit: 'sqft', unitPrice: 3.10, unitLabel: 'per sq ft', description: 'Standard ceramic tile installation' },
        { materialKey: 'quartz_countertop', materialName: 'Quartz Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 80.00, unitLabel: 'per sq ft', description: 'Premium quartz countertop material' },
        { materialKey: 'granite_countertop', materialName: 'Granite Countertops', category: 'Countertops', unit: 'sqft', unitPrice: 60.00, unitLabel: 'per sq ft', description: 'Natural granite countertop material' },
        { materialKey: 'interior_paint', materialName: 'Premium Interior Paint', category: 'Paint', unit: 'gallon', unitPrice: 48.00, unitLabel: 'per gallon', description: 'High-quality interior paint with primer' },
        { materialKey: 'exterior_paint', materialName: 'Exterior Paint', category: 'Paint', unit: 'gallon', unitPrice: 45.00, unitLabel: 'per gallon', description: 'Weather-resistant exterior paint' },
        { materialKey: 'drywall', materialName: 'Drywall Sheets', category: 'Wall Materials', unit: 'sheet', unitPrice: 11.50, unitLabel: 'per sheet', description: 'Standard 1/2" drywall sheets' },
        { materialKey: 'insulation_batt', materialName: 'Fiberglass Insulation', category: 'Insulation', unit: 'sqft', unitPrice: 1.30, unitLabel: 'per sq ft', description: 'R-13 fiberglass batt insulation' },
      ]
    }
  ],
  
  receipts: [
    {
      vendor: 'Home Depot',
      receiptDate: '2025-09-15',
      total: 247.83,
      subtotal: 229.84,
      tax: 17.99,
      category: 'Flooring',
      project: 'Johnson Kitchen Remodel',
      items: [
        {
          description: 'Luxury Vinyl Plank Flooring - Oak',
          category: 'Flooring',
          quantity: 45,
          unit: 'sqft',
          unitPrice: 4.25,
          sku: 'LVP-OAK-001'
        },
        {
          description: 'Underlayment Premium',
          category: 'Flooring',
          quantity: 45,
          unit: 'sqft', 
          unitPrice: 0.89,
          sku: 'UND-PREM-001'
        },
        {
          description: 'Transition Strip - Oak',
          category: 'Flooring',
          quantity: 2,
          unit: 'each',
          unitPrice: 12.99,
          sku: 'TRANS-OAK-001'
        }
      ]
    },
    {
      vendor: "Lowe's",
      receiptDate: '2025-09-14',
      total: 156.42,
      subtotal: 144.97,
      tax: 11.45,
      category: 'Paint & Finishes',
      project: 'Smith Bathroom Remodel',
      items: [
        {
          description: 'Premium Interior Paint - Eggshell',
          category: 'Paint',
          quantity: 2,
          unit: 'gallon',
          unitPrice: 45.99,
          sku: 'PAINT-EGG-001'
        },
        {
          description: 'Primer Sealer - High Build',
          category: 'Paint',
          quantity: 1,
          unit: 'gallon',
          unitPrice: 32.99,
          sku: 'PRIMER-HB-001'
        },
        {
          description: 'Professional Paint Brush Set',
          category: 'Tools',
          quantity: 1,
          unit: 'set',
          unitPrice: 24.99,
          sku: 'BRUSH-SET-001'
        }
      ]
    },
    {
      vendor: 'Menards',
      receiptDate: '2025-09-13',
      total: 89.15,
      subtotal: 82.69,
      tax: 6.46,
      category: 'Hardware',
      project: 'Johnson Kitchen Remodel',
      items: [
        {
          description: 'Cabinet Hardware - Brushed Nickel',
          category: 'Hardware',
          quantity: 12,
          unit: 'each',
          unitPrice: 3.49,
          sku: 'CAB-HW-BN-001'
        },
        {
          description: 'Wood Screws #8 x 2.5"',
          category: 'Hardware',
          quantity: 2,
          unit: 'box',
          unitPrice: 8.99,
          sku: 'SCREW-W8-001'
        },
        {
          description: 'Sandpaper Variety Pack',
          category: 'Tools',
          quantity: 1,
          unit: 'pack',
          unitPrice: 15.99,
          sku: 'SAND-VAR-001'
        }
      ]
    }
  ],

  taskTemplates: pricingDefaults.STARTER_TEMPLATES
};

async function main() {
  console.log('🌱 Seeding AlphaQuote database with demo data...');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.receiptItem.deleteMany();
    await prisma.localVendorPrice.deleteMany();
    await prisma.receipt.deleteMany();
    await prisma.task.deleteMany();
    await prisma.estimate.deleteMany();
    await prisma.project.deleteMany();
    await prisma.localVendor.deleteMany();
    await prisma.userRegionalSelection.deleteMany();
    await prisma.regionalMaterial.deleteMany();
    await prisma.regionalPricePack.deleteMany();
    await prisma.taskTemplateItem.deleteMany();
    await prisma.taskTemplate.deleteMany();
    
    // Create regional price packs
    console.log('🌍 Creating regional price packs...');
    const createdPricePacks = {};
    for (const packData of demoData.regionalPricePacks) {
      const pricePack = await prisma.regionalPricePack.create({
        data: {
          name: packData.name,
          region: packData.region,
          description: packData.description,
          materials: {
            create: packData.materials.map(material => ({
              materialKey: material.materialKey,
              materialName: material.materialName,
              category: material.category,
              unit: material.unit,
              unitPrice: material.unitPrice,
              unitLabel: material.unitLabel,
              description: material.description
            }))
          }
        },
        include: { materials: true }
      });
      createdPricePacks[pricePack.region] = pricePack;
      console.log(`   ✅ ${pricePack.name} (${pricePack.materials.length} materials)`);
    }

    // Get default contractor account
    const defaultContractor = await prisma.contractorAccount.findFirst({
      where: { email: 'default@alphaquote.local' }
    });
    
    if (!defaultContractor) {
      throw new Error('Default contractor account not found. Please run migrate-multiuser.js first.');
    }

    // Create task templates
    console.log('📋 Creating task templates...');
    for (const templateData of demoData.taskTemplates) {
      const template = await prisma.taskTemplate.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          isPublic: templateData.isPublic,
          userId: 'default',
          contractorAccountId: defaultContractor.id,
          tasks: {
            create: templateData.tasks.map((task, index) => ({
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
        },
        include: { tasks: true }
      });
      console.log(`   ✅ ${template.name} (${template.tasks.length} tasks)`);
    }

    // Create vendors
    console.log('🏪 Creating vendors...');
    const createdVendors = {};
    for (const vendorData of demoData.vendors) {
      const vendor = await prisma.localVendor.create({
        data: {
          ...vendorData,
          contractorAccountId: defaultContractor.id
        }
      });
      createdVendors[vendor.name] = vendor;
      console.log(`   ✅ ${vendor.name}`);
    }
    
    // Create demo projects
    console.log('🏗️ Creating demo projects...');
    const projects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'Johnson Kitchen & Bathroom Remodel',
          clientName: 'Sarah & Mike Johnson',
          clientEmail: 'sarah.johnson@email.com',
          clientPhone: '(555) 123-4567',
          address: '1234 Maple Street, Springfield, IL 62701',
          jobType: 'Complete Kitchen & Master Bathroom Renovation',
          description: 'Full kitchen remodel with new cabinets, countertops, flooring, and appliances. Master bathroom renovation with walk-in shower.',
          timeline: '6-8 weeks starting October 1st',
          budget: '$45,000 - $55,000',
          contractorAccountId: defaultContractor.id
        }
      }),
      prisma.project.create({
        data: {
          name: 'Smith Family Room Addition',
          clientName: 'Jennifer Smith',
          clientEmail: 'jennifer.smith@email.com',
          clientPhone: '(555) 987-6543',
          address: '567 Oak Avenue, Springfield, IL 62702',
          jobType: 'Room Addition & Finishing',
          description: 'Adding a 400 sq ft family room with vaulted ceilings, built-in entertainment center, and connecting to existing kitchen.',
          timeline: '4-6 weeks starting November 15th',
          budget: '$35,000 - $42,000',
          contractorAccountId: defaultContractor.id
        }
      }),
      prisma.project.create({
        data: {
          name: 'Williams Deck & Patio Project',
          clientName: 'Robert Williams',
          clientEmail: 'robert.williams@email.com',
          clientPhone: '(555) 456-7890',
          address: '890 Pine Road, Springfield, IL 62703',
          jobType: 'Outdoor Construction',
          description: 'Building a 20x16 composite deck with built-in seating and installing a stone patio with fire pit.',
          timeline: '3-4 weeks starting December 1st',
          budget: '$25,000 - $30,000',
          contractorAccountId: defaultContractor.id
        }
      })
    ]);
    
    console.log(`   ✅ Created ${projects.length} demo projects`);
    
    // Create receipts and items
    console.log('🧾 Creating receipts...');
    for (const receiptData of demoData.receipts) {
      const vendor = createdVendors[receiptData.vendor];
      
      // Link some receipts to projects
      let projectId = null;
      if (receiptData.project === 'Johnson Kitchen Remodel') {
        projectId = projects[0].id; // Johnson project
      } else if (receiptData.project === 'Smith Family Room') {
        projectId = projects[1].id; // Smith project
      } else if (receiptData.project === 'Williams Deck Project') {
        projectId = projects[2].id; // Williams project
      }
      
      const receipt = await prisma.receipt.create({
        data: {
          vendorId: vendor.id,
          receiptDate: new Date(receiptData.receiptDate),
          total: receiptData.total,
          subtotal: receiptData.subtotal,
          tax: receiptData.tax,
          category: receiptData.category,
          project: receiptData.project, // Keep legacy field
          projectId: projectId, // Add new project relation
          ocrConfidence: 0.95,
          contractorAccountId: defaultContractor.id,
          verified: true,
          items: {
            create: receiptData.items.map(item => ({
              description: item.description,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              sku: item.sku,
              confidence: 0.95
            }))
          }
        },
        include: { items: true }
      });
      
      console.log(`   ✅ ${receiptData.vendor} - $${receiptData.total}`);
      
      // Create vendor prices
      for (const item of receiptData.items) {
        const materialKey = (item.description || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
          
        await prisma.localVendorPrice.upsert({
          where: {
            vendorId_materialKey: {
              vendorId: vendor.id,
              materialKey: materialKey
            }
          },
          update: {
            unitPrice: item.unitPrice,
            lastUpdated: new Date(),
            receiptId: receipt.id
          },
          create: {
            vendorId: vendor.id,
            materialKey: materialKey,
            materialName: item.description,
            unitPrice: item.unitPrice,
            unitLabel: item.unit,
            category: item.category,
            confidence: 0.95,
            receiptId: receipt.id
          }
        });
      }
      
      // Vendor stats no longer tracked in simplified schema
    }
    
    // Get final stats
    const stats = await prisma.$transaction([
      prisma.receipt.count(),
      prisma.localVendor.count(),
      prisma.localVendorPrice.count(),
      prisma.receiptItem.count(),
      prisma.regionalPricePack.count(),
      prisma.regionalMaterial.count(),
      prisma.taskTemplate.count(),
      prisma.taskTemplateItem.count()
    ]);
    
    console.log('\n🎉 Database seeding complete!');
    console.log('📊 Statistics:');
    console.log(`   📄 Receipts: ${stats[0]}`);
    console.log(`   🏪 Vendors: ${stats[1]}`);
    console.log(`   💰 Vendor Prices: ${stats[2]}`);
    console.log(`   📦 Receipt Items: ${stats[3]}`);
    console.log(`   🌍 Regional Price Packs: ${stats[4]}`);
    console.log(`   📋 Regional Materials: ${stats[5]}`);
    console.log(`   📝 Task Templates: ${stats[6]}`);
    console.log(`   🔧 Template Tasks: ${stats[7]}`);
    console.log('\n💡 Ready to test at: http://localhost:3000/receipts');
    console.log('💡 Regional pricing available for material suggestions!');
    console.log('💡 Quick templates available for task insertion!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
