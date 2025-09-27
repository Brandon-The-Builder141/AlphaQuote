# Receipts Page Component - Comprehensive Receipt Management

## Overview
The `Receipts.jsx` component is a comprehensive receipt management system that displays all uploaded receipts with advanced filtering, searching, and editing capabilities. It provides a modern, user-friendly interface for managing receipt data.

## Features

### 📋 Receipt Display
- **Card Layout**: Clean, responsive card design for each receipt
- **Essential Information**: Date, vendor name, total amount, and status
- **Status Badges**: Visual status indicators (Parsed, Manual, Verified)
- **Quick Actions**: Edit and view details buttons for each receipt

### 🔍 Search & Filtering
- **Search Bar**: Real-time search by vendor name or date
- **Status Filter**: Filter receipts by status (All, Parsed, Manual, Verified)
- **Results Counter**: Shows filtered vs total receipt count
- **Responsive Design**: Works on desktop, tablet, and mobile

### ✏️ Editing Capabilities
- **Modal Editor**: In-place editing with form validation
- **Field Validation**: React Hook Form with Zod schema validation
- **Status Management**: Change receipt status (Parsed → Manual → Verified)
- **Notes Support**: Add/edit additional notes for each receipt

### 🗑️ Management Actions
- **Delete Receipts**: Remove receipts with confirmation
- **Bulk Operations**: Ready for future bulk actions
- **API Integration**: Full CRUD operations with backend

## Technical Implementation

### Dependencies
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### Validation Schema
```javascript
const receiptEditSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  totalAmount: z.string().min(1, 'Total amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Total amount must be a positive number'
  ),
  notes: z.string().optional(),
  status: z.enum(['parsed', 'manual', 'verified']).default('parsed')
});
```

### State Management
```javascript
const [receipts, setReceipts] = useState([]);           // All receipts from API
const [filteredReceipts, setFilteredReceipts] = useState([]); // Filtered results
const [loading, setLoading] = useState(true);           // Loading state
const [error, setError] = useState(null);               // Error state
const [searchTerm, setSearchTerm] = useState('');       // Search input
const [statusFilter, setStatusFilter] = useState('all'); // Status filter
const [showEditModal, setShowEditModal] = useState(false); // Modal state
const [editingReceipt, setEditingReceipt] = useState(null); // Receipt being edited
const [saving, setSaving] = useState(false);            // Save operation state
```

## User Interface Components

### Header Section
```javascript
<div className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-neon-blue">Receipts</h1>
      <p className="text-gray-400 mt-2">
        Manage your uploaded receipts and pricing data
      </p>
    </div>
    <button
      onClick={() => navigate('/receipts/new')}
      className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
    >
      <span>📄</span>
      <span>New Receipt</span>
    </button>
  </div>
</div>
```

### Search and Filter Bar
```javascript
<div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Search Bar */}
    <div>
      <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
        Search Receipts
      </label>
      <div className="relative">
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by vendor or date..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
      </div>
    </div>

    {/* Status Filter */}
    <div>
      <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-300 mb-2">
        Filter by Status
      </label>
      <select
        id="statusFilter"
        value={statusFilter}
        onChange={handleStatusFilterChange}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
      >
        <option value="all">All Statuses</option>
        <option value="parsed">Parsed</option>
        <option value="manual">Manual</option>
        <option value="verified">Verified</option>
      </select>
    </div>

    {/* Results Count */}
    <div className="flex items-end">
      <div className="bg-gray-700 rounded-lg p-3 w-full">
        <p className="text-sm text-gray-400">Showing</p>
        <p className="text-lg font-semibold text-neon-blue">
          {filteredReceipts.length} of {receipts.length} receipts
        </p>
      </div>
    </div>
  </div>
</div>
```

