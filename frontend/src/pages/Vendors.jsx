import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../utils/toastService';
import { API_BASE_URL } from '../config/env';
import {
  Store,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
  TrendingUp,
  ExternalLink,
  Globe
} from 'lucide-react';

export default function Vendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vendors`);

      if (!response.ok) {
        throw new Error('Failed to load vendors');
      }

      const result = await response.json();
      if (result.success) {
        setVendors(result.vendors);
      } else {
        throw new Error(result.error || 'Failed to load vendors');
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      setError('Failed to load vendors. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = () => {
    navigate('/vendors/new');
  };

  const handleEditVendor = (vendorId) => {
    navigate(`/vendors/${vendorId}/edit`);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete vendor');
        }

        const result = await response.json();
        if (result.success) {
          setVendors(vendors.filter(v => v.id !== vendorId));
          showSuccess('Vendor deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);
        showError(`Failed to delete vendor: ${error.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
        {/* Animated Background */}
        <div
          className="absolute inset-0 opacity-[0.02] animate-pulse"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <motion.div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
        {/* Animated Background */}
        <div
          className="absolute inset-0 opacity-[0.02] animate-pulse"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto p-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-red-400 mb-4 font-body">{error}</p>
            <motion.button
              onClick={loadVendors}
              className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-[0.02] animate-pulse"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      ></div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

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
                <Store className="w-10 h-10 text-primary" />
                Vendor Management
              </h1>
              <p className="text-slate-300 mt-2 font-body">
                Manage your local vendors and suppliers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button
            onClick={handleCreateVendor}
            className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Plus className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Add New Vendor</span>
          </motion.button>
        </motion.div>

        {/* Vendors List */}
        {vendors.length === 0 ? (
          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-800/50 shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Building2 className="w-16 h-16 text-primary mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-heading text-white mb-3">No Vendors Yet</h3>
            <p className="text-slate-300 mb-8 font-body max-w-md mx-auto">
              Add your first vendor to start tracking materials and pricing for your projects
            </p>
            <motion.button
              onClick={handleCreateVendor}
              className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden mx-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Plus className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Add Your First Vendor</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {vendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-heading text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    {vendor.name}
                  </h3>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => handleEditVendor(vendor.id)}
                      className="text-slate-400 hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-primary/10"
                      title="Edit vendor"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-red-400/10"
                      title="Delete vendor"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {vendor.contact && (
                  <div className="mb-3">
                    <p className="text-sm text-slate-400 font-body">Contact</p>
                    <p className="text-slate-300 font-body">{vendor.contact}</p>
                  </div>
                )}

                {vendor.websiteUrl && (
                  <div className="mb-3">
                    <motion.button
                      onClick={() => window.open(vendor.websiteUrl, '_blank', 'noopener,noreferrer')}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-body transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{vendor.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </motion.button>
                  </div>
                )}

                {vendor.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 font-body">Notes</p>
                    <p className="text-slate-300 text-sm font-body">{vendor.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-slate-500 font-body">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Added {formatDate(vendor.createdAt)}
                  </span>
                  <div className="flex space-x-4">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {vendor.prices.length} prices
                    </span>
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3 h-3" />
                      {vendor.receipts.length} receipts
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats */}
        {vendors.length > 0 && (
          <motion.div
            className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-xl font-heading text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Vendor Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <p className="text-3xl font-bold text-white font-heading">{vendors.length}</p>
                <p className="text-slate-400 font-body">Total Vendors</p>
              </div>
              <div className="text-center bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <p className="text-3xl font-bold text-white font-heading">
                  {vendors.reduce((sum, v) => sum + v.prices.length, 0)}
                </p>
                <p className="text-slate-400 font-body">Price Records</p>
              </div>
              <div className="text-center bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <p className="text-3xl font-bold text-white font-heading">
                  {vendors.reduce((sum, v) => sum + v.receipts.length, 0)}
                </p>
                <p className="text-slate-400 font-body">Receipt Records</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
