/**
 * @fileoverview AlphaQuote AI Estimation Engine - Core Calculation Functions
 * Provides advanced material and labor cost calculations with AI-enhanced pricing
 * @author AlphaQuote Team
 * @version 1.0.0
 */

/**
 * Calculates material costs based on room type, square footage, and material quality
 * Uses industry-standard rates with AI-enhanced adjustments for local pricing
 * 
 * @param {Object} params - Material calculation parameters
 * @param {string} params.roomType - Type of room (Kitchen, Bathroom, etc.)
 * @param {number} params.squareFootage - Project square footage
 * @param {string} [params.materialQuality='standard'] - Material quality level
 * @param {string} [params.zipCode] - ZIP code for local pricing adjustments
 * @param {Object} [params.customMaterials] - Custom material specifications
 * 
 * @returns {Object} Material cost breakdown
 * @returns {number} returns.baseCost - Base material cost per sqft
 * @returns {number} returns.totalCost - Total material cost
 * @returns {Array<Object>} returns.breakdown - Detailed cost breakdown by material
 * @returns {number} returns.localAdjustment - Local pricing adjustment factor
 * 
 * @example
 * // Calculate kitchen material costs
 * const materialCosts = calculateMaterialCosts({
 *   roomType: 'Kitchen',
 *   squareFootage: 200,
 *   materialQuality: 'premium',
 *   zipCode: '90210'
 * });
 * console.log(`Total materials: $${materialCosts.totalCost}`);
 * 
 * @example
 * // Use with custom materials
 * const customCosts = calculateMaterialCosts({
 *   roomType: 'Bathroom',
 *   squareFootage: 100,
 *   customMaterials: {
 *     tile: { cost: 8.50, unit: 'sqft' },
 *     vanity: { cost: 1200, unit: 'each' }
 *   }
 * });
 */
export function calculateMaterialCosts({ roomType, squareFootage, materialQuality = 'standard', zipCode, customMaterials }) {
  // Base material costs per sqft by room type and quality
  const baseCosts = {
    'Kitchen': {
      'budget': 4.50,
      'standard': 6.50,
      'premium': 12.00,
      'luxury': 20.00
    },
    'Bathroom': {
      'budget': 3.00,
      'standard': 4.50,
      'premium': 8.00,
      'luxury': 15.00
    },
    'Bedroom': {
      'budget': 2.50,
      'standard': 3.50,
      'premium': 6.00,
      'luxury': 10.00
    },
    'Living Room': {
      'budget': 3.50,
      'standard': 5.00,
      'premium': 8.50,
      'luxury': 14.00
    },
    'Basement': {
      'budget': 2.00,
      'standard': 3.00,
      'premium': 5.50,
      'luxury': 9.00
    }
  };

  const roomCosts = baseCosts[roomType] || baseCosts['Bedroom'];
  const baseCost = roomCosts[materialQuality] || roomCosts['standard'];
  
  // Calculate local pricing adjustment (simplified)
  const localAdjustment = calculateLocalAdjustment(zipCode);
  const adjustedBaseCost = baseCost * localAdjustment;
  
  // Calculate total material cost
  let totalCost = squareFootage * adjustedBaseCost;
  
  // Apply custom materials if provided
  let breakdown = [];
  if (customMaterials) {
    let customTotal = 0;
    Object.entries(customMaterials).forEach(([material, specs]) => {
      const materialCost = specs.cost * (specs.quantity || squareFootage);
      customTotal += materialCost;
      breakdown.push({
        material,
        unit: specs.unit || 'sqft',
        cost: specs.cost,
        quantity: specs.quantity || squareFootage,
        total: materialCost
      });
    });
    totalCost = customTotal;
  } else {
    // Standard breakdown
    breakdown = [
      {
        material: `${roomType} Materials (${materialQuality})`,
        unit: 'sqft',
        cost: adjustedBaseCost,
        quantity: squareFootage,
        total: totalCost
      }
    ];
  }

  return {
    baseCost: adjustedBaseCost,
    totalCost,
    breakdown,
    localAdjustment,
    quality: materialQuality
  };
}

