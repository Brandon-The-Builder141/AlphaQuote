#!/usr/bin/env node

/**
 * Backend Deployment Script
 * Prepares AlphaQuote backend for manual deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AlphaQuote Backend Deployment Script');
console.log('========================================\n');

// Configuration
const config = {
  deployDir: 'deploy-backend',
  packageName: 'alphaquote-backend',
  excludeFiles: [
    'node_modules',
    '.git',
    'deploy-backend',
    '*.log',
    '.env.local',
    'dev.db',
    'dev.db-journal'
  ]
};

// Utility functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const runCommand = (command, description, cwd = process.cwd()) => {
  try {
    log(`📦 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd });
    log(`✅ ${description} completed`, 'success');
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

const copyDirectory = (src, dest) => {
  if (!fs.existsSync(src)) {
    log(`❌ Source directory not found: ${src}`, 'error');
    return false;
  }

  fs.mkdirSync(dest, { recursive: true });
  
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  return true;
};

// Main deployment process
const deploy = async () => {
  try {
    // Step 1: Clean previous deployments
    log('🧹 Cleaning previous deployments...');
    if (fs.existsSync(config.deployDir)) {
      fs.rmSync(config.deployDir, { recursive: true, force: true });
    }

    // Step 2: Create deployment directory
    log('📁 Creating deployment directory...');
    fs.mkdirSync(config.deployDir, { recursive: true });

    // Step 3: Copy backend files
    log('📋 Copying backend files...');
    const backendFiles = [
      'server',
      'prisma',
      'middleware',
      'services',
      'package.json',
      'package-lock.json'
    ];

    for (const file of backendFiles) {
      if (fs.existsSync(file)) {
        const destPath = path.join(config.deployDir, file);
        if (fs.statSync(file).isDirectory()) {
          copyDirectory(file, destPath);
        } else {
          fs.copyFileSync(file, destPath);
        }
        log(`✅ Copied ${file}`, 'success');
      }
    }

    // Step 4: Create production package.json
    log('📝 Creating production package.json...');
    const packageJsonPath = path.join(config.deployDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update scripts for production
    packageJson.scripts = {
      start: 'node server/api.js',
      dev: 'nodemon server/api.js',
      'prisma:generate': 'npx prisma generate',
      'prisma:migrate': 'npx prisma migrate deploy',
      'prisma:seed': 'npx prisma db seed'
    };

    // Remove dev dependencies
    delete packageJson.devDependencies;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Step 5: Create environment template
    log('🔧 Creating environment template...');
    const envTemplate = `# AlphaQuote Backend Environment Variables
# Copy this to .env and fill in your values

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key_here

# API Configuration
API_PORT=3001
NODE_ENV=production

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS Origins (add your frontend domain)
CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://your-custom-domain.com
`;

    fs.writeFileSync(path.join(config.deployDir, '.env.template'), envTemplate);

    // Step 6: Create deployment instructions
    log('📖 Creating deployment instructions...');
    const deploymentInstructions = `
# AlphaQuote Backend Deployment Package

## 📁 Contents
- \`server/\` - Express API server
- \`prisma/\` - Database schema and migrations
- \`package.json\` - Production dependencies
- \`.env.template\` - Environment variables template

## 🚀 Deployment Options

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign up/login
3. Click "New Project"
4. Choose "Deploy from GitHub" or upload manually
5. Upload this entire folder
6. Set environment variables from \`.env.template\`
7. Add PostgreSQL service
8. Deploy!

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Sign up/login
3. Click "New Web Service"
4. Connect your repository or upload manually
5. Set environment variables
6. Add PostgreSQL database
7. Deploy!

### Option 3: Heroku
1. Install Heroku CLI
2. Run: \`heroku create your-app-name\`
3. Add PostgreSQL: \`heroku addons:create heroku-postgresql\`
4. Set environment variables: \`heroku config:set KEY=value\`
5. Deploy: \`git push heroku main\`

## 🔧 Required Environment Variables
- DATABASE_URL (PostgreSQL connection string)
- CLERK_SECRET_KEY (for authentication)
- API_PORT=3001
- NODE_ENV=production

## 📊 Database Setup
1. Create PostgreSQL database
2. Update DATABASE_URL in environment variables
3. Run: \`npm run prisma:migrate\`
4. Run: \`npm run prisma:seed\` (optional)

## 🧪 Testing Deployment
After deployment, test these endpoints:
- GET /api/health - Health check
- GET /api/vendors - Vendor list
- POST /api/vendors - Create vendor

## 📞 Support
Check the deployment guide for detailed instructions.

Generated on: ${new Date().toISOString()}
    `;

    fs.writeFileSync(
      path.join(config.deployDir, 'deployment-instructions.md'),
      deploymentInstructions
    );

    // Step 7: Create ZIP package
    log('📦 Creating ZIP package...');
    const zipCommand = process.platform === 'win32' 
      ? `powershell Compress-Archive -Path "${config.deployDir}\\*" -DestinationPath "${config.packageName}.zip"`
      : `zip -r ${config.packageName}.zip ${config.deployDir}`;
    
    runCommand(zipCommand, 'Creating ZIP package');

    // Step 8: Summary
    log('\n🎉 Backend deployment package ready!', 'success');
    log('====================================');
    log(`📁 Deployment folder: ${config.deployDir}/`);
    log(`📦 ZIP package: ${config.packageName}.zip`);
    log('\n📋 Next steps:');
    log('1. Upload the deployment folder to your hosting platform');
    log('2. Set up PostgreSQL database');
    log('3. Configure environment variables');
    log('4. Run database migrations');
    log('5. Test the API endpoints');
    log('\n📖 See deployment-instructions.md for detailed steps');

  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Run deployment
deploy();
