import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReceiptList() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/receipts');

      if (!response.ok) {
        throw new Error(`Failed to fetch receipts: ${response.statusText}`);
      }

      const data = await response.json();
      setReceipts(data.receipts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (receiptId) => {
    navigate(`/receipts/${receiptId}`);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b border-neon-blue mx-auto mb-4"></div>
            <p className="text-gray-400">Loading receipts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-red-600 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Error Loading Receipts</h2>
              <p className="text-red-200">{error}</p>
            </div>
            <button
              onClick={fetchReceipts}
              className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white mb-4 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-neon-blue">Receipt History</h1>
          <p className="text-gray-400 mt-2">
            Browse and view all your processed receipts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-neon-blue mb-2">Total Receipts</h3>
            <p className="text-3xl font-bold text-white">{receipts.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-neon-blue mb-2">Total Spent</h3>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(
                receipts.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0)
              )}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-neon-blue mb-2">Unique Vendors</h3>
            <p className="text-3xl font-bold text-white">
              {new Set(receipts.map(r => r.vendor)).size}
            </p>
          </div>
        </div>

        {/* Receipts List */}
        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Receipts Found</h3>
              <p className="text-gray-400 mb-6">
                You haven't processed any receipts yet. Start by uploading some receipt images.
              </p>
              <button
                onClick={() => navigate('/receipts/new')}
                className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Upload First Receipt
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Vendor</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Items</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Total</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt, index) => (
                    <tr
                      key={receipt.id}
                      className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-neon-blue rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {receipt.vendor.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{receipt.vendor}</p>
                            <p className="text-sm text-gray-400">
                              {receipt.fileName || 'Unknown file'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white">{formatDate(receipt.purchaseDate)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white">{receipt.itemsCount} item{receipt.itemsCount !== 1 ? 's' : ''}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white font-semibold">{formatCurrency(receipt.total)}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleViewReceipt(receipt.id)}
                          className="bg-neon-blue hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-neon-blue transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neon-blue rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {receipt.vendor.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{receipt.vendor}</h3>
                        <p className="text-sm text-gray-400">{formatDate(receipt.purchaseDate)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{formatCurrency(receipt.total)}</p>
                      <p className="text-sm text-gray-400">{receipt.itemsCount} items</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">
                      File: {receipt.fileName || 'Unknown'}
                    </p>
                    <button
                      onClick={() => handleViewReceipt(receipt.id)}
                      className="bg-neon-blue hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => navigate('/receipts/new')}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Upload New Receipt</span>
          </button>
          <button
            onClick={fetchReceipts}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Refresh List
          </button>
        </div>
      </div>
    </div>
  );
}


