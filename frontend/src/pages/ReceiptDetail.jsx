import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../utils/toastService';
import { API_BASE_URL } from '../config/env';

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchReceipt(id);
    }
  }, [id]);

  const fetchReceipt = async (receiptId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Receipt not found');
        }
        throw new Error(`Failed to fetch receipt: ${response.statusText}`);
      }

      const data = await response.json();
      setReceipt(data.receipt);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipt:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(parseFloat(amount));
    } catch {
      return '$0.00';
    }
  };

  const handleDeleteReceipt = async () => {
    if (!window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/receipts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete receipt');
      }

      showSuccess('Receipt deleted successfully!');
      navigate('/receipts');
    } catch (err) {
      console.error('Error deleting receipt:', err);
      showError('Failed to delete receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b border-neon-blue mx-auto mb-4"></div>
            <p className="text-gray-400">Loading receipt details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-red-600 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Error Loading Receipt</h2>
              <p className="text-red-200">{error}</p>
            </div>
            <button
              onClick={() => navigate('/receipts')}
              className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Back to Receipts
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Receipt Not Found</h2>
            <p className="text-gray-400 mb-6">The requested receipt could not be found.</p>
            <button
              onClick={() => navigate('/receipts')}
              className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Back to Receipts
            </button>
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
            onClick={() => navigate('/receipts')}
            className="text-gray-400 hover:text-white mb-4 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Receipts</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-neon-blue">Receipt Details</h1>
              <p className="text-gray-400 mt-2">
                Receipt ID: {receipt.id}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteReceipt}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Delete Receipt
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-neon-blue mb-4">Receipt Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Vendor:</span>
                <span className="text-white font-medium">{receipt.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Purchase Date:</span>
                <span className="text-white font-medium">{formatDate(receipt.purchaseDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-white font-semibold text-lg">{formatCurrency(receipt.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Name:</span>
                <span className="text-white font-medium">{receipt.fileName || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Upload Date:</span>
                <span className="text-white font-medium">
                  {receipt.uploadDate ? formatDate(receipt.uploadDate) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-neon-blue mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Items:</span>
                <span className="text-white font-medium">{receipt.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Item Price:</span>
                <span className="text-white font-medium">
                  {receipt.items?.length > 0
                    ? formatCurrency(receipt.items.reduce((sum,  item) => sum + parseFloat(item.unitPrice || 0),
                      0) / receipt.items.length)
                    : '$0.00'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Largest Item:</span>
                <span className="text-white font-medium">
                  {receipt.items?.length > 0
                    ? receipt.items.reduce((max,
                      item) => parseFloat(item.total || 0) > parseFloat(max.total || 0) ? item : max).name
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-neon-blue">Line Items</h2>
          </div>

          {receipt.items && receipt.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Item Name</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Quantity</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Unit Price</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-700 ${
                        index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <p className="text-white font-medium">{item.name}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white">{item.quantity}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white">{formatCurrency(item.unitPrice)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white font-semibold">{formatCurrency(item.total)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-700">
                  <tr>
                    <td colSpan="3" className="py-4 px-6 text-right text-gray-300 font-medium">
                      Total:
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white font-bold text-lg">{formatCurrency(receipt.total)}</p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-400">No line items found for this receipt.</p>
            </div>
          )}
        </div>

        {/* Raw Text (if available) */}
        {receipt.rawText && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-neon-blue">Raw OCR Text</h2>
              <p className="text-sm text-gray-400 mt-1">Original text extracted from the receipt</p>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {receipt.rawText}
              </pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/receipts')}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Back to Receipts
          </button>
          <button
            onClick={() => navigate('/receipts/new')}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Upload New Receipt
          </button>
        </div>
      </div>
    </div>
  );
}


