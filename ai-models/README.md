# AlphaQuote AI Models

This directory contains all AI-powered estimation logic for AlphaQuote, including advanced material/labor cost calculations, pricing intelligence, and natural language processing for project analysis.

## 📁 Directory Structure

```
ai-models/
├── core/                    # Core AI estimation engines
│   ├── alphaMemory.js       # Memory management for AI context
│   ├── askAlpha.js         # Non-streaming AI estimation
│   ├── streamAlpha.js      # Streaming AI estimation with real-time updates
│   ├── estimationEngine.js # Advanced cost calculation functions
│   └── pricingIntelligence.js # AI-powered pricing analysis
├── utils/                   # AI utility functions
│   └── aiEstimationUtils.js # Project analysis and validation utilities
├── AlphaBot.jsx            # Main AI Assistant React component
├── index.js                # Main export file with comprehensive functions
└── README.md               # This documentation
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { generateCompleteEstimate } from './ai-models';

// Generate a complete AI estimate
const result = await generateCompleteEstimate({
  transcript: "Kitchen renovation with custom cabinets and granite countertops",
  formData: {
    roomType: "Kitchen",
    squareFootage: 200,
    notes: "High-end renovation with smart home features"
  },
  profile: {
    businessName: "ABC Construction",
    laborRate: 75,
    markup: 15,
    zipCode: "90210"
  }
});

console.log('Estimate:', result.estimate);
console.log('Total Cost:', result.costs.totalCost);
```

### Streaming Estimation

```javascript
import { streamAlpha } from './ai-models/core/streamAlpha';

const estimate = await streamAlpha({
  transcript: "Bathroom remodel with tile flooring",
  formData: { roomType: "Bathroom", squareFootage: 100 },
  profile: { businessName: "My Company", laborRate: 65, markup: 12 },
  onUpdate: (partialResult) => {
    console.log('Streaming estimate:', partialResult);
    // Update UI with partial results
  }
});
```

## 🧠 Core AI Functions

### 1. Project Analysis (`aiEstimationUtils.js`)

Analyzes voice transcripts and project descriptions to extract key information:

```javascript
import { analyzeProjectTranscript } from './ai-models';

const analysis = analyzeProjectTranscript(
  "I need to renovate my kitchen with new cabinets and granite countertops, about 200 square feet"
);

console.log(analysis);
// Output:
// {
//   projectType: 'kitchen',
//   materials: ['cabinets', 'countertops'],
//   features: [],
//   scope: 'renovation',
//   measurements: { squareFootage: 200 }
// }
```

### 2. Material Cost Calculations (`estimationEngine.js`)

Advanced material cost calculations with regional pricing:

```javascript
import { calculateMaterialCosts } from './ai-models';

const materialCosts = calculateMaterialCosts({
  roomType: 'Kitchen',
  squareFootage: 200,
  materialQuality: 'premium',
  zipCode: '90210'
});

console.log(`Total materials: $${materialCosts.totalCost}`);
```

### 3. Labor Cost Calculations (`estimationEngine.js`)

Intelligent labor cost estimation based on complexity and specialties:

```javascript
import { calculateLaborCosts } from './ai-models';

const laborCosts = calculateLaborCosts({
  roomType: 'Kitchen',
  squareFootage: 200,
  hourlyRate: 75,
  complexity: 'high',
  specialties: ['electrical', 'plumbing']
});

console.log(`Total labor: $${laborCosts.totalCost}`);
```

### 4. Pricing Intelligence (`pricingIntelligence.js`)

AI-powered market analysis and competitive pricing:

```javascript
import { analyzeMarketPricing } from './ai-models';

const pricing = await analyzeMarketPricing({
  materialType: 'Kitchen Cabinets',
  zipCode: '90210',
  timeframe: '30d',
  competitors: ['Home Depot', 'Lowes', 'Local Suppliers']
});

console.log(`Market price: $${pricing.currentPrice}`);
console.log(`Trend: ${pricing.trend > 0 ? 'Rising' : 'Falling'}`);
```

## 📊 AI Estimation Features

### Real-time Streaming
- Live estimate generation with progressive updates
- Real-time price data integration
- Fallback calculations when AI is unavailable

### Natural Language Processing
- Voice transcript analysis
- Project requirement extraction
- Measurement parsing from descriptions

### Pricing Intelligence
- Market trend analysis
- Competitive pricing insights
- Regional cost adjustments
- Supplier recommendations

