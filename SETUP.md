# 🚀 AlphaQuote Setup Guide

> **Complete setup instructions for AlphaQuote - from zero to running application**

This guide will walk you through setting up AlphaQuote on your local machine, step by step. No prior experience required!

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Troubleshooting](#-troubleshooting)
- [Next Steps](#-next-steps)

---

## 🛠️ Prerequisites

Before you begin, make sure you have these installed on your computer:

### Required Software

| Software | Version | Download Link | Purpose |
|----------|---------|---------------|---------|
| **Node.js** | v16.0+ | [nodejs.org](https://nodejs.org/) | JavaScript runtime for the frontend |
| **npm** | v8.0+ | *Included with Node.js* | Package manager |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | Version control |
| **Python** | v3.8+ | [python.org](https://python.org/) | For AI models (optional) |

### Optional Software

| Software | Purpose | When to Install |
|----------|---------|----------------|
| **VS Code** | Code editor | Recommended for development |
| **Postman** | API testing | For backend development |
| **SQLite Browser** | Database management | For debugging database issues |

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Required for downloading packages and AI models

---

## ⚡ Quick Start

If you're in a hurry, here's the fastest way to get AlphaQuote running:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/alphaquote.git
cd alphaquote

# 2. Install dependencies
cd frontend
npm install

# 3. Start the application
npm start
```

That's it! Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Detailed Setup

### Step 1: Install Prerequisites

#### Install Node.js and npm

**Windows:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" version (recommended)
3. Run the installer and follow the prompts
4. Restart your command prompt

**macOS:**
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

#### Install Git

**Windows:**
1. Download from [git-scm.com](https://git-scm.com/)
2. Run installer with default settings
3. Restart command prompt

**macOS:**
```bash
# Using Homebrew
brew install git

# Git comes pre-installed on most Macs
```

**Linux:**
```bash
sudo apt install git
```

### Step 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/alphaquote.git

# Navigate to the project directory
cd alphaquote

# Verify you're in the right place
ls -la
# You should see: frontend/, backend/, docs/, etc.
```

### Step 3: Install Dependencies

#### Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install

# This will install packages like:
# - react (UI framework)
# - tailwindcss (styling)
# - framer-motion (animations)
# - And many more...
```

**What this does:**
- Downloads all required JavaScript packages
- Creates a `node_modules/` folder
- Updates `package-lock.json` with exact versions

#### Backend Dependencies (Optional)

```bash
# Navigate to backend directory
cd ../backend

# Install backend dependencies
npm install

# This installs:
# - express (web server)
# - prisma (database toolkit)
# - nodemailer (email service)
```

#### AI Models Dependencies (Optional)

```bash
# Navigate to ai-models directory
cd ../ai-models

# Install Python dependencies (if requirements.txt exists)
pip install -r requirements.txt

# Or install individual packages:
pip install torch transformers
```

### Step 4: Environment Configuration

#### Create Environment File

```bash
# Navigate back to project root
cd ..

# Copy the environment template
cp .env.example .env

# Edit the environment file
# On Windows: notepad .env
# On macOS/Linux: nano .env
```

#### Environment Variables Template

Create a `.env` file in the project root with these variables:

```env
# ===========================================
# AlphaQuote Environment Configuration
# ===========================================

# Application Settings
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="file:./backend/prisma/dev.db"

# Email Configuration (for sending quotes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AlphaQuote <noreply@alphaquote.com>

# API Keys (Optional - for enhanced features)
OPENAI_API_KEY=sk-your-openai-key-here
SERPAPI_KEY=your-serpapi-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# AI Model Settings
AI_MODEL_PROVIDER=mistral
AI_MODEL_NAME=mistral-7b
AI_MODEL_PATH=./ai-models/models/

# Feature Flags
ENABLE_AI_ASSISTANT=true
ENABLE_RECEIPT_OCR=true
ENABLE_PRICE_SCRAPING=false

# Development Settings
DEBUG=true
LOG_LEVEL=info
```

#### Setting Up API Keys (Optional)

**OpenAI API Key (for AI features):**
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new secret key
5. Copy the key to your `.env` file

**SerpAPI Key (for price scraping):**
1. Visit [serpapi.com](https://serpapi.com/)
2. Create a free account
3. Get your API key from the dashboard
4. Add to your `.env` file

**Gmail App Password (for email):**
1. Enable 2-factor authentication on Gmail
2. Go to Google Account settings
3. Security → App passwords
4. Generate a new app password
5. Use this password in your `.env` file

### Step 5: Database Setup

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed

# Verify database setup
npx prisma studio
# This opens a web interface to view your database
```

---

## 🏃‍♂️ Running the Application

### Option 1: Development Mode (Recommended)

```bash
# From the project root
npm run dev

# This starts:
# - Frontend on http://localhost:3000
# - Backend API on http://localhost:3001
# - Price scraper service
```

### Option 2: Start Services Individually

#### Frontend Only
```bash
cd frontend
npm start

# Opens http://localhost:3000
# Hot reload enabled - changes update automatically
```

#### Backend Only
```bash
cd backend
npm run api

# Starts API server on http://localhost:3001
# API endpoints available at /api/*
```

#### Price Scraper Service
```bash
cd backend
npm run scraper

# Starts background price scraping service
```

### Option 3: Production Build

```bash
# Build the frontend for production
cd frontend
npm run build

# Start production server
npm run production

# Serves optimized build on http://localhost:3000
```

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### "npm install" fails

**Problem**: Permission errors or network issues
```bash
# Solution 1: Clear npm cache
npm cache clean --force

# Solution 2: Use different registry
npm install --registry https://registry.npmjs.org/

# Solution 3: Delete node_modules and retry
rm -rf node_modules package-lock.json
npm install
```

#### "Port 3000 already in use"

**Problem**: Another application is using port 3000
```bash
# Solution 1: Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Solution 2: Use different port
PORT=3001 npm start
```

#### Database connection errors

**Problem**: Prisma can't connect to database
```bash
# Solution 1: Reset database
cd backend
npx prisma migrate reset --force

# Solution 2: Regenerate Prisma client
npx prisma generate

# Solution 3: Check database file permissions
ls -la prisma/dev.db
```

#### "Module not found" errors

**Problem**: Missing dependencies or import issues
```bash
# Solution 1: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

# Solution 2: Check import paths
# Make sure imports match the new project structure
```

#### Environment variables not loading

**Problem**: .env file not being read
```bash
# Solution 1: Check file location
# .env should be in project root, not frontend/ or backend/

# Solution 2: Verify file format
# No spaces around = signs
# No quotes unless needed
DATABASE_URL="file:./backend/prisma/dev.db"

# Solution 3: Restart development server
# Environment variables are loaded at startup
```

### Getting Help

If you're still having issues:

1. **Check the logs**:
   ```bash
   # Frontend logs
   npm start

   # Backend logs
   cd backend && npm run api
   ```

2. **Verify your setup**:
   ```bash
   # Check Node.js version
   node --version

   # Check npm version
   npm --version

   # Check if dependencies are installed
   ls node_modules/
   ```

3. **Ask for help**:
   - Create an issue on GitHub
   - Join our Discord community
   - Check the documentation

---

## ✅ Next Steps

Once AlphaQuote is running successfully:

### 1. Explore the Application
- Visit [http://localhost:3000](http://localhost:3000)
- Try creating a new estimate
- Set up your company profile
- Test the receipt upload feature

### 2. Customize Your Setup
- Modify the `.env` file for your needs
- Add your own API keys
- Configure email settings
- Set up custom branding

### 3. Development Workflow
```bash
# Make changes to the code
# Save files (hot reload will update automatically)

# Run tests
npm test

# Check code quality
npm run lint

# Build for production
npm run build
```

### 4. Learn More
- Read the [README.md](./README.md) for project overview
- Check [docs/](./docs/) for detailed documentation
- Explore the code structure in `src/` directories

---

## 🎉 Congratulations!

You've successfully set up AlphaQuote! The application should now be running at [http://localhost:3000](http://localhost:3000).

**What's next?**
- Create your first estimate
- Set up your company profile
- Explore the AI features
- Start building your construction business!

---

## 📞 Need Help?

- **🐛 Found a bug?** [Create an issue](https://github.com/yourusername/alphaquote/issues)
- **💡 Have a suggestion?** [Start a discussion](https://github.com/yourusername/alphaquote/discussions)
- **❓ Need support?** [Join our Discord](https://discord.gg/alphaquote)
- **📧 Email us**: support@alphaquote.com

---

*Happy estimating! 🏗️*