/**
 * Calculates labor costs based on project complexity, room type, and local rates
 * Includes difficulty assessment and specialized labor requirements
 * 
 * @param {Object} params - Labor calculation parameters
 * @param {string} params.roomType - Type of room
 * @param {number} params.squareFootage - Project square footage
 * @param {number} params.hourlyRate - Base hourly labor rate
 * @param {string} [params.complexity='standard'] - Project complexity level
 * @param {Array<string>} [params.specialties] - Required specialties (electrical, plumbing, etc.)
 * @param {Object} [params.customLabor] - Custom labor specifications
 * 
 * @returns {Object} Labor cost breakdown
 * @returns {number} returns.totalHours - Total labor hours required
 * @returns {number} returns.totalCost - Total labor cost
 * @returns {Array<Object>} returns.breakdown - Detailed labor breakdown
 * @returns {number} returns.complexityMultiplier - Complexity adjustment factor
 * 
 * @example
 * // Calculate kitchen renovation labor
 * const laborCosts = calculateLaborCosts({
 *   roomType: 'Kitchen',
 *   squareFootage: 200,
 *   hourlyRate: 75,
 *   complexity: 'high',
 *   specialties: ['electrical', 'plumbing']
 * });
 * console.log(`Total labor: $${laborCosts.totalCost}`);
 * 
 * @example
 * // Use with custom labor rates
 * const customLabor = calculateLaborCosts({
 *   roomType: 'Bathroom',
 *   squareFootage: 100,
 *   hourlyRate: 65,
 *   customLabor: {
 *     plumbing: { hours: 8, rate: 85 },
 *     tiling: { hours: 12, rate: 70 }
 *   }
 * });
 */
export function calculateLaborCosts({ roomType, squareFootage, hourlyRate, complexity = 'standard', specialties = [], customLabor }) {
  // Base labor hours per sqft by room type and complexity
  const laborRates = {
    'Kitchen': {
      'simple': 2.5,
      'standard': 3.5,
      'high': 5.0,
      'complex': 7.0
    },
    'Bathroom': {
      'simple': 3.0,
      'standard': 4.5,
      'high': 6.5,
      'complex': 9.0
    },
    'Bedroom': {
      'simple': 1.5,
      'standard': 2.5,
      'high': 3.5,
      'complex': 5.0
    },
    'Living Room': {
      'simple': 2.0,
      'standard': 3.0,
      'high': 4.5,
      'complex': 6.5
    },
    'Basement': {
      'simple': 2.5,
      'standard': 4.0,
      'high': 6.0,
      'complex': 8.5
    }
  };

  const roomRates = laborRates[roomType] || laborRates['Bedroom'];
  const baseHoursPerSqft = roomRates[complexity] || roomRates['standard'];
  
  // Calculate base labor hours
  let totalHours = squareFootage * baseHoursPerSqft;
  
  // Apply specialty labor adjustments
  let breakdown = [];
  let totalCost = 0;
  
  if (customLabor) {
    // Use custom labor specifications
    Object.entries(customLabor).forEach(([specialty, specs]) => {
      const specialtyCost = specs.hours * specs.rate;
      totalCost += specialtyCost;
      breakdown.push({
        specialty,
        hours: specs.hours,
        rate: specs.rate,
        total: specialtyCost
      });
    });
    totalHours = Object.values(customLabor).reduce((sum, specs) => sum + specs.hours, 0);
  } else {
    // Standard labor calculation
    let baseCost = totalHours * hourlyRate;
    
    // Add specialty labor
    specialties.forEach(specialty => {
      const specialtyRates = {
        'electrical': 1.5,
        'plumbing': 1.4,
        'hvac': 1.3,
        'flooring': 1.2,
        'cabinetry': 1.6,
        'tiling': 1.4
      };
      
      const specialtyMultiplier = specialtyRates[specialty] || 1.2;
      const specialtyHours = totalHours * 0.3; // 30% of total hours
      const specialtyCost = specialtyHours * hourlyRate * specialtyMultiplier;
      
      baseCost += specialtyCost;
      breakdown.push({
        specialty: `${specialty} (specialty)`,
        hours: specialtyHours,
        rate: hourlyRate * specialtyMultiplier,
        total: specialtyCost
      });
    });
    
    // Add base labor
    breakdown.unshift({
      specialty: `${roomType} General Labor`,
      hours: totalHours,
      rate: hourlyRate,
      total: totalHours * hourlyRate
    });
    
    totalCost = baseCost;
  }

  const complexityMultiplier = {
    'simple': 0.8,
    'standard': 1.0,
    'high': 1.3,
    'complex': 1.6
  }[complexity] || 1.0;

  return {
    totalHours,
    totalCost,
    breakdown,
    complexityMultiplier,
    baseHourlyRate: hourlyRate
  };
}

