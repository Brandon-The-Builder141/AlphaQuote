# Contributing to AlphaQuote

Thank you for your interest in contributing to AlphaQuote! 🚀 This guide will help you get started with contributing to our AI-powered construction estimation platform.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Code Style Guidelines](#code-style-guidelines)
- [Submitting Issues](#submitting-issues)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Questions or Need Help?](#questions-or-need-help)

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful, constructive, and collaborative in all interactions.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Python** (v3.8+ for AI models)
- **Ollama** (for local AI models)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AlphaQuote.git
   cd AlphaQuote
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/AlphaQuote.git
   ```

## 🛠️ Development Environment

### Quick Setup

1. **Install Dependencies**
   ```bash
   # Frontend dependencies
   cd frontend
   npm install
   
   # Backend dependencies (if applicable)
   cd ../backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # Add API keys, database URLs, etc.
   ```

3. **Start Development Servers**
   ```bash
   # Start frontend (React)
   cd frontend
   npm start
   
   # Start backend API (separate terminal)
   cd backend
   npm run dev
   
   # Start AI services (separate terminal)
   # Ensure Ollama is running with Mistral model
   ollama serve
   ```

4. **Verify Setup**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:11434

### Project Structure

```
AlphaQuote/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
│   └── package.json
├── backend/            # Node.js API server
│   ├── api.js         # API routes
│   ├── scraper.js     # Web scraping services
│   └── package.json
├── ai-models/          # AI estimation logic
│   ├── core/          # Core AI engines
│   └── utils/         # AI utilities
└── docs/              # Documentation
```

## 📝 Code Style Guidelines

### JavaScript/TypeScript (ESLint)

We use ESLint with the following configuration:

```bash
# Install ESLint dependencies
cd frontend
npm install --save-dev eslint eslint-plugin-unused-imports eslint-plugin-jsx-a11y

# Run linting
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Key Rules:**
- Use **2 spaces** for indentation
- Use **single quotes** for strings
- **No console.log** in production code (use console.warn/error for debugging)
- **No unused imports** or variables
- **Semicolons required**
- **Max line length: 120 characters**

### React Components

```jsx
// ✅ Good
import React, { useState, useEffect } from 'react';

/**
 * Example component with proper JSDoc
 * @param {Object} props - Component props
 * @param {string} props.title - Component title
 * @returns {JSX.Element} Rendered component
 */
const ExampleComponent = ({ title }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Component logic here
  }, []);

  return (
    <div className="example-component">
      <h1>{title}</h1>
    </div>
  );
};

export default ExampleComponent;
```

### AI Models Documentation

All AI functions must include comprehensive JSDoc:

```javascript
/**
 * Calculates material costs with AI-enhanced pricing
 * @param {Object} params - Calculation parameters
 * @param {string} params.roomType - Room type
 * @param {number} params.squareFootage - Project size
 * @returns {Object} Cost breakdown
 * @example
 * const costs = calculateMaterialCosts({
 *   roomType: 'Kitchen',
 *   squareFootage: 200
 * });
 */
export function calculateMaterialCosts(params) {
  // Implementation here
}
```

## 🐛 Submitting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Test with the latest version**

### Issue Templates

#### Bug Report
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js: [e.g., v16.14.0]

**Screenshots**
If applicable, add screenshots.
```

#### Feature Request
```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why would this feature be useful?

**Proposed Solution**
How should this work?

**Alternatives**
Any alternative solutions considered?
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 🔄 Pull Request Process

### Before Submitting

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style guidelines

3. **Test your changes**:
   ```bash
   # Run linting
   npm run lint
   
   # Run tests (when available)
   npm test
   
   # Test manually in browser
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Add new estimation feature"
   ```

### Commit Message Format

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Pull Request Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Linting passes
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked appropriately)
```

### Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainers
3. **Approval** from at least one maintainer
4. **Merge** by maintainers only

## 🧪 Testing

### Current Testing Status

We're working on implementing comprehensive tests. Currently, we have:

- **Manual testing** - Test features in browser
- **Linting** - Code style validation
- **Type checking** - TypeScript validation (when applicable)

### Planned Testing Framework

```bash
# Future test commands (placeholder)
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Coverage report
```

### Manual Testing Checklist

Before submitting PRs, test:

- [ ] **Estimation Flow** - Create estimates with different room types
- [ ] **AI Assistant** - Voice input and streaming responses
- [ ] **PDF Export** - Generate and download PDF estimates
- [ ] **Profile Setup** - Complete setup wizard
- [ ] **Receipt Processing** - Upload and process receipts
- [ ] **Vendor Management** - Add and manage vendors
- [ ] **Responsive Design** - Test on different screen sizes

## 📚 Documentation

### Code Documentation

- **JSDoc comments** required for all functions
- **README updates** for new features
- **API documentation** for backend changes
- **Inline comments** for complex logic

### Documentation Updates

When adding new features:
1. Update relevant README files
2. Add JSDoc to new functions
3. Update API documentation
4. Add examples and usage instructions

## ❓ Questions or Need Help?

### Getting Help

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord/Slack** - Real-time chat (if available)
- **Email** - contact@alphaquote.com

### Resources

- **Project Documentation** - `/docs` directory
- **API Reference** - `/docs/api.md`
- **Setup Guide** - `SETUP.md`
- **Main README** - `README.md`

### Contributing to Documentation

Documentation improvements are always welcome! Look for:
- Typos and grammar errors
- Missing information
- Outdated instructions
- Better examples

## 🎉 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to AlphaQuote! Together, we're building the future of construction estimation. 🏗️✨

---

**Happy Coding!** 🚀

For any questions about contributing, feel free to open an issue or reach out to the maintainers.
