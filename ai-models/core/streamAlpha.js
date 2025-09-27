/**
 * @fileoverview AlphaQuote AI Streaming Estimation Engine
 * Provides real-time streaming AI estimates with live price data integration
 * @author AlphaQuote Team
 * @version 1.0.0
 */

import { getMemoryContext } from "./alphaMemory";

/**
 * Gets common materials for a specific room type
 * Used to enhance material cost calculations and suggestions
 * 
 * @param {string} roomType - Type of room (e.g., 'Kitchen', 'Bathroom')
 * @returns {Array<string>} Array of material names relevant to the room type
 * 
 * @example
 * // Get kitchen materials
 * const materials = getMaterialsForRoomType('Kitchen');
 * console.log(materials);
 * // Output: ['kitchen cabinets', 'countertops', 'kitchen flooring', ...]
 * 
 * @example
 * // Use in estimation
 * const roomMaterials = getMaterialsForRoomType(formData.roomType);
 * const materialCost = calculateMaterialCost(roomMaterials, sqft);
 */
const getMaterialsForRoomType = (roomType) => {
  const materialMap = {
    'kitchen': ['kitchen cabinets', 'countertops', 'kitchen flooring', 'kitchen backsplash', 'kitchen appliances'],
    'bathroom': ['bathroom tile', 'vanity', 'shower door', 'bathroom flooring', 'bathroom fixtures'],
    'bedroom': ['bedroom flooring', 'bedroom paint', 'bedroom trim', 'bedroom doors'],
    'living room': ['living room flooring', 'living room paint', 'living room trim', 'living room lighting'],
    'basement': ['basement flooring', 'basement insulation', 'basement drywall', 'basement lighting'],
    'general': ['flooring', 'paint', 'trim', 'doors', 'lighting', 'insulation', 'drywall']
  };
  
  return materialMap[roomType.toLowerCase()] || materialMap['general'];
};

/**
 * Generates a streaming AI estimate with real-time price data integration
 * Provides live updates to the UI as the estimate is being generated
 * Falls back to standard calculation if AI service is unavailable
 * 
 * @param {Object} params - The streaming estimation parameters
 * @param {string} params.transcript - Voice transcript or text description of the project
 * @param {Object} params.formData - Form data from the user interface
 * @param {string} params.formData.roomType - Type of room (Kitchen, Bathroom, etc.)
 * @param {string|number} params.formData.squareFootage - Project square footage
 * @param {string} params.formData.notes - Additional project notes
 * @param {Object} params.profile - Company profile information
 * @param {string} params.profile.businessName - Company name
 * @param {number} params.profile.laborRate - Hourly labor rate
 * @param {number} params.profile.markup - Markup percentage
 * @param {string} params.profile.materialVendor - Preferred material vendor
 * @param {string} [params.profile.zipCode] - ZIP code for local pricing
 * @param {Function} params.onUpdate - Callback function called with partial results
 * @param {string} params.onUpdate.partialResult - Partial estimate text as it's generated
 * 
 * @returns {Promise<string>} Complete AI-generated estimate text
 * 
 * @throws {Error} When AI service is unavailable (falls back to standard calculation)
 * 
 * @example
 * // Generate streaming estimate with live updates
 * const estimate = await streamAlpha({
 *   transcript: "Kitchen renovation with granite countertops",
 *   formData: {
 *     roomType: "Kitchen",
 *     squareFootage: 200,
 *     notes: "High-end renovation"
 *   },
 *   profile: {
 *     businessName: "ABC Construction",
 *     laborRate: 75,
 *     markup: 15,
 *     zipCode: "90210"
 *   },
 *   onUpdate: (partialResult) => {
 *     console.log('Partial estimate:', partialResult);
 *     // Update UI with partial result
 *   }
 * });
 * 
 * @example
 * // Use in React component
 * const [estimate, setEstimate] = useState('');
 * 
 * const generateEstimate = async () => {
 *   await streamAlpha({
 *     transcript,
 *     formData,
 *     profile,
 *     onUpdate: (partial) => setEstimate(partial)
 *   });
 * };
 */
