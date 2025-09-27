/**
 * Service Status Checker for AlphaQuote
 * Checks availability of external services (Ollama AI, Price Scraper)
 */

export const checkServiceStatus = async () => {
  const status = {
    ollama: false,
    scraper: false,
    timestamp: new Date().toISOString()
  };

  // Check Ollama AI Service
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    status.ollama = response.ok;
  } catch (error) {
    console.warn('Ollama service not available:', error.message);
    status.ollama = false;
  }

  // Check Price Scraper Service
  try {
    const response = await fetch('http://localhost:5050/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    status.scraper = response.ok;
  } catch (error) {
    console.warn('Price scraper service not available:', error.message);
    status.scraper = false;
  }

  return status;
};

export const getServiceStatusMessage = (status) => {
  const messages = [];

  if (!status.ollama) {
    messages.push({
      type: 'warning',
      service: 'AI Assistant',
      message: 'Ollama AI service is not running. AI features will use fallback estimates.',
      solution: 'Start Ollama with: ollama serve'
    });
  }

  if (!status.scraper) {
    messages.push({
      type: 'warning',
      service: 'Price Scraper',
      message: 'Price scraper service is not running. Using estimated pricing.',
      solution: 'Start scraper with: npm run scraper'
    });
  }

  if (status.ollama && status.scraper) {
    messages.push({
      type: 'success',
      service: 'All Services',
      message: 'All services are running correctly.',
      solution: null
    });
  }

  return messages;
};

export default checkServiceStatus;



