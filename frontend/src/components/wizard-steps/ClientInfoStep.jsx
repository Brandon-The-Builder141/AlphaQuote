import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { showError } from '../../utils/toastService';

export default function ClientInfoStep({ data, updateData, onNext, isFirstStep }) {
  const handleChange = (field, value) => {
    updateData({ [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!data.clientName.trim()) {
      showError('Please enter client name');
      return;
    }

    if (!data.jobType) {
      showError('Please select a job type');
      return;
    }

    // Validate email if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      showError('Please enter a valid email address');
      return;
    }

    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-heading text-white">Client Information</h2>
          <p className="text-slate-400 text-sm">Enter details about your client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Client Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              placeholder="John Smith"
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Job Type <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              value={data.jobType}
              onChange={(e) => handleChange('jobType', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <textarea
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St, City, State ZIP"
              rows={3}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6 border-t border-slate-800">
          <motion.button
            type="submit"
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue to Work Items</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
