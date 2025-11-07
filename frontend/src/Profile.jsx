import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Store,
  Edit,
  Save,
  X,
  Calculator,
  Settings,
  User,
  Briefcase,
  RefreshCw,
  Database
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    companyName: '',
    logo: null,
    phone: '',
    email: '',
    industry: '',
    location: '',
    website: '',
    defaultMarkup: 15,
    hourlyLaborRate: '',
    serviceZipCode: '',
    preferredVendor: '',
    customVendor: '',
    useCustomPricing: false,
    customMaterials: []
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardData, setWizardData] = useState(null);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Listen for storage changes to update profile data
  useEffect(() => {
    const handleStorageChange = () => {
      loadProfileData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadProfileData = () => {
    // console.log('Loading profile data...');

    // First try to load from wizard data (primary source)
    const wizardDataStr = localStorage.getItem('alphaquote_wizard_data');
    if (wizardDataStr) {
      try {
        const wizard = JSON.parse(wizardDataStr);
        // console.log('Found wizard data:', wizard);
        setWizardData(wizard);

        if (wizard.companyInfo) {
          const companyInfo = wizard.companyInfo;
          // console.log('Loading company info from wizard:', companyInfo);

          setProfileData(prev => ({
            ...prev,
            companyName: companyInfo.companyName || '',
            phone: companyInfo.phone || '',
            email: companyInfo.email || '',
            industry: companyInfo.industry || '',
            location: companyInfo.location || '',
            website: companyInfo.website || '',
            logo: companyInfo.logoPreview || null
          }));

          if (companyInfo.logoPreview) {
            setLogoPreview(companyInfo.logoPreview);
          }

          return; // Exit early if wizard data is found
        }
      } catch (error) {
        console.error('Error loading wizard data:', error);
      }
    }

    // Only load from existing profile data if no wizard data exists
    const existingProfile = localStorage.getItem('alphaquote_profile');
    if (existingProfile) {
      try {
        const profile = JSON.parse(existingProfile);
        // console.log('Loading from existing profile:', profile);

        // Handle custom vendor logic
        let preferredVendor = profile.preferredVendor || '';
        let customVendor = profile.customVendor || '';

        if (profile.vendorName && !['Home Depot',  "Lowe's",  'Menards',  'Ace Hardware',
          'True Value'].includes(profile.vendorName)) {
          preferredVendor = 'custom';
          customVendor = profile.vendorName;
        }

        setProfileData(prev => ({
          ...prev,
          companyName: profile.businessName || profile.companyName || '',
          phone: profile.phoneNumber || profile.phone || '',
          email: profile.email || '',
          industry: profile.industry || '',
          location: profile.serviceZipCode || profile.location || '',
          website: profile.website || '',
          logo: null,
          preferredVendor,
          customVendor,
          useCustomPricing: profile.useCustomPricing || false,
          customMaterials: profile.customMaterials || []
        }));

        if (profile.logoUrl) {
          setLogoPreview(profile.logoUrl);
        }
      } catch (error) {
        console.error('Error loading existing profile:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        logo: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Save to localStorage (backward compatibility format)
      const profileToSave = {
        businessName: profileData.companyName,
        companyName: profileData.companyName,
        phoneNumber: profileData.phone,
        phone: profileData.phone,
        email: profileData.email,
        industry: profileData.industry,
        location: profileData.location,
        website: profileData.website,
        logoUrl: logoPreview,
        lastUpdated: new Date().toISOString(),
        preferredVendor: profileData.preferredVendor,
        customVendor: profileData.customVendor,
        useCustomPricing: profileData.useCustomPricing,
        customMaterials: profileData.customMaterials
      };

      localStorage.setItem('alphaquote_profile', JSON.stringify(profileToSave));

      // Update wizard data if it exists
      if (wizardData) {
        const updatedWizardData = {
          ...wizardData,
          companyInfo: {
            ...wizardData.companyInfo,
            companyName: profileData.companyName,
            phone: profileData.phone,
            email: profileData.email,
            industry: profileData.industry,
            location: profileData.location,
            website: profileData.website,
            logoPreview
          }
        };
        localStorage.setItem('alphaquote_wizard_data', JSON.stringify(updatedWizardData));
        setWizardData(updatedWizardData); // Update local state
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    loadProfileData(); // Reload original data
    setIsEditing(false);
  };

  const handleLoadDemoData = () => {
    const demoData = {
      companyName: 'Premier Home Renovations',
      phone: '(555) 123-4567',
      email: 'info@premierrenovations.com',
      industry: 'Construction',
      location: 'Los Angeles, CA',
      website: 'www.premierrenovations.com',
      logo: null
    };

    setProfileData(prev => ({
      ...prev,
      ...demoData
    }));

    // Save demo data to wizard format
    const demoWizardData = {
      companyInfo: demoData,
      completedAt: new Date().toISOString(),
      modules: {
        selectedModules: {
          estimation: true,
          vendorManagement: true,
          reporting: true
        }
      }
    };

    localStorage.setItem('alphaquote_wizard_data', JSON.stringify(demoWizardData));
    setWizardData(demoWizardData);
  };

  const handleRefreshData = () => {
    loadProfileData();
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

            <div className="w-px h-6 bg-slate-700"></div>

            <motion.button
              onClick={handleRefreshData}
              className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors duration-300"
              whileHover={{ x: 4 }}
            >
              <span className="font-body">Refresh</span>
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={handleLoadDemoData}
              className="flex items-center space-x-3 text-accent hover:text-accent/80 transition-colors duration-300"
              whileHover={{ x: 4 }}
            >
              <span className="font-body">Load Demo Data</span>
              <Database className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <User className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-5xl font-heading text-white">Profile</h1>
          </div>
          <h2 className="text-3xl font-heading text-white mb-3">Company Information</h2>
          <p className="text-xl text-slate-300 font-body">View and manage your business profile</p>
        </motion.div>

        {/* Profile Display/Edit Section */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with Edit Button */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-heading text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Company Details
            </h3>

            {!isEditing ? (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl font-body transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-body transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white rounded-xl font-body transition-all duration-200"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            )}
          </div>

          {/* Profile Information Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Logo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 font-body mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Company Logo
              </label>

              {isEditing ? (
                <div className="space-y-4">
                  {logoPreview && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 object-contain bg-slate-800/50 rounded-xl border border-slate-700/50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setProfileData(prev => ({ ...prev, logo: null }));
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
              ) : (
                <div className="flex items-center space-x-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company logo"
                      className="w-20 h-20 object-contain bg-slate-800/50 rounded-xl border border-slate-700/50"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-body">Company Logo</p>
                    <p className="text-slate-400 text-sm font-body">Click Edit to change</p>
                  </div>
                </div>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Company Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={profileData.companyName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
              ) : (
                <p className="text-white font-body text-lg">{profileData.companyName || 'Not set'}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Industry
              </label>
              {isEditing ? (
                <select
                  name="industry"
                  value={profileData.industry}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                >
                  <option value="">Select your industry</option>
                  <option value="Construction">Construction</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Flooring">Flooring</option>
                  <option value="Roofing">Roofing</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Painting">Painting</option>
                  <option value="General Contracting">General Contracting</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-white font-body text-lg">{profileData.industry || 'Not set'}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
              ) : (
                <p className="text-white font-body text-lg">{profileData.phone || 'Not set'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
              ) : (
                <p className="text-white font-body text-lg">{profileData.email || 'Not set'}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
              ) : (
                <p className="text-white font-body text-lg">{profileData.location || 'Not set'}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
              ) : (
                <p className="text-white font-body text-lg">{profileData.website || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Debug Information Section */}
          <motion.div
            className="mt-8 pt-8 border-t border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-heading text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Debug Information
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-slate-400 font-body text-sm">Wizard Data Status</span>
                <p className="text-white font-body text-sm">
                  {wizardData ? '✅ Loaded from wizard' : '❌ No wizard data found'}
                </p>
                {wizardData && (
                  <p className="text-slate-400 font-body text-xs mt-1">
                    Company: {wizardData.companyInfo?.companyName || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-body text-sm">Profile Data Status</span>
                <p className="text-white font-body text-sm">
                  {profileData.companyName ? '✅ Profile data loaded' : '❌ No profile data'}
                </p>
                <p className="text-slate-400 font-body text-xs mt-1">
                  Company: {profileData.companyName || 'Not set'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Additional Information Section */}
          {wizardData && (
            <motion.div
              className="mt-8 pt-8 border-t border-slate-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-lg font-heading text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Setup Information
              </h4>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <span className="text-slate-400 font-body text-sm">Setup Completed</span>
                  <p className="text-white font-body">
                    {wizardData.completedAt ? new Date(wizardData.completedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-body text-sm">Enabled Modules</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {wizardData.modules?.selectedModules && Object.entries(wizardData.modules.selectedModules)
                      .filter(([_, enabled]) => enabled)
                      .map(([moduleId, _]) => (
                        <span key={moduleId} className="px-2 py-1 bg-primary/20 text-primary rounded-lg text-xs font-body">
                          {moduleId === 'estimation' ? 'Estimation' :
                            moduleId === 'vendorManagement' ? 'Vendor Management' :
                              moduleId === 'reporting' ? 'Reporting' : moduleId}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
