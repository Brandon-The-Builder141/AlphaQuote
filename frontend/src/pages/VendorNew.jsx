import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Building2, User, FileText, Globe } from 'lucide-react';
import { showSuccess, showError } from '../utils/toastService';
import { API_BASE_URL } from '../config/env';
import { vendorSchema } from '../schemas';

export default function VendorNew() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vendor');
      }

      const result = await response.json();
      // console.log('✅ Vendor created:', result);

      showSuccess('Vendor created successfully!');

      // Redirect to vendors page
      navigate('/vendors');
    } catch (error) {
      console.error('❌ Error creating vendor:', error);
      showError(`Failed to create vendor: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/vendors');
  };

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
      {[...Array(15)].map((_, i) => (
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

      <div className="relative max-w-4xl mx-auto p-8">
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
                Create New Vendor
              </h1>
              <p className="text-slate-300 mt-2 font-body">
                Add a new local vendor or supplier to your database
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
                placeholder="Additional information about this vendor..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none font-body"
              />
              <p className="mt-1 text-sm text-slate-500 font-body">
                Optional: Store location, special terms, preferred contact method, etc.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-slate-700/50">
              <motion.button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-body border border-slate-600/50 hover:border-slate-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center font-body"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Vendor
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Help Text */}
        <motion.div
          className="mt-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-heading text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Tips for Adding Vendors
          </h3>
          <ul className="text-sm text-slate-300 space-y-2 font-body">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              Use the exact vendor name as it appears on receipts
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              Include contact info for easy reference during projects
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              Add notes about special terms, delivery options, or preferred contact methods
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              You can always edit vendor information later
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