### Receipt Card
```javascript
<div key={receipt.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-200">
  {/* Receipt Header */}
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-white mb-1">
        {receipt.vendor}
      </h3>
      <p className="text-sm text-gray-400">
        {formatDate(receipt.purchaseDate)}
      </p>
    </div>
    <div className="flex items-center space-x-2">
      {getStatusBadge(receipt.status)}
      <button
        onClick={() => handleDeleteReceipt(receipt.id)}
        className="text-red-400 hover:text-red-300 p-1"
        title="Delete receipt"
      >
        🗑️
      </button>
    </div>
  </div>

  {/* Receipt Details */}
  <div className="space-y-3 mb-6">
    <div className="flex justify-between items-center">
      <span className="text-gray-400">Total Amount:</span>
      <span className="text-xl font-bold text-neon-blue">
        {formatCurrency(receipt.total)}
      </span>
    </div>
    
    {receipt.itemsCount && (
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Items:</span>
        <span className="text-white font-medium">
          {receipt.itemsCount}
        </span>
      </div>
    )}

    {receipt.fileName && (
      <div className="flex justify-between items-center">
        <span className="text-gray-400">File:</span>
        <span className="text-white text-sm truncate max-w-32" title={receipt.fileName}>
          {receipt.fileName}
        </span>
      </div>
    )}
  </div>

  {/* Action Buttons */}
  <div className="flex space-x-3">
    <button
      onClick={() => handleEditReceipt(receipt)}
      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
    >
      Edit
    </button>
    <button
      onClick={() => navigate(`/receipts/${receipt.id}`)}
      className="flex-1 bg-neon-blue hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
    >
      View Details
    </button>
  </div>
</div>
```

### Status Badge System
```javascript
const getStatusBadge = (status) => {
  const statusConfig = {
    parsed: { color: 'bg-blue-600', text: 'Parsed', icon: '🤖' },
    manual: { color: 'bg-yellow-600', text: 'Manual', icon: '✏️' },
    verified: { color: 'bg-green-600', text: 'Verified', icon: '✅' }
  };

  const config = statusConfig[status] || statusConfig.parsed;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};
```

### Edit Modal
```javascript
{showEditModal && editingReceipt && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
      <h2 className="text-xl font-bold text-neon-blue mb-6">Edit Receipt</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields with validation */}
        <div>
          <label htmlFor="editVendorName" className="block text-sm font-medium text-gray-300 mb-2">
            Vendor Name *
          </label>
          <input
            type="text"
            id="editVendorName"
            {...register('vendorName')}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
          />
          {errors.vendorName && (
            <p className="text-red-400 text-sm mt-1">{errors.vendorName.message}</p>
          )}
        </div>

        {/* Additional form fields... */}
        
        {/* Modal Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCloseModal}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || saving}
            className="flex-1 bg-neon-blue hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

## Core Functions

### Data Loading
```javascript
const loadReceipts = async () => {
  try {
    setLoading(true);
    const response = await fetch('http://localhost:3001/api/receipts');
    if (response.ok) {
      const data = await response.json();
      setReceipts(data.receipts || []);
      setError(null);
    } else {
      throw new Error('Failed to load receipts');
    }
  } catch (error) {
    console.error('Error loading receipts:', error);
    setError('Failed to load receipts. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Filtering Logic
```javascript
const filterReceipts = () => {
  let filtered = [...receipts];

  // Filter by search term (vendor name or date)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(receipt => 
      receipt.vendor.toLowerCase().includes(term) ||
      receipt.purchaseDate.includes(term)
    );
  }

  // Filter by status
  if (statusFilter !== 'all') {
    filtered = filtered.filter(receipt => receipt.status === statusFilter);
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

  setFilteredReceipts(filtered);
};
```

### Receipt Editing
```javascript
const handleEditReceipt = (receipt) => {
  setEditingReceipt(receipt);
  
  // Populate form with receipt data
  setValue('vendorName', receipt.vendor);
  setValue('purchaseDate', receipt.purchaseDate);
  setValue('totalAmount', receipt.total.toString());
  setValue('notes', receipt.notes || '');
  setValue('status', receipt.status || 'parsed');
  
  setShowEditModal(true);
};

const onSubmit = async (data) => {
  if (!editingReceipt) return;

  setSaving(true);
  try {
    // Prepare updated receipt data
    const updatedReceipt = {
      ...editingReceipt,
      vendor: data.vendorName,
      purchaseDate: data.purchaseDate,
      total: parseFloat(data.totalAmount),
      notes: data.notes || '',
      status: data.status
    };

    // Update receipt in the list
    setReceipts(prev => 
      prev.map(receipt => 
        receipt.id === editingReceipt.id ? updatedReceipt : receipt
      )
    );

    // TODO: Call API to update receipt in backend
    // await fetch(`http://localhost:3001/api/receipts/${editingReceipt.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedReceipt)
    // });

    console.log('Receipt updated:', updatedReceipt);
    handleCloseModal();
  } catch (error) {
    console.error('Error updating receipt:', error);
    alert('Failed to update receipt. Please try again.');
  } finally {
    setSaving(false);
  }
};
```

### Receipt Deletion
```javascript
const handleDeleteReceipt = async (receiptId) => {
  if (!window.confirm('Are you sure you want to delete this receipt?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/receipts/${receiptId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      // Remove receipt from list
      setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
      console.log('Receipt deleted successfully');
    } else {
      throw new Error('Failed to delete receipt');
    }
  } catch (error) {
    console.error('Error deleting receipt:', error);
    alert('Failed to delete receipt. Please try again.');
  }
};
```

## Utility Functions

### Date Formatting
```javascript
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};
```

### Currency Formatting
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
```

