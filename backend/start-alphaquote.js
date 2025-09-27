#!/usr/bin/env node

/**
 * AlphaQuote Startup Script
 * Comprehensive startup script for AlphaQuote application
 * Starts all required services and checks dependencies
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧮 AlphaQuote Professional Estimation Software');
console.log('================================================');
console.log('Starting all services...\n');

// Configuration
const config = {
  react: {
    command: 'npm start',
    port: 3000,
    name: 'React App'
  },
  scraper: {
    command: 'node server/scraper.js',
    port: 5050,
    name: 'Price Scraper'
  },
  ollama: {
    command: 'ollama serve',
    port: 11434,
    name: 'Ollama AI'
  }
};

// Track running processes
const processes = {};
let startupComplete = false;

// Utility functions
const log = (service, message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'     // reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${service}: ${message}${colors.reset}`);
};

const checkPort = (port) => {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    
    server.on('error', () => resolve(true));
  });
};

const waitForService = async (name, port, maxWait = 30000) => {
  log(name, `Waiting for service on port ${port}...`);
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const isRunning = await checkPort(port);
    if (isRunning) {
      log(name, `✅ Service is running on port ${port}`, 'success');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  log(name, `⚠️ Service did not start within ${maxWait/1000} seconds`, 'warning');
  return false;
};

// Check prerequisites
const checkPrerequisites = async () => {
  log('System', 'Checking prerequisites...');
  
  // Check if Node.js dependencies are installed
  if (!fs.existsSync('node_modules')) {
    log('System', 'Installing Node.js dependencies...', 'warning');
    return new Promise((resolve) => {
      const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
      npmInstall.on('close', (code) => {
        if (code === 0) {
          log('System', '✅ Dependencies installed successfully', 'success');
          resolve(true);
        } else {
          log('System', '❌ Failed to install dependencies', 'error');
          resolve(false);
        }
      });
    });
  }
  
  log('System', '✅ Prerequisites check complete', 'success');
  return true;
};

// Start individual services
const startService = (serviceName, serviceConfig) => {
  return new Promise((resolve) => {
    log(serviceName, `Starting ${serviceConfig.name}...`);
    
    const [command, ...args] = serviceConfig.command.split(' ');
    const process = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });
    
    processes[serviceName] = process;
    
    // Handle process output
    process.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        log(serviceName, message);
      }
    });
    
    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('warning')) {
        log(serviceName, message, 'warning');
      }
    });
    
    process.on('close', (code) => {
      if (!startupComplete) {
        log(serviceName, `Process exited with code ${code}`, code === 0 ? 'info' : 'error');
      }
    });
    
    process.on('error', (err) => {
      log(serviceName, `Failed to start: ${err.message}`, 'error');
    });
    
    // Give the process a moment to start
    setTimeout(() => resolve(process), 2000);
  });
};

// Graceful shutdown
const shutdown = () => {
  if (startupComplete) {
    console.log('\n🛑 Shutting down AlphaQuote services...');
    
    Object.entries(processes).forEach(([name, process]) => {
      if (process && !process.killed) {
        log(name, 'Stopping service...');
        process.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }
};

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Main startup sequence
const main = async () => {
  try {
    // Check prerequisites
    const prereqsOk = await checkPrerequisites();
    if (!prereqsOk) {
      log('System', '❌ Prerequisites check failed', 'error');
      process.exit(1);
    }
    
    console.log('\n🚀 Starting services...\n');
    
    // Start scraper service first
    await startService('scraper', config.scraper);
    await waitForService('Price Scraper', config.scraper.port, 10000);
    
    // Try to start Ollama (optional)
    log('ollama', 'Attempting to start Ollama AI service...');
    try {
      await startService('ollama', config.ollama);
      const ollamaStarted = await waitForService('Ollama AI', config.ollama.port, 15000);
      if (!ollamaStarted) {
        log('ollama', '⚠️ Ollama not available - AI features will use fallback mode', 'warning');
      }
    } catch (error) {
      log('ollama', '⚠️ Ollama not installed - AI features will use fallback mode', 'warning');
    }
    
    // Start React app last
    await startService('react', config.react);
    const reactStarted = await waitForService('React App', config.react.port, 20000);
    
    if (reactStarted) {
      startupComplete = true;
      console.log('\n🎉 AlphaQuote is now running!');
      console.log('=====================================');
      console.log(`📱 Application: http://localhost:${config.react.port}`);
      console.log(`🔧 Price Scraper: http://localhost:${config.scraper.port}/health`);
      console.log(`🤖 Ollama AI: http://localhost:${config.ollama.port} (if available)`);
      console.log('\n💡 Tips:');
      console.log('- Set up your business profile for branded estimates');
      console.log('- Use the AI assistant for voice-powered estimates');
      console.log('- Check service status in the top-right corner');
      console.log('\nPress Ctrl+C to stop all services\n');
    } else {
      log('System', '❌ Failed to start React application', 'error');
      shutdown();
    }
    
  } catch (error) {
    log('System', `❌ Startup failed: ${error.message}`, 'error');
    shutdown();
  }
};

// Start the application
main();



