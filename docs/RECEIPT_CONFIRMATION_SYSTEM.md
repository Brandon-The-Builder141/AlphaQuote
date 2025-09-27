# Receipt Confirmation System

## Overview
The Receipt Confirmation System provides an editable preview form that allows users to review, modify, and confirm parsed receipt data before saving it to the backend database.

## Features

### 📝 Editable Preview Form
- **Vendor Name**: Editable text input for vendor identification
- **Purchase Date**: Date picker for accurate purchase date
- **Line Items Table**: Fully editable table with item names, quantities, and prices
- **Real-time Total**: Automatically calculated total as items are modified
- **Add/Remove Items**: Dynamic item management with add and remove buttons

### 🔧 Data Validation
- **Required Fields**: Vendor name and purchase date validation
- **Item Validation**: Name, quantity, and price validation for all items
- **Data Integrity**: Comprehensive validation before submission
- **Error Handling**: Clear error messages for invalid data

### 💾 Backend Integration
- **API Endpoints**: Complete CRUD operations for receipt data
- **Database Storage**: Persistent storage in Prisma database
- **Vendor Management**: Automatic vendor creation and price updates
- **Data Relationships**: Proper linking between receipts, vendors, and items

## Technical Implementation

### Components

#### ReceiptConfirm.jsx
```javascript
// Main confirmation page component
export default function ReceiptConfirm() {
  const [editableData, setEditableData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load parsed data from session storage
  useEffect(() => {
    const storedParsedData = sessionStorage.getItem('parsedReceiptData');
    // Initialize editable data...
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate data and save to backend
  };
}
```

#### ReceiptProcessing Flow
1. **Upload**: Files uploaded in ReceiptNew
2. **OCR Processing**: Text extracted using Tesseract.js
3. **Parsing**: Text parsed using receiptParser.js
4. **Confirmation**: Data reviewed and edited in ReceiptConfirm
5. **Save**: Final data saved to backend database

### API Endpoints

#### Receipt Management
```javascript
// Save receipt data
POST /api/receipts
{
  "vendor": "Home Depot",
  "purchaseDate": "2025-09-19",
  "items": [
    {
      "name": "Luxury Vinyl Plank",
      "quantity": 45,
      "unitPrice": 4.25,
      "total": 191.25
    }
  ],
  "total": 314.52,
  "fileName": "receipt.jpg",
  "rawText": "Home Depot\nLuxury Vinyl..."
}
```

#### Database Operations
```javascript
// Create receipt record
const receipt = await prisma.receipt.create({
  data: {
    vendorId: vendorRecord.id,
    purchaseDate: new Date(purchaseDate),
    totalAmount: total,
    fileName: fileName,
    rawText: rawText,
    processedAt: new Date()
  }
});

// Create receipt items
const receiptItems = await Promise.all(
  items.map(item =>
    prisma.receiptItem.create({
      data: {
        receiptId: receipt.id,
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total
      }
    })
  )
);
```

## User Interface

### Form Layout
```javascript
// Vendor and Date Section
<div className="grid md:grid-cols-2 gap-6">
  <div>
    <label>Vendor Name *</label>
    <input
      type="text"
      value={editableData.vendor}
      onChange={handleVendorChange}
      placeholder="Enter vendor name"
    />
  </div>
  <div>
    <label>Purchase Date *</label>
    <input
      type="date"
      value={editableData.purchaseDate}
      onChange={handleDateChange}
    />
  </div>
</div>
```

### Items Table
```javascript
// Editable items table
<table className="w-full">
  <thead>
    <tr>
      <th>Item Name</th>
      <th>Quantity</th>
      <th>Unit Price</th>
      <th>Total</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {editableData.items.map((item, index) => (
      <tr key={index}>
        <td>
          <input
            type="text"
            value={item.name}
            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            value={item.unitPrice}
            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
          />
        </td>
        <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
        <td>
          <button onClick={() => removeItem(index)}>Remove</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

## Data Flow

### 1. Data Loading
```javascript
useEffect(() => {
  // Load parsed data from session storage
  const storedParsedData = sessionStorage.getItem('parsedReceiptData');
  if (storedParsedData) {
    const parsedData = JSON.parse(storedParsedData);
    setEditableData({
      ...parsedData,
      items: [...parsedData.items]
    });
  }
}, []);
```

### 2. Field Updates
```javascript
const handleVendorChange = (e) => {
  setEditableData(prev => ({
    ...prev,
    vendor: e.target.value
  }));
};

const handleItemChange = (index, field, value) => {
  setEditableData(prev => ({
    ...prev,
    items: prev.items.map((item, i) => 
      i === index 
        ? { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value }
        : item
    )
  }));
};
```

### 3. Data Submission
```javascript
const handleSubmit = async () => {
  // Validate required fields
  if (!editableData.vendor.trim()) {
    alert('Please enter a vendor name');
    return;
  }

  // Prepare data for backend
  const receiptData = {
    vendor: editableData.vendor.trim(),
    purchaseDate: editableData.purchaseDate,
    items: editableData.items.map(item => ({
      name: item.name.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice
    })),
    total: calculateTotal()
  };

  // Call API
  const response = await fetch('http://localhost:3001/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(receiptData),
  });
};
```

## Validation Rules

### Required Fields
- **Vendor Name**: Must not be empty
- **Purchase Date**: Must be a valid date
- **Items**: At least one item required

### Item Validation
- **Item Name**: Must not be empty
- **Quantity**: Must be positive number
- **Unit Price**: Must be non-negative number
- **Total**: Calculated automatically

### Data Types
- **Vendor**: String (trimmed)
- **Purchase Date**: Date (ISO format)
- **Quantity**: Number (positive)
- **Unit Price**: Number (non-negative)
- **Total**: Number (calculated)

## Backend Processing

### Receipt Creation
```javascript
// Create or find vendor
let vendorRecord = await prisma.localVendor.findFirst({
  where: { name: vendor.trim() }
});