export default async function streamAlpha({ transcript, formData, profile, onUpdate }) {
  const memory = getMemoryContext();
  
  // Fetch real-time material prices from multiple sites
  let materialPricing = "";
  try {
    const materialSearch = formData.roomType ? `${formData.roomType} materials` : "construction materials";
    const zipCode = profile.zipCode || "90210";
    
    // Use enhanced scraper with multiple sites
    const response = await fetch(`http://localhost:5050/scrape-price?search=${encodeURIComponent(materialSearch)}&zip=${zipCode}&sites=homeDepot,lowes,menards,aceHardware`);
    const priceData = await response.json();
    
    if (priceData.results && priceData.results.length > 0) {
      // Extract prices from the new format
      const prices = priceData.results
        .map(item => parseFloat(item.price.replace(/[$,]/g, '')))
        .filter(p => !isNaN(p));
      
      const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
      
      // Create detailed pricing summary
      const siteBreakdown = Object.entries(priceData.breakdown || {})
        .map(([site, items]) => `${site}: ${items.length} prices`)
        .join(', ');
      
      materialPricing = `📊 Multi-Site Material Pricing (ZIP ${zipCode}):
🔍 Search: "${materialSearch}"
💰 Average Price: ~$${averagePrice?.toFixed(2) || "Unknown"}/sqft
🏪 Sources: ${siteBreakdown}
📈 Total Prices Found: ${priceData.totalResults}
⏰ Updated: ${new Date().toLocaleTimeString()}

📋 Price Breakdown by Store:
${Object.entries(priceData.breakdown || {}).map(([site, items]) => 
  `• ${site}: ${items.slice(0, 3).map(item => item.price).join(', ')}`
).join('\n')}`;
    } else {
      materialPricing = `📊 Material Pricing: No prices found for "${materialSearch}" in ZIP ${zipCode}`;
    }
  } catch (error) {
    console.warn('Multi-site price scraping failed:', error);
    materialPricing = `📊 Material Pricing: Unable to fetch real-time prices (${error.message})`;
  }
  
  const prompt = `
You are AlphaQuote, a smart assistant for contractors. Use the following data to generate a live estimate:

🎤 Voice Transcript:
"${transcript}"

🏠 Project Details:
- Room: ${formData.roomType}
- Square Footage: ${formData.squareFootage}
- Notes: ${formData.notes}

🏢 Company Profile:
- Name: ${profile.businessName}
- Hourly Rate: $${profile.laborRate}
- Markup: ${profile.markup}%
- Preferred Vendor: ${profile.materialVendor}

${materialPricing}

📚 Memory Reference (Recent Jobs):
${memory}

💡 Instructions:
Generate a detailed, client-ready estimate including:
1. Material recommendations with current pricing
2. Labor breakdown with difficulty assessment
3. Scope of work summary
4. Total cost calculation with markup
5. Professional presentation format

Respond as if you're writing a professional estimate for a client.
  `;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-oss:latest",
        prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}. Please check if gpt-oss:latest model is installed.`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let result = "";
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse the JSON lines from the stream
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              result += data.response;
              onUpdate(result); // push partial result to UI
            }
          } catch (e) {
            // Skip invalid JSON lines
            console.warn('Invalid JSON in stream:', line);
          }
        }
      }
      done = streamDone;
    }

    return result;
  } catch (error) {
    console.error('Error in streamAlpha:', error);
    
    // Provide a fallback estimate if AI service is unavailable
    const fallbackEstimate = generateFallbackEstimate(formData, profile, materialPricing, memory);
    onUpdate(fallbackEstimate);
    return fallbackEstimate;
  }
}

/**
 * Generates a fallback estimate using standard industry calculations
 * Used when AI service is unavailable or returns an error
 * Provides basic cost breakdown based on room type and square footage
 * 
 * @param {Object} formData - Form data from the user interface
 * @param {string} formData.roomType - Type of room (Kitchen, Bathroom, etc.)
 * @param {string|number} formData.squareFootage - Project square footage
 * @param {Object} profile - Company profile information
 * @param {string} profile.businessName - Company name
 * @param {number} profile.markup - Markup percentage
 * @param {string} materialPricing - Material pricing information from scrapers
 * @param {string} memory - Memory context from previous estimates
 * 
 * @returns {string} Formatted fallback estimate with cost breakdown
 * 
 * @example
 * // Generate fallback estimate
 * const fallback = generateFallbackEstimate(
 *   { roomType: 'Kitchen', squareFootage: 200 },
 *   { businessName: 'ABC Construction', markup: 15 },
 *   'Material pricing data...',
 *   'Memory context...'
 * );
 * console.log(fallback);
 */
function generateFallbackEstimate(formData, profile, materialPricing, memory) {
  const sqft = parseInt(formData.squareFootage) || 0;
  const roomType = formData.roomType || 'General Room';
  const businessName = profile.businessName || 'Your Business';
  const markup = profile.markup || 15;
  
  // Basic cost estimation
  const baseCosts = {
    'Kitchen': 6.50,
    'Bathroom': 4.50,
    'Bedroom': 3.50,
    'Living Room': 4.00,
    'Basement': 3.75
  };
  
  const baseCost = baseCosts[roomType] || 4.00;
  const materialCost = sqft * baseCost;
  const laborCost = materialCost * 0.6; // 60% of material cost
  const subtotal = materialCost + laborCost;
  const markupAmount = subtotal * (markup / 100);
  const total = subtotal + markupAmount;
  
  return `# ${businessName} - Professional Estimate

## Project Overview
**Room Type:** ${roomType}
**Square Footage:** ${sqft} sqft
**Date:** ${new Date().toLocaleDateString()}

## Cost Breakdown

### Materials
- Base material cost: $${materialCost.toFixed(2)}
- Rate: $${baseCost}/sqft

### Labor
- Labor cost: $${laborCost.toFixed(2)}
- Based on standard industry rates

### Summary
- **Subtotal:** $${subtotal.toFixed(2)}
- **Markup (${markup}%):** $${markupAmount.toFixed(2)}
- **Total Estimate:** $${total.toFixed(2)}

${materialPricing}

## Notes
⚠️ **AI Service Unavailable** - This estimate was generated using standard industry calculations.

💡 **Recommendations:**
- Verify material prices with local suppliers
- Adjust for local labor rates
- Consider site-specific factors
- Get multiple quotes for comparison

## Contact Information
For questions about this estimate, please contact us.

---
*Generated by AlphaQuote Professional Estimation Software*`;
}
