# 🔍 AlphaQuote SerpAPI Price Scraper v2.0

## 🚀 **Professional Real-Time Pricing Intelligence**

The AlphaQuote price scraper has been completely redesigned to use **SerpAPI** for professional-grade pricing intelligence via Google Shopping results. This service runs on port 5050 and integrates seamlessly with the main AlphaQuote application.

## 🆕 **What's New in v2.0**

### **SerpAPI Integration**
- ✅ **Google Shopping Results** - Real-time pricing from all major retailers
- ✅ **Professional API** - Reliable, legal data access
- ✅ **Multi-Store Comparison** - Home Depot, Lowe's, Menards, Ace Hardware
- ✅ **Rich Product Data** - Prices, ratings, reviews, shipping info
- ✅ **Intelligent Fallbacks** - Works even without API key

### **Enhanced Features**
- ✅ **Price Range Analysis** - Min/max pricing with averages
- ✅ **Vendor Intelligence** - Store-specific pricing comparison
- ✅ **Location-Based Results** - ZIP code specific pricing
- ✅ **Confidence Scoring** - Data quality indicators

## 📦 **Setup & Configuration**

### **Quick Start**
```bash
# 1. Start the scraper service
npm run scraper

# 2. Test the health endpoint
curl http://localhost:5050/health

# 3. Verify integration with main app
# The service status indicator in AlphaQuote will show "Online" when running
```

### **SerpAPI Configuration (Recommended)**
```bash
# Get free API key: https://serpapi.com/
# Edit server/scraper.js line 11:
const SERPAPI_KEY = 'your_api_key_here';

# Or set environment variable:
set SERPAPI_KEY=your_api_key_here
```

## 🔗 **API Endpoints**

### **GET /scrape-price**
Main pricing endpoint with SerpAPI integration.

**Parameters:**
- `search`: Material search term (e.g., "vinyl flooring")
- `zip`: ZIP code for local pricing (default: "90210")
- `sites`: Comma-separated store list (default: "allStores")

**Examples:**
```bash
# General search across all stores
http://localhost:5050/scrape-price?search=vinyl+flooring&zip=90210&sites=allStores

# Home Depot specific
http://localhost:5050/scrape-price?search=quartz+countertops&zip=90210&sites=homeDepot

# Multi-store comparison
http://localhost:5050/scrape-price?search=hardwood+flooring&zip=90210&sites=homeDepot,lowes,menards
```

### **GET /health**
Service health and configuration status.

**Response:**
```json
{
  "status": "healthy",
  "serpApiConfigured": true,
  "serpApiStatus": "configured",
  "availableSites": ["homeDepot", "lowes", "menards", "aceHardware", "trueValue", "allStores"],
  "version": "2.0 - SerpAPI Integration"
}
```

### **GET /sites**
Available store information and SerpAPI features.

## 📊 **Response Format**

### **With SerpAPI (Live Data)**
```json
{
  "query": "vinyl flooring",
  "location": "90210",
  "totalResults": 10,
  "averagePrice": "$7.75",
  "priceRange": {
    "min": "$2.99",
    "max": "$13.79"
  },
  "results": [
    {
      "title": "Luxury Vinyl Plank Flooring",
      "price": "$4.25",
      "priceValue": 4.25,
      "source": "Home Depot",
      "rating": "4.2",
      "reviews": 245,
      "delivery": "Available",
      "shipping": "Free shipping"
    }
  ],
  "source": "serpapi",
  "timestamp": "2025-09-19T14:30:00.000Z"
}
```

### **Fallback Mode (No API Key)**
```json
{
  "query": "vinyl flooring",
  "location": "90210",
  "totalResults": 5,
  "averagePrice": "$3.75",
  "results": [
    {
      "title": "vinyl flooring - Home Depot",
      "price": "$3.25",
      "source": "Home Depot",
      "rating": "4.1",
      "delivery": "Available"
    }
  ],
  "source": "fallback",
  "message": "Using estimated pricing - configure SERPAPI_KEY for live data"
}
```

## 🧠 **AI Integration**

