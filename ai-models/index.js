/**
 * @fileoverview AlphaQuote AI Models - Main Export File
 * Central export point for all AI-powered estimation functions and utilities
 * @author AlphaQuote Team
 * @version 1.0.0
 */

// Core AI estimation engines
export { default as askAlpha } from './core/askAlpha';
export { default as streamAlpha } from './core/streamAlpha';
export { 
  saveEstimateToMemory, 
  getMemoryContext, 
  clearEstimateMemory, 
  getMemoryCount 
} from './core/alphaMemory';

// Advanced estimation calculations
export {
  calculateMaterialCosts,
  calculateLaborCosts,
  calculateProjectTotal,
  getMaterialRecommendations
} from './core/estimationEngine';

// AI pricing intelligence
export {
  analyzeMarketPricing,
  predictMaterialCosts,
  compareMarketPricing,
  getSupplierRecommendations
} from './core/pricingIntelligence';

// AI estimation utilities
export {
  analyzeProjectTranscript,
  extractMeasurements,
  generateMaterialRecommendations,
  validateProjectData,
  generateProjectSummary
} from './utils/aiEstimationUtils';

// Components
export { default as AlphaBot } from './AlphaBot';

/**
 * Main AI estimation function that combines all capabilities
 * Provides a single entry point for comprehensive AI-powered estimation
 * 
 * @param {Object} params - Complete estimation parameters
 * @param {string} params.transcript - Voice transcript or project description
 * @param {Object} params.formData - Form data from UI
 * @param {Object} params.profile - Company profile information
 * @param {Object} [params.options] - Additional options for estimation
 * @param {boolean} [params.options.streaming] - Enable streaming responses
 * @param {boolean} [params.options.usePricingIntelligence] - Enable pricing intelligence
 * @param {Function} [params.options.onUpdate] - Callback for streaming updates
 * 
 * @returns {Promise<Object>} Complete estimation results
 * @returns {string} returns.estimate - Generated estimate text
 * @returns {Object} returns.analysis - Project analysis results
 * @returns {Object} returns.recommendations - Material recommendations
 * @returns {Object} returns.validation - Data validation results
 * @returns {Object} returns.summary - Project summary
 * 
 * @example
 * // Complete AI estimation with all features
 * const result = await generateCompleteEstimate({
 *   transcript: "Kitchen renovation with custom cabinets",
 *   formData: {
 *     roomType: "Kitchen",
 *     squareFootage: 200,
 *     notes: "High-end renovation"
 *   },
 *   profile: {
 *     businessName: "ABC Construction",
 *     laborRate: 75,
 *     markup: 15
 *   },
 *   options: {
 *     streaming: true,
 *     usePricingIntelligence: true,
 *     onUpdate: (partial) => console.log('Streaming:', partial)
 *   }
 * });
 * 
 * @example
 * // Simple estimation without streaming
 * const result = await generateCompleteEstimate({
 *   transcript: "Bathroom remodel",
 *   formData: { roomType: "Bathroom", squareFootage: 100 },
 *   profile: { businessName: "My Company", laborRate: 65, markup: 12 }
 * });
 * console.log('Estimate:', result.estimate);
 */
