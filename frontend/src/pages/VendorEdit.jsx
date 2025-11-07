import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, User, FileText, Globe } from 'lucide-react';
import { showSuccess, showError } from '../utils/toastService';
import { API_BASE_URL } from '../config/env';
import { vendorSchema } from '../schemas';

export default function VendorEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      contactInfo: '',
      websiteUrl: '',
      notes: ''
    }
  });

  // Load vendor data
  useEffect(() => {
    const loadVendor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/vendors/${id}`);

        if (!response.ok) {
          throw new Error('Failed to load vendor');
        }

        const result = await response.json();
        if (result.success && result.vendor) {
          // Reset form with vendor data
          reset({
            name: result.vendor.name || '',
            contactInfo: result.vendor.contact || result.vendor.contactInfo || '',
            websiteUrl: result.vendor.websiteUrl || '',
            notes: result.vendor.notes || ''
          });
        } else {
          throw new Error('Vendor not found');
        }
      } catch (error) {
        console.error('Error loading vendor:', error);
        showError(`Failed to load vendor: ${error.message}`);
        navigate('/vendors');
      } finally {
        setLoading(false);
      }
    };

    loadVendor();
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vendor');
      }

      const result = await response.json();
      showSuccess('Vendor updated successfully!');
      navigate('/vendors');
    } catch (error) {
      console.error('Error updating vendor:', error);
      showError(`Failed to update vendor: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/vendors');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
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
        {/* Premium Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleCancel}
              className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors duration-300"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body">Back to Vendors</span>
            </motion.button>
            <div className="w-px h-6 bg-slate-700"></div>
            <div>
              <h1 className="text-4xl font-heading text-white flex items-center gap-3">
                <Building2 className="w-10 h-10 text-primary" />
                Edit Vendor
              </h1>
              <p className="text-slate-300 mt-2 font-body">
                Update vendor information
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Vendor Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Vendor Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="e.g., Home Depot, Local Hardware Store"
                className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body ${
                  errors.name ? 'border-red-500' : 'border-slate-700/50'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 font-body">{errors.name.message}</p>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Contact Information
              </label>
              <input
                {...register('contactInfo')}
                type="text"
                id="contactInfo"
                placeholder="Phone number, email, or contact person"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
              />
              <p className="mt-1 text-sm text-slate-500 font-body">
                Optional: Phone, email, or contact person name
              </p>
            </div>

            {/* Website URL */}
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Website URL
              </label>
              <input
                {...register('websiteUrl')}
                type="url"
                id="websiteUrl"
                placeholder="https://www.example.com"
                className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body ${
                  errors.websiteUrl ? 'border-red-500' : 'border-slate-700/50'
                }`}
              />
              {errors.websiteUrl && (
                <p className="mt-1 text-sm text-red-400 font-body">{errors.websiteUrl.message}</p>
              )}
              <p className="mt-1 text-sm text-slate-500 font-body">
                Optional: Vendor's website for quick access and cart imports
              </p>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Notes
              </label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={4}
                placeholder="Any additional notes about this vendor..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body resize-none"
              />
              <p className="mt-1 text-sm text-slate-500 font-body">
                Optional: Pricing info, delivery notes, or other details
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700/50">
              <motion.button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 font-semibold font-body"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}