### **Automatic Integration**
The scraper seamlessly integrates with AlphaQuote's AI system:

1. **Smart Search Terms**: AI determines optimal search queries
2. **Location Awareness**: Uses business profile ZIP code
3. **Real-Time Data**: Fetches current pricing during estimate generation
4. **Fallback Handling**: Gracefully handles API limits or failures
5. **Context Integration**: Pricing data included in AI prompts

### **Enhanced AI Prompts**
```javascript
📊 Multi-Site Material Pricing (ZIP 62701):
🔍 Search: "Kitchen materials"
💰 Average Price: ~$6.25/sqft
🏪 Sources: Home Depot: 5 prices, Lowe's: 4 prices
📈 Total Prices Found: 12
⏰ Updated: 2:30 PM

📋 Price Breakdown by Store:
• Home Depot: $5.99, $6.25, $6.75
• Lowe's: $5.89, $6.15, $6.45
```

## 💰 **SerpAPI Pricing & Value**

### **Free Tier (Perfect for Testing)**
- 🆓 **100 searches/month**
- ✅ **All features included**
- 🚀 **No setup fees**

### **Paid Plans (Production Use)**
- 💼 **$50/month**: 5,000 searches
- 🏢 **$125/month**: 15,000 searches
- 🚀 **$250/month**: 30,000 searches

### **ROI Analysis**
- **Cost per search**: $0.01 - $0.008
- **Cost per estimate**: ~$0.01 (1 search average)
- **Monthly cost**: $5-50 for most contractors
- **Value**: Accurate pricing saves 2-5% on estimates
- **Break-even**: 1-2 projects per month

## 🔧 **Technical Features**

### **Professional Grade**
- ✅ **Reliable API access** - No more blocked requests
- ✅ **Rate limiting** - Respects API quotas
- ✅ **Error handling** - Graceful degradation
- ✅ **Caching** - Efficient API usage

### **Data Processing**
- ✅ **Price normalization** - Consistent formatting
- ✅ **Store recognition** - Vendor identification
- ✅ **Quality scoring** - Data confidence levels
- ✅ **Trend analysis** - Price movement detection

## 🚨 **Troubleshooting**

### **Common Issues**

**"SerpAPI not configured"**
- Set your API key in `server/scraper.js`
- Or use environment variable: `SERPAPI_KEY=your_key`

**"No results found"**
- Try broader search terms
- Check ZIP code format
- Verify API key is valid
- API may have usage limits

**"API quota exceeded"**
- Check SerpAPI dashboard for usage
- Upgrade plan if needed
- Fallback mode activates automatically

### **Debug Commands**
```bash
# Check service health
curl http://localhost:5050/health

# Test specific search
curl "http://localhost:5050/scrape-price?search=test&zip=12345"

# View available sites
curl http://localhost:5050/sites
```

## 🎯 **Integration with AlphaQuote**

### **Estimate Forms**
- Real-time pricing suggestions
- Material-specific search optimization
- Regional pricing accuracy
- Vendor comparison data

### **AI Assistant**
- Enhanced prompts with live pricing
- Market intelligence context
- Professional estimate generation
- Fallback calculations when needed

### **Receipt Intelligence**
- Complements receipt-based pricing with OCR processing
- Validates local vs market pricing
- Provides broader market context
- Fills gaps in receipt data

### **Service Status Monitoring**
- Real-time service health monitoring
- Automatic fallback when service is offline
- Visual status indicator in the application
- Graceful degradation for pricing features

---

## 🏆 **Professional Pricing Intelligence**

**The SerpAPI integration transforms AlphaQuote into a professional-grade pricing intelligence platform that provides:**

✅ **Real-time market data** from Google Shopping  
✅ **Multi-source validation** with receipt intelligence  
✅ **Professional reliability** with fallback systems  
✅ **Cost-effective operation** with free tier available  

**This creates a significant competitive advantage through accurate, current pricing data that beats manual research methods.**

🔗 **Get Started**: https://serpapi.com/  
📧 **Support**: SerpAPI documentation and support  
💡 **Tips**: Start with free tier, upgrade based on usage