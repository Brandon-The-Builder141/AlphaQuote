#!/usr/bin/env node

/**
 * AlphaQuote Services Setup Script
 * Sets up Ollama with gpt-oss:latest model and starts scraper service
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');

console.log('🧮 AlphaQuote Services Setup');
console.log('============================');

const log = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'     // reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  return new Promise((resolve, reject) => {
    log(`${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Failed: ${error.message}`, 'error');
        reject(error);
      } else {
        log(`✅ ${description} completed`, 'success');
        if (stdout) console.log(stdout);
        resolve(stdout);
      }
    });
  });
};

const checkOllamaInstallation = async () => {
  try {
    await runCommand('ollama --version', 'Checking Ollama installation');
    return true;
  } catch (error) {
    log('❌ Ollama not found. Please install Ollama first:', 'error');
    console.log('');
    console.log('📥 Installation Instructions:');
    console.log('Windows: Download from https://ollama.ai/download/windows');
    console.log('macOS: Download from https://ollama.ai/download/mac');
    console.log('Linux: curl https://ollama.ai/install.sh | sh');
    console.log('');
    return false;
  }
};

const setupOllamaModel = async () => {
  try {
    log('📥 Pulling gpt-oss:latest model (this may take a few minutes)...');
    await runCommand('ollama pull gpt-oss:latest', 'Downloading gpt-oss:latest model');
    
    log('🧪 Testing model availability...');
    await runCommand('ollama list', 'Listing available models');
    
    return true;
  } catch (error) {
    log('⚠️ Failed to setup gpt-oss:latest model. Trying alternative models...', 'warning');
    
    try {
      log('📥 Trying llama2 as fallback...');
      await runCommand('ollama pull llama2', 'Downloading llama2 model');
      
      // Update the model in streamAlpha.js to use llama2
      const streamAlphaPath = './src/core/streamAlpha.js';
      if (fs.existsSync(streamAlphaPath)) {
        let content = fs.readFileSync(streamAlphaPath, 'utf8');
        content = content.replace('model: "gpt-oss:latest"', 'model: "llama2"');
        fs.writeFileSync(streamAlphaPath, content);
        log('✅ Updated streamAlpha.js to use llama2 model', 'success');
      }
      
      return true;
    } catch (fallbackError) {
      log('❌ Failed to setup any AI model. AI features will use fallback mode.', 'error');
      return false;
    }
  }
};

const startOllamaService = async () => {
  return new Promise((resolve) => {
    log('🚀 Starting Ollama service...');
    
    const ollamaProcess = spawn('ollama', ['serve'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });
    
    ollamaProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message.includes('Listening on')) {
        log('✅ Ollama service started successfully', 'success');
        resolve(true);
      }
    });
    
    ollamaProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('warning')) {
        log(`Ollama: ${message}`, 'info');
      }
    });
    
    ollamaProcess.on('error', (error) => {
      log(`❌ Failed to start Ollama: ${error.message}`, 'error');
      resolve(false);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      log('⚠️ Ollama service taking longer than expected to start', 'warning');
      resolve(true); // Continue anyway
    }, 10000);
  });
};

const startScraperService = async () => {
  return new Promise((resolve) => {
    log('🚀 Starting Price Scraper service...');
    
    const scraperProcess = spawn('node', ['server/scraper.js'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });
    
    scraperProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message.includes('running at')) {
        log('✅ Price Scraper service started successfully', 'success');
        resolve(true);
      }
      console.log(`Scraper: ${message}`);
    });
    
    scraperProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('warning')) {
        log(`Scraper: ${message}`, 'warning');
      }
    });
    
    scraperProcess.on('error', (error) => {
      log(`❌ Failed to start Price Scraper: ${error.message}`, 'error');
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      log('⚠️ Price Scraper taking longer than expected to start', 'warning');
      resolve(true); // Continue anyway
    }, 5000);
  });
};

const main = async () => {
  try {
    console.log('');
    log('🔍 Checking system requirements...');
    
    // Check if Node.js dependencies are installed
    if (!fs.existsSync('node_modules')) {
      await runCommand('npm install', 'Installing Node.js dependencies');
    }
    
    // Check Ollama installation
    const ollamaInstalled = await checkOllamaInstallation();
    
    if (ollamaInstalled) {
      // Setup AI model
      await setupOllamaModel();
      
      // Start Ollama service
      await startOllamaService();
    } else {
      log('⚠️ Skipping AI setup. AI features will use fallback mode.', 'warning');
    }
    
    // Start scraper service
    await startScraperService();
    
    console.log('');
    log('🎉 Services setup complete!', 'success');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Run: npm start (to start the React application)');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Check service status in the top-right corner');
    console.log('');
    console.log('💡 Service URLs:');
    console.log('- React App: http://localhost:3000');
    console.log('- Price Scraper: http://localhost:5050/health');
    console.log('- Ollama AI: http://localhost:11434 (if running)');
    console.log('');
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Setup interrupted. Services may still be running in background.');
  process.exit(0);
});

main();



