// Price Scraper Service for AlphaQuote (SerpAPI / Google Shopping)
//
// Pass Seven (production hardening). The contract is now explicit:
//
//   * ONLY the main AlphaQuote API calls this service, server-to-server.
//     Browsers never talk to it directly (Pass Two had locked it behind a
//     browser-held Clerk token the frontend never actually sent, so every
//     live lookup failed; and the service was never deployed at all).
//   * Data routes require a shared secret in the `x-scraper-secret`
//     header, compared in constant time. The secret comes only from the
//     SCRAPER_SHARED_SECRET environment variable. When it is not set the
//     data routes fail closed (503) — an unconfigured service serves
//     nothing, ever.
//   * The SerpAPI key comes only from the SERPAPI_KEY environment
//     variable. When it is missing the service answers honestly
//     (503, source: 'unconfigured', zero results). The old behavior —
//     fabricating random "store prices" — is gone: this service never
//     invents a price.
//   * Upstream SerpAPI calls have a hard timeout; an upstream failure is
//     a 502, never a silently-empty or fake result set.
//   * GET /health stays public: a data-free liveness probe that makes no
//     SerpAPI call and reports only whether the secrets are configured.

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

// Use built-in fetch for Node.js 18+ or node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';
const SERPAPI_TIMEOUT_MS = parseInt(process.env.SERPAPI_TIMEOUT_MS || '10000', 10);

// Secrets are read lazily (per call) so configuration is never captured
// stale at require time and tests can set env before exercising routes.
const getSerpApiKey = () => process.env.SERPAPI_KEY || '';
const getSharedSecret = () => process.env.SCRAPER_SHARED_SECRET || '';
const isSerpApiEnabled = () => getSerpApiKey().length > 0;
const isSecretConfigured = () => getSharedSecret().length > 0;

const app = express();
// SCRAPER_PORT wins when set (local dev); fall back to the host-injected PORT.
const PORT = process.env.SCRAPER_PORT || process.env.PORT || 5050;

// CORS: server-to-server callers send no Origin, so this only matters for
// local development. Same explicit allowlist style as the main API.
const corsAllowlist = (
  process.env.CORS_ALLOWED_ORIGINS ||
  [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000', 'http://127.0.0.1:3000'].join(',')
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsAllowlist.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));

/**
 * Shared-secret gate for every data route. Fails closed:
 *  - secret not configured on this service -> 503 (service not lit up)
 *  - header missing or wrong              -> 401
 */
function requireScraperSecret(req, res, next) {
  const configured = getSharedSecret();
  if (!configured) {
    return res.status(503).json({
      success: false,
      source: 'unconfigured',
      error: 'Scraper service is not configured (SCRAPER_SHARED_SECRET is not set)'
    });
  }
  const presented = req.get('x-scraper-secret') || '';
  const presentedBuf = Buffer.from(presented);
  const configuredBuf = Buffer.from(configured);
  const matches =
    presentedBuf.length === configuredBuf.length &&
    crypto.timingSafeEqual(presentedBuf, configuredBuf);
  if (!matches) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return next();
}

/**
 * Honest-unconfigured gate: without a SerpAPI key there is no live data,
 * so data routes say so instead of fabricating prices.
 */
function requireSerpApi(req, res, next) {
  if (!isSerpApiEnabled()) {
    return res.status(503).json({
      success: false,
      source: 'unconfigured',
      results: [],
      totalResults: 0,
      averagePrice: null,
      error: 'SERPAPI_KEY is not configured on the scraper service; live pricing is unavailable'
    });
  }
  return next();
}

// --- Input validation -------------------------------------------------

function parseSearchParams(req) {
  const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  if (!rawSearch) {
    return { error: 'Query parameter "search" is required' };
  }
  if (rawSearch.length > 120) {
    return { error: 'Query parameter "search" is too long (max 120 characters)' };
  }
  const rawZip = typeof req.query.zip === 'string' ? req.query.zip.trim() : '';
  if (rawZip && !/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(rawZip)) {
    return { error: 'Query parameter "zip" is not a valid postal code' };
  }
  return { search: rawSearch, zip: rawZip, location: rawZip || 'United States' };
}

