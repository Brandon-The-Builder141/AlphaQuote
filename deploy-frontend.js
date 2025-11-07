#!/usr/bin/env node

/**
 * Frontend Deployment Script
 * Prepares AlphaQuote frontend for manual deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AlphaQuote Frontend Deployment Script');
console.log('==========================================\n');

// Configuration
const config = {
  buildDir: 'build',
  deployDir: 'deploy-frontend',
  packageName: 'alphaquote-frontend'
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

const runCommand = (command, description) => {
  try {
    log(`📦 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} completed`, 'success');
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Main deployment process
const deploy = async () => {
  try {
    // Step 1: Clean previous builds
    log('🧹 Cleaning previous builds...');
    if (fs.existsSync(config.buildDir)) {
      fs.rmSync(config.buildDir, { recursive: true, force: true });
    }
    if (fs.existsSync(config.deployDir)) {
      fs.rmSync(config.deployDir, { recursive: true, force: true });
    }

    // Step 2: Install dependencies
    runCommand('npm install', 'Installing dependencies');

    // Step 3: Run ESLint check
    log('🔍 Running code quality checks...');
    try {
      runCommand('npx eslint src --quiet', 'Running ESLint');
    } catch (error) {
      log('⚠️ ESLint found issues, but continuing with build...', 'warning');
    }

    // Step 4: Build production bundle
    runCommand('npm run build', 'Building production bundle');

    // Step 5: Verify build
    if (!fs.existsSync(config.buildDir)) {
      throw new Error('Build directory not found');
    }

    // Step 6: Create deployment package
    log('📦 Creating deployment package...');
    fs.mkdirSync(config.deployDir, { recursive: true });
    
    // Copy build files
    fs.cpSync(config.buildDir, path.join(config.deployDir, 'build'), { recursive: true });
    
    // Create deployment instructions
    const deploymentInstructions = `
# AlphaQuote Frontend Deployment Package

## 📁 Contents
- \`build/\` - Production-ready React application
- \`deployment-instructions.md\` - This file

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login
3. Click "New Project"
4. Drag and drop the \`build\` folder
5. Set environment variables:
   - REACT_APP_API_URL=https://your-backend-url
   - REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
6. Deploy!

### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag and drop the \`build\` folder
4. Set environment variables in Site Settings
5. Deploy!

### Option 3: Firebase Hosting
1. Install Firebase CLI: \`npm install -g firebase-tools\`
2. Run: \`firebase login\`
3. Run: \`firebase init hosting\`
4. Copy build files to public directory
5. Run: \`firebase deploy\`

## 🔧 Environment Variables
Make sure to set these in your hosting platform:
- REACT_APP_API_URL (your backend URL)
- REACT_APP_CLERK_PUBLISHABLE_KEY (for authentication)
- REACT_APP_STRIPE_PUBLISHABLE_KEY (for payments)

## 📞 Support
If you need help, check the deployment guide or contact support.

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
    log('\n🎉 Frontend deployment package ready!', 'success');
    log('=====================================');
    log(`📁 Deployment folder: ${config.deployDir}/`);
    log(`📦 ZIP package: ${config.packageName}.zip`);
    log('\n📋 Next steps:');
    log('1. Upload the build folder to your hosting platform');
    log('2. Set up environment variables');
    log('3. Configure your domain');
    log('4. Test the deployment');
    log('\n📖 See deployment-instructions.md for detailed steps');

  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Run deployment
deploy();
