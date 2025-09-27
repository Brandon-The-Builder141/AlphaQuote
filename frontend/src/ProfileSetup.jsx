import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDemoProfile } from './utils/demoData';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Calculator
} from 'lucide-react';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    logo: null,
    phoneNumber: '',
    email: '',
    defaultMarkup: 15,
    hourlyLaborRate: '',
    serviceZipCode: '',
    preferredVendor: '',
    customVendor: '',
    useCustomPricing: false,
    customMaterials: []
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing profile data on component mount
  useEffect(() => {
    // First try to load from wizard data
    const wizardData = localStorage.getItem('alphaquote_wizard_data');
    if (wizardData) {
      try {
        const wizard = JSON.parse(wizardData);
        if (wizard.companyInfo) {
          setFormData(prev => ({
            ...prev,
            businessName: wizard.companyInfo.companyName || '',
            phoneNumber: wizard.companyInfo.phone || '',
            email: wizard.companyInfo.email || '',
            serviceZipCode: wizard.companyInfo.location || '',
            logo: wizard.companyInfo.logoPreview || null
          }));

          if (wizard.companyInfo.logoPreview) {
            setLogoPreview(wizard.companyInfo.logoPreview);
          }
        }
      } catch (error) {
        console.error('Error loading wizard data:', error);
      }
    }

    // Then load from existing profile data (for backward compatibility)
    const existingProfile = localStorage.getItem('alphaquote_profile');
    if (existingProfile) {
      const profile = JSON.parse(existingProfile);

      // Handle custom vendor logic
      let preferredVendor = profile.preferredVendor || '';
      let customVendor = profile.customVendor || '';

      // If we have a vendorName but preferredVendor is not in our dropdown options,
      // it means it was a custom vendor
      if (profile.vendorName && !['Home Depot',  "Lowe's",  'Menards',  'Ace Hardware',
        'True Value'].includes(profile.vendorName)) {
        preferredVendor = 'custom';
        customVendor = profile.vendorName;
      }

      setFormData(prev => ({
        ...prev,
        ...profile,
        logo: null, // Don't load logo from localStorage
        preferredVendor,
        customVendor,
        useCustomPricing: profile.useCustomPricing || false,
        customMaterials: profile.customMaterials || []
      }));

      if (profile.logoUrl) {
        setLogoPreview(profile.logoUrl);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVendorChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      preferredVendor: value,
      customVendor: value === 'custom' ? prev.customVendor : '',
      useCustomPricing: value === 'custom' ? prev.useCustomPricing : false
    }));
  };

  const handleCustomPricingToggle = (e) => {
    setFormData(prev => ({
      ...prev,
      useCustomPricing: e.target.checked
    }));
  };

  const addCustomMaterial = () => {
    setFormData(prev => ({
      ...prev,
      customMaterials: [
        ...prev.customMaterials,
        { id: Date.now(), name: '', price: '', unit: 'per sq ft' }
      ]
    }));
  };

  const updateCustomMaterial = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      customMaterials: prev.customMaterials.map(material =>
        material.id === id ? { ...material, [field]: value } : material
      )
    }));
  };

  const removeCustomMaterial = (id) => {
    setFormData(prev => ({
      ...prev,
      customMaterials: prev.customMaterials.filter(material => material.id !== id)
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare profile data
      const profileData = {
        ...formData,
        logoUrl: logoPreview,
        lastUpdated: new Date().toISOString(),
        // Store the actual vendor name (either selected or custom)
        vendorName: formData.preferredVendor === 'custom' ? formData.customVendor : formData.preferredVendor
      };

      // Store in localStorage
      localStorage.setItem('alphaquote_profile', JSON.stringify(profileData));

      // Simulate a brief delay for better UX
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSubmitting(false);
    }
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
      {[...Array(25)].map((_, i) => (
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
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors duration-300"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body">Back to Home</span>
            </motion.button>

            <div className="w-px h-6 bg-slate-700"></div>

            <motion.button
              onClick={() => navigate('/setup')}
              className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-colors duration-300"
              whileHover={{ x: 4 }}
            >
              <span className="font-body">Run Setup Wizard</span>
              <Calculator className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calculator className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-5xl font-heading text-white">AlphaQuote</h1>
          </div>
          <h2 className="text-3xl font-heading text-white mb-3">Profile Setup</h2>
          <p className="text-xl text-slate-300 font-body mb-6">Configure your business information for estimates</p>

          <motion.button
            onClick={loadDemoProfile}
            className="bg-gradient-to-r from-accent to-accent/80 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Building2 className="w-4 h-4" />
            Load Demo Business Profile
          </motion.button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info Section */}
          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-heading text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Why Set Up Your Profile?
            </h3>
            <div className="space-y-6 text-slate-300">
              <div className="flex items-start space-x-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                </motion.div>
                <div>
                  <h4 className="font-heading text-white text-lg mb-1">Professional Estimates</h4>
                  <p className="text-sm font-body">Include your business name and logo on all estimates</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                </motion.div>
                <div>
                  <h4 className="font-heading text-white text-lg mb-1">Default Settings</h4>
                  <p className="text-sm font-body">Set your preferred markup and labor rates</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                </motion.div>
                <div>
                  <h4 className="font-heading text-white text-lg mb-1">Contact Information</h4>
                  <p className="text-sm font-body">Clients can easily reach you with questions</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                </motion.div>
                <div>
                  <h4 className="font-heading text-white text-lg mb-1">Service Area</h4>
                  <p className="text-sm font-body">Define your service ZIP code for local projects</p>
                </div>
              </div>
            </div>

            <motion.div
              className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-sm text-slate-300 font-body">
                <strong>Note:</strong> You can update your profile anytime from the settings menu.
              </p>
            </motion.div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-2xl font-heading text-white mb-8 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Business Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your business name"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Logo
                </label>
                <div className="space-y-3">
                  {logoPreview && (
                    <div className="flex items-center space-x-3">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 object-contain bg-gray-700 rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setFormData(prev => ({ ...prev, logo: null }));
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-blue file:text-white hover:file:bg-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@yourbusiness.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Business Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Markup %
                  </label>
                  <input
                    type="number"
                    name="defaultMarkup"
                    value={formData.defaultMarkup}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Labor Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    name="hourlyLaborRate"
                    value={formData.hourlyLaborRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="45.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Service Area */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Service ZIP Code
                </label>
                <input
                  type="number"
                  name="serviceZipCode"
                  value={formData.serviceZipCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                />
              </div>

              {/* Preferred Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Material Vendor
                </label>
                <select
                  name="preferredVendor"
                  value={formData.preferredVendor}
                  onChange={handleVendorChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                >
                  <option value="">Select preferred vendor</option>
                  <option value="Home Depot">Home Depot</option>
                  <option value="Lowe's">Lowe's</option>
                  <option value="Menards">Menards</option>
                  <option value="Ace Hardware">Ace Hardware</option>
                  <option value="True Value">True Value</option>
                  <option value="custom">Custom Vendor</option>
                </select>

                {/* Custom Vendor Input - Only show when "Custom Vendor" is selected */}
                {formData.preferredVendor === 'custom' && (
                  <div className="mt-3 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Custom Vendor Name
                      </label>
                      <input
                        type="text"
                        name="customVendor"
                        value={formData.customVendor}
                        onChange={handleInputChange}
                        placeholder="Enter your vendor name (e.g., Local Hardware Store)"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      />
                    </div>

                    {/* Custom Pricing Toggle */}
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.useCustomPricing}
                          onChange={handleCustomPricingToggle}
                          className="w-4 h-4 text-neon-blue bg-gray-700 border-gray-600 rounded focus:ring-neon-blue focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-300">
                          Manually enter material pricing
                        </span>
                      </label>
                    </div>

                    {/* Custom Materials Form */}
                    {formData.useCustomPricing && (
                      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-white">Custom Material Pricing</h4>
                          <button
                            type="button"
                            onClick={addCustomMaterial}
                            className="bg-neon-blue hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            + Add Material
                          </button>
                        </div>

                        {formData.customMaterials.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-gray-400 mb-2">No custom materials defined yet</p>
                            <p className="text-sm text-gray-500">Add materials to define your own pricing</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {formData.customMaterials.map((material) => (
                              <div key={material.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                  <div className="md:col-span-4">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                      Material Name
                                    </label>
                                    <input
                                      type="text"
                                      value={material.name}
                                      onChange={(e) => updateCustomMaterial(material.id, 'name', e.target.value)}
                                      placeholder="e.g., Vinyl Flooring"
                                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                                    />
                                  </div>

                                  <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                      Price ($)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={material.price}
                                      onChange={(e) => updateCustomMaterial(material.id, 'price', e.target.value)}
                                      placeholder="0.00"
                                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                                    />
                                  </div>

                                  <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                      Unit
                                    </label>
                                    <select
                                      value={material.unit}
                                      onChange={(e) => updateCustomMaterial(material.id, 'unit', e.target.value)}
                                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                                    >
                                      <option value="per sq ft">per sq ft</option>
                                      <option value="per piece">per piece</option>
                                      <option value="per bundle">per bundle</option>
                                      <option value="per sheet">per sheet</option>
                                      <option value="per gallon">per gallon</option>
                                      <option value="per pound">per pound</option>
                                      <option value="per linear ft">per linear ft</option>
                                      <option value="per box">per box</option>
                                    </select>
                                  </div>

                                  <div className="md:col-span-2">
                                    <button
                                      type="button"
                                      onClick={() => removeCustomMaterial(material.id)}
                                      className="w-full bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                          <p className="text-xs text-gray-400">
                            <strong>Note:</strong> Custom material pricing will be used in estimates instead of scraped pricing when available.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !formData.businessName}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-body"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Save Profile
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
