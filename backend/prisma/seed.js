/**
 * Prisma Database Seeder
 * Populates the database with demo receipt and pricing data
 */

const { PrismaClient } = require('@prisma/client');
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
  ]
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
    
    // Create vendors
    console.log('🏪 Creating vendors...');
    const createdVendors = {};
    for (const vendorData of demoData.vendors) {
      const vendor = await prisma.localVendor.create({
        data: vendorData
      });
      createdVendors[vendor.name] = vendor;
      console.log(`   ✅ ${vendor.name}`);
    }
    
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
          budget: '$45,000 - $55,000'
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
          budget: '$35,000 - $42,000'
        }
      }),
      prisma.project.create({
        data: {
          name: 'Williams Deck & Outdoor Kitchen',
          clientName: 'Robert & Lisa Williams',
          clientEmail: 'robert.williams@email.com',
          clientPhone: '(555) 456-7890',
          address: '890 Pine Street, Springfield, IL 62703',
          jobType: 'Outdoor Living Space',
          description: 'Building a 20x16 composite deck with built-in outdoor kitchen, pergola, and landscaping.',
          timeline: '3-4 weeks starting September 20th',
          budget: '$25,000 - $30,000'
        }
      })
    ]);
    
    projects.forEach(project => {
      console.log(`   ✅ ${project.name}`);
    });
    
    // Get final stats
    const stats = await prisma.$transaction([
      prisma.receipt.count(),
      prisma.localVendor.count(),
      prisma.localVendorPrice.count(),
      prisma.receiptItem.count()
    ]);
    
    console.log('\n🎉 Database seeding complete!');
    console.log('📊 Statistics:');
    console.log(`   📄 Receipts: ${stats[0]}`);
    console.log(`   🏪 Vendors: ${stats[1]}`);
    console.log(`   💰 Prices: ${stats[2]}`);
    console.log(`   📦 Items: ${stats[3]}`);
    console.log('\n💡 Ready to test at: http://localhost:3000/receipts');
    
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