## Loading and Error States

### Loading State
```javascript
if (loading) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
        <p className="text-lg text-neon-blue">Loading receipts...</p>
      </div>
    </div>
  );
}
```

### Error State
```javascript
if (error) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Receipts</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={loadReceipts}
          className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

### Empty State
```javascript
{filteredReceipts.length === 0 ? (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📄</div>
    <h3 className="text-xl font-semibold text-gray-300 mb-2">
      {searchTerm || statusFilter !== 'all' ? 'No receipts found' : 'No receipts yet'}
    </h3>
    <p className="text-gray-400 mb-6">
      {searchTerm || statusFilter !== 'all' 
        ? 'Try adjusting your search or filter criteria'
        : 'Upload your first receipt to get started'
      }
    </p>
    {!searchTerm && statusFilter === 'all' && (
      <button
        onClick={() => navigate('/receipts/new')}
        className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
      >
        Upload First Receipt
      </button>
    )}
  </div>
) : (
  // Receipt grid...
)}
```

## API Integration

### Expected API Endpoints
- **GET /api/receipts** - List all receipts
- **PUT /api/receipts/:id** - Update receipt (TODO: implement)
- **DELETE /api/receipts/:id** - Delete receipt

### Receipt Data Structure
```javascript
{
  id: string,
  vendor: string,
  purchaseDate: string,
  total: number,
  itemsCount: number,
  fileName: string,
  status: 'parsed' | 'manual' | 'verified',
  notes?: string
}
```

## Responsive Design

### Grid Layout
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredReceipts.map((receipt) => (
    // Receipt card...
  ))}
</div>
```

### Mobile-First Approach
- Single column on mobile
- Two columns on tablet (md)
- Three columns on desktop (lg)
- Responsive search and filter bar

## Accessibility Features

### Form Labels
```javascript
<label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
  Search Receipts
</label>
```

### ARIA Attributes
```javascript
<button
  onClick={() => handleDeleteReceipt(receipt.id)}
  className="text-red-400 hover:text-red-300 p-1"
  title="Delete receipt"
>
  🗑️
</button>
```

### Keyboard Navigation
- Tab navigation through form elements
- Enter key submission
- Escape key modal closure

## Future Enhancements

### Planned Features
- **Bulk Operations**: Select multiple receipts for bulk actions
- **Advanced Filtering**: Filter by date range, amount range, vendor category
- **Export Functionality**: Export receipt data to CSV/Excel
- **Receipt Categories**: Organize receipts by project or category
- **Duplicate Detection**: Identify and merge duplicate receipts
- **Receipt Analytics**: Spending trends and vendor analysis

### Technical Improvements
- **Virtual Scrolling**: Handle large numbers of receipts efficiently
- **Offline Support**: Cache receipts for offline viewing
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Search**: Full-text search with highlighting
- **Receipt OCR**: In-place OCR processing for uploaded images

The Receipts component provides a comprehensive, user-friendly interface for managing receipt data with modern React patterns, form validation, and responsive design.


