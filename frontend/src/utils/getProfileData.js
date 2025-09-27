/**
 * Retrieves and parses the saved company profile from localStorage
 * @returns {Object} Profile data with fallback values if no profile exists
 */
const getProfileData = () => {
  try {
    // Try to get profile data from localStorage
    const savedProfile = localStorage.getItem('alphaquote_profile');

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);

      // Return parsed profile with fallback values for missing fields
      return {
        businessName: parsedProfile.businessName || 'AlphaQuote Contractor',
        phone: parsedProfile.phoneNumber || '',
        email: parsedProfile.email || '',
        markup: parsedProfile.defaultMarkup || 15,
        laborRate: parsedProfile.hourlyLaborRate || 60,
        zipCode: parsedProfile.serviceZipCode || '00000',
        materialVendor: parsedProfile.preferredVendor || 'Home Depot',
        vendorName: parsedProfile.vendorName || parsedProfile.preferredVendor || 'Home Depot',
        customVendor: parsedProfile.customVendor || '',
        useCustomPricing: parsedProfile.useCustomPricing || false,
        customMaterials: parsedProfile.customMaterials || [],
        logoUrl: parsedProfile.logoUrl || ''
      };
    }
  } catch (error) {
    console.error('Error parsing profile data from localStorage:', error);
  }

  // Return default values if no profile exists or parsing fails
  return {
    businessName: 'AlphaQuote Contractor',
    phone: '',
    email: '',
    markup: 15,
    laborRate: 60,
    zipCode: '00000',
    materialVendor: 'Home Depot',
    vendorName: 'Home Depot',
    customVendor: '',
    useCustomPricing: false,
    customMaterials: [],
    logoUrl: ''
  };
};

export default getProfileData;
