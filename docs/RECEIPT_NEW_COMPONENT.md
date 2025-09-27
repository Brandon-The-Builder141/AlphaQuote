# ReceiptNew Component - Enhanced Receipt Upload & Parsing

## Overview
The `ReceiptNew` component is a comprehensive receipt upload and processing system that allows users to upload receipt files (images or PDFs) and automatically parse them using OCR technology, with manual entry as a fallback option.

## Features

### 📁 File Upload
- **Supported Formats**: JPG, PNG, PDF
- **Drag & Drop**: Visual drag and drop interface
- **File Preview**: Image preview for uploaded files
- **File Validation**: Client-side validation for file types and sizes

### 🤖 OCR Processing
- **Tesseract.js Integration**: Client-side OCR processing
- **Enhanced Parsing**: Advanced receipt text parsing with confidence scoring
- **Vendor Recognition**: Automatic detection of common store names
- **Date Extraction**: Multiple date format recognition
- **Item Parsing**: Intelligent line item extraction with quantities and prices
- **Total Calculation**: Automatic total amount detection

### 📝 Form Management
- **React Hook Form**: Modern form handling with validation
- **Zod Schema**: Type-safe validation schema
- **Real-time Validation**: Live form validation with error messages
- **Auto-fill**: Automatic form population from parsed data

### 🎨 User Interface
- **Modern Design**: Consistent with AlphaQuote's dark theme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Loading States**: Visual feedback during processing
- **Error Handling**: Clear error messages and recovery options
- **Confidence Indicators**: Shows parsing confidence percentage

## Technical Implementation

### Dependencies
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createWorker } from 'tesseract.js';
import { parseReceiptText } from '../utils/receiptParserEnhanced';
```

### Validation Schema
```javascript
const receiptSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  totalAmount: z.string().min(1, 'Total amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Total amount must be a positive number'
  ),
  notes: z.string().optional(),
  receiptFile: z.any().optional()
});
```

### State Management
```javascript
const [vendors, setVendors] = useState([]);           // Available vendors from API
const [loading, setLoading] = useState(false);        // Save operation state
const [uploading, setUploading] = useState(false);    // OCR processing state
const [parsedData, setParsedData] = useState(null);   // Parsed receipt data
const [showParsedFields, setShowParsedFields] = useState(false); // UI state
const [selectedFile, setSelectedFile] = useState(null); // Uploaded file
const [filePreview, setFilePreview] = useState(null);   // File preview URL
const [ocrWorker, setOcrWorker] = useState(null);      // Tesseract worker
```

## User Workflow

### 1. File Upload
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }
};
```

### 2. OCR Processing
```javascript
const parseReceiptWithOCR = async (file) => {
  const { data: { text } } = await ocrWorker.recognize(file);
  const parsed = parseReceiptText(text);
  
  return {
    vendorName: parsed.vendor,
    purchaseDate: parsed.purchaseDate || new Date().toISOString().split('T')[0],
    totalAmount: parsed.total.toString(),
    rawText: text,
    items: parsed.items,
    confidence: parsed.confidence,
    errors: parsed.errors,
    warnings: parsed.warnings
  };
};
```

### 3. Form Population
```javascript
const handleUploadAndParse = async (data) => {
  setUploading(true);
  
  try {
    const parsed = await parseReceiptWithOCR(selectedFile);
    
    // Update form with parsed data
    setValue('vendorName', parsed.vendorName);
    setValue('purchaseDate', parsed.purchaseDate);
    setValue('totalAmount', parsed.totalAmount);
    
    setParsedData(parsed);
    setShowParsedFields(true);
  } catch (error) {
    alert('Error parsing receipt. Please try again or enter data manually.');
  } finally {
    setUploading(false);
  }
};
```

