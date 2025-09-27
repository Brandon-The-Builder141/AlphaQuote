/**
 * Demo Data for AlphaQuote Live Testing
 * Complete example estimate form data
 */

export const demoEstimateData = {
  // Client Information
  projectInfo: {
    clientName: 'Sarah & Mike Johnson',
    clientEmail: 'sarah.johnson@email.com',
    clientPhone: '(555) 123-4567',
    projectAddress: '1234 Maple Street, Springfield, IL 62701',
    jobType: 'Complete Kitchen & Master Bathroom Renovation',
    projectDescription: 'Full kitchen remodel with new cabinets, countertops, flooring, and appliances. Master bathroom renovation with walk-in shower, new vanity, and tile work.',

    timeline: '6-8 weeks starting October 1st',
    budget: '$45,000 - $55,000'
  },

  // Project Settings
  estimateType: 'multi',
  markup: 18,

  // Room Details
  rooms: [
    {
      id: 1,
      name: 'Main Kitchen',
      sqft: 280,
      material: 'Quartz countertops, hardwood cabinets (maple), luxury vinyl plank flooring, subway tile backsplash',
      materialCost: '12.50',
      labor: 'Cabinet installation, countertop templating and installation, flooring installation, tile work, electrical updates',

      laborHours: '85',
      notes: 'Need to relocate electrical outlet for new island. Client wants soft-close drawers and under-cabinet lighting. Backsplash extends to ceiling.',

      demo: true,
      trim: true,
      paint: true
    },
    {
      id: 2,
      name: 'Master Bathroom',
      sqft: 120,
      material: 'Porcelain tile flooring, natural stone shower walls, quartz vanity top, custom glass shower door',
      materialCost: '8.75',
      labor: 'Tile installation, plumbing rough-in, shower installation, vanity installation, glass door installation',
      laborHours: '45',
      notes: 'Remove existing tub and install walk-in shower. Need waterproof membrane behind shower walls. Client prefers heated floors.',

      demo: true,
      trim: false,
      paint: true
    },
    {
      id: 3,
      name: 'Kitchen Pantry',
      sqft: 45,
      material: 'Custom shelving system, matching flooring to kitchen',
      materialCost: '6.25',
      labor: 'Custom shelving installation, flooring installation, electrical for lighting',
      laborHours: '12',
      notes: 'Convert existing closet to walk-in pantry with pull-out drawers and wine storage.',
      demo: false,
      trim: true,
      paint: true
    }
  ]
};

export const demoBusinessProfile = {
  businessName: 'Premier Home Renovations',
  phoneNumber: '(555) 987-6543',
  email: 'info@premierhomereno.com',
  defaultMarkup: 18,
  hourlyLaborRate: 75,
  serviceZipCode: '62701',
  preferredVendor: 'Home Depot',
  customVendor: '',
  vendorName: 'Home Depot',
  useCustomPricing: false,
  customMaterials: [],
  logoUrl: null,
  lastUpdated: new Date().toISOString()
};

// Demo AI estimate for testing PDF export
export const demoAIEstimate = `# Premier Home Renovations - Professional Estimate

## Project Overview
**Room Type:** Kitchen & Bathroom Renovation
**Square Footage:** 400 sqft total
**Date:** ${new Date().toLocaleDateString()}

## Cost Breakdown

### Materials
- Kitchen Materials: $3,500.00
- Bathroom Materials: $1,800.00
- **Total Materials: $5,300.00**

### Labor
- Kitchen Installation: 85 hours × $75/hr = $6,375.00
- Bathroom Installation: 45 hours × $75/hr = $3,375.00
- **Total Labor: $9,750.00**

### Summary
- **Subtotal:** $15,050.00
- **Markup (18%):** $2,709.00
- **Total Estimate:** $17,759.00

📊 Multi-Site Material Pricing (ZIP 62701):
🔍 Search: "Kitchen materials"
💰 Average Price: ~$6.25/sqft
🏪 Sources: Home Depot: 5 prices, Lowe's: 4 prices, Menards: 3 prices
📈 Total Prices Found: 12
⏰ Updated: ${new Date().toLocaleTimeString()}

## Scope of Work

### Kitchen Renovation
- Remove existing cabinets and countertops
- Install new hardwood cabinets with soft-close drawers
- Template and install quartz countertops
- Install luxury vinyl plank flooring
- Tile backsplash installation extending to ceiling
- Under-cabinet lighting installation
- Electrical outlet relocation for island

### Master Bathroom Renovation  
- Remove existing tub and install walk-in shower
- Install waterproof membrane behind shower walls
- Porcelain tile flooring with heated floor system
- Natural stone shower walls
- Quartz vanity top installation
- Custom glass shower door
- Plumbing rough-in modifications

## Professional Recommendations
- Verify current material prices with local suppliers
- Consider site-specific factors during installation
- Schedule electrical and plumbing inspections
- Plan for 6-8 week project timeline
- Budget additional 10% for unforeseen issues

## Notes
⚠️ **AI Service Available** - This estimate was generated using advanced AI analysis.

💡 **Additional Considerations:**
- Client prefers soft-close drawers and under-cabinet lighting
- Heated floors requested for master bathroom
- Backsplash to extend to ceiling height
- Custom glass shower door with premium hardware

## Contact Information
For questions about this estimate, please contact Premier Home Renovations.

---
*Generated by AlphaQuote AI Assistant - Professional Estimation Software*`;

// Function to load demo data into the form
export const loadDemoData = (setProjectInfo, setRooms, setMarkup, setEstimateType) => {
  setProjectInfo(demoEstimateData.projectInfo);
  setRooms(demoEstimateData.rooms);
  setMarkup(demoEstimateData.markup);
  setEstimateType(demoEstimateData.estimateType);
};

// Function to load demo business profile
export const loadDemoProfile = () => {
  localStorage.setItem('alphaquote_profile', JSON.stringify(demoBusinessProfile));
  window.location.reload(); // Reload to apply profile changes
};

export default demoEstimateData;
