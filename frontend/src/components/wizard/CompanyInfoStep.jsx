import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Upload,
  MapPin,
  Briefcase,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const CompanyInfoStep = ({ data, onDataChange, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    logo: data.logo || null,
    industry: data.industry || '',
    location: data.location || '',
    website: data.website || '',
    phone: data.phone || '',
    email: data.email || ''
  });

  const [logoPreview, setLogoPreview] = useState(data.logoPreview || null);

  const industries = [
    'Construction',
    'Renovation',
    'Flooring',
    'Roofing',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Landscaping',
    'Painting',
    'General Contracting',
    'Other'
  ];

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          logoPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (formData.companyName && formData.industry) {
      onNext();
    }
  };

  const isFormValid = formData.companyName && formData.industry;

  return (
    <motion.div
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Building2 className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-heading text-white mb-2">Company Information</h2>
        <p className="text-slate-300 font-body">Tell us about your business to get started</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Enter your company name"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
            required
          />
        </div>

        {/* Logo Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Company Logo
          </label>
          <div className="space-y-4">
            {logoPreview && (
              <div className="flex items-center space-x-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain bg-slate-800/50 rounded-xl border border-slate-700/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview(null);
                    setFormData(prev => ({ ...prev, logo: null, logoPreview: null }));
                  }}
                  className="text-red-400 hover:text-red-300 text-sm font-body"
                >
                  Remove
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
            />
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Industry *
          </label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
            required
          >
            <option value="">Select your industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="City, State"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-slate-300 font-body mb-2">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://yourcompany.com"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-300 font-body mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 font-body mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="contact@yourcompany.com"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-body transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          onClick={handleNext}
          disabled={!isFormValid}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-body transition-all duration-200"
          whileHover={{ scale: isFormValid ? 1.02 : 1 }}
          whileTap={{ scale: isFormValid ? 0.98 : 1 }}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CompanyInfoStep;
