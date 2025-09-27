// start-scraper.js - Simple script to start the price scraper server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AlphaQuote Price Scraper Server...');
console.log('📡 Server will run on http://localhost:5050');
console.log('🔗 Test URL: http://localhost:5050/scrape-price?search=vinyl+flooring&zip=43078');

const scraper = spawn('node', ['server/scraper.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

scraper.on('error', (error) => {
  console.error('❌ Failed to start scraper server:', error);
});

scraper.on('close', (code) => {
  console.log(`📴 Scraper server exited with code ${code}`);
});