function parseSites(req) {
  const available = Object.keys(scrapers);
  if (!req.query.sites) {
    return { sites: ['allStores'] };
  }
  const requested = String(req.query.sites)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const valid = requested.filter((s) => available.includes(s));
  if (valid.length === 0) {
    return { error: `No valid sites requested. Available sites: ${available.join(', ')}` };
  }
  return { sites: valid };
}

// --- SerpAPI ----------------------------------------------------------

/**
 * One SerpAPI Google Shopping search. Throws on transport failure,
 * timeout, HTTP error, or a SerpAPI-level error — callers turn that
 * into an honest 502 rather than an empty/fake result set.
 */
const serpApiSearch = async (query, location = "United States") => {
  const params = new URLSearchParams({
    engine: 'google_shopping',
    q: query,
    location: location,
    api_key: getSerpApiKey(),
    num: 20,
    sort: 'price_low_to_high'
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERPAPI_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${SERPAPI_BASE_URL}?${params}`, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`SerpAPI request timed out after ${SERPAPI_TIMEOUT_MS}ms`);
    }
    throw new Error(`SerpAPI request failed: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`SerpAPI returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }
  return data.shopping_results || [];
};

// Process shopping results and extract pricing data
const processShoppingResults = (results) => {
  const processedResults = [];

  results.forEach(result => {
    try {
      let price = null;
      let priceText = '';

      if (result.price) {
        priceText = result.price;
        const priceMatch = result.price.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
          price = parseFloat(priceMatch[0].replace(/,/g, ''));
        }
      }

      if (price && price > 0) {
        processedResults.push({
          title: result.title || 'Unknown Product',
          price: priceText,
          priceValue: price,
          source: result.source || 'Unknown Store',
          link: result.link,
          thumbnail: result.thumbnail,
          rating: result.rating,
          reviews: result.reviews,
          delivery: result.delivery,
          shipping: result.shipping
        });
      }
    } catch (error) {
      console.warn('Error processing result:', error.message);
    }
  });

  return processedResults.sort((a, b) => a.priceValue - b.priceValue);
};

// Store-specific searches
const scrapers = {
  async homeDepot(search, location) {
    const results = await serpApiSearch(`${search} site:homedepot.com`, location);
    return processShoppingResults(results).slice(0, 5);
  },

  async lowes(search, location) {
    const results = await serpApiSearch(`${search} site:lowes.com`, location);
    return processShoppingResults(results).slice(0, 5);
  },

  async menards(search, location) {
    const results = await serpApiSearch(`${search} site:menards.com`, location);
    return processShoppingResults(results).slice(0, 5);
  },

  async aceHardware(search, location) {
    const results = await serpApiSearch(`${search} site:acehardware.com`, location);
    return processShoppingResults(results).slice(0, 5);
  },

  async trueValue(search, location) {
    const results = await serpApiSearch(`${search} site:truevalue.com`, location);
    return processShoppingResults(results).slice(0, 5);
  },

  // General shopping search across all stores
  async allStores(search, location) {
    const results = await serpApiSearch(`${search} construction materials`, location);
    return processShoppingResults(results).slice(0, 10);
  }
};

const averagePriceOf = (items) => {
  const numeric = items
    .map(item => item.priceValue)
    .filter(price => typeof price === 'number' && !isNaN(price) && price > 0);
  if (numeric.length === 0) return null;
  const average = numeric.reduce((a, b) => a + b, 0) / numeric.length;
  return `$${average.toFixed(2)}`;
};

// --- Routes -----------------------------------------------------------

// Health check (public liveness probe: no data, no SerpAPI call, and no
// secret values — only whether each is configured).
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    availableSites: Object.keys(scrapers),
    serpApiConfigured: isSerpApiEnabled(),
    secretConfigured: isSecretConfigured(),
    version: '3.0 - Shared-secret server-to-server (Pass Seven)'
  });
});

// Main scraping endpoint (API-to-service only: shared secret required)
app.get("/scrape-price", requireScraperSecret, requireSerpApi, async (req, res) => {
  const parsed = parseSearchParams(req);
  if (parsed.error) {
    return res.status(400).json({ success: false, error: parsed.error });
  }
  const sitesParsed = parseSites(req);
  if (sitesParsed.error) {
    return res.status(400).json({ success: false, error: sitesParsed.error });
  }
  const { search, zip, location } = parsed;
  const sites = sitesParsed.sites;

  try {
    // Fan out in parallel; every call carries its own hard timeout.
    const perSite = await Promise.all(
      sites.map(async (site) => ({ site, prices: await scrapers[site](search, location) }))
    );

    const results = {};
    const allPrices = [];
    for (const { site, prices } of perSite) {
      results[site] = prices;
      allPrices.push(...prices);
    }
    allPrices.sort((a, b) => a.priceValue - b.priceValue);

    const numericPrices = allPrices.map(item => item.priceValue).filter(p => p > 0);

    return res.json({
      success: true,
      query: search,
      location: zip || location,
      sites: sites,
      totalResults: allPrices.length,
      averagePrice: averagePriceOf(allPrices),
      priceRange: numericPrices.length > 0 ? {
        min: `$${Math.min(...numericPrices).toFixed(2)}`,
        max: `$${Math.max(...numericPrices).toFixed(2)}`
      } : null,
      results: allPrices,
      breakdown: results,
      timestamp: new Date().toISOString(),
      source: 'serpapi'
    });
  } catch (err) {
    console.error('❌ SerpAPI search error:', err.message);
    return res.status(502).json({
      success: false,
      source: 'error',
      query: search,
      location: zip || location,
      sites: sites,
      totalResults: 0,
      averagePrice: null,
      results: [],
      error: err.message
    });
  }
});

// Site-specific endpoint (shared secret required)
app.get("/scrape/:site", requireScraperSecret, requireSerpApi, async (req, res) => {
  const site = req.params.site;
  if (!scrapers[site]) {
    return res.status(400).json({
      success: false,
      error: "Invalid site",
      availableSites: Object.keys(scrapers)
    });
  }
  const parsed = parseSearchParams(req);
  if (parsed.error) {
    return res.status(400).json({ success: false, error: parsed.error });
  }

  try {
    const prices = await scrapers[site](parsed.search, parsed.location);
    return res.json({
      success: true,
      site: site,
      query: parsed.search,
      zip: parsed.zip,
      results: prices,
      count: prices.length,
      source: 'serpapi'
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      source: 'error',
      error: `${site} scraping failed`,
      message: err.message
    });
  }
});

// Available sites + configuration status (shared secret required)
app.get("/sites", requireScraperSecret, (req, res) => {
  res.json({
    availableSites: Object.keys(scrapers),
    descriptions: {
      homeDepot: "Home Depot - Large home improvement retailer (via SerpAPI)",
      lowes: "Lowe's - Home improvement and appliance store (via SerpAPI)",
      menards: "Menards - Midwest home improvement chain (via SerpAPI)",
      aceHardware: "Ace Hardware - Local hardware store chain (via SerpAPI)",
      trueValue: "True Value - Hardware and home improvement (via SerpAPI)",
      allStores: "All Stores - General shopping search across multiple retailers (via SerpAPI)"
    },
    serpApi: {
      configured: isSerpApiEnabled(),
      status: isSerpApiEnabled() ? 'Live pricing via Google Shopping' : 'Not configured (SERPAPI_KEY missing)'
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 AlphaQuote Price Scraper v3.0 running at http://localhost:${PORT}`);
    console.log(`📊 Available sites: ${Object.keys(scrapers).join(', ')}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Shared secret: ${isSecretConfigured() ? 'configured' : 'NOT SET — data routes will fail closed (503)'}`);
    console.log(`💡 SerpAPI: ${isSerpApiEnabled() ? 'configured — live pricing enabled' : 'NOT SET — data routes will answer 503 unconfigured'}`);
  });
}

module.exports = app;
