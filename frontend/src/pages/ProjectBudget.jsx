import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/env';

export default function ProjectBudget() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getVendorBreakdown = () => {
    if (!project?.receipts) return {};

    return project.receipts.reduce((breakdown, receipt) => {
      const vendor = receipt.vendor;
      if (!breakdown[vendor]) {
        breakdown[vendor] = {
          count: 0,
          total: 0,
          receipts: []
        };
      }
      breakdown[vendor].count += 1;
      breakdown[vendor].total += parseFloat(receipt.total);
      breakdown[vendor].receipts.push(receipt);
      return breakdown;
    }, {});
  };

  const getTotalReceiptCost = () => {
    if (!project?.receipts) return 0;
    return project.receipts.reduce((total, receipt) => total + parseFloat(receipt.total), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-lg text-neon-blue">Loading project budget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Project</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/receipts')}
            className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Project Not Found</h2>
          <button
            onClick={() => navigate('/receipts')}
            className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  const vendorBreakdown = getVendorBreakdown();
  const totalReceiptCost = getTotalReceiptCost();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              onClick={() => navigate('/')}
              className="text-4xl font-bold text-neon-blue mb-2 cursor-pointer hover:text-blue-400 transition-colors"
            >
              🧮 AlphaQuote - {project.name} - Budget Overview
            </h1>
            <p className="text-gray-400">
              Client: {project.clientName || 'N/A'} •
              Job Type: {project.jobType || 'N/A'} •
              Status: <span className="text-green-400">{project.status}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/receipts')}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            ← Back to Receipts
          </button>
        </div>

        {/* Project Info Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Client Name:</p>
              <p className="text-white">{project.clientName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Client Email:</p>
              <p className="text-white">{project.clientEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Client Phone:</p>
              <p className="text-white">{project.clientPhone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Address:</p>
              <p className="text-white">{project.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Timeline:</p>
              <p className="text-white">{project.timeline || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400">Budget:</p>
              <p className="text-white">{project.budget || 'N/A'}</p>
            </div>
          </div>
          {project.description && (
            <div className="mt-4">
              <p className="text-gray-400">Description:</p>
              <p className="text-white">{project.description}</p>
            </div>
          )}
        </div>

        {/* Receipt Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-neon-blue mb-2">Total Receipts</h3>
            <p className="text-3xl font-bold text-white">{project.receipts?.length || 0}</p>
            <p className="text-gray-400 text-sm">Receipts linked to this project</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-neon-blue mb-2">Total Cost</h3>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(totalReceiptCost)}</p>
            <p className="text-gray-400 text-sm">From all receipts</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-neon-blue mb-2">Vendors</h3>
            <p className="text-3xl font-bold text-white">{Object.keys(vendorBreakdown).length}</p>
            <p className="text-gray-400 text-sm">Different vendors</p>
          </div>
        </div>

        {/* Vendor Breakdown */}
        {Object.keys(vendorBreakdown).length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-neon-blue mb-4">Vendor Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(vendorBreakdown).map(([vendor, data]) => (
                <div key={vendor} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">{vendor}</h3>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">{formatCurrency(data.total)}</p>
                      <p className="text-sm text-gray-400">{data.count} receipt{data.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {data.receipts.map((receipt) => (
                      <div key={receipt.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">
                          {formatDate(receipt.purchaseDate)} - {receipt.fileName}
                        </span>
                        <span className="text-neon-blue">{formatCurrency(receipt.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Receipt Details */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">All Receipts</h2>
          {project.receipts && project.receipts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-gray-300">Vendor</th>
                    <th className="text-left py-3 px-4 text-gray-300">File</th>
                    <th className="text-right py-3 px-4 text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {project.receipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4 text-white">{formatDate(receipt.purchaseDate)}</td>
                      <td className="py-3 px-4 text-white">{receipt.vendor}</td>
                      <td className="py-3 px-4 text-gray-300">{receipt.fileName}</td>
                      <td className="py-3 px-4 text-right text-green-400 font-semibold">
                        {formatCurrency(receipt.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🧾</div>
              <p className="text-gray-400">No receipts linked to this project yet.</p>
              <button
                onClick={() => navigate('/receipts')}
                className="mt-4 bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                View All Receipts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
