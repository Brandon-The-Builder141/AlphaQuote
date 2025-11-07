# Accounting Tool Integration Documentation

## Overview
The Accounting Tool Integration module allows users to export quotes, receipts, and job data to popular accounting software like QuickBooks, Housecall Pro, and Xero. This is an optional export-only feature that maintains all existing app logic.

## Features

### ✅ Supported Accounting Software
- **QuickBooks**: Desktop & Online compatibility
- **Housecall Pro**: Service management integration
- **Xero**: Cloud accounting platform
- **CSV Export**: Universal format for any software

### 🔧 Export Capabilities
- **Quotes**: Export estimate data with client information
- **Receipts**: Export receipt data with vendor details
- **Projects**: Export project information and tasks
- **All Data**: Bulk export of all available data

### 📊 Data Mapping
- **Clients**: Customer information mapping
- **Tasks**: Work item and service mapping
- **Materials**: Inventory and product mapping
- **Financial**: Cost calculations and tax handling

## Technical Implementation

### Components
- `AccountingExportService` - Core export logic and data mapping
- `AccountingExport` - Full-featured export UI component
- `ExportButton` - Compact export button for integration
- `AccountingIntegration` - Main accounting integration page

### Services
- `accountingExportService.js` - Export functionality and format conversion
- Data mapping for each supported software format
- CSV generation and file download capabilities

## Usage

### Main Integration Page
Navigate to `/accounting` to access the full accounting integration interface:
- Select data type (receipts, projects, all)
- Choose export format
- Configure export settings
- Download export files

### Export Button Integration
Add export functionality to any page:
```jsx
import ExportButton from './components/ExportButton';

<ExportButton
  data={quoteData}
  dataType="quote"
  label="Export Quote"
  size="default"
  variant="primary"
/>
```

### Full Export Component
Use the complete export interface:
```jsx
import AccountingExport from './components/AccountingExport';

<AccountingExport
  data={data}
  dataType="quote"
  title="Export to QuickBooks"
/>
```

## Data Formats

### QuickBooks Format
- Customer mapping with contact information
- Item tracking with quantities and prices
- Tax calculations and markup handling
- Invoice-ready format

### Housecall Pro Format
- Job tracking with service details
- Customer management integration
- Service scheduling compatibility
- Material and labor tracking

### Xero Format
- Contact management system
- Invoice generation support
- Expense tracking capabilities
- Multi-currency support

### CSV Format
- Universal compatibility
- All data fields included
- Customizable import mapping
- Easy data manipulation

## Export Process

### 1. Data Selection
- Choose data type (quotes, receipts, projects)
- Filter data if needed
- Preview export data

### 2. Format Selection
- Select accounting software format
- Review format-specific mappings
- Configure export options

### 3. Export Generation
- Generate formatted export file
- Download file to local system
- Verify export success

### 4. Import to Accounting Software
- Open accounting software
- Use import function
- Map fields as needed
- Review and finalize import

## Integration Points

### Existing Modules
- **Estimate Results**: Export button added to quote results
- **Receipt Management**: Export functionality for receipt data
- **Project Management**: Export capabilities for project data
- **Vendor Management**: Export vendor information

### API Integration
- Uses existing API endpoints
- No modifications to core logic
- Maintains data integrity
- Preserves existing functionality

## File Formats

### CSV Files
- Standard comma-separated values
- UTF-8 encoding
- Header row included
- Compatible with Excel and Google Sheets

### Naming Convention
- `alphaquote_quotes_YYYY-MM-DD.csv`
- `alphaquote_receipts_YYYY-MM-DD.csv`
- `alphaquote_projects_YYYY-MM-DD.csv`

## Data Mapping Details

### Quote Data Mapping
```javascript
{
  'Customer': clientName,
  'Email': clientEmail,
  'Phone': clientPhone,
  'Address': address,
  'Job Type': jobType,
  'Description': description,
  'Quote Date': formattedDate,
  'Subtotal': formattedCurrency(subtotal),
  'Markup %': markup,
  'Total': formattedCurrency(total)
}
```

### Receipt Data Mapping
```javascript
{
  'Vendor': vendorName,
  'Vendor Contact': vendorContact,
  'Date': formattedDate,
  'Amount': formattedCurrency(total),
  'Subtotal': formattedCurrency(subtotal),
  'Tax': formattedCurrency(tax),
  'Category': category,
  'Project': projectName
}
```

### Project Data Mapping
```javascript
{
  'Customer': clientName,
  'Project Name': projectName,
  'Address': address,
  'Job Type': jobType,
  'Description': description,
  'Start Date': formattedDate,
  'Budget': budget,
  'Status': status
}
```

## Error Handling

### Validation
- Data presence validation
- Format compatibility checks
- File generation verification
- Download success confirmation

### Error Messages
- Clear error descriptions
- Suggested solutions
- Fallback options
- User-friendly notifications

## Performance Considerations

### Large Datasets
- Efficient data processing
- Memory optimization
- Progress indicators
- Batch processing support

### File Size
- Compressed exports when possible
- Data filtering options
- Chunked downloads for large files
- Size warnings for very large exports

## Security & Privacy

### Data Protection
- Local processing only
- No external API calls
- Secure file generation
- User-controlled exports

### Privacy
- No data transmission to third parties
- Local file storage only
- User-initiated exports only
- No automatic data sharing

## Troubleshooting

### Common Issues
- **Export Fails**: Check data availability and format
- **File Won't Open**: Verify software compatibility
- **Missing Data**: Ensure all required fields are present
- **Import Errors**: Review field mapping in accounting software

### Support Resources
- Format-specific documentation
- Accounting software help guides
- Import troubleshooting guides
- Contact support for assistance

## Future Enhancements

### Planned Features
- **Direct API Integration**: Connect directly to accounting software APIs
- **Real-time Sync**: Automatic data synchronization
- **Custom Mapping**: User-defined field mapping
- **Batch Scheduling**: Scheduled export automation

### Additional Formats
- **Excel Export**: Native Excel file format
- **JSON Export**: Structured data format
- **XML Export**: Enterprise integration format
- **PDF Reports**: Formatted report generation

## Development

### Adding New Formats
1. Extend `AccountingExportService`
2. Add format mapping functions
3. Update UI components
4. Test with sample data

### Custom Integrations
1. Create custom mapping functions
2. Add format-specific UI options
3. Implement validation logic
4. Add error handling

## Testing

### Test Scenarios
- Export with various data types
- Test all supported formats
- Verify data accuracy
- Test error conditions

### Sample Data
- Use demo data for testing
- Test with empty datasets
- Test with large datasets
- Test edge cases

This accounting integration module provides a robust, flexible solution for exporting AlphaQuote data to popular accounting software while maintaining the integrity and functionality of the existing application.
