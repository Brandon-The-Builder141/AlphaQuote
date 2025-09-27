# OCR Integration with Tesseract.js

## Overview
The receipt upload system now includes real-time OCR (Optical Character Recognition) processing using Tesseract.js to extract text from uploaded receipt images.

## Features

### 🔍 Real-time OCR Processing
- **Automatic Processing**: OCR runs automatically when image files are uploaded
- **Multiple Languages**: Supports English language recognition
- **Background Processing**: OCR runs in web workers to prevent UI blocking
- **Progress Indicators**: Visual feedback during OCR processing

### 📄 Text Extraction
- **Raw Text Extraction**: Extracts all readable text from receipt images
- **Live Preview**: Shows extracted text below file previews
- **Text Parsing**: Intelligent parsing of vendor names, items, and prices
- **Error Handling**: Graceful handling of OCR failures

### 🎯 Receipt Data Parsing
- **Vendor Detection**: Automatic identification of store names
- **Item Extraction**: Parses product names and prices
- **Total Calculation**: Extracts receipt totals
- **Price Recognition**: Identifies monetary amounts and currency

## Technical Implementation

### Dependencies
```bash
npm install tesseract.js --legacy-peer-deps
```

### Core Components

#### ReceiptNew.jsx
- **OCR Worker Management**: Creates and manages Tesseract workers per file
- **Real-time Processing**: Processes images immediately after upload
- **State Management**: Tracks OCR status for each file
- **Memory Management**: Proper cleanup of workers and resources

#### ReceiptProcess.jsx
- **Text Parsing**: Intelligent parsing of extracted OCR text
- **Data Extraction**: Vendor names, items, prices, and totals
- **Result Display**: Shows parsed data with OCR text backup
- **Error Handling**: Handles OCR failures gracefully

### OCR Processing Flow

#### 1. File Upload
```javascript
// File validation and preview generation
const newFiles = validFiles.map(file => {
  const fileObj = {
    id: Date.now() + Math.random(),
    file: file,
    name: file.name,
    size: file.size,
    type: file.type,
    preview: null,
    ocrProcessing: false,
    ocrText: null,
    ocrError: null,
    ocrCompleted: false
  };
  // ... rest of setup
});
```

#### 2. OCR Processing
```javascript
const processOCR = async (file, fileId) => {
  try {
    // Create worker if it doesn't exist
    let worker = ocrWorkers.get(fileId);
    if (!worker) {
      worker = await createWorker('eng');
      setOcrWorkers(prev => new Map(prev).set(fileId, worker));
    }

    // Update file state to show OCR is processing
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, ocrProcessing: true, ocrText: null, ocrError: null }
        : f
    ));

    // Process the file with OCR
    const { data: { text } } = await worker.recognize(file);
    
    // Update file state with OCR results
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { 
            ...f, 
            ocrProcessing: false, 
            ocrText: text.trim(), 
            ocrError: null,
            ocrCompleted: true 
          }
        : f
    ));

    return text.trim();
  } catch (error) {
    // Error handling...
  }
};
```

#### 3. Text Parsing
```javascript
const parseReceiptText = (ocrText) => {
  const text = ocrText.toLowerCase();
  
  // Extract vendor name
  let vendor = 'Unknown Vendor';
  const vendorPatterns = [
    { name: 'Home Depot', patterns: ['home depot', 'homedepot'] },
    { name: "Lowe's", patterns: ["lowe's", 'lowes'] },
    // ... more vendors
  ];
  
  // Extract items and prices
  const items = [];
  const lines = ocrText.split('\n');
  
  for (const line of lines) {
    const priceMatch = line.match(/\$(\d+\.?\d*)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      if (price > 0 && price < 10000) {
        // Extract item name and create item object
        const itemName = line.replace(/\$[\d.,]+.*$/, '').trim();
        if (itemName && itemName.length > 2) {
          items.push({
            name: itemName,
            quantity: 1,
            unitPrice: price,
            total: price
          });
        }
      }
    }
  }
  
  // Extract total amount
  let total = '0.00';
  const totalPatterns = [
    /total[:\s]+\$?(\d+\.?\d*)/i,
    /amount[:\s]+\$?(\d+\.?\d*)/i,
    /grand total[:\s]+\$?(\d+\.?\d*)/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      total = parseFloat(match[1]).toFixed(2);
      break;
    }
  }
  
  return { vendor, items, total };
};
```

