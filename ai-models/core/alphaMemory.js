/**
 * @fileoverview AlphaQuote Memory Management System
 * Provides persistent storage and retrieval of estimate history for AI context
 * @author AlphaQuote Team
 * @version 1.0.0
 */

const MEMORY_KEY = "alphaquote_memory";

/**
 * Saves an estimate to local storage memory for AI context and learning
 * Maintains a rolling buffer of the last 5 estimates for quick access
 * 
 * @param {Object} estimateData - The estimate data to store
 * @param {string} estimateData.roomType - Type of room (e.g., 'Kitchen', 'Bathroom')
 * @param {string|number} estimateData.sqft - Square footage of the project
 * @param {string} estimateData.materialType - Type of materials used
 * @param {string} estimateData.laborType - Type of labor performed
 * @param {number} estimateData.markup - Markup percentage applied
 * @param {string} estimateData.totalEstimate - Final estimate total
 * @param {string} estimateData.timestamp - ISO timestamp of when estimate was created
 * @param {string} [estimateData.aiResponse] - AI-generated response text
 * 
 * @example
 * // Save a kitchen renovation estimate
 * saveEstimateToMemory({
 *   roomType: 'Kitchen',
 *   sqft: 200,
 *   materialType: 'High-end Cabinets',
 *   laborType: 'Custom Installation',
 *   markup: 15,
 *   totalEstimate: '$45,000',
 *   timestamp: new Date().toISOString(),
 *   aiResponse: 'AI generated detailed estimate...'
 * });
 * 
 * @returns {void}
 */
export function saveEstimateToMemory(estimateData) {
  let memory = JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];

  memory.unshift(estimateData); // add to top
  if (memory.length > 5) memory.pop(); // keep last 5

  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

/**
 * Retrieves formatted memory context for AI prompt generation
 * Converts stored estimate history into a readable string for AI context
 * 
 * @returns {string} Formatted string containing recent estimate history
 * 
 * @example
 * // Get memory context for AI
 * const context = getMemoryContext();
 * console.log(context);
 * // Output: "Recent Estimate History:\nJob 1:\n- Room: Kitchen\n- SqFt: 200\n..."
 * 
 * @example
 * // Use in AI prompt
 * const memoryContext = getMemoryContext();
 * const prompt = `Generate estimate based on this history: ${memoryContext}`;
 */
export function getMemoryContext() {
  const memory = JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];

  if (memory.length === 0) return "No past jobs found.";

  let result = "Recent Estimate History:\n";

  memory.forEach((job, idx) => {
    result += `Job ${idx + 1}:
- Room: ${job.roomType}
- SqFt: ${job.sqft}
- Material: ${job.materialType}
- Labor: ${job.laborType}
- Markup: ${job.markup}%
- Total: $${job.totalEstimate}\n\n`;
  });

  return result.trim();
}

/**
 * Clears all stored estimate memory
 * Useful for testing or when starting fresh
 * 
 * @returns {void}
 * 
 * @example
 * // Clear all memory
 * clearEstimateMemory();
 */
export function clearEstimateMemory() {
  localStorage.removeItem(MEMORY_KEY);
}

/**
 * Gets the count of stored estimates in memory
 * 
 * @returns {number} Number of estimates currently stored (0-5)
 * 
 * @example
 * // Check memory usage
 * const count = getMemoryCount();
 * console.log(`Stored ${count} estimates`);
 */
export function getMemoryCount() {
  const memory = JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];
  return memory.length;
}
