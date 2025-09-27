// Enhanced Multi-Site Price Scraper for AlphaQuote using SerpAPI
// Professional price scraping with Google Shopping results

const express = require("express");
const cors = require("cors");

// Use built-in fetch for Node.js 18+ or node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

// SerpAPI configuration
const SERPAPI_KEY = process.env.SERPAPI_KEY || 'c17781071d436fa603f949c75145ca77ccbe449f38d5c3cabd586f7ee09af5af';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

const app = express();
const PORT = 5050;

app.use(cors());

// SerpAPI Shopping Search Functions
const serpApiSearch = async (query, location = "United States") => {
  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: query,
      location: location,
      api_key: SERPAPI_KEY,
      num: 20, // Get up to 20 results
      sort: 'price_low_to_high'
    });

    const url = `${SERPAPI_BASE_URL}?${params}`;
    console.log(`🔍 SerpAPI Search: ${query} in ${location}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`SerpAPI returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`SerpAPI Error: ${data.error}`);
    }
    
    return data.shopping_results || [];
    
  } catch (error) {
    console.error('SerpAPI search failed:', error.message);
    return [];
  }
};

// Process shopping results and extract pricing data
const processShoppingResults = (results, query) => {
  const processedResults = [];
  
  results.forEach(result => {
    try {
      // Extract price information
      let price = null;
      let priceText = '';
      
      if (result.price) {
        priceText = result.price;
        // Extract numeric price
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
  
  // Sort by price (low to high)
  return processedResults.sort((a, b) => a.priceValue - b.priceValue);
};

// Store-specific search functions for backwards compatibility
const scrapers = {
  async homeDepot(search, zip) {
    const results = await serpApiSearch(`${search} site:homedepot.com`, zip);
    return processShoppingResults(results, search).slice(0, 5);
  },
  
  async lowes(search, zip) {
    const results = await serpApiSearch(`${search} site:lowes.com`, zip);
    return processShoppingResults(results, search).slice(0, 5);
  },
  
  async menards(search, zip) {
    const results = await serpApiSearch(`${search} site:menards.com`, zip);
    return processShoppingResults(results, search).slice(0, 5);
  },
  
  async aceHardware(search, zip) {
    const results = await serpApiSearch(`${search} site:acehardware.com`, zip);
    return processShoppingResults(results, search).slice(0, 5);
  },
  
  async trueValue(search, zip) {
    const results = await serpApiSearch(`${search} site:truevalue.com`, zip);
    return processShoppingResults(results, search).slice(0, 5);
  },
  
  // General shopping search across all stores
  async allStores(search, zip) {
    const results = await serpApiSearch(`${search} construction materials`, zip);
    return processShoppingResults(results, search).slice(0, 10);
  }
};

// Main scraping endpoint with SerpAPI integration
app.get("/scrape-price", async (req, res) => {
  const search = req.query.search || "vinyl flooring";
  const zip = req.query.zip || "90210";
  const sites = req.query.sites ? req.query.sites.split(',') : ['allStores']; // Default to general search

  console.log(`🔍 SerpAPI Search for: "${search}" in location: ${zip}`);
  console.log(`🏪 Target sites: ${sites.join(', ')}`);

  try {
    const allPrices = [];
    const results = {};

    // Check if API key is configured
    if (SERPAPI_KEY === 'your_serpapi_key_here') {
      console.warn('⚠️ SerpAPI key not configured, using fallback data');
      
      // Return fallback pricing data
      const fallbackPrices = generateFallbackPrices(search);
      return res.json({
        query: search,
        location: zip,
        sites: sites,
        totalResults: fallbackPrices.length,
        averagePrice: calculateAveragePrice(fallbackPrices),
        results: fallbackPrices,
        breakdown: { fallback: fallbackPrices },
        timestamp: new Date().toISOString(),
        source: 'fallback',
        message: 'Using estimated pricing - configure SERPAPI_KEY for live data'
      });
    }

    // Scrape from all requested sites using SerpAPI
    for (const site of sites) {
      if (scrapers[site]) {
        console.log(`📡 Searching via SerpAPI: ${site}...`);
        const prices = await scrapers[site](search, zip);
        results[site] = prices;
        allPrices.push(...prices);
      }
    }

    // Calculate average price from SerpAPI results
    const numericPrices = allPrices
      .map(item => item.priceValue || parseFloat((item.price || '0').replace(/[$,]/g, '')))
      .filter(price => !isNaN(price) && price > 0);

    const averagePrice = numericPrices.length > 0 
      ? numericPrices.reduce((a, b) => a + b, 0) / numericPrices.length 
      : null;

    // Prepare response
    const response = {
      query: search,
      location: zip,
      sites: sites,
      totalResults: allPrices.length,
      averagePrice: averagePrice ? `$${averagePrice.toFixed(2)}` : null,
      priceRange: numericPrices.length > 0 ? {
        min: `$${Math.min(...numericPrices).toFixed(2)}`,
        max: `$${Math.max(...numericPrices).toFixed(2)}`
      } : null,
      results: allPrices,
      breakdown: results,
      timestamp: new Date().toISOString(),
      source: 'serpapi'
    };

    console.log(`✅ SerpAPI search complete: ${allPrices.length} prices found`);
    console.log(`💰 Average price: ${response.averagePrice}`);

    res.json(response);

  } catch (err) {
    console.error('❌ SerpAPI search error:', err);
    
    // Fallback to estimated pricing on error
    const fallbackPrices = generateFallbackPrices(search);
    res.json({
      query: search,
      location: zip,
      sites: sites,
      totalResults: fallbackPrices.length,
      averagePrice: calculateAveragePrice(fallbackPrices),
      results: fallbackPrices,
      breakdown: { fallback: fallbackPrices },
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: err.message,
      message: 'Using estimated pricing due to API error'
    });
  }
});

// Generate fallback pricing data when SerpAPI is not available
const generateFallbackPrices = (search) => {
  const searchLower = search.toLowerCase();
  let basePrice = 4.0; // Default base price per sqft
  let priceRange = 2.0;
  
  // Adjust pricing based on material type
  if (searchLower.includes('granite') || searchLower.includes('quartz')) {
    basePrice = 8.0;
    priceRange = 4.0;
  } else if (searchLower.includes('hardwood') || searchLower.includes('wood')) {
    basePrice = 6.0;
    priceRange = 3.0;
  } else if (searchLower.includes('tile') || searchLower.includes('ceramic')) {
    basePrice = 5.0;
    priceRange = 2.5;
  } else if (searchLower.includes('vinyl') || searchLower.includes('laminate')) {
    basePrice = 3.5;
    priceRange = 1.5;
  } else if (searchLower.includes('carpet')) {
    basePrice = 2.5;
    priceRange = 1.0;
  }
  
  // Generate sample prices
  const stores = ['Home Depot', 'Lowe\'s', 'Menards', 'Ace Hardware', 'Local Supplier'];
  const fallbackPrices = [];
  
  stores.forEach((store, index) => {
    const variation = (Math.random() - 0.5) * priceRange;
    const price = basePrice + variation;
    fallbackPrices.push({
      title: `${search} - ${store}`,
      price: `$${price.toFixed(2)}`,
      priceValue: price,
      source: store,
      link: '#',
      thumbnail: null,
      rating: (4.0 + Math.random()).toFixed(1),
      reviews: Math.floor(Math.random() * 500) + 50,
      delivery: 'Available',
      shipping: index < 2 ? 'Free shipping' : null
    });
  });
  
  return fallbackPrices.sort((a, b) => a.priceValue - b.priceValue);
};

// Calculate average price from results
const calculateAveragePrice = (prices) => {
  const numericPrices = prices
    .map(item => item.priceValue || parseFloat((item.price || '0').replace(/[$,]/g, '')))
    .filter(price => !isNaN(price) && price > 0);
  
  if (numericPrices.length === 0) return null;
  
  const average = numericPrices.reduce((a, b) => a + b, 0) / numericPrices.length;
  return `$${average.toFixed(2)}`;
};

// Health check endpoint
app.get("/health", (req, res) => {
  const apiConfigured = SERPAPI_KEY !== 'your_serpapi_key_here';
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    availableSites: Object.keys(scrapers),
    serpApiConfigured: apiConfigured,
    serpApiStatus: apiConfigured ? 'configured' : 'using fallback pricing',
    version: '2.0 - SerpAPI Integration'
  });
});

// Site-specific endpoints
app.get("/scrape/:site", async (req, res) => {
  const site = req.params.site;
  const search = req.query.search || "vinyl flooring";
  const zip = req.query.zip || "90210";

  if (!scrapers[site]) {
    return res.status(400).json({ 
      error: "Invalid site", 
      availableSites: Object.keys(scrapers) 
    });
  }

  try {
    const prices = await scrapers[site](search, zip);
    res.json({
      site: site,
      query: search,
      zip: zip,
      results: prices,
      count: prices.length
    });
  } catch (err) {
    res.status(500).json({ 
      error: `${site} scraping failed`, 
      message: err.message 
    });
  }
});

// Get available sites and SerpAPI info
app.get("/sites", (req, res) => {
  const apiConfigured = SERPAPI_KEY !== 'your_serpapi_key_here';
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
      configured: apiConfigured,
      status: apiConfigured ? 'Live pricing via Google Shopping' : 'Fallback pricing estimates',
      features: [
        'Real-time pricing from Google Shopping',
        'Multiple store comparison',
        'Product ratings and reviews',
        'Delivery and shipping information',
        'Price range analysis'
      ]
    }
  });
});

app.listen(PORT, () => {
  const apiConfigured = SERPAPI_KEY !== 'your_serpapi_key_here';
  
  console.log(`🚀 AlphaQuote SerpAPI Price Scraper v2.0 running at http://localhost:${PORT}`);
  console.log(`📊 Available sites: ${Object.keys(scrapers).join(', ')}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Available sites: http://localhost:${PORT}/sites`);
  console.log(`💡 Usage: http://localhost:${PORT}/scrape-price?search=vinyl+flooring&zip=90210&sites=allStores`);
  console.log('');
  
  if (apiConfigured) {
    console.log('✅ SerpAPI configured - Live pricing enabled');
    console.log('🛒 Google Shopping integration active');
  } else {
    console.log('⚠️ SerpAPI not configured - Using fallback pricing');
    console.log('💡 Set SERPAPI_KEY environment variable for live pricing');
    console.log('🔗 Get API key: https://serpapi.com/');
  }
  
  console.log('');
});
