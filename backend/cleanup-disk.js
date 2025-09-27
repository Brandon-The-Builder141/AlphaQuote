// Disk Cleanup Script for AlphaQuote
// Helps free up space by cleaning temporary files and node_modules

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 AlphaQuote Disk Cleanup Utility');
console.log('====================================');

// Function to get directory size
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be accessed
  }
  
  return totalSize;
}

// Function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check current disk usage
console.log('\n📊 Current Disk Usage:');
try {
  const nodeModulesSize = getDirectorySize('./node_modules');
  console.log(`📁 node_modules: ${formatBytes(nodeModulesSize)}`);
  
  const buildSize = getDirectorySize('./build');
  console.log(`📁 build: ${formatBytes(buildSize)}`);
  
  const totalSize = nodeModulesSize + buildSize;
  console.log(`📊 Total project size: ${formatBytes(totalSize)}`);
  
} catch (error) {
  console.log('❌ Error checking disk usage:', error.message);
}

// Cleanup options
console.log('\n🧹 Cleanup Options:');
console.log('1. Clean node_modules (saves space, requires npm install)');
console.log('2. Clean build folder');
console.log('3. Clean both');
console.log('4. Check disk space only');

// For now, let's just show the current status
console.log('\n💡 To free up space:');
console.log('• Run: Remove-Item -Recurse -Force node_modules');
console.log('• Run: npm install (to reinstall dependencies)');
console.log('• Run: Remove-Item -Recurse -Force build (if exists)');

console.log('\n✅ Cleanup utility ready!');
