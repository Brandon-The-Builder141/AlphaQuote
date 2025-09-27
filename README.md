# 🏗️ AlphaQuote

> **AI-Powered Construction Estimation Platform**

AlphaQuote is a modern, intelligent estimation tool designed specifically for contractors and construction professionals. Built with React and powered by AI, it streamlines the quoting process and helps you win more projects with accurate, professional estimates.

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [API Keys & Environment Setup](#-api-keys--environment-setup)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🚀 **Core Functionality**
- **⚡ Fast Quote Generation** - Generate professional estimates in minutes, not hours
- **🏢 Company Profiles** - Maintain detailed business profiles with custom branding
- **📊 Smart Pricing** - AI-powered material and labor cost suggestions
- **📱 Modern UI** - Sleek, responsive interface that works on all devices
- **📄 PDF Export** - Professional quote documents ready for clients

### 🤖 **AI-Powered Features** *(Coming Soon)*
- **📸 Image Processing** - Upload photos and automatically extract measurements
- **📋 Form Recognition** - AI-powered receipt and document parsing
- **🎯 Smart Recommendations** - Intelligent suggestions based on project history
- **📈 Market Analysis** - Real-time pricing data and trend analysis

### 📦 **Modules**
- **Estimation Engine** - Core quoting functionality
- **Vendor Management** - Track suppliers and pricing
- **Receipt Processing** - OCR-powered receipt management
- **AI Assistant** - Intelligent project guidance

---

## 📸 Screenshots

> *Screenshots and demo GIFs will be added here*

### Dashboard
![Dashboard Preview](./docs/screenshots/dashboard.png)
*Main dashboard with project overview and quick actions*

### Quote Generation
![Quote Generator](./docs/screenshots/quote-generator.png)
*Intuitive quote creation with real-time calculations*

### Company Profile
![Company Profile](./docs/screenshots/company-profile.png)
*Professional company setup with custom branding*

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/alphaquote.git
   cd alphaquote
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies (if applicable)
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Initialize the database**
   ```bash
   cd backend
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm start          # Frontend (port 3000)
   npm run api        # Backend API (port 3001)
   npm run scraper    # Price scraper service
   ```

---

## 💻 Usage

### Generate a Quote
```bash
# Start the application
npm run start

# Navigate to http://localhost:3000
# Click "Start New Estimate"
# Fill in project details
# Generate professional PDF quote
```

### Company Setup
```bash
# Run the setup wizard
npm run setup

# Configure your company profile
# Set up vendor relationships
# Customize branding and templates
```

### Receipt Processing
```bash
# Upload receipt images
# AI automatically extracts data
# Review and confirm details
# Add to project tracking
```

---

## 🏗️ Project Structure

```
alphaquote/
├── 📁 frontend/           # React application
│   ├── 📁 src/
│   │   ├── 📁 components/ # Reusable UI components
│   │   ├── 📁 pages/      # Application pages
│   │   ├── 📁 services/   # API and business logic
│   │   └── 📁 utils/      # Helper functions
│   ├── 📁 public/         # Static assets
│   └── 📄 package.json    # Frontend dependencies
├── 📁 backend/            # Node.js API server
│   ├── 📁 server/         # API routes and services
│   ├── 📁 prisma/         # Database schema and migrations
│   └── 📄 package.json    # Backend dependencies
├── 📁 ai-models/          # AI and ML components
│   ├── 📁 core/           # Core AI functionality
│   └── 📄 AlphaBot.jsx    # AI assistant component
├── 📁 docs/               # Documentation
└── 📄 README.md           # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **⚛️ React 18** - Modern UI framework
- **🎨 Tailwind CSS** - Utility-first styling
- **🎭 Framer Motion** - Smooth animations
- **🔄 React Router** - Client-side routing
- **📝 React Hook Form** - Form management
- **✅ Zod** - Schema validation

### Backend
- **🚀 Node.js** - JavaScript runtime
- **⚡ Express.js** - Web framework
- **🗄️ Prisma** - Database ORM
- **📧 Nodemailer** - Email service
- **🔍 Tesseract.js** - OCR processing

### AI & ML
- **🤖 Mistral/LLaMA** - Local language models
- **👁️ Computer Vision** - Image processing
- **📊 Data Analytics** - Pricing intelligence

### Tools & Services
- **📦 npm** - Package management
- **🔧 ESLint** - Code linting
- **💾 SQLite** - Development database
- **📄 jsPDF** - PDF generation

---

## 🔑 API Keys & Environment Setup

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# API Keys (Optional)
SERPAPI_KEY="REMOVED_APPLICATION_SECRET"
OPENAI_API_KEY="your-openai-key"

# Application Settings
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Setting Up API Keys

1. **SerpAPI** (for price scraping)
   - Visit [SerpAPI](https://serpapi.com/)
   - Create account and get API key
   - Add to `.env` file

2. **Email Service** (for sending quotes)
   - Configure SMTP settings
   - Use app-specific passwords for Gmail

---

## 🧪 Development

### Available Scripts

```bash
# Frontend Development
npm start              # Start development server
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # Lint code
npm run lint:fix       # Fix linting issues

# Backend Development
npm run api            # Start API server
npm run scraper        # Start price scraper
npm run db:seed        # Seed database
npm run db:reset       # Reset database

# Full Stack
npm run dev            # Start all services
npm run production     # Production build and serve
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Type checking (if using TypeScript)
npm run type-check

# Testing
npm test
npm run test:coverage
```

---

## 🤝 Contributing

We welcome contributions to AlphaQuote! Here's how you can help:

### 🐛 Bug Reports
1. Check existing issues first
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos
   - Environment details

### 💡 Feature Requests
1. Open an issue with `enhancement` label
2. Describe the feature and use case
3. Consider implementation approach
4. Wait for community feedback

### 🔧 Pull Requests
1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation
4. **Commit changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open Pull Request**

### 📋 Development Guidelines

- **Code Style**: Follow ESLint configuration
- **Commits**: Use conventional commit messages
- **Testing**: Write tests for new features
- **Documentation**: Update README for user-facing changes
- **Performance**: Consider bundle size and runtime performance

### 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first approach
- **Prisma** - For the excellent database toolkit
- **Community Contributors** - For all the feedback and contributions

---

## 📞 Support

- **📧 Email**: support@alphaquote.com
- **💬 Discord**: [Join our community](https://discord.gg/alphaquote)
- **🐦 Twitter**: [@AlphaQuoteApp](https://twitter.com/AlphaQuoteApp)
- **📖 Documentation**: [docs.alphaquote.com](https://docs.alphaquote.com)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the construction industry

[🏠 Homepage](https://alphaquote.com) • [📖 Documentation](https://docs.alphaquote.com) • [🐛 Report Bug](https://github.com/yourusername/alphaquote/issues)

</div>
