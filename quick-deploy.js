#!/usr/bin/env node

/**
 * Quick Deployment Script
 * Fast deployment for testing and demos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚡ AlphaQuote Quick Deployment');
console.log('==============================\n');

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

try {
  // Quick frontend build
  log('🎨 Building frontend...');
  execSync('npm run build', { stdio: 'inherit', cwd: 'frontend' });
  
  // Create quick deploy folder
  const deployDir = 'quick-deploy';
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }
  fs.mkdirSync(deployDir);
  
  // Copy build files
  fs.cpSync('frontend/build', `${deployDir}/build`, { recursive: true });
  
  // Create simple instructions
  const instructions = `# Quick Deploy Instructions

## 🚀 Deploy to Vercel (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Drag and drop the 'build' folder
3. Set environment variable: REACT_APP_API_URL=http://localhost:3001
4. Deploy!

## 🔧 For Production
- Update REACT_APP_API_URL to your backend URL
- Add real Clerk keys for authentication
- Configure custom domain

Generated: ${new Date().toISOString()}
`;
  
  fs.writeFileSync(`${deployDir}/README.md`, instructions);
  
  log('✅ Quick deploy package ready!', 'success');
  log(`📁 Upload the '${deployDir}/build' folder to Vercel`);
  
} catch (error) {
  log(`❌ Quick deploy failed: ${error.message}`, 'error');
  process.exit(1);
}