/**
 * Calculates total project cost including materials, labor, and markup
 * Provides comprehensive cost breakdown with AI-enhanced pricing
 * 
 * @param {Object} params - Project calculation parameters
 * @param {Object} params.materials - Material cost data from calculateMaterialCosts
 * @param {Object} params.labor - Labor cost data from calculateLaborCosts
 * @param {number} params.markup - Markup percentage (e.g., 15 for 15%)
 * @param {Object} [params.additionalCosts] - Additional costs (permits, disposal, etc.)
 * @param {string} [params.projectName] - Name of the project for reporting
 * 
 * @returns {Object} Complete project cost breakdown
 * @returns {number} returns.materialCost - Total material cost
 * @returns {number} returns.laborCost - Total labor cost
 * @returns {number} returns.additionalCosts - Additional costs
 * @returns {number} returns.subtotal - Subtotal before markup
 * @returns {number} returns.markupAmount - Markup amount
 * @returns {number} returns.totalCost - Final total cost
 * @returns {Object} returns.breakdown - Detailed cost breakdown
 * 
 * @example
 * // Calculate complete project cost
 * const materials = calculateMaterialCosts({ roomType: 'Kitchen', squareFootage: 200 });
 * const labor = calculateLaborCosts({ roomType: 'Kitchen', squareFootage: 200, hourlyRate: 75 });
 * const project = calculateProjectTotal({
 *   materials,
 *   labor,
 *   markup: 15,
 *   additionalCosts: { permits: 500, disposal: 200 }
 * });
 * console.log(`Project total: $${project.totalCost}`);
 */
export function calculateProjectTotal({ materials, labor, markup, additionalCosts = {}, projectName }) {
  const materialCost = materials.totalCost;
  const laborCost = labor.totalCost;
  
  // Calculate additional costs
  const additionalTotal = Object.values(additionalCosts).reduce((sum, cost) => sum + cost, 0);
  
  // Calculate subtotal
  const subtotal = materialCost + laborCost + additionalTotal;
  
  // Calculate markup
  const markupAmount = subtotal * (markup / 100);
  const totalCost = subtotal + markupAmount;
  
  // Create detailed breakdown
  const breakdown = {
    materials: {
      cost: materialCost,
      details: materials.breakdown
    },
    labor: {
      cost: laborCost,
      details: labor.breakdown
    },
    additional: {
      cost: additionalTotal,
      details: Object.entries(additionalCosts).map(([name, cost]) => ({
        item: name,
        cost: cost
      }))
    },
    markup: {
      percentage: markup,
      amount: markupAmount
    }
  };

  return {
    materialCost,
    laborCost,
    additionalCosts: additionalTotal,
    subtotal,
    markupAmount,
    totalCost,
    breakdown,
    projectName: projectName || 'Project Estimate'
  };
}

/**
 * Calculates local pricing adjustment based on ZIP code
 * Uses simplified regional cost factors for material and labor adjustments
 * 
 * @param {string} [zipCode] - ZIP code for local pricing
 * @returns {number} Adjustment factor (1.0 = no adjustment)
 * 
 * @example
 * // Get local adjustment for Beverly Hills
 * const adjustment = calculateLocalAdjustment('90210');
 * console.log(`Local adjustment: ${adjustment}x`); // e.g., 1.3x
 */
function calculateLocalAdjustment(zipCode) {
  if (!zipCode) return 1.0;
  
  // Simplified regional adjustments based on ZIP code ranges
  const zip = parseInt(zipCode.substring(0, 3));
  
  // High-cost areas (West Coast, Northeast)
  if ((zip >= 100 && zip <= 119) || // NYC
      (zip >= 900 && zip <= 919) || // LA area
      (zip >= 940 && zip <= 949) || // Bay Area
      (zip >= 980 && zip <= 999)) { // Seattle area
    return 1.4;
  }
  
  // Medium-high cost areas
  if ((zip >= 200 && zip <= 219) || // DC area
      (zip >= 300 && zip <= 319) || // Atlanta
      (zip >= 600 && zip <= 619) || // Chicago
      (zip >= 800 && zip <= 819)) { // Denver
    return 1.2;
  }
  
  // Medium cost areas
  if ((zip >= 400 && zip <= 499) || // Midwest
      (zip >= 500 && zip <= 599) || // Plains states
      (zip >= 700 && zip <= 799)) { // South
    return 1.1;
  }
  
  // Lower cost areas (default)
  return 1.0;
}

