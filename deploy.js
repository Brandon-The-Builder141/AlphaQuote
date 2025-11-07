#!/usr/bin/env node

/**
 * AlphaQuote Complete Deployment Script
 * Deploys both frontend and backend for manual deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AlphaQuote Complete Deployment Script');
console.log('==========================================\n');

// Configuration
const config = {
  frontendDir: 'frontend',
  backendDir: 'backend',
  deployDir: 'deploy-package',
  packageName: 'alphaquote-complete'
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
    return false;
  }
  return true;
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

    // Step 3: Deploy Frontend
    log('\n🎨 Deploying Frontend...');
    log('========================');
    
    if (!fs.existsSync(config.frontendDir)) {
      log(`❌ Frontend directory not found: ${config.frontendDir}`, 'error');
      process.exit(1);
    }

    // Build frontend
    if (!runCommand('npm run build', 'Building frontend', config.frontendDir)) {
      log('⚠️ Frontend build failed, but continuing...', 'warning');
    }

    // Copy frontend build
    const frontendBuildDir = path.join(config.frontendDir, 'build');
    if (fs.existsSync(frontendBuildDir)) {
      copyDirectory(frontendBuildDir, path.join(config.deployDir, 'frontend-build'));
      log('✅ Frontend build copied', 'success');
    }

    // Step 4: Deploy Backend
    log('\n⚙️ Deploying Backend...');
    log('======================');
    
    if (!fs.existsSync(config.backendDir)) {
      log(`❌ Backend directory not found: ${config.backendDir}`, 'error');
      process.exit(1);
    }

    // Copy backend files
    const backendFiles = [
      'server',
      'prisma',
      'middleware',
      'services',
      'package.json',
      'package-lock.json'
    ];

    const backendDeployDir = path.join(config.deployDir, 'backend');
    fs.mkdirSync(backendDeployDir, { recursive: true });

    for (const file of backendFiles) {
      const srcPath = path.join(config.backendDir, file);
      const destPath = path.join(backendDeployDir, file);
      
      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          copyDirectory(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
        log(`✅ Copied ${file}`, 'success');
      }
    }

    // Update backend package.json for production
    const packageJsonPath = path.join(backendDeployDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.scripts = {
        start: 'node server/api.js',
        'prisma:generate': 'npx prisma generate',
        'prisma:migrate': 'npx prisma migrate deploy',
        'prisma:seed': 'npx prisma db seed'
      };
      delete packageJson.devDependencies;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Step 5: Create deployment documentation
    log('\n📖 Creating deployment documentation...');
    
    const deploymentGuide = `# AlphaQuote Complete Deployment Package

## 📁 Contents
- \`frontend-build/\` - Production-ready React application
- \`backend/\` - Express API server with database
- \`deployment-guide.md\` - This file

## 🚀 Quick Deployment Guide

### Frontend Deployment (Vercel - Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login
3. Click "New Project"
4. Drag and drop the \`frontend-build\` folder
5. Set environment variables:
   - REACT_APP_API_URL=https://your-backend-url
   - REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
6. Deploy!

### Backend Deployment (Railway - Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign up/login
3. Click "New Project"
4. Upload the \`backend\` folder
5. Add PostgreSQL service
6. Set environment variables:
   - DATABASE_URL=postgresql://...
   - CLERK_SECRET_KEY=your_clerk_secret
   - API_PORT=3001
   - NODE_ENV=production
7. Deploy!

## 🔧 Environment Variables

### Frontend (.env)
\`\`\`env
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
\`\`\`

### Backend (Railway Environment)
\`\`\`env
DATABASE_URL=postgresql://user:pass@host:port/db
CLERK_SECRET_KEY=sk_live_your_key
API_PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://your-frontend.vercel.app
\`\`\`

## 📊 Database Setup
1. Create PostgreSQL database on Railway
2. Update DATABASE_URL in environment variables
3. Run: \`npm run prisma:migrate\`
4. Run: \`npm run prisma:seed\` (optional)

## 🧪 Testing Deployment
1. Test frontend: Visit your Vercel URL
2. Test backend: Visit https://your-backend.railway.app/api/health
3. Test authentication: Try signing up
4. Test features: Create estimates, manage vendors

## 🔄 Updates
To update your deployment:
1. Run this script again to create new packages
2. Upload new frontend build to Vercel
3. Upload new backend code to Railway
4. Update environment variables if needed

## 📞 Support
- Check the full deployment guide
- Review environment variables
- Test each component separately

Generated on: ${new Date().toISOString()}
    `;

    fs.writeFileSync(
      path.join(config.deployDir, 'deployment-guide.md'),
      deploymentGuide
    );

    // Step 6: Create environment templates
    log('🔧 Creating environment templates...');
    
    const frontendEnvTemplate = `# AlphaQuote Frontend Environment Variables
REACT_APP_API_URL=https://your-backend-url
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
`;

    const backendEnvTemplate = `# AlphaQuote Backend Environment Variables
DATABASE_URL=postgresql://user:password@host:port/database
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
API_PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://your-frontend.vercel.app
`;

    fs.writeFileSync(path.join(config.deployDir, 'frontend.env.template'), frontendEnvTemplate);
    fs.writeFileSync(path.join(config.deployDir, 'backend.env.template'), backendEnvTemplate);

    // Step 7: Create ZIP package
    log('\n📦 Creating ZIP package...');
    const zipCommand = process.platform === 'win32' 
      ? `powershell Compress-Archive -Path "${config.deployDir}\\*" -DestinationPath "${config.packageName}.zip"`
      : `zip -r ${config.packageName}.zip ${config.deployDir}`;
    
    runCommand(zipCommand, 'Creating ZIP package');

    // Step 8: Final Summary
    log('\n🎉 Complete deployment package ready!', 'success');
    log('=====================================');
    log(`📁 Deployment folder: ${config.deployDir}/`);
    log(`📦 ZIP package: ${config.packageName}.zip`);
    log('\n📋 What\'s included:');
    log('✅ Frontend production build');
    log('✅ Backend server with database');
    log('✅ Environment variable templates');
    log('✅ Complete deployment guide');
    log('\n🚀 Next steps:');
    log('1. Deploy frontend to Vercel');
    log('2. Deploy backend to Railway');
    log('3. Set up database and environment variables');
    log('4. Test your live application!');
    log('\n📖 Read deployment-guide.md for detailed instructions');

  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Run deployment
deploy();
