/**
 * @fileoverview AlphaQuote AI Estimation Utilities
 * Provides helper functions for AI-powered estimation and analysis
 * @author AlphaQuote Team
 * @version 1.0.0
 */

/**
 * Analyzes voice transcript to extract key project information
 * Uses natural language processing to identify project type, scope, and requirements
 * 
 * @param {string} transcript - Voice transcript from user input
 * @returns {Object} Extracted project information
 * @returns {string} returns.projectType - Detected project type
 * @returns {Array<string>} returns.materials - Mentioned materials
 * @returns {Array<string>} returns.features - Desired features
 * @returns {string} returns.scope - Project scope description
 * @returns {Object} returns.measurements - Extracted measurements
 * 
 * @example
 * // Analyze kitchen renovation transcript
 * const analysis = analyzeProjectTranscript(
 *   "I need to renovate my kitchen with new cabinets and granite countertops, about 200 square feet"
 * );
 * console.log(analysis);
 * // Output: {
 * //   projectType: 'kitchen renovation',
 * //   materials: ['cabinets', 'granite countertops'],
 * //   features: [],
 * //   scope: 'renovation',
 * //   measurements: { squareFootage: 200 }
 * // }
 * 
 * @example
 * // Use in AI estimation
 * const transcript = "Bathroom remodel with tile flooring and new vanity";
 * const analysis = analyzeProjectTranscript(transcript);
 * const materials = analysis.materials; // ['tile', 'vanity']
 */
export function analyzeProjectTranscript(transcript) {
  const lowerTranscript = transcript.toLowerCase();
  
  // Project type detection
  const projectTypes = {
    'kitchen': ['kitchen', 'cooking', 'cabinets', 'countertop'],
    'bathroom': ['bathroom', 'bath', 'shower', 'toilet', 'vanity'],
    'bedroom': ['bedroom', 'bed', 'sleeping'],
    'living room': ['living room', 'family room', 'den'],
    'basement': ['basement', 'lower level'],
    'renovation': ['renovate', 'remodel', 'update', 'modernize'],
    'construction': ['build', 'construct', 'new construction']
  };

  let detectedProjectType = 'general';
  let projectScope = 'renovation';

  Object.entries(projectTypes).forEach(([type, keywords]) => {
    if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
      if (['renovation', 'construction'].includes(type)) {
        projectScope = type;
      } else {
        detectedProjectType = type;
      }
    }
  });

  // Material detection
  const materialKeywords = {
    'cabinets': ['cabinets', 'cabinet', 'storage'],
    'countertops': ['countertop', 'counter', 'granite', 'quartz', 'marble'],
    'flooring': ['floor', 'flooring', 'tile', 'hardwood', 'carpet'],
    'paint': ['paint', 'painting', 'color'],
    'appliances': ['appliance', 'refrigerator', 'stove', 'dishwasher'],
    'lighting': ['light', 'lighting', 'fixture'],
    'plumbing': ['plumbing', 'faucet', 'sink', 'toilet'],
    'electrical': ['electrical', 'wiring', 'outlet', 'switch']
  };

  const detectedMaterials = [];
  Object.entries(materialKeywords).forEach(([material, keywords]) => {
    if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
      detectedMaterials.push(material);
    }
  });

  // Feature detection
  const featureKeywords = {
    'custom': ['custom', 'bespoke', 'made to order'],
    'high-end': ['high-end', 'luxury', 'premium', 'top quality'],
    'energy efficient': ['energy efficient', 'eco-friendly', 'green'],
    'smart home': ['smart', 'automated', 'connected']
  };

  const detectedFeatures = [];
  Object.entries(featureKeywords).forEach(([feature, keywords]) => {
    if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
      detectedFeatures.push(feature);
    }
  });

  // Measurement extraction
  const measurements = extractMeasurements(transcript);

  return {
    projectType: detectedProjectType,
    materials: detectedMaterials,
    features: detectedFeatures,
    scope: projectScope,
    measurements: measurements
  };
}

/**
 * Extracts measurements and quantities from text input
 * Parses square footage, dimensions, and other numerical values
 * 
 * @param {string} text - Text to analyze for measurements
 * @returns {Object} Extracted measurements
 * @returns {number} returns.squareFootage - Square footage if found
 * @returns {Object} returns.dimensions - Length, width, height if found
 * @returns {number} returns.quantity - Quantity if specified
 * @returns {string} returns.unit - Unit of measurement
 * 
 * @example
 * // Extract measurements from description
 * const measurements = extractMeasurements(
 *   "I need a 200 square foot kitchen with 10 foot ceilings"
 * );
 * console.log(measurements);
 * // Output: {
 * //   squareFootage: 200,
 * //   dimensions: { height: 10 },
 * //   quantity: null,
 * //   unit: 'feet'
 * // }
 * 
 * @example
 * // Use in project analysis
 * const description = "Bathroom renovation 8x10 feet";
 * const measurements = extractMeasurements(description);
 * const sqft = measurements.squareFootage || 
 *   (measurements.dimensions?.length * measurements.dimensions?.width);
 */
