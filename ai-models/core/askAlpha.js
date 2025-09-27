/**
 * @fileoverview AlphaQuote AI Estimation Engine - Non-streaming Version
 * Provides AI-powered estimation using Mistral/LLaMA models via Ollama
 * @author AlphaQuote Team
 * @version 1.0.0
 */

/**
 * Generates a complete AI estimate using Mistral model via Ollama API
 * This is the non-streaming version that returns the complete response at once
 * 
 * @param {Object} params - The estimation parameters
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
 * 
 * @returns {Promise<string>} Complete AI-generated estimate text
 * 
 * @throws {Error} When Ollama API is unavailable or returns an error
 * 
 * @example
 * // Generate estimate for kitchen renovation
 * const estimate = await askAlpha({
 *   transcript: "I need to renovate my kitchen with new cabinets and countertops",
 *   formData: {
 *     roomType: "Kitchen",
 *     squareFootage: 200,
 *     notes: "High-end materials preferred"
 *   },
 *   profile: {
 *     businessName: "ABC Construction",
 *     laborRate: 75,
 *     markup: 15,
 *     materialVendor: "Home Depot"
 *   }
 * });
 * console.log(estimate);
 * 
 * @example
 * // Handle errors gracefully
 * try {
 *   const estimate = await askAlpha({ transcript, formData, profile });
 *   // Process estimate
 * } catch (error) {
 *   console.error('Estimation failed:', error.message);
 * }
 */
export default async function askAlpha({ transcript, formData, profile }) {
  const prompt = `
You are AlphaQuote, an AI assistant designed to help contractors generate accurate project estimates from minimal inputs.

Here is a job description, spoken by the user:
"${transcript}"

Form Data:
- Room Type: ${formData.roomType}
- Square Footage: ${formData.squareFootage}
- Notes: ${formData.notes}

Company Profile:
- Business Name: ${profile.businessName}
- Labor Rate: $${profile.laborRate}/hr
- Markup: ${profile.markup}%
- Preferred Vendor: ${profile.materialVendor}

Your job is to:
1. Generate an itemized labor and material estimate
2. Apply the markup
3. Suggest a short scope-of-work summary in bullet points
4. Provide a clean total cost at the end

Respond as if you're writing a report for a contractor to send to their client.
  `;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral", // change to "mixtral" or "llama3" later if needed
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.response;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw new Error(`Failed to generate AI estimate: ${error.message}`);
  }
}
