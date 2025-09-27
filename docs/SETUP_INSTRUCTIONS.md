# 🧮 AlphaQuote Setup Instructions

## Quick Start Guide

### 1. Install Prerequisites

**Node.js** (Required)
- Download from: https://nodejs.org/
- Version 14 or higher required

**Ollama** (For AI Features)
- Windows: https://ollama.ai/download/windows
- macOS: https://ollama.ai/download/mac  
- Linux: `curl https://ollama.ai/install.sh | sh`

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database & Services
```bash
npx prisma migrate dev
npm run db:seed
```
This will:
- Create the SQLite database with Prisma schema
- Populate with demo receipt and pricing data
- Set up receipt management and project tracking

### 4. Start the Application
```bash
npm start
```

## Manual Setup (Alternative)

If the automatic setup doesn't work, follow these steps:

### Step 1: Install Ollama AI Model
```bash
# Install Ollama first (see links above)
ollama pull gpt-oss:latest

# If gpt-oss:latest is not available, try:
ollama pull llama2
# or
ollama pull mistral
```

### Step 2: Start Services Manually

**Terminal 1 - React App:**
```bash
npm start
```

**Terminal 2 - API Server:**
```bash
npm run api
```

**Terminal 3 - Price Scraper:**
```bash
npm run scraper
```

**Terminal 4 - Ollama AI:**
```bash
ollama serve
```

## Service Status

After setup, check service status at: http://localhost:3000

- 🟢 Green: All services running
- 🟡 Yellow: Some services offline (app still works with fallbacks)
- 🔴 Red: Critical issues

## Service URLs

- **Main App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Price Scraper**: http://localhost:5050/health
- **Ollama AI**: http://localhost:11434
- **Database Studio**: http://localhost:5555

## Features Overview

### 🆕 New Features (v2.0)

### **Receipt Upload & Pricing Intelligence**
- **Upload receipts** from suppliers to build local pricing database
- **OCR processing** with Tesseract.js extracts vendor and material pricing data
- **Smart parsing** automatically extracts vendor, date, items, and totals
- **Receipt browsing** with search, filter, and management capabilities
- **Project assignment** to link receipts to specific projects
- **Price analytics** show trends, ranges, and vendor comparisons
- **Smart suggestions** in estimate forms from real receipt data
- **Vendor management** with purchase history and statistics

### **Enhanced Client-Fillable Forms**
- **Client Information**: Name, email, phone, address
- **Job Type**: Fully customizable project type
- **Project Details**: Description, timeline, budget
- **Room Details**: All text inputs (no dropdowns)
- **Material Costs**: Client can specify exact costs with price intelligence
- **Labor Hours**: Client can specify time estimates

### 🤖 AI Model: gpt-oss:latest
- Advanced GPT-based model for better estimates
- Fallback to other models if unavailable
- Works offline with manual calculations

### 💰 SerpAPI Price Scraper
- **Google Shopping integration** via SerpAPI
- **Real-time pricing** from major retailers
- **Fallback pricing** when API quota exceeded
- **Multi-store comparison** with price analytics

### 🧾 Receipt Intelligence
- **Upload supplier receipts** to build local pricing database
- **OCR processing** extracts pricing data automatically
- **Vendor analytics** track supplier performance
- **Price suggestions** integrated in estimate forms

## Troubleshooting

### Common Issues

**"Ollama not found"**
```bash
# Install Ollama first, then:
ollama pull gpt-oss:latest
ollama serve
```

**"Port already in use"**
```bash
# Kill processes using the ports:
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

**"Price scraper not working"**
- This is normal - many sites block scraping
- The app will use fallback pricing automatically
- Client can input their own material costs

**"AI not generating estimates"**
- Check if Ollama is running: http://localhost:11434
- Verify model is installed: `ollama list`
- App will use fallback calculations if AI is unavailable

### Model Alternatives

If gpt-oss:latest doesn't work, try these models:

```bash
# Try these in order:
ollama pull gpt-oss:latest
ollama pull llama2  
ollama pull mistral
ollama pull codellama
```

Then update `src/core/streamAlpha.js` line 87:
```javascript
model: "llama2",  // or whichever model works
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Serve Production Build
```bash
npm run production
```

## Configuration

### Business Profile
1. Go to "Setup Business Profile"
2. Add your company info and logo
3. Set default markup and labor rates
4. Configure service ZIP code

### Custom Pricing
- Clients can now input exact material costs
- Labor hours are client-specified
- No more restrictive dropdown menus

### AI Prompts
Edit `src/core/streamAlpha.js` to customize AI prompts and calculations.

## Support

### Log Files
Check browser console (F12) for detailed error messages.

### Service Health
- Main app: Check service status indicator (top-right)
- Scraper: http://localhost:5050/health
- AI: http://localhost:11434/api/tags

### Reset Data
```bash
# Clear browser data:
# Chrome: F12 > Application > Local Storage > Clear
# Or clear manually in the app settings
```

---

**AlphaQuote** - Professional Construction Estimation Software  
*Now with 100% client-fillable forms and advanced AI*