export async function generateCompleteEstimate({ transcript, formData, profile, options = {} }) {
  const { streaming = false, usePricingIntelligence = false, onUpdate } = options;
  
  try {
    // Step 1: Analyze project transcript
    const analysis = analyzeProjectTranscript(transcript);
    
    // Step 2: Validate project data
    const validation = validateProjectData({
      roomType: formData.roomType,
      squareFootage: formData.squareFootage,
      notes: formData.notes,
      images: [],
      transcript: transcript
    });
    
    // Step 3: Generate material recommendations
    const materialRecommendations = generateMaterialRecommendations(
      analysis,
      'standard', // Default quality level
      25000 // Default budget
    );
    
    // Step 4: Calculate costs
    const materialCosts = calculateMaterialCosts({
      roomType: formData.roomType,
      squareFootage: parseInt(formData.squareFootage) || 200,
      materialQuality: 'standard'
    });
    
    const laborCosts = calculateLaborCosts({
      roomType: formData.roomType,
      squareFootage: parseInt(formData.squareFootage) || 200,
      hourlyRate: profile.laborRate || 65,
      complexity: 'standard'
    });
    
    const projectTotal = calculateProjectTotal({
      materials: materialCosts,
      labor: laborCosts,
      markup: profile.markup || 15
    });
    
    // Step 5: Generate AI estimate
    let estimate;
    if (streaming) {
      estimate = await streamAlpha({
        transcript,
        formData,
        profile,
        onUpdate: onUpdate || (() => {})
      });
    } else {
      estimate = await askAlpha({
        transcript,
        formData,
        profile
      });
    }
    
    // Step 6: Generate project summary
    const summary = generateProjectSummary(analysis, materialRecommendations, validation);
    
    // Step 7: Optional pricing intelligence
    let pricingIntelligence = null;
    if (usePricingIntelligence) {
      try {
        pricingIntelligence = await analyzeMarketPricing({
          materialType: formData.roomType + ' Materials',
          zipCode: profile.zipCode || '10001',
          timeframe: '30d'
        });
      } catch (error) {
        console.warn('Pricing intelligence unavailable:', error.message);
      }
    }
    
    // Step 8: Save to memory
    saveEstimateToMemory({
      roomType: formData.roomType,
      sqft: formData.squareFootage,
      materialType: materialRecommendations.primary[0]?.material || 'AI Generated',
      laborType: 'AI Generated',
      markup: profile.markup || 15,
      totalEstimate: `$${projectTotal.totalCost.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      aiResponse: estimate
    });
    
    return {
      estimate,
      analysis,
      recommendations: materialRecommendations,
      validation,
      summary,
      costs: projectTotal,
      pricingIntelligence,
      success: true
    };
    
  } catch (error) {
    console.error('Complete estimation failed:', error);
    
    return {
      estimate: `Estimation failed: ${error.message}. Please try again or contact support.`,
      analysis: null,
      recommendations: null,
      validation: null,
      summary: null,
      costs: null,
      pricingIntelligence: null,
      success: false,
      error: error.message
    };
  }
}

/**
 * Quick estimation function for simple projects
 * Provides fast estimation without advanced AI features
 * 
 * @param {string} projectDescription - Simple project description
 * @param {string} roomType - Type of room
 * @param {number} squareFootage - Project size
 * @returns {Promise<Object>} Quick estimation results
 * 
 * @example
 * // Quick kitchen estimate
 * const quickEstimate = await generateQuickEstimate(
 *   "Kitchen renovation",
 *   "Kitchen", 
 *   200
 * );
 * console.log(`Quick estimate: $${quickEstimate.totalCost}`);
 */
export async function generateQuickEstimate(projectDescription, roomType, squareFootage) {
  const materialCosts = calculateMaterialCosts({
    roomType,
    squareFootage,
    materialQuality: 'standard'
  });
  
  const laborCosts = calculateLaborCosts({
    roomType,
    squareFootage,
    hourlyRate: 65, // Default rate
    complexity: 'standard'
  });
  
  const projectTotal = calculateProjectTotal({
    materials: materialCosts,
    labor: laborCosts,
    markup: 15 // Default markup
  });
  
  return {
    description: projectDescription,
    roomType,
    squareFootage,
    materialCost: materialCosts.totalCost,
    laborCost: laborCosts.totalCost,
    totalCost: projectTotal.totalCost,
    breakdown: projectTotal.breakdown,
    estimated: true
  };
}

/**
 * Batch estimation for multiple projects
 * Processes multiple projects efficiently
 * 
 * @param {Array<Object>} projects - Array of project data
 * @returns {Promise<Array<Object>>} Array of estimation results
 * 
 * @example
 * // Estimate multiple projects
 * const projects = [
 *   { description: "Kitchen renovation", roomType: "Kitchen", squareFootage: 200 },
 *   { description: "Bathroom remodel", roomType: "Bathroom", squareFootage: 100 }
 * ];
 * const results = await generateBatchEstimates(projects);
 * results.forEach(result => console.log(`${result.description}: $${result.totalCost}`));
 */
export async function generateBatchEstimates(projects) {
  const results = await Promise.all(
    projects.map(async (project) => {
      try {
        return await generateQuickEstimate(
          project.description,
          project.roomType,
          project.squareFootage
        );
      } catch (error) {
        return {
          ...project,
          error: error.message,
          estimated: false
        };
      }
    })
  );
  
  return results;
}
