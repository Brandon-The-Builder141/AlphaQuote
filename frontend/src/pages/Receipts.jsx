import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../utils/toastService';
import { API_BASE_URL } from '../config/env';
import { receiptEditSchema } from '../schemas';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Building,
  FileText,
  ArrowLeft
} from 'lucide-react';

export default function Receipts() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(receiptEditSchema),
    mode: 'onChange'
  });

  // Load receipts on component mount
  useEffect(() => {
    loadReceipts();
    loadProjects();
  }, []);

  // Filter receipts when search term or status filter changes
  useEffect(() => {
    filterReceipts();
  }, [receipts, searchTerm, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/receipts`);
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

  const loadProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      // Don't set error state for projects since it's not critical
    }
  };

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleEditReceipt = (receipt) => {
    setEditingReceipt(receipt);

    // Populate form with receipt data
    setValue('vendorName', receipt.vendor);
    setValue('purchaseDate', receipt.purchaseDate);
    setValue('totalAmount', receipt.total.toString());
    setValue('notes', receipt.notes || '');
    setValue('status', receipt.status || 'parsed');
    setValue('projectId', receipt.projectId || '');

    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingReceipt(null);
    reset();
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
        status: data.status,
        projectId: data.projectId || null,
        project: data.projectId ? projects.find(p => p.id === data.projectId) : null
      };

      // Update receipt in the list
      setReceipts(prev =>
        prev.map(receipt =>
          receipt.id === editingReceipt.id ? updatedReceipt : receipt
        )
      );

      const response = await fetch(`${API_BASE_URL}/api/receipts/${editingReceipt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorName: data.vendorName,
          purchaseDate: data.purchaseDate,
          totalAmount: data.totalAmount,
          notes: data.notes,
          status: data.status,
          projectId: data.projectId || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update receipt');
      }

      // console.log('Receipt updated successfully');
      showSuccess('Receipt updated successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Error updating receipt:', error);
      showError('Failed to update receipt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/receipts/${receiptId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove receipt from list
        setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
        showSuccess('Receipt deleted successfully!');
      } else {
        throw new Error('Failed to delete receipt');
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      showError('Failed to delete receipt. Please try again.');
    }
  };

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] animate-pulse"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'%2314B8A6\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")'
          }}
        ></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto p-8">
        {/* Premium Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors duration-300"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body">Back to Home</span>
            </motion.button>
            <div className="w-px h-6 bg-slate-700"></div>
            <div>
              <h1 className="text-4xl font-heading text-white flex items-center gap-3">
                <Receipt className="w-10 h-10 text-primary" />
                Receipt Management
              </h1>
              <p className="text-slate-300 mt-2 font-body">
                Manage your uploaded receipts and pricing data
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/receipts/new')}
            className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Plus className="w-6 h-6 relative z-10" />
            <span className="relative z-10">New Receipt</span>
          </motion.button>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Search Receipts
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by vendor or date..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
              >
                <option value="all">All Statuses</option>
                <option value="parsed">Parsed</option>
                <option value="manual">Manual</option>
                <option value="verified">Verified</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="bg-slate-800/50 rounded-xl p-4 w-full border border-slate-700/50">
                <p className="text-sm text-slate-400 font-body">Showing</p>
                <p className="text-xl font-semibold text-primary">
                  {filteredReceipts.length} of {receipts.length} receipts
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Receipts List */}
        {filteredReceipts.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900/50 rounded-full mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-heading text-slate-300 mb-3">
              {searchTerm || statusFilter !== 'all' ? 'No receipts found' : 'No receipts yet'}
            </h3>
            <p className="text-slate-400 mb-8 font-body max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first receipt to get started with pricing intelligence'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <motion.button
                onClick={() => navigate('/receipts/new')}
                className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden mx-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Plus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Upload First Receipt</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Receipt Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-primary" />
                      <h3 className="text-lg font-heading text-white">
                        {receipt.vendor}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(receipt.purchaseDate)}</span>
                    </div>
                    {receipt.project && (
                      <button
                        onClick={() => navigate(`/projects/${receipt.project.id}/budget`)}
                        className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        {receipt.project.name}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(receipt.status)}
                    <motion.button
                      onClick={() => handleDeleteReceipt(receipt.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      title="Delete receipt"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center bg-slate-800/30 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-slate-400 font-body">Total Amount:</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(receipt.total)}
                    </span>
                  </div>

                  {receipt.itemsCount && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-body">Items:</span>
                      <span className="text-white font-medium">
                        {receipt.itemsCount}
                      </span>
                    </div>
                  )}

                  {receipt.fileName && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-body">File:</span>
                      <span className="text-white text-sm truncate max-w-32" title={receipt.fileName}>
                        {receipt.fileName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleEditReceipt(receipt)}
                    className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-slate-600/50 hover:border-slate-500"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => navigate(`/receipts/${receipt.id}`)}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <h2 className="text-xl font-bold text-neon-blue mb-6">Edit Receipt</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Vendor Name */}
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

                {/* Purchase Date */}
                <div>
                  <label htmlFor="editPurchaseDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    id="editPurchaseDate"
                    {...register('purchaseDate')}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  />
                  {errors.purchaseDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.purchaseDate.message}</p>
                  )}
                </div>

                {/* Total Amount */}
                <div>
                  <label htmlFor="editTotalAmount" className="block text-sm font-medium text-gray-300 mb-2">
                    Total Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      id="editTotalAmount"
                      {...register('totalAmount')}
                      placeholder="0.00"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    />
                  </div>
                  {errors.totalAmount && (
                    <p className="text-red-400 text-sm mt-1">{errors.totalAmount.message}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="editStatus" className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="editStatus"
                    {...register('status')}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  >
                    <option value="parsed">Parsed</option>
                    <option value="manual">Manual</option>
                    <option value="verified">Verified</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>
                  )}
                </div>

                {/* Project */}
                <div>
                  <label htmlFor="editProjectId" className="block text-sm font-medium text-gray-300 mb-2">
                    Project (Optional)
                  </label>
                  <select
                    id="editProjectId"
                    {...register('projectId')}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  >
                    <option value="">-- No Project --</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} {project.clientName ? `(${project.clientName})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-red-400 text-sm mt-1">{errors.projectId.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="editNotes" className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="editNotes"
                    {...register('notes')}
                    rows={3}
                    placeholder="Add any additional notes..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent resize-none"
                  />
                  {errors.notes && (
                    <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
                  )}
                </div>

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
      </div>
    </div>
  );
}
