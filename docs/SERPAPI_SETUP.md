# 🔍 SerpAPI Integration Setup Guide

AlphaQuote now uses **SerpAPI** for professional, reliable price scraping via Google Shopping results.

## 🚀 Quick Setup

### 1. Get SerpAPI Key (Recommended)
1. Go to: https://serpapi.com/
2. Sign up for a free account
3. Get your API key from the dashboard
4. **Free tier**: 100 searches/month

### 2. Configure API Key

#### Option A: Environment Variable (Recommended)
```bash
# Windows
set SERPAPI_KEY=your_actual_api_key_here

# Mac/Linux
export SERPAPI_KEY=your_actual_api_key_here
```

#### Option B: Direct Configuration
Edit `server/scraper.js` line 11:
```javascript
const SERPAPI_KEY = 'your_actual_api_key_here';
```

### 3. Restart Scraper Service
```bash
npm run scraper
```

## 🎯 SerpAPI Benefits

### **Professional Grade**
- ✅ **Reliable**: No more blocked requests
- ✅ **Fast**: Optimized API responses
- ✅ **Accurate**: Real Google Shopping data
- ✅ **Legal**: Compliant data access

### **Rich Data**
- 🛒 **Product titles and descriptions**
- 💰 **Accurate pricing information**
- ⭐ **Ratings and reviews**
- 🚚 **Shipping and delivery info**
- 🏪 **Store information**
- 📊 **Price range analysis**

### **Business Features**
- 🔍 **Multi-store comparison**
- 📍 **Location-based results**
- 🎯 **Targeted searches** (site-specific)
- 📈 **Price trend analysis**

## 🛠 Usage Examples

### Basic Search
```bash
curl "http://localhost:5050/scrape-price?search=vinyl+flooring&zip=90210"
```

### Store-Specific Search
```bash
curl "http://localhost:5050/scrape-price?search=quartz+countertops&zip=90210&sites=homeDepot"
```

### Multi-Store Comparison
```bash
curl "http://localhost:5050/scrape-price?search=hardwood+flooring&zip=90210&sites=homeDepot,lowes,menards"
```

## 📊 API Response Format

```json
{
  "query": "vinyl flooring",
  "location": "90210",
  "sites": ["allStores"],
  "totalResults": 10,
  "averagePrice": "$4.25",
  "priceRange": {
    "min": "$2.99",
    "max": "$6.50"
  },
  "results": [
    {
      "title": "Luxury Vinyl Plank Flooring",
      "price": "$2.99",
      "priceValue": 2.99,
      "source": "Home Depot",
      "link": "https://...",
      "thumbnail": "https://...",
      "rating": "4.2",
      "reviews": 245,
      "delivery": "Available",
      "shipping": "Free shipping"
    }
  ],
  "source": "serpapi",
  "timestamp": "2025-09-16T17:30:00.000Z"
}
```

## 🔧 Fallback Mode

### Without SerpAPI Key
- ✅ **Still works** - Uses intelligent estimates
- 📊 **Material-based pricing** - Adjusts by material type
- 🏪 **Store variations** - Simulates different store prices
- 🎯 **Realistic data** - Based on industry averages

### Fallback Features
- **Granite/Quartz**: $6-12/sqft
- **Hardwood**: $4-9/sqft  
- **Tile/Ceramic**: $3-8/sqft
- **Vinyl/Laminate**: $2-5/sqft
- **Carpet**: $1.5-3.5/sqft

## 💰 SerpAPI Pricing

### **Free Tier** (Perfect for Testing)
- 🆓 **100 searches/month**
- ✅ **All features included**
- 🚀 **No setup fees**

### **Paid Plans** (For Production)
- 💼 **$50/month**: 5,000 searches
- 🏢 **$125/month**: 15,000 searches  
- 🚀 **$250/month**: 30,000 searches

### **Cost Analysis**
- **Per search**: $0.01 - $0.008
- **Per estimate**: ~$0.01 (1 search avg)
- **Monthly cost**: $5-50 for most contractors

## 🎯 Business Value

### **ROI Calculation**
- **Cost**: ~$50/month for 5,000 searches
- **Value**: Accurate pricing saves 2-5% on estimates
- **Break-even**: 1-2 projects per month
- **Profit**: Improved accuracy = more winning bids

### **Competitive Advantage**
- 🎯 **Real-time pricing** beats static estimates
- 🏆 **Professional accuracy** wins more bids  
- ⚡ **Faster estimates** = more opportunities
- 📊 **Data-driven decisions** reduce risk

## 🔍 Testing & Verification

### Check Service Status
```bash
npm run verify
```

### Test API Integration
```bash
curl http://localhost:5050/health
```

### Test Price Search
```bash
curl "http://localhost:5050/scrape-price?search=test&zip=12345"
```

## 🚨 Troubleshooting

### Common Issues

**"SerpAPI key not configured"**
- Set the `SERPAPI_KEY` environment variable
- Or edit the key directly in `server/scraper.js`

**"API quota exceeded"**
- Check your SerpAPI dashboard usage
- Upgrade plan if needed
- Fallback mode will activate automatically

**"No results found"**
- Try broader search terms
- Check ZIP code format
- Verify API key is valid

### Debug Mode
Add to your environment:
```bash
DEBUG=true npm run scraper
```

## 📈 Next Steps

1. **Get SerpAPI key** (free tier available)
2. **Configure environment variable**
3. **Test with sample searches**
4. **Integrate into estimates**
5. **Monitor usage and upgrade as needed**

---

**SerpAPI transforms AlphaQuote into a professional-grade estimation tool with real-time, accurate pricing data.**

🔗 **Get Started**: https://serpapi.com/  
📧 **Support**: Contact SerpAPI support for technical issues  
💡 **Tips**: Start with free tier, upgrade based on usage