### 4. Data Saving
```javascript
const handleSaveReceipt = async (data) => {
  const receiptData = {
    vendor: data.vendorName,
    purchaseDate: data.purchaseDate,
    total: parseFloat(data.totalAmount),
    items: parsedData?.items || [],
    fileName: selectedFile?.name || 'manual_entry',
    rawText: parsedData?.rawText || '',
    notes: data.notes || ''
  };

  const response = await fetch('http://localhost:3001/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(receiptData),
  });

  if (response.ok) {
    navigate('/receipts');
  }
};
```

## Enhanced Parsing Features

### Vendor Recognition
```javascript
const extractVendorName = (lines) => {
  const storePatterns = [
    /home\s*depot/i,
    /lowes/i,
    /menards/i,
    /ace\s*hardware/i,
    /true\s*value/i,
    /walmart/i,
    /target/i,
    /costco/i,
    /sams\s*club/i,
    /kroger/i,
    /safeway/i
  ];
  
  // Look for store names in first few lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    for (const pattern of storePatterns) {
      if (pattern.test(lines[i])) {
        return formatVendorName(lines[i]);
      }
    }
  }
  
  return 'Unknown Vendor';
};
```

### Date Extraction
```javascript
const extractPurchaseDate = (text) => {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, // MM/DD/YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g, // YYYY/MM/DD
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})/gi, // DD Mon YYYY
  ];
  
  // Process each pattern and return formatted date
  for (const pattern of datePatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      return formatDate(matches[0]);
    }
  }
  
  return null;
};
```

### Item Parsing
```javascript
const extractItems = (lines) => {
  const itemPatterns = [
    /^(.+?)\s+\$(\d+\.?\d*)$/,           // Item Name $XX.XX
    /^(.+?)\s+(\d+\.?\d*)$/,             // Item Name XX.XX
    /^(\d+)\s+(.+?)\s+\$(\d+\.?\d*)$/,   // Qty Item Name $XX.XX
    /^(.+?)\s+@\s+\$(\d+\.?\d*)$/        // Item Name @ $XX.XX
  ];
  
  const items = [];
  
  for (const line of lines) {
    if (isNonItemLine(line)) continue;
    
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        // Extract and validate item data
        const item = processItemMatch(match, pattern);
        if (item) items.push(item);
        break;
      }
    }
  }
  
  return items;
};
```

### Confidence Scoring
```javascript
const calculateConfidence = (vendor, purchaseDate, items, total) => {
  let confidence = 0;
  
  // Vendor confidence (30 points max)
  if (vendor && vendor !== 'Unknown Vendor') {
    confidence += 20;
    if (vendor.length > 5 && vendor.length < 50) {
      confidence += 10;
    }
  }
  
  // Date confidence (25 points max)
  if (purchaseDate) confidence += 25;
  
  // Items confidence (30 points max)
  if (items.length > 0) {
    confidence += Math.min(items.length * 5, 20);
    if (items.some(item => item.name.length > 3)) {
      confidence += 10;
    }
  }
  
  // Total confidence (15 points max)
  if (total > 0) confidence += 15;
  
  return Math.min(confidence, 100);
};
```

## UI Components

### File Upload Section
```javascript
<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
  <h2 className="text-xl font-semibold text-neon-blue mb-4">Upload Receipt File</h2>
  
  <input
    type="file"
    accept="image/*,.pdf"
    onChange={handleFileChange}
    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
  />
  
  {filePreview && (
    <div className="mt-4">
      <img src={filePreview} alt="Receipt preview" className="max-w-full h-auto max-h-64" />
    </div>
  )}
</div>
```

### Parsed Data Display
```javascript
{showParsedFields && (
  <div className="mb-6 space-y-3">
    <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
      <p className="text-green-400 font-medium">
        ✅ Receipt parsed successfully!
      </p>
      {parsedData?.confidence && (
        <p className="text-sm text-gray-400 mt-1">
          Parsing Confidence: {parsedData.confidence}%
        </p>
      )}
    </div>
    
    {parsedData?.warnings && (
      <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
        <p className="text-yellow-400 font-medium mb-2">⚠️ Warnings:</p>
        <ul className="text-sm text-yellow-300 space-y-1">
          {parsedData.warnings.map((warning, index) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}
```