export function extractMeasurements(text) {
  const measurements = {
    squareFootage: null,
    dimensions: {},
    quantity: null,
    unit: 'feet'
  };

  // Square footage patterns
  const sqftPatterns = [
    /(\d+)\s*sq\.?\s*ft\.?/i,
    /(\d+)\s*square\s*feet?/i,
    /(\d+)\s*sqft/i
  ];

  for (const pattern of sqftPatterns) {
    const match = text.match(pattern);
    if (match) {
      measurements.squareFootage = parseInt(match[1]);
      break;
    }
  }

  // Dimension patterns (length x width x height)
  const dimensionPatterns = [
    /(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i, // 8x10x9
    /(\d+)\s*by\s*(\d+)\s*by\s*(\d+)/i, // 8 by 10 by 9
    /(\d+)\s*x\s*(\d+)/i, // 8x10
    /(\d+)\s*by\s*(\d+)/i // 8 by 10
  ];

  for (const pattern of dimensionPatterns) {
    const match = text.match(pattern);
    if (match) {
      measurements.dimensions.length = parseInt(match[1]);
      measurements.dimensions.width = parseInt(match[2]);
      if (match[3]) {
        measurements.dimensions.height = parseInt(match[3]);
      }
      
      // Calculate square footage if not already found
      if (!measurements.squareFootage && match[1] && match[2]) {
        measurements.squareFootage = parseInt(match[1]) * parseInt(match[2]);
      }
      break;
    }
  }

  // Quantity patterns
  const quantityPatterns = [
    /(\d+)\s*units?/i,
    /(\d+)\s*pieces?/i,
    /(\d+)\s*items?/i
  ];

  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      measurements.quantity = parseInt(match[1]);
      break;
    }
  }

  return measurements;
}

/**
 * Generates intelligent material recommendations based on project analysis
 * Uses AI-enhanced logic to suggest optimal materials for the project
 * 
 * @param {Object} projectAnalysis - Project analysis from analyzeProjectTranscript
 * @param {string} qualityLevel - Desired quality level (budget, standard, premium, luxury)
 * @param {number} budget - Budget constraints
 * @returns {Object} Material recommendations with alternatives
 * @returns {Array<Object>} returns.primary - Primary recommendations
 * @returns {Array<Object>} returns.alternatives - Alternative options
 * @returns {Object} returns.costAnalysis - Cost analysis
 * 
 * @example
 * // Get recommendations for kitchen renovation
 * const analysis = {
 *   projectType: 'kitchen',
 *   materials: ['cabinets', 'countertops'],
 *   features: ['custom'],
 *   measurements: { squareFootage: 200 }
 * };
 * const recommendations = generateMaterialRecommendations(analysis, 'premium', 25000);
 * console.log('Recommended materials:', recommendations.primary);
 * 
 * @example
 * // Use in estimation workflow
 * const projectAnalysis = analyzeProjectTranscript(transcript);
 * const recommendations = generateMaterialRecommendations(
 *   projectAnalysis, 
 *   'standard', 
 *   budget
 * );
 * const materialCosts = calculateMaterialCosts(recommendations.primary);
 */
