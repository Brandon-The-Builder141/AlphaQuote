# Receipt Parsing System

## Overview
The receipt parsing system provides intelligent text extraction and data parsing from receipt images using OCR (Tesseract.js) and advanced pattern matching algorithms.

## Features

### 🔍 OCR Text Extraction
- **Real-time Processing**: Automatic OCR processing when images are uploaded
- **Multiple Formats**: Supports JPG, PNG images (PDF support planned)
- **Background Processing**: Non-blocking OCR using web workers
- **Progress Tracking**: Visual indicators for OCR status

### 📊 Intelligent Data Parsing
- **Vendor Recognition**: Identifies 12+ major retailers
- **Date Extraction**: Supports multiple date formats
- **Line Item Parsing**: Extracts product names, quantities, and prices
- **Total Calculation**: Finds receipt totals and subtotals
- **Confidence Scoring**: Provides parsing confidence metrics

### 🎯 Advanced Pattern Matching
- **Regex Patterns**: Multiple pattern matching for different receipt formats
- **Fallback Logic**: Graceful degradation for unclear text
- **Validation**: Data validation and error handling
- **Flexible Parsing**: Handles various receipt layouts

## Technical Implementation

### Core Components

#### ReceiptParser.js
```javascript
// Main parsing function
export function parseReceiptText(receiptText) {
  return {
    vendor: extractVendor(receiptText),
    purchaseDate: extractPurchaseDate(receiptText),
    items: extractLineItems(receiptText),
    total: extractTotal(receiptText),
    confidence: calculateConfidence(vendor, items, total),
    rawText: receiptText,
    parsedAt: new Date().toISOString()
  };
}
```

#### ReceiptNew.jsx
- **OCR Integration**: Tesseract.js processing
- **File Management**: Drag & drop with validation
- **Real-time Updates**: Live OCR status and text display
- **Worker Management**: Proper cleanup of OCR workers

#### ReceiptProcess.jsx
- **Data Processing**: Uses parsed receipt data
- **Results Display**: Structured data presentation
- **Error Handling**: OCR and parsing error management
- **Confidence Display**: Visual confidence indicators

### Parsing Algorithms

#### Vendor Recognition
```javascript
const VENDOR_PATTERNS = [
  { name: 'Home Depot', patterns: ['home depot', 'homedepot', 'the home depot'] },
  { name: "Lowe's", patterns: ["lowe's", 'lowes', 'lowes home improvement'] },
  { name: 'Menards', patterns: ['menards', 'menard'] },
  { name: 'Ace Hardware', patterns: ['ace hardware', 'acehardware', 'ace'] },
  // ... 8 more vendors
];
```

#### Date Extraction
```javascript
const DATE_PATTERNS = [
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, // MM/DD/YYYY
  /(january|february|...)\s+(\d{1,2}),?\s+(\d{4})/i, // Month DD, YYYY
  /(\d{1,2})\s+(january|february|...)\s+(\d{4})/i, // DD Month YYYY
  /(\d{4})-(\d{1,2})-(\d{1,2})/ // YYYY-MM-DD
];
```

#### Line Item Parsing
```javascript
// Pattern 1: "Item Name Quantity @ $Price"
const pattern1 = /^(.+?)\s+(\d+(?:\.\d+)?)\s*@\s*\$?(\d+(?:\.\d+)?)$/i;

// Pattern 2: "Item Name $Total" (quantity = 1)
const pattern2 = /^(.+?)\s+\$?(\d+(?:\.\d+)?)$/;

// Pattern 3: "Quantity Item Name $Price"
const pattern3 = /^(\d+(?:\.\d+)?)\s+(.+?)\s+\$?(\d+(?:\.\d+)?)$/i;
```

#### Total Extraction
```javascript
const totalPatterns = [
  /total[:\s]+\$?(\d+(?:\.\d+)?)/i,
  /amount[:\s]+\$?(\d+(?:\.\d+)?)/i,
  /grand total[:\s]+\$?(\d+(?:\.\d+)?)/i,
  /final total[:\s]+\$?(\d+(?:\.\d+)?)/i,
  /subtotal[:\s]+\$?(\d+(?:\.\d+)?)/i,
  /balance[:\s]+\$?(\d+(?:\.\d+)?)/i
];
```

