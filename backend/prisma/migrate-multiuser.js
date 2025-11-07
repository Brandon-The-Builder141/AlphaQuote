/**
 * Migration script to add multi-user support
 * This script creates a default contractor account and assigns existing data to it
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function migrateToMultiUser() {
  try {
    console.log('🚀 Starting multi-user migration...');

    // 1. Create default contractor account
    console.log('📋 Creating default contractor account...');
    const defaultContractor = await prisma.contractorAccount.upsert({
      where: { email: 'default@alphaquote.local' },
      update: {},
      create: {
        name: 'Default Contractor',
        email: 'default@alphaquote.local',
        phone: null,
        address: null,
        isActive: true
      }
    });
    console.log(`✅ Created contractor account: ${defaultContractor.name}`);

    // 2. Create default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultUser = await prisma.user.upsert({
      where: { email: 'admin@alphaquote.local' },
      update: {},
      create: {
        email: 'admin@alphaquote.local',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        contractorAccountId: defaultContractor.id
      }
    });
    console.log(`✅ Created admin user: ${defaultUser.firstName} ${defaultUser.lastName}`);

    // 3. Update existing data to belong to default contractor
    console.log('🔄 Updating existing data...');

    // Update LocalVendor
    const vendorCount = await prisma.localVendor.count();
    if (vendorCount > 0) {
      await prisma.$executeRaw`
        UPDATE "LocalVendor" 
        SET "contractorAccountId" = ${defaultContractor.id}, "createdById" = ${defaultUser.id}
        WHERE "contractorAccountId" IS NULL
      `;
      console.log(`✅ Updated ${vendorCount} vendors`);
    }

    // Update Project
    const projectCount = await prisma.project.count();
    if (projectCount > 0) {
      await prisma.$executeRaw`
        UPDATE "Project" 
        SET "contractorAccountId" = ${defaultContractor.id}, "createdById" = ${defaultUser.id}
        WHERE "contractorAccountId" IS NULL
      `;
      console.log(`✅ Updated ${projectCount} projects`);
    }

    // Update Receipt
    const receiptCount = await prisma.receipt.count();
    if (receiptCount > 0) {
      await prisma.$executeRaw`
        UPDATE "Receipt" 
        SET "contractorAccountId" = ${defaultContractor.id}, "createdById" = ${defaultUser.id}
        WHERE "contractorAccountId" IS NULL
      `;
      console.log(`✅ Updated ${receiptCount} receipts`);
    }

    // Update Estimate
    const estimateCount = await prisma.estimate.count();
    if (estimateCount > 0) {
      await prisma.$executeRaw`
        UPDATE "Estimate" 
        SET "contractorAccountId" = ${defaultContractor.id}, "createdById" = ${defaultUser.id}
        WHERE "contractorAccountId" IS NULL
      `;
      console.log(`✅ Updated ${estimateCount} estimates`);
    }

    // Update TaskTemplate
    const templateCount = await prisma.taskTemplate.count();
    if (templateCount > 0) {
      await prisma.$executeRaw`
        UPDATE "TaskTemplate" 
        SET "contractorAccountId" = ${defaultContractor.id}, "createdById" = ${defaultUser.id}
        WHERE "contractorAccountId" IS NULL
      `;
      console.log(`✅ Updated ${templateCount} task templates`);
    }

    // Update FollowUpTemplate
    const followUpTemplateCount = await prisma.followUpTemplate.count();
    if (followUpTemplateCount > 0) {
      await prisma.$executeRaw`
        UPDATE "FollowUpTemplate" 
        SET "contractorAccountId" = ${defaultContractor.id}, "createdById" = ${defaultUser.id}
        WHERE "contractorAccountId" IS NULL
      `;
      console.log(`✅ Updated ${followUpTemplateCount} follow-up templates`);
    }

    console.log('\n🎉 Multi-user migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   🏢 Contractor Account: ${defaultContractor.name}`);
    console.log(`   👤 Admin User: ${defaultUser.email}`);
    console.log(`   🏪 Vendors: ${vendorCount}`);
    console.log(`   📋 Projects: ${projectCount}`);
    console.log(`   📄 Receipts: ${receiptCount}`);
    console.log(`   💰 Estimates: ${estimateCount}`);
    console.log(`   📝 Task Templates: ${templateCount}`);
    console.log(`   📧 Follow-up Templates: ${followUpTemplateCount}`);
    console.log('\n💡 Default login credentials:');
    console.log(`   Email: admin@alphaquote.local`);
    console.log(`   Password: admin123`);
    console.log('\n🔒 Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToMultiUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = migrateToMultiUser;