if (!vendorRecord) {
  vendorRecord = await prisma.localVendor.create({
    data: {
      name: vendor.trim(),
      contact: null,
      notes: 'Created from receipt processing'
    }
  });
}
```

### Price Updates
```javascript
// Create or update vendor prices
await Promise.all(
  items.map(async (item) => {
    const materialKey = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    const existingPrice = await prisma.localVendorPrice.findFirst({
      where: {
        vendorId: vendorRecord.id,
        materialKey: materialKey
      }
    });

    if (existingPrice) {
      // Update existing price
      await prisma.localVendorPrice.update({
        where: { id: existingPrice.id },
        data: {
          unitPrice: item.unitPrice,
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      });
    } else {
      // Create new price
      await prisma.localVendorPrice.create({
        data: {
          vendorId: vendorRecord.id,
          materialKey: materialKey,
          unitPrice: item.unitPrice,
          unit: 'each',
          isManual: false,
          source: 'receipt',
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      });
    }
  })
);
```

## Error Handling

### Client-Side Validation
```javascript
// Validate items
for (const item of editableData.items) {
  if (!item.name.trim()) {
    alert('Please enter item names for all items');
    return;
  }
  if (item.quantity <= 0) {
    alert('Please enter valid quantities for all items');
    return;
  }
  if (item.unitPrice < 0) {
    alert('Please enter valid prices for all items');
    return;
  }
}
```

### API Error Handling
```javascript
try {
  const response = await fetch('http://localhost:3001/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(receiptData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save receipt');
  }

  const result = await response.json();
  alert(`Receipt saved successfully!\nReceipt ID: ${result.receipt.id}`);
} catch (error) {
  alert(`Failed to save receipt data: ${error.message}`);
}
```

## Database Schema

### Receipt Model
```prisma
model Receipt {
  id           String   @id @default(cuid())
  vendorId     String
  purchaseDate DateTime
  totalAmount  Float
  fileName     String?
  rawText      String?
  processedAt  DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  vendor LocalVendor @relation(fields: [vendorId], references: [id])
  items  ReceiptItem[]
}
```

### ReceiptItem Model
```prisma
model ReceiptItem {
  id         String  @id @default(cuid())
  receiptId  String
  itemName   String
  quantity   Float
  unitPrice  Float
  totalPrice Float
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  receipt Receipt @relation(fields: [receiptId], references: [id])
}
```

## User Experience

### Navigation Flow
1. **Upload Files**: `/receipts/new` - Upload receipt images
2. **Process OCR**: Automatic OCR processing with progress indicators
3. **Review Parsing**: `/receipts/process` - Review parsed data
4. **Confirm Data**: `/receipts/confirm` - Edit and confirm data
5. **Save Success**: Redirect to `/receipts` with success message

### Visual Feedback
- **Loading States**: Spinner during save operation
- **Validation Errors**: Clear error messages
- **Success Messages**: Confirmation with receipt details
- **Real-time Updates**: Total calculation updates automatically

### Responsive Design
- **Mobile Friendly**: Responsive table and form layout
- **Touch Support**: Mobile-optimized input fields
- **Accessibility**: Proper labels and keyboard navigation

## Performance Considerations

### Data Management
- **Session Storage**: Temporary data storage between pages
- **Memory Cleanup**: Proper cleanup of session data
- **State Management**: Efficient React state updates

### API Optimization
- **Batch Operations**: Multiple items processed together
- **Transaction Safety**: Database operations wrapped in transactions
- **Error Recovery**: Graceful handling of API failures

## Security Features

### Data Validation
- **Input Sanitization**: Trimmed and validated input data
- **Type Checking**: Proper data type validation
- **SQL Injection Prevention**: Parameterized queries with Prisma

### Access Control
- **Client-Side Validation**: Immediate feedback for users
- **Server-Side Validation**: Backend validation for security
- **Error Sanitization**: Safe error messages without sensitive data

## Future Enhancements

### Advanced Features
- **Bulk Editing**: Select and edit multiple items
- **Item Templates**: Save common items for quick addition
- **Price History**: Show price trends for materials
- **Receipt Duplicates**: Detect and handle duplicate receipts

### Integration Improvements
- **Receipt Archive**: Store receipt images
- **Export Options**: Export receipt data to various formats
- **Analytics**: Receipt processing analytics and insights
- **Mobile App**: Native mobile app for receipt capture

The Receipt Confirmation System provides a comprehensive, user-friendly interface for reviewing and confirming parsed receipt data before saving it to the database, ensuring data accuracy and user satisfaction.