/**
 * Generates AI-enhanced material recommendations based on project requirements
 * Provides intelligent material suggestions with cost-benefit analysis
 * 
 * @param {Object} params - Recommendation parameters
 * @param {string} params.roomType - Type of room
 * @param {string} params.materialQuality - Desired quality level
 * @param {number} params.budget - Budget constraints
 * @param {Array<string>} [params.requirements] - Special requirements (durability, eco-friendly, etc.)
 * 
 * @returns {Object} Material recommendations with alternatives
 * @returns {Array<Object>} returns.primary - Primary material recommendations
 * @returns {Array<Object>} returns.alternatives - Alternative options
 * @returns {Object} returns.costAnalysis - Cost comparison analysis
 * 
 * @example
 * // Get material recommendations for kitchen
 * const recommendations = getMaterialRecommendations({
 *   roomType: 'Kitchen',
 *   materialQuality: 'premium',
 *   budget: 25000,
 *   requirements: ['durable', 'easy-clean']
 * });
 * console.log('Recommended materials:', recommendations.primary);
 */
export function getMaterialRecommendations({ roomType, materialQuality, budget, requirements = [] }) {
  // Material database with recommendations
  const materialDatabase = {
    'Kitchen': {
      'budget': [
        { material: 'Laminate Countertops', cost: 15, durability: 3, ecoFriendly: 2 },
        { material: 'Vinyl Flooring', cost: 8, durability: 4, ecoFriendly: 2 },
        { material: 'MDF Cabinets', cost: 120, durability: 3, ecoFriendly: 3 }
      ],
      'standard': [
        { material: 'Quartz Countertops', cost: 45, durability: 5, ecoFriendly: 3 },
        { material: 'Hardwood Flooring', cost: 12, durability: 4, ecoFriendly: 4 },
        { material: 'Solid Wood Cabinets', cost: 200, durability: 5, ecoFriendly: 4 }
      ],
      'premium': [
        { material: 'Granite Countertops', cost: 75, durability: 5, ecoFriendly: 3 },
        { material: 'Engineered Hardwood', cost: 18, durability: 5, ecoFriendly: 4 },
        { material: 'Custom Cabinets', cost: 350, durability: 5, ecoFriendly: 4 }
      ],
      'luxury': [
        { material: 'Marble Countertops', cost: 120, durability: 4, ecoFriendly: 3 },
        { material: 'Exotic Hardwood', cost: 25, durability: 5, ecoFriendly: 3 },
        { material: 'High-end Custom Cabinets', cost: 500, durability: 5, ecoFriendly: 5 }
      ]
    }
    // Additional room types can be added here
  };

  const roomMaterials = materialDatabase[roomType] || materialDatabase['Kitchen'];
  const qualityMaterials = roomMaterials[materialQuality] || roomMaterials['standard'];
  
  // Filter by requirements
  const filteredMaterials = qualityMaterials.filter(material => {
    if (requirements.includes('durable') && material.durability < 4) return false;
    if (requirements.includes('eco-friendly') && material.ecoFriendly < 3) return false;
    return true;
  });

  // Calculate cost analysis
  const avgCost = filteredMaterials.reduce((sum, mat) => sum + mat.cost, 0) / filteredMaterials.length;
  const budgetRatio = budget / (avgCost * 200); // Assuming 200 sqft average

  return {
    primary: filteredMaterials,
    alternatives: roomMaterials[materialQuality === 'premium' ? 'standard' : 'premium'],
    costAnalysis: {
      averageCost: avgCost,
      budgetFit: budgetRatio > 0.8 ? 'good' : budgetRatio > 0.6 ? 'moderate' : 'tight',
      recommendations: budgetRatio < 0.8 ? ['Consider lower quality materials', 'Reduce project scope'] : []
    }
  };
}
