import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../utils/toastService';
import { API_BASE_URL } from '../config/env';

export default function ReceiptConfirm() {
  const navigate = useNavigate();
  const [parsedData, setParsedData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load parsed data from session storage
    const storedParsedData = sessionStorage.getItem('parsedReceiptData');
    if (storedParsedData) {
      try {
        const parsedData = JSON.parse(storedParsedData);
        setParsedData(parsedData);
        setEditableData({
          ...parsedData,
          items: [...parsedData.items]
        });
      } catch (error) {
        console.error('Error loading parsed receipt data:', error);
        navigate('/receipts/process');
      }
    } else {
      // Fallback: try to load from receipt files (for backward compatibility)
      const storedFiles = sessionStorage.getItem('receiptFiles');
      if (storedFiles) {
        try {
          const fileData = JSON.parse(storedFiles);
          if (fileData && fileData.length > 0) {
            // Mock data for demo purposes
            const mockParsedData = {
              vendor: 'Home Depot',
              purchaseDate: new Date().toISOString().split('T')[0],
              items: [
                { name: 'Luxury Vinyl Plank', quantity: 45, unitPrice: 4.25 },
                { name: 'Underlayment', quantity: 1, unitPrice: 89.99 },
                { name: 'Transition Strip', quantity: 2, unitPrice: 12.99 }
              ],
              total: 314.52,
              confidence: 90,
              fileName: fileData[0]?.name || 'receipt.jpg'
            };

            setParsedData(mockParsedData);
            setEditableData({
              ...mockParsedData,
              items: [...mockParsedData.items]
            });
          }
        } catch (error) {
          console.error('Error loading receipt data:', error);
          navigate('/receipts/new');
        }
      } else {
        navigate('/receipts/new');
      }
    }
  }, [navigate]);

  const handleVendorChange = (e) => {
    setEditableData(prev => ({
      ...prev,
      vendor: e.target.value
    }));
  };

  const handleDateChange = (e) => {
    setEditableData(prev => ({
      ...prev,
      purchaseDate: e.target.value
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

  const addItem = () => {
    setEditableData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (index) => {
    setEditableData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    if (!editableData) return 0;
    return editableData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!editableData) return;

    // Validate required fields
    if (!editableData.vendor.trim()) {
      showError('Please enter a vendor name');
      return;
    }

    if (!editableData.purchaseDate) {
      showError('Please select a purchase date');
      return;
    }

    if (editableData.items.length === 0) {
      showError('Please add at least one item');
      return;
    }

    // Validate items
    for (const item of editableData.items) {
      if (!item.name.trim()) {
        showError('Please enter item names for all items');
        return;
      }
      if (item.quantity <= 0) {
        showError('Please enter valid quantities for all items');
        return;
      }
      if (item.unitPrice < 0) {
        showError('Please enter valid prices for all items');
        return;
      }
    }

    setSaving(true);

    try {
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
        total: calculateTotal(),
        fileName: parsedData?.fileName || 'unknown',
        rawText: parsedData?.rawText || ''
      };

      // console.log('Saving receipt data:', receiptData);

      // Call the API
      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save receipt');
      }

      const result = await response.json();
      // console.log('✅ Receipt saved successfully:', result);

      // Clear session storage
      sessionStorage.removeItem('receiptFiles');
      sessionStorage.removeItem('parsedReceiptData');

      // Show success message
      showSuccess(`Receipt saved successfully! Total: $${result.receipt.total}`);

      // Navigate back to receipts
      navigate('/receipts');
    } catch (error) {
      console.error('Error saving receipt:', error);
      showError(`Failed to save receipt: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/receipts');
    }
  };

  if (!editableData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b border-neon-blue mx-auto mb-4"></div>
            <p className="text-gray-400">Loading receipt data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white mb-4 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Processing</span>
          </button>
          <h1 className="text-3xl font-bold text-neon-blue">Confirm Receipt Data</h1>
          <p className="text-gray-400 mt-2">
            Review and edit the parsed receipt data before saving
          </p>
        </div>

        {/* Vendor and Date Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">Receipt Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vendor Name */}
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-300 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="vendor"
                value={editableData.vendor}
                onChange={handleVendorChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                placeholder="Enter vendor name"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-300 mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="purchaseDate"
                value={editableData.purchaseDate}
                onChange={handleDateChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-neon-blue">Line Items</h2>
            <button
              onClick={addItem}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              + Add Item
            </button>
          </div>

          {editableData.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Item Name</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Unit Price</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Total</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {editableData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue"
                          placeholder="Item name"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue"
                          placeholder="Qty"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No items added yet</p>
              <button
                onClick={addItem}
                className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Add First Item
              </button>
            </div>
          )}
        </div>

        {/* Total Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-neon-blue">Total Amount</h2>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                ${calculateTotal().toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">
                {editableData.items.length} item{editableData.items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Receipt Data'
            )}
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-neon-blue mb-4">📋 Editing Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Required Fields</h4>
              <ul className="space-y-1">
                <li>• Vendor name must be provided</li>
                <li>• Purchase date is required</li>
                <li>• At least one item must be added</li>
                <li>• All items need valid names and quantities</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Editing Features</h4>
              <ul className="space-y-1">
                <li>• Click on any field to edit it</li>
                <li>• Add new items with the "Add Item" button</li>
                <li>• Remove items with the "Remove" button</li>
                <li>• Total is calculated automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