export function generateMaterialRecommendations(projectAnalysis, qualityLevel, budget) {
  const { projectType, materials, features, measurements } = projectAnalysis;
  
  // Material database with quality-based pricing
  const materialDatabase = {
    'kitchen': {
      'cabinets': {
        'budget': { material: 'Stock Cabinets', cost: 120, durability: 3 },
        'standard': { material: 'Semi-Custom Cabinets', cost: 200, durability: 4 },
        'premium': { material: 'Custom Cabinets', cost: 350, durability: 5 },
        'luxury': { material: 'High-End Custom Cabinets', cost: 500, durability: 5 }
      },
      'countertops': {
        'budget': { material: 'Laminate', cost: 15, durability: 3 },
        'standard': { material: 'Quartz', cost: 45, durability: 5 },
        'premium': { material: 'Granite', cost: 75, durability: 5 },
        'luxury': { material: 'Marble', cost: 120, durability: 4 }
      },
      'flooring': {
        'budget': { material: 'Vinyl Plank', cost: 8, durability: 4 },
        'standard': { material: 'Hardwood', cost: 12, durability: 4 },
        'premium': { material: 'Engineered Hardwood', cost: 18, durability: 5 },
        'luxury': { material: 'Exotic Hardwood', cost: 25, durability: 5 }
      }
    },
    'bathroom': {
      'tile': {
        'budget': { material: 'Ceramic Tile', cost: 3, durability: 4 },
        'standard': { material: 'Porcelain Tile', cost: 6, durability: 5 },
        'premium': { material: 'Natural Stone Tile', cost: 12, durability: 5 },
        'luxury': { material: 'Premium Stone Tile', cost: 20, durability: 5 }
      },
      'vanity': {
        'budget': { material: 'Stock Vanity', cost: 300, durability: 3 },
        'standard': { material: 'Semi-Custom Vanity', cost: 600, durability: 4 },
        'premium': { material: 'Custom Vanity', cost: 1000, durability: 5 },
        'luxury': { material: 'High-End Custom Vanity', cost: 1500, durability: 5 }
      }
    }
  };

  const roomMaterials = materialDatabase[projectType] || materialDatabase['kitchen'];
  const recommendations = {
    primary: [],
    alternatives: [],
    costAnalysis: { totalCost: 0, budgetFit: 'good' }
  };

  // Generate recommendations for mentioned materials
  materials.forEach(material => {
    if (roomMaterials[material]) {
      const materialOptions = roomMaterials[material];
      const primaryOption = materialOptions[qualityLevel] || materialOptions['standard'];
      const alternativeLevel = qualityLevel === 'premium' ? 'standard' : 'premium';
      const alternativeOption = materialOptions[alternativeLevel];

      recommendations.primary.push({
        ...primaryOption,
        category: material,
        features: features.includes('custom') ? 'Custom' : 'Standard'
      });

      if (alternativeOption) {
        recommendations.alternatives.push({
          ...alternativeOption,
          category: material,
          features: features.includes('custom') ? 'Custom' : 'Standard'
        });
      }
    }
  });

  // Calculate cost analysis
  const sqft = measurements.squareFootage || 200; // Default to 200 sqft
  const totalCost = recommendations.primary.reduce((sum, material) => {
    return sum + (material.cost * sqft);
  }, 0);

  recommendations.costAnalysis = {
    totalCost,
    budgetFit: totalCost > budget ? 'over' : totalCost > budget * 0.8 ? 'tight' : 'good',
    recommendations: totalCost > budget ? ['Consider lower quality materials', 'Reduce project scope'] : []
  };

  return recommendations;
}

/**
 * Validates project data completeness and provides suggestions for missing information
 * Ensures all necessary data is available for accurate estimation
 * 
 * @param {Object} projectData - Current project data
 * @param {string} projectData.roomType - Room type
 * @param {string} projectData.squareFootage - Square footage
 * @param {string} projectData.notes - Additional notes
 * @param {Array} projectData.images - Uploaded images
 * @param {string} projectData.transcript - Voice transcript
 * @returns {Object} Validation results and suggestions
 * @returns {boolean} returns.isComplete - Whether project data is complete
 * @returns {Array<string>} returns.missingFields - Missing required fields
 * @returns {Array<string>} returns.suggestions - Improvement suggestions
 * @returns {number} returns.completenessScore - Data completeness score (0-100)
 * 
 * @example
 * // Validate kitchen project data
 * const projectData = {
 *   roomType: 'Kitchen',
 *   squareFootage: '200',
 *   notes: 'Need new cabinets',
 *   images: [],
 *   transcript: 'Kitchen renovation'
 * };
 * const validation = validateProjectData(projectData);
 * console.log(`Completeness: ${validation.completenessScore}%`);
 * 
 * @example
 * // Use validation in form
 * const validation = validateProjectData(projectData);
 * if (!validation.isComplete) {
 *   console.log('Missing:', validation.missingFields);
 *   console.log('Suggestions:', validation.suggestions);
 * }
 */
export function validateProjectData(projectData) {
  const { roomType, squareFootage, notes, images, transcript } = projectData;
  
  const validation = {
    isComplete: true,
    missingFields: [],
    suggestions: [],
    completenessScore: 0
  };

  let score = 0;
  const maxScore = 100;

  // Check room type (20 points)
  if (roomType && roomType.trim()) {
    score += 20;
  } else {
    validation.missingFields.push('Room Type');
    validation.suggestions.push('Select the room type for better material recommendations');
    validation.isComplete = false;
  }

  // Check square footage (25 points)
  if (squareFootage && !isNaN(parseInt(squareFootage)) && parseInt(squareFootage) > 0) {
    score += 25;
  } else {
    validation.missingFields.push('Square Footage');
    validation.suggestions.push('Provide accurate square footage for precise cost calculations');
    validation.isComplete = false;
  }

  // Check transcript/description (20 points)
  if (transcript && transcript.trim().length > 10) {
    score += 20;
  } else {
    validation.missingFields.push('Project Description');
    validation.suggestions.push('Describe your project in detail for better AI analysis');
    validation.isComplete = false;
  }

  // Check additional notes (15 points)
  if (notes && notes.trim().length > 5) {
    score += 15;
  } else {
    validation.suggestions.push('Add specific requirements or preferences in notes');
  }

  // Check images (10 points)
  if (images && images.length > 0) {
    score += 10;
  } else {
    validation.suggestions.push('Upload photos for visual project analysis');
  }

  // Bonus points for detailed information (10 points)
  if (notes && notes.length > 50) {
    score += 10;
  }

  validation.completenessScore = Math.min(score, maxScore);

  // Add general suggestions
  if (validation.completenessScore < 70) {
    validation.suggestions.push('Provide more project details for better estimation accuracy');
  }

  return validation;
}