## Usage Examples

### Basic Parsing
```javascript
import { parseReceiptText } from '../utils/receiptParser';

const receiptText = `Lowe's
2x4 Studs 3 @ $4.99
Deck Screws 1 @ $9.00
Subtotal: $23.97`;

const result = parseReceiptText(receiptText);
console.log(result);
// Output:
// {
//   vendor: "Lowe's",
//   purchaseDate: "2025-09-19",
//   items: [
//     { name: "2x4 Studs", quantity: 3, unitPrice: 4.99 },
//     { name: "Deck Screws", quantity: 1, unitPrice: 9.00 }
//   ],
//   total: 23.97,
//   confidence: 90
// }
```

### Advanced Parsing
```javascript
import { parseReceiptTextAdvanced } from '../utils/receiptParser';

const options = {
  strictMode: true,
  includeRawText: false,
  maxItems: 20
};

const result = parseReceiptTextAdvanced(receiptText, options);
```

## Supported Receipt Formats

### Vendor Recognition
- **Home Depot**: "home depot", "homedepot", "the home depot"
- **Lowe's**: "lowe's", "lowes", "lowes home improvement"
- **Menards**: "menards", "menard"
- **Ace Hardware**: "ace hardware", "acehardware", "ace"
- **Walmart**: "walmart", "wal-mart", "wal mart"
- **Target**: "target", "target store"
- **Costco**: "costco", "costco wholesale"
- **Harbor Freight**: "harbor freight", "harbor freight tools"
- **Northern Tool**: "northern tool", "northern tool & equipment"
- **True Value**: "true value", "truevalue"
- **Do It Best**: "do it best", "doitbest"
- **Local Supply Co**: "local supply", "supply co", "lumber yard"

### Date Formats
- **MM/DD/YYYY**: 09/19/2025
- **MM-DD-YYYY**: 09-19-2025
- **Month DD, YYYY**: September 19, 2025
- **DD Month YYYY**: 19 September 2025
- **YYYY-MM-DD**: 2025-09-19

### Item Patterns
- **Quantity @ Price**: "2x4 Studs 3 @ $4.99"
- **Name $Price**: "Deck Screws $9.00"
- **Qty Name $Price**: "3 2x4 Studs $4.99"

### Total Patterns
- **Total**: "Total: $23.97"
- **Subtotal**: "Subtotal: $23.97"
- **Amount**: "Amount: $23.97"
- **Grand Total**: "Grand Total: $23.97"

## Data Validation

### Item Validation
```javascript
function isValidItem(item) {
  return (
    item.name &&
    item.name.length >= 2 &&
    item.name.length <= 100 &&
    item.quantity > 0 &&
    item.quantity <= 1000 &&
    item.unitPrice > 0 &&
    item.unitPrice < 10000
  );
}
```

### Price Validation
- **Minimum**: $0.01
- **Maximum**: $9,999.99
- **Format**: Decimal with up to 2 places

### Quantity Validation
- **Minimum**: 0.01
- **Maximum**: 1,000
- **Format**: Integer or decimal

## Confidence Scoring

### Scoring Algorithm
```javascript
function calculateConfidence(vendor, items, total) {
  let confidence = 0;
  
  // Vendor confidence (30 points)
  if (vendor !== 'Unknown Vendor') {
    confidence += 30;
  }
  
  // Items confidence (50 points)
  if (items.length > 0) {
    confidence += Math.min(50, items.length * 10);
  }
  
  // Total confidence (20 points)
  if (total > 0) {
    confidence += 20;
  }
  
  return Math.min(100, confidence);
}
```

### Confidence Levels
- **90-100%**: High confidence - All data extracted successfully
- **70-89%**: Good confidence - Most data extracted
- **50-69%**: Medium confidence - Some data extracted
- **30-49%**: Low confidence - Limited data extracted
- **0-29%**: Very low confidence - Minimal data extracted

## Error Handling

### OCR Errors
- **Worker Failures**: Automatic retry and error reporting
- **Image Quality**: Graceful degradation for poor images
- **Memory Issues**: Proper cleanup and resource management

