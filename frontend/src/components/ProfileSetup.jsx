/**
 * Profile Setup Component
 * Collects additional user information after Clerk signup
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { User, Building, CheckCircle } from 'lucide-react';

const ProfileSetup = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're in demo mode (no real Clerk user)
  const isDemoMode = !user || !user.emailAddresses || user.emailAddresses.length === 0;
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    address: '',
    website: '',
    license: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user is available and not in demo mode
      if (!user || isDemoMode) {
        console.warn('No user object available or in demo mode, saving to localStorage only');
      } else {
        // Try to update user metadata in Clerk (if available and not demo mode)
        try {
          await user.update({
            unsafeMetadata: {
              profileCompleted: true,
              companyName: formData.companyName,
              phone: formData.phone,
              address: formData.address,
              website: formData.website,
              license: formData.license,
              primaryColor: formData.primaryColor,
              secondaryColor: formData.secondaryColor
            }
          });
          console.log('Profile updated in Clerk successfully');
        } catch (clerkError) {
          console.warn('Failed to update Clerk profile, continuing with localStorage:', clerkError);
          // Continue with localStorage save even if Clerk update fails
        }
      }

      // Save to localStorage for immediate use (always do this)
      const profileData = {
        companyName: formData.companyName,
        email: user?.emailAddresses?.[0]?.emailAddress || 'demo@alphaquote.com',
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        license: formData.license,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        profileCompleted: true,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem('alphaquote_profile', JSON.stringify(profileData));
      console.log('Profile saved to localStorage:', profileData);

      // Apply branding
      document.documentElement.style.setProperty('--primary', formData.primaryColor);
      document.documentElement.style.setProperty('--secondary', formData.secondaryColor);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to save profile: ${error.message}. Profile data saved locally only.`);

      // Even if there's an error, try to save to localStorage
      try {
        localStorage.setItem('alphaquote_profile', JSON.stringify({
          companyName: formData.companyName,
          email: user?.emailAddresses?.[0]?.emailAddress || 'demo@alphaquote.com',
          phone: formData.phone,
          address: formData.address,
          website: formData.website,
          license: formData.license,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          profileCompleted: true,
          savedAt: new Date().toISOString()
        }));
        navigate('/dashboard');
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <User className="w-8 h-8 text-primary" />
            </motion.div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
              Complete Your Profile
            </h1>

            <p className="text-xl text-slate-400">
              Help us personalize your AlphaQuote experience
            </p>
            {isDemoMode && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  🚀 Demo Mode: Profile will be saved locally for this session
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder="Your Construction Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder="www.yourcompany.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="license"
                      value={formData.license}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder="LIC-12345"
                    />
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Branding Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Skip Option */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Skip for now →
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;
