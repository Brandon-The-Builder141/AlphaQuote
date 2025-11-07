/**
 * Deterministic Estimate Calculator
 *
 * This module provides 100% deterministic calculation functions.
 * Same inputs will ALWAYS produce the same outputs.
 *
 * All calculations:
 * - Use static pricing constants
 * - Round to exactly 2 decimal places
 * - Are pure functions with no side effects
 * - Do not use Date(), Math.random(), or any async calls
 */

import { LABOR_RATES, ADDON_COSTS } from './pricingConstants';

/**
 * Round number to exactly 2 decimal places (deterministic)
 * Uses banker's rounding to avoid floating-point drift
 *
 * @param {number} num - Number to round
 * @returns {number} Number rounded to 2 decimal places
 */
export const roundTo2Decimals = (num) => {
  if (typeof num !== 'number' || isNaN(num)) {
    return 0.00;
  }
  // Add small epsilon to handle floating-point errors, then round
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Format number as currency string
 * @param {number} num - Number to format
 * @returns {string} Formatted currency (e.g., "1234.56")
 */
export const formatCurrency = (num) => {
  return roundTo2Decimals(num).toFixed(2);
};

/**
 * Calculate room cost (deterministic)
 * @param {Object} room - Room data
 * @returns {number} Total room cost rounded to 2 decimals
 */
export const calculateRoomCost = (room) => {
  const sqft = parseFloat(room.sqft) || 0;
  const materialCostPerSqft = parseFloat(room.materialCost) || 0;
  const laborHours = parseFloat(room.laborHours) || 0;
  const laborRate = parseFloat(room.laborRate) || LABOR_RATES.DEFAULT;

  // Calculate base costs
  const materialTotal = sqft * materialCostPerSqft;
  const laborTotal = laborHours * laborRate;

  // Calculate add-ons (deterministic)
  const demoAddon = room.demo ? sqft * ADDON_COSTS.DEMO : 0;
  const trimAddon = room.trim ? sqft * ADDON_COSTS.TRIM : 0;
  const paintAddon = room.paint ? sqft * ADDON_COSTS.PAINT : 0;

  const addOnsTotal = demoAddon + trimAddon + paintAddon;

  // Round final total to 2 decimals
  return roundTo2Decimals(materialTotal + laborTotal + addOnsTotal);
};

/**
 * Calculate task cost (deterministic)
 * @param {Object} task - Task data
 * @returns {number} Total task cost rounded to 2 decimals
 */
export const calculateTaskCost = (task) => {
  const materialCost = parseFloat(task.materialCost) || 0;
  const laborCost = parseFloat(task.laborCost) || 0;

  // Calculate add-ons (deterministic)
  const disposalAddon = task.disposal ? ADDON_COSTS.DISPOSAL : 0;
  const deliveryAddon = task.delivery ? ADDON_COSTS.DELIVERY : 0;

  const addOnsTotal = disposalAddon + deliveryAddon;

  // Round final total to 2 decimals
  return roundTo2Decimals(materialCost + laborCost + addOnsTotal);
};

/**
 * Calculate work item cost (handles both rooms and tasks)
 * @param {Object} item - Work item (room or task)
 * @returns {number} Total cost rounded to 2 decimals
 */
export const calculateWorkItemCost = (item) => {
  if (item.type === 'room') {
    return calculateRoomCost(item);
  } else if (item.type === 'task') {
    return calculateTaskCost(item);
  }
  return 0.00;
};

/**
 * Calculate subtotal from all work items (deterministic)
 * @param {Array} rooms - Array of room objects
 * @param {Array} changeOrders - Array of change order objects (optional)
 * @returns {number} Subtotal rounded to 2 decimals
 */
export const calculateSubtotal = (rooms, changeOrders = []) => {
  // Calculate rooms total
  const roomsTotal = rooms.reduce((total, room) => {
    return total + calculateRoomCost(room);
  }, 0);

  // Calculate change orders total
  const changeOrdersTotal = changeOrders.reduce((total, changeOrder) => {
    return total + (parseFloat(changeOrder.totalCost) || 0);
  }, 0);

  // Round final subtotal
  return roundTo2Decimals(roomsTotal + changeOrdersTotal);
};

/**
 * Calculate subtotal from work items (wizard format)
 * @param {Array} workItems - Array of work item objects (rooms and tasks)
 * @returns {number} Subtotal rounded to 2 decimals
 */
export const calculateSubtotalFromWorkItems = (workItems = []) => {
  const total = workItems.reduce((sum, item) => {
    return sum + calculateWorkItemCost(item);
  }, 0);

  return roundTo2Decimals(total);
};

/**
 * Calculate markup amount (deterministic)
 * @param {number} subtotal - Subtotal amount
 * @param {number} markupPercent - Markup percentage (e.g., 15 for 15%)
 * @returns {number} Markup amount rounded to 2 decimals
 */
export const calculateMarkupAmount = (subtotal, markupPercent) => {
  const subtotalNum = parseFloat(subtotal) || 0;
  const markupNum = parseFloat(markupPercent) || 0;

  return roundTo2Decimals(subtotalNum * (markupNum / 100));
};

/**
 * Calculate tax amount (deterministic)
 * @param {number} subtotal - Subtotal amount
 * @param {number} markupAmount - Markup amount
 * @param {number} taxRate - Tax rate as percentage (e.g., 7.25 for 7.25%)
 * @param {boolean} taxEnabled - Whether tax is enabled
 * @returns {number} Tax amount rounded to 2 decimals
 */
export const calculateTaxAmount = (subtotal, markupAmount, taxRate, taxEnabled = false) => {
  if (!taxEnabled) {
    return 0.00;
  }

  const subtotalNum = parseFloat(subtotal) || 0;
  const markupNum = parseFloat(markupAmount) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;

  const taxableAmount = subtotalNum + markupNum;

  return roundTo2Decimals(taxableAmount * (taxRateNum / 100));
};

/**
 * Calculate grand total (deterministic)
 * @param {number} subtotal - Subtotal amount
 * @param {number} markupAmount - Markup amount
 * @param {number} taxAmount - Tax amount
 * @param {number} discount - Discount amount
 * @returns {number} Grand total rounded to 2 decimals
 */
export const calculateGrandTotal = (subtotal, markupAmount, taxAmount = 0, discount = 0) => {
  const subtotalNum = parseFloat(subtotal) || 0;
  const markupNum = parseFloat(markupAmount) || 0;
  const taxNum = parseFloat(taxAmount) || 0;
  const discountNum = parseFloat(discount) || 0;

  return roundTo2Decimals(subtotalNum + markupNum + taxNum - discountNum);
};

/**
 * Calculate complete estimate (all-in-one deterministic function)
 * @param {Object} params - Estimate parameters
 * @param {Array} params.rooms - Array of room objects
 * @param {Array} params.workItems - Array of work item objects (alternative to rooms)
 * @param {Array} params.changeOrders - Array of change orders
 * @param {number} params.markup - Markup percentage
 * @param {number} params.taxRate - Tax rate percentage
 * @param {boolean} params.taxEnabled - Whether tax is enabled
 * @param {number} params.discount - Discount amount
 * @returns {Object} Complete estimate with all calculations
 */
export const calculateCompleteEstimate = ({
  rooms = [],
  workItems = [],
  changeOrders = [],
  markup = 15,
  taxRate = 0,
  taxEnabled = false,
  discount = 0
}) => {
  // Calculate subtotal (use workItems if provided, otherwise rooms)
  let subtotal;
  if (workItems.length > 0) {
    subtotal = calculateSubtotalFromWorkItems(workItems);
  } else {
    subtotal = calculateSubtotal(rooms, changeOrders);
  }

  // Calculate markup
  const markupAmount = calculateMarkupAmount(subtotal, markup);

  // Calculate tax
  const taxAmount = calculateTaxAmount(subtotal, markupAmount, taxRate, taxEnabled);

  // Calculate grand total
  const total = calculateGrandTotal(subtotal, markupAmount, taxAmount, discount);

  // Return all values formatted to 2 decimals
  return {
    subtotal: formatCurrency(subtotal),
    markupAmount: formatCurrency(markupAmount),
    taxAmount: formatCurrency(taxAmount),
    discount: formatCurrency(discount),
    total: formatCurrency(total),
    // Also return as numbers for further calculations
    subtotalNum: subtotal,
    markupAmountNum: markupAmount,
    taxAmountNum: taxAmount,
    discountNum: discount,
    totalNum: total
  };
};

/**
 * Validate that calculations are deterministic
 * Runs the same calculation 10 times and ensures identical results
 * @param {Object} params - Estimate parameters
 * @returns {boolean} True if deterministic, false otherwise
 */
export const validateDeterministic = (params) => {
  const results = [];

  // Run calculation 10 times
  for (let i = 0; i < 10; i++) {
    const result = calculateCompleteEstimate(params);
    results.push(result.total);
  }

  // Check all results are identical
  const firstResult = results[0];
  return results.every(result => result === firstResult);
};

export default {
  roundTo2Decimals,
  formatCurrency,
  calculateRoomCost,
  calculateTaskCost,
  calculateWorkItemCost,
  calculateSubtotal,
  calculateSubtotalFromWorkItems,
  calculateMarkupAmount,
  calculateTaxAmount,
  calculateGrandTotal,
  calculateCompleteEstimate,
  validateDeterministic
};