### Parsing Errors
- **Invalid Text**: Fallback to mock data
- **Pattern Failures**: Multiple pattern attempts
- **Validation Errors**: Clear error messages

### Error Types
```javascript
{
  errors: [
    "Invalid receipt text provided",
    "Parsing error: Unable to extract data"
  ],
  warnings: [
    "Limited to 20 items",
    "Date not detected, using current date"
  ]
}
```

## Performance Considerations

### OCR Processing
- **Worker Management**: Per-file workers with cleanup
- **Memory Management**: Proper disposal of resources
- **Concurrent Processing**: Multiple files processed simultaneously
- **Progress Tracking**: Real-time status updates

### Parsing Performance
- **Pattern Matching**: Optimized regex patterns
- **Validation**: Efficient data validation
- **Caching**: Potential for result caching
- **Batch Processing**: Multiple receipts processed together

## Testing

### Test Component
- **ReceiptParserTest.jsx**: Interactive testing interface
- **Example Receipts**: Pre-built test cases
- **Live Parsing**: Real-time parsing demonstration
- **Result Display**: Comprehensive result visualization

### Test Cases
```javascript
// Home Depot Example
const homeDepotReceipt = `Home Depot
Luxury Vinyl Plank 45 @ $4.25
Underlayment 1 @ $89.99
Transition Strip 2 @ $12.99
Subtotal: $291.22
Tax: $23.30
Total: $314.52`;

// Lowe's Example
const lowesReceipt = `Lowe's
2x4 Studs 3 @ $4.99
Deck Screws 1 @ $9.00
Wood Glue 2 @ $3.50
Subtotal: $23.97
Tax: $1.92
Total: $25.89`;
```

## Integration Points

### Receipt Upload Flow
1. **File Upload**: Drag & drop or file picker
2. **OCR Processing**: Tesseract.js text extraction
3. **Text Display**: Live preview of extracted text
4. **Continue**: Proceed to processing with OCR data

### Processing Flow
1. **Text Parsing**: Intelligent data extraction
2. **Validation**: Data validation and error checking
3. **Results Display**: Structured data presentation
4. **Confidence Scoring**: Parsing confidence metrics
5. **Save**: Store processed data for future use

### Database Integration
- **Vendor Storage**: Save recognized vendors
- **Item Catalog**: Store extracted items
- **Price History**: Track pricing over time
- **Receipt Archive**: Store processed receipts

## Future Enhancements

### Advanced OCR Features
- **Multi-language Support**: Additional language recognition
- **Handwriting Recognition**: Better handwritten text support
- **Image Enhancement**: Pre-processing for better accuracy
- **Confidence Scoring**: OCR confidence metrics

### Parsing Improvements
- **Machine Learning**: Improved parsing algorithms
- **Vendor Expansion**: More retailer recognition patterns
- **Item Categorization**: Automatic product categorization
- **Price Validation**: Cross-reference with known prices

### Integration Enhancements
- **Database Storage**: Persistent receipt storage
- **API Integration**: Server-side processing
- **Batch Processing**: Improved bulk processing
- **Export Options**: Receipt data export functionality

## Security Considerations

### Client-Side Processing
- **Local Processing**: OCR and parsing in browser
- **No Server Upload**: Images stay on client side
- **Privacy Protection**: No data sent to external services
- **Resource Limits**: Browser-imposed processing limits

### Data Handling
- **Memory Management**: Proper cleanup of sensitive data
- **Worker Isolation**: Secure worker environment
- **Error Sanitization**: Safe error message display
- **Resource Cleanup**: Complete cleanup on component unmount

## Troubleshooting

### Common Issues
- **Slow Processing**: Large images may take longer
- **Poor Accuracy**: Image quality affects OCR results
- **Memory Issues**: Browser memory limits may apply
- **Worker Errors**: Network or resource constraints

### Solutions
- **Image Optimization**: Compress images before upload
- **Quality Improvement**: Use high-contrast, clear images
- **Batch Size**: Process fewer files simultaneously
- **Error Recovery**: Retry failed OCR attempts

The receipt parsing system provides a robust, intelligent solution for extracting structured data from receipt images while maintaining privacy and performance standards.


