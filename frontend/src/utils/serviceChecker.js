/**
 * Service Status Checker for AlphaQuote
 * Checks availability of external services (Price Scraper)
 */

import { API_ENDPOINTS } from '../config/env';

export const checkServiceStatus = async () => {
  const status = {
    scraper: false,
    timestamp: new Date().toISOString()
  };

  // Check Price Scraper Service
  try {
    const response = await fetch(API_ENDPOINTS.SCRAPER_HEALTH, {
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

  if (!status.scraper) {
    messages.push({
      type: 'warning',
      service: 'Price Scraper',
      message: 'Price scraper service is not running. Using estimated pricing.',
      solution: 'Start scraper with: npm run scraper'
    });
  }

  if (status.scraper) {
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