/**
 * Generates project summary from analysis and recommendations
 * Creates a comprehensive overview for client presentation
 * 
 * @param {Object} projectAnalysis - Project analysis results
 * @param {Object} materialRecommendations - Material recommendations
 * @param {Object} validation - Project data validation
 * @returns {Object} Project summary for presentation
 * @returns {string} returns.overview - Project overview text
 * @returns {Array<string>} returns.keyFeatures - Key project features
 * @returns {Object} returns.estimatedScope - Estimated project scope
 * @returns {string} returns.recommendation - AI recommendation summary
 * 
 * @example
 * // Generate project summary
 * const analysis = analyzeProjectTranscript(transcript);
 * const recommendations = generateMaterialRecommendations(analysis, 'premium', 25000);
 * const validation = validateProjectData(projectData);
 * const summary = generateProjectSummary(analysis, recommendations, validation);
 * console.log('Project Overview:', summary.overview);
 * 
 * @example
 * // Use in AI estimation
 * const summary = generateProjectSummary(analysis, recommendations, validation);
 * const aiPrompt = `Project Summary: ${summary.overview}. Key Features: ${summary.keyFeatures.join(', ')}`;
 */
export function generateProjectSummary(projectAnalysis, materialRecommendations, validation) {
  const { projectType, materials, features, scope, measurements } = projectAnalysis;
  const { primary, costAnalysis } = materialRecommendations;
  
  // Generate overview
  const overview = `This is a ${scope} project for a ${projectType} covering approximately ${measurements.squareFootage || 'unknown'} square feet. The project involves ${materials.length > 0 ? materials.join(', ') : 'general improvements'}.`;
  
  // Extract key features
  const keyFeatures = [
    ...materials.map(material => `${material} installation/upgrade`),
    ...features.map(feature => feature),
    `${scope} scope`,
    `${measurements.squareFootage || 'TBD'} sqft`
  ];

  // Estimate scope
  const estimatedScope = {
    duration: estimateProjectDuration(projectType, measurements.squareFootage),
    complexity: determineProjectComplexity(materials, features),
    teamSize: estimateTeamSize(projectType, materials)
  };

  // Generate recommendation
  let recommendation = `Based on the analysis, this ${projectType} ${scope} project appears to be `;
  if (costAnalysis.budgetFit === 'good') {
    recommendation += 'well within budget with good material quality options available.';
  } else if (costAnalysis.budgetFit === 'tight') {
    recommendation += 'at the upper end of the budget - consider alternative materials or phased approach.';
  } else {
    recommendation += 'over budget - recommend reviewing scope or considering lower-cost alternatives.';
  }

  return {
    overview,
    keyFeatures,
    estimatedScope,
    recommendation,
    dataQuality: validation.completenessScore >= 80 ? 'High' : validation.completenessScore >= 60 ? 'Medium' : 'Low'
  };
}

// Helper functions

function estimateProjectDuration(projectType, squareFootage) {
  const baseDurations = {
    'kitchen': 14,
    'bathroom': 10,
    'bedroom': 7,
    'living room': 10,
    'basement': 21
  };
  
  const baseDays = baseDurations[projectType] || 10;
  const sizeFactor = Math.max(0.5, Math.min(2.0, squareFootage / 200));
  
  return Math.ceil(baseDays * sizeFactor);
}

function determineProjectComplexity(materials, features) {
  let complexity = 'Standard';
  
  if (materials.includes('electrical') || materials.includes('plumbing')) {
    complexity = 'High';
  } else if (materials.length > 3 || features.includes('custom')) {
    complexity = 'Medium-High';
  } else if (materials.length > 1) {
    complexity = 'Medium';
  }
  
  return complexity;
}

function estimateTeamSize(projectType, materials) {
  let teamSize = 2; // Base team
  
  if (materials.includes('electrical')) teamSize++;
  if (materials.includes('plumbing')) teamSize++;
  if (projectType === 'kitchen' || projectType === 'bathroom') teamSize++;
  
  return Math.min(teamSize, 5); // Cap at 5 team members
}
