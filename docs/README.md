# 🧮 AlphaQuote - Professional Construction Estimation Software

**Estimate smarter. Lead the pack.**

AlphaQuote is a comprehensive, business-ready construction estimation software designed for contractors, remodelers, and construction professionals. Featuring AI-powered estimates, real-time material pricing, receipt-based pricing intelligence, OCR receipt processing, and professional PDF generation.

![AlphaQuote Features](https://img.shields.io/badge/Features-Complete-brightgreen) ![Database](https://img.shields.io/badge/Database-Prisma%20SQLite-blue) ![AI](https://img.shields.io/badge/AI-Ollama%20GPT--OSS-orange) ![Pricing](https://img.shields.io/badge/Pricing-SerpAPI-yellow) ![OCR](https://img.shields.io/badge/OCR-Tesseract.js-green)

## 🚀 Quick Start

### One-Command Startup
```bash
npm install
npm run db:seed
npm start
```

### Full Service Startup (Recommended)
```bash
# Terminal 1: Start React application
npm start

# Terminal 2: Start API server
npm run api

# Terminal 3: Start price scraper
npm run scraper

# Terminal 4: Start AI service
ollama serve

# Terminal 5: View database (optional)
npx prisma studio
```

### Service URLs
- **Main App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Price Scraper**: http://localhost:5050
- **AI Service**: http://localhost:11434
- **Database Studio**: http://localhost:5555

## 🎯 Core Features

### ✅ **Professional Estimation**
- **100% Client-Fillable Forms** - No restrictive dropdowns
- **Multi-Room Project Support** - Handle complex estimates
- **Real-Time Calculations** - Live cost updates as you type
- **Professional PDF Generation** - Branded, client-ready documents
- **Business Profile Management** - Company branding and settings

### 🤖 **AI-Powered Intelligence**
- **Voice Input Support** - Natural speech recognition
- **AI-Generated Estimates** - Using gpt-oss:latest model
- **Streaming Responses** - Real-time AI estimate generation
- **AI PDF Export** - Convert AI estimates to professional PDFs
- **Context Learning** - Remembers past projects for better estimates

### 💰 **Advanced Pricing Intelligence**
- **SerpAPI Integration** - Real-time pricing from Google Shopping
- **Receipt Upload System** - Build local pricing database with OCR
- **Vendor Price Analytics** - Compare suppliers and track trends
- **Smart Price Suggestions** - AI-powered pricing recommendations
- **Multi-Store Comparison** - Home Depot, Lowe's, Menards, etc.

### 🧾 **Receipt Management System**
- **OCR Processing** - Tesseract.js powered text extraction
- **Smart Parsing** - Automatic vendor, date, and item extraction
- **Receipt Browsing** - Search, filter, and manage all receipts
- **Project Assignment** - Link receipts to specific projects
- **Vendor Intelligence** - Build pricing database from receipts

### 🗄️ **Professional Database**
- **Prisma ORM** - Type-safe database operations
- **SQLite Database** - Local, fast, reliable storage
- **Receipt Intelligence** - OCR processing and price extraction
- **Vendor Management** - Track supplier relationships
- **Project Tracking** - Complete workflow management

## 📊 Business Benefits

### **Time Savings**
- **90% faster estimates** compared to manual methods
- **Automated calculations** prevent costly errors
- **Voice input** eliminates typing
- **Template reuse** for similar projects

### **Competitive Advantage**
- **Real-time pricing** ensures accuracy
- **Local pricing intelligence** from receipts
- **AI insights** improve estimate quality
- **Professional presentation** wins more bids

### **Client Experience**
- **Transparent pricing** builds trust
- **Professional documents** enhance credibility
- **Quick turnaround** speeds project starts
- **Mobile-responsive** works on any device

## 🛠 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **NPM** (comes with Node.js)
- **Ollama** (optional, for AI features)

### Installation Steps
```bash
# 1. Clone or download AlphaQuote
git clone [repository-url]
cd AlphaQuote

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma migrate dev
npm run db:seed

# 4. Start application
npm start
```

### Optional: AI & Pricing Setup
```bash
# Install Ollama AI
# Windows: Download from https://ollama.ai/download/windows
# Mac: Download from https://ollama.ai/download/mac
# Linux: curl https://ollama.ai/install.sh | sh

# Install AI model
ollama pull gpt-oss:latest

# Get SerpAPI key (free tier available)
# Visit: https://serpapi.com/
# Set in server/scraper.js or environment variable
```

## 📋 Available Scripts

### Development
```bash
npm start           # Start React application (port 3000)
npm run api         # Start Express API server (port 3001)
npm run scraper     # Start price scraper service (port 5050)
npm run verify      # Check all service status
npm run dev         # Start app and scraper together
```

### Database Management
```bash
npm run db:seed     # Load demo data
npm run db:reset    # Reset and reseed database
npx prisma studio   # Visual database editor
npx prisma migrate dev --name [name]  # Create migration
```

### Production
```bash
npm run build       # Build for production
npm run production  # Serve production build
```

## 🎯 Service Architecture

### Core Services
1. **React Frontend** (Port 3000): Main user interface
2. **Express API Server** (Port 3001): Backend API with CRUD operations
3. **Price Scraper** (Port 5050): SerpAPI integration for real-time pricing
4. **Ollama AI** (Port 11434): Local AI processing for estimates
5. **Prisma Studio** (Port 5555): Database management interface

### Database Schema
- **LocalVendor**: Supplier information and statistics
- **LocalVendorPrice**: Material pricing from receipts
- **Receipt**: Uploaded receipt data with OCR processing and project assignment
- **ReceiptItem**: Individual line items from parsed receipts
- **Task**: Project tasks with vendor associations
- **Project**: Client projects and estimates with receipt tracking

## 🎨 Demo & Testing

### Quick Demo
1. **Load Business Profile**: Setup → "🏢 Load Demo Business Profile"
2. **Load Estimate Data**: Estimate → "📝 Load Demo Data"
3. **Test AI Assistant**: AI → "📝 Load Demo AI Estimate"
4. **Test Receipt Upload**: Receipts → "New Receipt" → Upload receipt image
5. **Test Receipt Management**: Browse, edit, and assign receipts to projects
6. **Generate PDFs**: Professional documents from all features

### Sample Data Included
- **Complete kitchen & bathroom renovation** ($19,316.60)
- **Multiple vendor receipts** with OCR processing
- **AI estimate examples** with professional formatting
- **Business profile** with branding and settings
- **Project examples** with receipt assignments

## 🔧 Configuration

### Business Setup
- **Company Information**: Name, logo, contact details
- **Default Settings**: Markup percentages, labor rates
- **Service Area**: ZIP code for local pricing
- **Vendor Preferences**: Preferred suppliers

### API Configuration
- **SerpAPI**: Real-time pricing (100 free searches/month)
- **Ollama AI**: Local AI processing (free)
- **Prisma**: Database management (local SQLite)

## 🚨 Troubleshooting

### Common Issues
```bash
# Services won't start
npm run verify

# Database issues
npm run db:reset

# AI not working
ollama serve
ollama pull gpt-oss:latest

# Price scraping issues
# Check SerpAPI key in server/scraper.js
```

### Service URLs
- **Main App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Price Scraper Health**: http://localhost:5050/health
- **Database Studio**: http://localhost:5555
- **AI Service**: http://localhost:11434

## 💼 Business Value

### ROI Analysis
- **Setup Cost**: $0 (free tier available for all services)
- **Monthly Cost**: $0-50 (based on SerpAPI usage)
- **Time Savings**: 2-3 hours per estimate
- **Accuracy Improvement**: 95%+ vs manual methods
- **Break-Even**: 1-2 projects per month

### Competitive Advantages
- **Real local pricing** from receipt intelligence
- **AI-powered efficiency** with professional output
- **Multi-source pricing** (web scraping + receipts + AI)
- **Professional presentation** enhances business image

## 📞 Support & Development

### Key Files
- `src/EstimateForm.js`: Main estimation logic
- `src/AlphaBot.jsx`: AI assistant with voice input
- `src/pages/ReceiptNew.jsx`: Receipt upload with OCR processing
- `src/pages/Receipts.jsx`: Receipt management and browsing
- `src/utils/receiptParserEnhanced.js`: Advanced receipt parsing
- `server/api.js`: Express API server with CRUD operations
- `server/scraper.js`: SerpAPI price scraping
- `prisma/schema.prisma`: Database schema

### Contributing
This is a complete, production-ready solution. For customization:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Document modifications

---

**AlphaQuote** - Professional Construction Estimation Software  
*Estimate smarter. Lead the pack.*

🔗 **Features**: AI Estimation | OCR Receipt Processing | Real-Time Pricing | Project Management | Professional PDFs  
🎯 **Target**: Contractors, Remodelers, Construction Professionals  
🚀 **Status**: Production Ready