/**
 * Service Status Checker for AlphaQuote
 *
 * Pass Seven: the browser no longer probes the scraper service directly
 * (it isn't browser-reachable by design, and REACT_APP_SCRAPER_URL was
 * never set in production, so this widget always cried wolf). Status
 * now comes from the API, which knows whether the scraper is wired up
 * and can actually reach it: GET /api/prices/status.
 */

import { API_BASE_URL } from '../config/env';

export const checkServiceStatus = async () => {
  const status = {
    scraper: false,
    scraperConfigured: false,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/prices/status`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    if (response.ok) {
      const data = await response.json();
      status.scraperConfigured = Boolean(data.configured);
      // "Running" means configured AND reachable AND able to serve live
      // prices (a SerpAPI key present on the scraper service).
      status.scraper = Boolean(data.configured && data.reachable && data.serpApiConfigured);
    }
  } catch (error) {
    console.warn('Price lookup status unavailable:', error.message);
  }

  return status;
};

export const getServiceStatusMessage = (status) => {
  const messages = [];

  if (!status.scraper) {
    messages.push({
      type: 'warning',
      service: 'Price Scraper',
      message: status.scraperConfigured
        ? 'Live price lookup is configured but not answering. Estimates use your saved and receipt pricing.'
        : 'Live price lookup is not set up on this server. Estimates use your saved and receipt pricing.',
      solution: null
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
