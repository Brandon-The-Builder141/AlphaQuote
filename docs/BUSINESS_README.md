# 🧮 AlphaQuote - Professional Construction Estimation Software

**Estimate smarter. Lead the pack.**

AlphaQuote is a comprehensive, business-ready construction estimation software designed for contractors, remodelers, and construction professionals. Featuring AI-powered estimates, real-time material pricing via SerpAPI, OCR receipt processing with Tesseract.js, receipt-based pricing intelligence with Prisma database, and professional PDF generation.

## 🆕 **Latest Features (v2.0)**
- **OCR Receipt Processing** - Tesseract.js powered text extraction and parsing
- **Receipt Management System** - Upload, browse, search, and assign receipts to projects
- **Prisma Database Integration** - Professional-grade data management  
- **SerpAPI Real-Time Pricing** - Live Google Shopping price data
- **AI PDF Export** - Convert AI estimates to professional documents
- **Enhanced Client Forms** - 100% fillable with no restrictive dropdowns
- **Project Budget Tracking** - Link receipts to projects for cost management

## 🚀 Quick Start (Business Ready)

### Option 1: One-Command Startup
```bash
npm run start-all
```
This automatically starts all services and opens your browser to the application.

### Option 2: Manual Service Management
```bash
# Terminal 1: Start price scraper
npm run scraper

# Terminal 2: Start React application
npm start

# Terminal 3 (Optional): Start AI service
ollama serve
```

## 📋 Business Features

### ✅ Core Functionality
- **Smart Estimates**: Room-specific material recommendations with accurate pricing
- **Multi-Room Projects**: Handle complex projects with multiple rooms/areas
- **Professional PDFs**: Branded, client-ready estimates with detailed breakdowns
- **Business Profiles**: Company branding, contact info, and default settings
- **Real-Time Pricing**: Live material prices via SerpAPI from Google Shopping
- **Receipt Intelligence**: Upload receipts to build local pricing database
- **Vendor Analytics**: Track supplier performance and pricing trends

### 🤖 AI-Powered Features
- **Voice Input**: Describe projects using natural speech
- **Smart Estimates**: AI generates professional estimates from project descriptions
- **AI PDF Export**: Convert AI estimates to professional branded PDFs
- **Learning Memory**: Remembers past projects for better future estimates
- **Fallback Mode**: Works even when AI services are unavailable

### 💼 Business-Ready Elements
- **Service Status Monitoring**: Real-time status of all services
- **Error Handling**: Graceful fallbacks when services are unavailable
- **Professional UI**: Clean, modern interface suitable for client presentations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Data Persistence**: Saves profiles and estimate history locally

## 🛠 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **NPM** (comes with Node.js)
- **Ollama** (optional, for AI features)

### Installation Steps

1. **Clone or Download** the AlphaQuote project
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Application**:
   ```bash
   npm run start-all
   ```

The startup script will automatically:
- Install any missing dependencies
- Start the price scraper service
- Attempt to start Ollama AI (optional)
- Launch the React application
- Open your browser to the application

## 🎯 Business Setup Guide

### 1. Configure Your Business Profile
- Navigate to "Setup Business Profile" on the home page
- Add your business name, logo, and contact information
- Set default markup percentages and labor rates
- Configure your service area ZIP code

### 2. Service Configuration
- **Price Scraper**: Automatically started, provides real-time material pricing
- **AI Assistant**: Optional but recommended for advanced features
- **Service Status**: Monitor in the top-right corner of the application

### 3. Creating Professional Estimates
- Use "Start New Estimate" for standard room-by-room estimates
- Use "AI Assistant" for voice-powered, intelligent estimates
- Generate PDF reports with your business branding
- Save estimate history for future reference

## 📊 Service Architecture

### Core Services
1. **React Frontend** (Port 3000): Main user interface
2. **Express API Server** (Port 3001): Backend API with CRUD operations
3. **Price Scraper** (Port 5050): Real-time material pricing
4. **Ollama AI** (Port 11434): AI-powered estimates (optional)
5. **Prisma Studio** (Port 5555): Database management interface

### Service Status
The application includes real-time service monitoring:
- 🟢 Green: All services running
- 🟡 Yellow: Some services offline (fallback mode active)
- 🔴 Red: Critical services unavailable

## 💡 Usage Tips

### For Maximum Accuracy
1. **Set up your business profile** with local labor rates
2. **Use specific room names** (Kitchen, Bathroom, etc.) for better material recommendations
3. **Verify AI estimates** with your local knowledge and pricing
4. **Update ZIP code** in profile for accurate local pricing

### For Professional Presentations
1. **Upload your business logo** in the profile setup
2. **Use the PDF export** for client presentations
3. **Review estimates** before sending to clients
4. **Keep service status** indicators in mind when making promises

## 🔧 Troubleshooting

### Common Issues

**Services Won't Start**
- Ensure ports 3000, 5050, and 11434 are available
- Check that Node.js is properly installed
- Try `npm install` to reinstall dependencies

**AI Features Not Working**
- Install Ollama: `curl https://ollama.ai/install.sh | sh`
- Install Mistral model: `ollama pull mistral`
- The app will work in fallback mode without AI

**Price Scraping Issues**
- Price scraper may be blocked by some retailers
- Fallback pricing will be used automatically
- Check service status indicator for real-time monitoring

### Service Commands
```bash
# Check service health
curl http://localhost:5050/health

# Check available scraper sites
curl http://localhost:5050/sites

# Test Ollama
curl http://localhost:11434/api/tags
```

## 📈 Business Benefits

### Time Savings
- **Automated Calculations**: No more manual math or spreadsheets
- **Template Estimates**: Reuse successful estimate patterns
- **Voice Input**: Describe projects naturally, get instant estimates

### Professional Image
- **Branded PDFs**: Professional-looking estimates with your logo
- **Consistent Pricing**: Standardized markup and labor rates
- **Quick Turnaround**: Generate estimates in minutes, not hours

### Competitive Advantage
- **Real-Time Pricing**: Always use current material costs
- **AI Insights**: Leverage technology for better estimates
- **Comprehensive Records**: Track all estimates and learn from patterns

## 🔒 Data & Privacy

- **Local Storage**: All data stored locally on your computer
- **No Cloud Dependency**: Works entirely offline (except for price scraping)
- **Business Data Security**: Your client and business information stays private
- **Export Capability**: PDF exports for easy sharing and archival

## 📞 Support & Customization

This software is designed to be business-ready out of the box. For customization needs or business-specific features, the codebase is well-documented and modular.

### Key Files for Customization
- `src/EstimateForm.js`: Main estimation logic and material pricing
- `src/core/streamAlpha.js`: AI estimation algorithms
- `src/pages/ReceiptNew.jsx`: Receipt upload with OCR processing
- `src/pages/Receipts.jsx`: Receipt management and browsing
- `src/utils/receiptParserEnhanced.js`: Advanced receipt parsing
- `server/api.js`: Express API server with CRUD operations
- `server/scraper.js`: Price scraping configuration
- `src/index.css`: Styling and branding

---

**AlphaQuote** - Professional Construction Estimation Software  
*Estimate smarter. Lead the pack.*

