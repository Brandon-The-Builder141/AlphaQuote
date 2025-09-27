#!/usr/bin/env node

/**
 * AlphaQuote Service Verification Script
 * Quickly verify all services are running correctly
 */

const fetch = require('node-fetch').default || require('node-fetch');

const services = [
  {
    name: 'React App',
    url: 'http://localhost:3000',
    port: 3000
  },
  {
    name: 'Price Scraper',
    url: 'http://localhost:5050/health',
    port: 5050
  },
  {
    name: 'Ollama AI',
    url: 'http://localhost:11434/api/tags',
    port: 11434
  }
];

const checkService = async (service) => {
  try {
    const response = await fetch(service.url, { 
      method: 'GET',
      timeout: 5000 
    });
    
    if (response.ok) {
      console.log(`✅ ${service.name} - Running on port ${service.port}`);
      return true;
    } else {
      console.log(`⚠️ ${service.name} - Responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${service.name} - Not accessible (${error.message})`);
    return false;
  }
};

const main = async () => {
  console.log('🧮 AlphaQuote Service Status Check');
  console.log('==================================');
  console.log('');
  
  const results = [];
  
  for (const service of services) {
    const isRunning = await checkService(service);
    results.push({ ...service, running: isRunning });
  }
  
  console.log('');
  console.log('📊 Summary:');
  console.log('-----------');
  
  const runningCount = results.filter(r => r.running).length;
  
  if (runningCount === 3) {
    console.log('🎉 All services are running! AlphaQuote is ready for use.');
  } else if (runningCount >= 1) {
    console.log(`⚠️ ${runningCount}/3 services running. AlphaQuote will work with fallback modes.`);
  } else {
    console.log('❌ No services detected. Please start the services first.');
  }
  
  console.log('');
  console.log('🔗 Service URLs:');
  results.forEach(service => {
    if (service.running) {
      console.log(`   ${service.name}: ${service.url}`);
    }
  });
  
  console.log('');
  console.log('💡 To start services:');
  console.log('   npm start      (React App)');
  console.log('   npm run scraper (Price Scraper)');
  console.log('   ollama serve   (AI Service)');
  console.log('');
};

main().catch(console.error);