## UI/UX Features

### File Upload Interface
- **Drag & Drop**: Intuitive file upload with visual feedback
- **File Validation**: Automatic validation of supported formats
- **Preview Generation**: Thumbnail previews for uploaded images
- **Multiple Files**: Support for batch uploads

### OCR Status Display
- **Processing Indicators**: Spinning loader during OCR processing
- **Status Badges**: Visual indicators for OCR completion
- **Error Messages**: Clear error display for failed OCR attempts
- **Text Preview**: Truncated preview of extracted text

### Processing Results
- **Parsed Data**: Structured display of vendor, items, and totals
- **OCR Text Backup**: Full OCR text available for review
- **Error Handling**: Warning indicators for failed extractions
- **Data Validation**: Verification of extracted information

## Supported Features

### File Formats
- **Images**: JPG, JPEG, PNG (OCR supported)
- **PDFs**: Supported upload but OCR not implemented yet
- **File Size**: Up to 10MB per file
- **Multiple Files**: Batch processing support

### OCR Capabilities
- **Language**: English recognition
- **Text Types**: Handwritten and printed text
- **Image Quality**: Works with various image qualities
- **Processing Speed**: Real-time processing in background

### Data Extraction
- **Vendor Recognition**: 7+ major retailers supported
- **Price Extraction**: Dollar amounts and currency symbols
- **Item Parsing**: Product names and descriptions
- **Total Calculation**: Receipt totals and subtotals

## Error Handling

### OCR Failures
- **Worker Errors**: Automatic retry and error reporting
- **Image Quality**: Graceful degradation for poor images
- **Memory Issues**: Proper cleanup and resource management
- **Network Problems**: Offline processing capability

### Data Validation
- **Price Ranges**: Reasonable price validation (0-$10,000)
- **Item Names**: Length and character validation
- **Vendor Matching**: Fallback to "Unknown Vendor"
- **Total Extraction**: Multiple pattern matching attempts

## Performance Considerations

### Worker Management
- **Per-File Workers**: Individual workers for each file
- **Resource Cleanup**: Automatic worker termination
- **Memory Management**: Proper disposal of resources
- **Concurrent Processing**: Multiple files processed simultaneously

### Processing Optimization
- **Background Processing**: Non-blocking UI updates
- **Progress Tracking**: Real-time status updates
- **Error Recovery**: Graceful handling of failures
- **Resource Limits**: Reasonable processing limits

## Future Enhancements

### Advanced OCR Features
- **Multi-language Support**: Additional language recognition
- **Handwriting Recognition**: Better handwritten text support
- **Image Enhancement**: Pre-processing for better accuracy
- **Confidence Scoring**: OCR confidence metrics

### Data Processing
- **Machine Learning**: Improved parsing algorithms
- **Vendor Expansion**: More retailer recognition patterns
- **Item Categorization**: Automatic product categorization
- **Price Validation**: Cross-reference with known prices

### Integration Improvements
- **Database Storage**: Persistent OCR text storage
- **API Integration**: Server-side OCR processing
- **Batch Processing**: Improved bulk processing
- **Export Options**: OCR text export functionality

## Usage Examples

### Basic OCR Processing
```javascript
// Upload files and OCR processes automatically
const files = [imageFile1, imageFile2];
// OCR workers start processing immediately
// Results available in file objects
```

### Text Parsing
```javascript
const ocrText = "Home Depot\nLuxury Vinyl Plank $4.25\nTotal: $191.25";
const parsed = parseReceiptText(ocrText);
// Result: { vendor: "Home Depot", items: [...], total: "191.25" }
```

### Error Handling
```javascript
if (file.ocrError) {
  console.log('OCR failed:', file.ocrError);
  // Handle gracefully with fallback data
}
```

## Security Considerations

### Client-Side Processing
- **Local Processing**: OCR runs entirely in browser
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

The OCR integration provides a powerful foundation for receipt processing while maintaining privacy and performance standards.