### Memory & Learning
- Estimate history storage
- Context-aware recommendations
- Pattern recognition from past projects

## 🔧 Configuration

### AI Model Configuration

The AI models are configured to use local Ollama instances with Mistral/LLaMA models:

```javascript
// In streamAlpha.js and askAlpha.js
const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "mistral", // or "llama3", "mixtral"
    prompt: prompt,
    stream: true/false
  })
});
```

### Pricing Service Integration

Real-time pricing data is fetched from the backend scraper service:

```javascript
// In streamAlpha.js
const response = await fetch(`http://localhost:5050/scrape-price?search=${materialSearch}&zip=${zipCode}`);
```

## 📈 Performance Optimization

### Streaming vs Non-Streaming

- **Streaming** (`streamAlpha`): Real-time updates, better UX for long estimates
- **Non-Streaming** (`askAlpha`): Faster for simple estimates, complete response at once

### Memory Management

- Automatic cleanup of old estimates (keeps last 5)
- Efficient local storage usage
- Context optimization for AI prompts

### Error Handling

- Graceful fallback to standard calculations
- Comprehensive error logging
- User-friendly error messages

## 🧪 Testing

### Unit Tests

```javascript
// Test material cost calculations
const materialCosts = calculateMaterialCosts({
  roomType: 'Kitchen',
  squareFootage: 200,
  materialQuality: 'standard'
});

expect(materialCosts.totalCost).toBeGreaterThan(0);
expect(materialCosts.breakdown).toHaveLength(1);
```

### Integration Tests

```javascript
// Test complete estimation workflow
const result = await generateCompleteEstimate({
  transcript: "Kitchen renovation",
  formData: { roomType: "Kitchen", squareFootage: 200 },
  profile: { businessName: "Test Company", laborRate: 65, markup: 15 }
});

expect(result.success).toBe(true);
expect(result.estimate).toBeDefined();
expect(result.costs.totalCost).toBeGreaterThan(0);
```

## 🔮 Future Enhancements

### Planned Features

1. **Computer Vision Integration**
   - Image analysis for project scope
   - Material recognition from photos
   - Damage assessment from images

2. **Advanced AI Models**
   - GPT-4 integration for better responses
   - Custom fine-tuned models for construction
   - Multi-modal AI (text + images + voice)

3. **Predictive Analytics**
   - Project timeline predictions
   - Risk assessment
   - Cost overrun predictions

4. **Integration Enhancements**
   - CRM integration
   - Accounting software sync
   - Project management tools

### API Expansion

- RESTful API endpoints for external integration
- Webhook support for real-time updates
- Batch processing capabilities

## 🛠️ Development

### Adding New AI Functions

1. Create function in appropriate directory (`core/` or `utils/`)
2. Add comprehensive JSDoc documentation
3. Include examples and error handling
4. Export from `index.js`
5. Add tests and update documentation

### Code Style

- Use JSDoc for all functions
- Include parameter descriptions and examples
- Handle errors gracefully
- Follow existing naming conventions

### Dependencies

- **React**: For UI components
- **jsPDF**: For PDF generation
- **Framer Motion**: For animations (in AlphaBot component)

## 📚 API Reference

### Main Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `generateCompleteEstimate` | Complete AI estimation with all features | `transcript`, `formData`, `profile`, `options` | Complete estimation object |
| `streamAlpha` | Streaming AI estimation | `transcript`, `formData`, `profile`, `onUpdate` | Streaming estimate text |
| `calculateMaterialCosts` | Material cost calculations | `roomType`, `squareFootage`, `quality`, `zipCode` | Cost breakdown object |
| `calculateLaborCosts` | Labor cost calculations | `roomType`, `squareFootage`, `hourlyRate`, `complexity` | Labor breakdown object |
| `analyzeProjectTranscript` | NLP project analysis | `transcript` | Project analysis object |

### Utility Functions

| Function | Description | Use Case |
|----------|-------------|----------|
| `validateProjectData` | Data completeness validation | Form validation |
| `extractMeasurements` | Parse measurements from text | Voice input processing |
| `getMaterialRecommendations` | AI material suggestions | Cost optimization |
| `analyzeMarketPricing` | Market trend analysis | Competitive pricing |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive JSDoc documentation
4. Include tests for new functions
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.

---

For more information about AlphaQuote, visit the main project documentation in the `/docs` directory.