### Items Preview
```javascript
{showParsedFields && parsedData?.items && (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <h3 className="text-lg font-semibold text-neon-blue mb-4">
      Detected Items ({parsedData.items.length})
    </h3>
    <div className="bg-gray-700 rounded-lg p-4">
      {parsedData.items.map((item, index) => (
        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-600">
          <span className="text-white">{item.name}</span>
          <span className="text-neon-blue font-medium">
            ${(item.unitPrice * (item.quantity || 1)).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

## Error Handling

### OCR Errors
```javascript
try {
  const parsed = await parseReceiptWithOCR(selectedFile);
  // Process successful parsing
} catch (error) {
  console.error('OCR parsing error:', error);
  alert('Error parsing receipt. Please try again or enter data manually.');
}
```

### API Errors
```javascript
try {
  const response = await fetch('http://localhost:3001/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(receiptData),
  });

  if (!response.ok) {
    throw new Error('Failed to save receipt');
  }
} catch (error) {
  console.error('Error saving receipt:', error);
  alert('Failed to save receipt. Please try again.');
}
```

## Performance Optimizations

### OCR Worker Management
```javascript
useEffect(() => {
  initializeOCRWorker();
  
  return () => {
    // Cleanup OCR worker on unmount
    if (ocrWorker) {
      ocrWorker.terminate();
    }
  };
}, []);

const initializeOCRWorker = async () => {
  try {
    const worker = await createWorker('eng');
    setOcrWorker(worker);
  } catch (error) {
    console.error('Error initializing OCR worker:', error);
  }
};
```

### Form Validation
```javascript
const {
  register,
  handleSubmit,
  setValue,
  watch,
  formState: { errors, isValid }
} = useForm({
  resolver: zodResolver(receiptSchema),
  mode: 'onChange' // Real-time validation
});
```

## Integration Points

### API Integration
- **Vendor Loading**: Fetches available vendors from `/api/vendors`
- **Receipt Saving**: Posts receipt data to `/api/receipts`
- **Error Handling**: Proper HTTP status code handling

### Navigation
- **Back to Receipts**: Links to `/receipts` for receipt list
- **Success Redirect**: Navigates to receipt list after successful save

### State Management
- **Form State**: React Hook Form for form management
- **File State**: Local state for file handling and preview
- **Parsing State**: State management for OCR processing

## Accessibility Features

### Form Accessibility
```javascript
<label htmlFor="vendorName" className="block text-sm font-medium text-gray-300 mb-2">
  Vendor Name *
</label>
<select
  id="vendorName"
  {...register('vendorName')}
  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
>
```

### Error Messages
```javascript
{errors.vendorName && (
  <p className="text-red-400 text-sm mt-1">{errors.vendorName.message}</p>
)}
```

### Loading States
```javascript
<button
  type="submit"
  disabled={loading || uploading || !isValid}
  className="bg-neon-blue hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
>
  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
  <span>{loading ? 'Saving...' : 'Save Receipt'}</span>
</button>
```

## Future Enhancements

### Planned Features
- **Batch Upload**: Support for multiple file uploads
- **Advanced Parsing**: Machine learning-based receipt parsing
- **Template Recognition**: Store-specific parsing templates
- **Manual Item Editing**: Edit individual parsed items
- **Receipt Categories**: Organize receipts by category
- **Duplicate Detection**: Prevent duplicate receipt uploads

### Technical Improvements
- **Web Worker**: Move OCR processing to web worker
- **Caching**: Cache OCR results for better performance
- **Progressive Enhancement**: Fallback for browsers without OCR support
- **Offline Support**: Work offline with cached data
- **Advanced Validation**: More sophisticated receipt validation

The ReceiptNew component provides a comprehensive, user-friendly interface for receipt upload and processing, with robust error handling, modern form validation, and intelligent OCR parsing capabilities.


