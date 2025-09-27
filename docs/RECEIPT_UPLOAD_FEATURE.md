# Receipt Upload Feature

## Overview
The Receipt Upload feature allows contractors to upload receipt files (JPG, PNG, PDF) and extract pricing data to build their local vendor database.

## Features

### 📄 File Upload
- **Drag & Drop Interface**: Intuitive drag and drop file upload
- **File Picker**: Traditional file selection browser
- **Multiple Files**: Support for uploading multiple receipts at once
- **File Validation**: Automatic validation of file types and sizes

### 🖼️ File Preview
- **Thumbnail Previews**: Image thumbnails for JPG/PNG files
- **File Information**: Display file name, size, and type
- **File Management**: Remove individual files before processing
- **Progress Indicators**: Visual feedback during upload

### 🔍 Processing
- **Mock OCR Processing**: Simulated receipt data extraction
- **Vendor Detection**: Automatic vendor name identification
- **Item Extraction**: Parse item names, quantities, and prices
- **Total Calculation**: Extract total amounts from receipts

## Technical Implementation

### Pages
- **`/receipts/new`**: File upload interface with drag & drop
- **`/receipts/process`**: Receipt processing and data extraction
- **`/receipts`**: Main receipt management dashboard

### Components
- **`ReceiptNew.jsx`**: Upload page with file validation and previews
- **`ReceiptProcess.jsx`**: Processing page with mock OCR results
- **`ReceiptManager.jsx`**: Updated with navigation to new upload page

### File Handling
- **Supported Formats**: JPG, JPEG, PNG, PDF
- **File Size Limit**: 10MB per file
- **Preview Generation**: Object URLs for image thumbnails
- **Memory Management**: Automatic cleanup of preview URLs

## Usage Flow

### 1. Upload Files
1. Navigate to `/receipts/new`
2. Drag and drop files or click "Choose Files"
3. Review uploaded files with previews
4. Remove unwanted files if needed
5. Click "Continue to Processing"

### 2. Process Receipts
1. Review files to be processed
2. Click "Start Processing Receipts"
3. Watch progress as files are processed
4. Review extracted data for each receipt
5. Click "Save to Database" when complete

### 3. Data Extraction
The system extracts:
- **Vendor Information**: Store name and contact details
- **Item Details**: Product names, quantities, unit prices
- **Totals**: Receipt totals and itemized breakdowns
- **Metadata**: Purchase dates and receipt numbers

## File Validation

### Supported Formats
```javascript
const validTypes = [
  'image/jpeg',  // JPG files
  'image/jpg',   // JPEG files
  'image/png',   // PNG files
  'application/pdf'  // PDF files
];
```

### File Size Limits
- **Maximum Size**: 10MB per file
- **Error Handling**: Clear error messages for invalid files
- **User Feedback**: Immediate validation feedback

## UI/UX Features

### Drag & Drop Interface
- **Visual Feedback**: Border color changes on drag over
- **Drop Zone**: Clear drop area with instructions
- **File Validation**: Immediate feedback on file types

### File Previews
- **Image Thumbnails**: 128px height previews for images
- **File Icons**: Appropriate icons for PDF files
- **File Information**: Name, size, and type display
- **Remove Option**: Easy file removal before processing

### Processing Interface
- **Progress Bar**: Visual progress indicator
- **File Status**: Individual file processing status
- **Results Display**: Structured display of extracted data
- **Action Buttons**: Clear next steps for users

## Integration Points

### Navigation
- **ReceiptManager**: "New Upload" button added
- **Breadcrumbs**: Back navigation between pages
- **Session Storage**: Temporary file data storage

### Data Flow
1. **Upload**: Files stored in component state
2. **Validation**: Client-side file validation
3. **Processing**: Mock OCR data extraction
4. **Storage**: Session storage for temporary data
5. **Database**: Future integration with Prisma database

## Future Enhancements

### Real OCR Integration
- **Tesseract.js**: Client-side OCR processing
- **Cloud OCR**: Server-side processing with APIs
- **AI Extraction**: Machine learning for better data extraction

### Database Integration
- **Receipt Storage**: Save uploaded files to database
- **Vendor Creation**: Automatic vendor record creation
- **Price Updates**: Update existing pricing data
- **Receipt History**: Track all processed receipts

### Advanced Features
- **Batch Processing**: Process multiple receipts simultaneously
- **Data Validation**: User review and correction interface
- **Export Options**: Export extracted data to various formats
- **Duplicate Detection**: Identify and handle duplicate receipts

## Error Handling

### File Validation Errors
- **Invalid Format**: Clear error messages for unsupported files
- **File Too Large**: Size limit exceeded notifications
- **Multiple Files**: Batch validation with individual error reporting

### Processing Errors
- **OCR Failures**: Graceful handling of processing failures
- **Data Extraction**: Fallback options for incomplete data
- **Network Issues**: Retry mechanisms for failed uploads

## Performance Considerations

### File Handling
- **Preview URLs**: Automatic cleanup to prevent memory leaks
- **File Size**: Reasonable limits to prevent browser crashes
- **Batch Processing**: Efficient handling of multiple files

### User Experience
- **Loading States**: Clear feedback during processing
- **Progress Indicators**: Visual progress for long operations
- **Error Recovery**: Easy retry options for failed operations

## Security Considerations

### File Upload Security
- **Type Validation**: Strict file type checking
- **Size Limits**: Prevent large file uploads
- **Client-Side Processing**: No server-side file storage in demo

### Data Privacy
- **Local Processing**: Files processed in browser
- **Session Storage**: Temporary data only
- **No Persistence**: Files not permanently stored in demo


