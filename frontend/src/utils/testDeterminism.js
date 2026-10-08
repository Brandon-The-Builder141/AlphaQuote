/**
 * Test Suite for Deterministic Calculations
 * 
 * Run this to verify that the same inputs always produce the same outputs
 */

import { calculateCompleteEstimate, validateDeterministic } from './calculateEstimate';

// Test data
const testData = {
  rooms: [
    {
      id: 1,
      name: 'Living Room',
      sqft: 200,
      materialCost: 5.50,
      laborHours: 10,
      laborRate: 75,
      demo: true,
      trim: false,
      paint: true
    },
    {
      id: 2,
      name: 'Bedroom',
      sqft: 150,
      materialCost: 4.00,
      laborHours: 8,
      laborRate: 75,
      demo: false,
      trim: true,
      paint: false
    }
  ],
  changeOrders: [],
  markup: 15,
  taxRate: 7.25,
  taxEnabled: true,
  discount: 50
};

/**
 * Run determinism test
 */
export const testCalculationDeterminism = () => {
  console.log('🧪 Testing Calculation Determinism...\n');

  // Run the same calculation 10 times
  const results = [];
  for (let i = 0; i < 10; i++) {
    const result = calculateCompleteEstimate(testData);
    results.push(result);
    console.log(`Run ${i + 1}: $${result.total}`);
  }

  // Check if all results are identical
  const firstResult = JSON.stringify(results[0]);
  const allIdentical = results.every(result => JSON.stringify(result) === firstResult);

  console.log('\n' + '='.repeat(50));
  if (allIdentical) {
    console.log('✅ SUCCESS: All calculations are deterministic!');
    console.log('Same inputs produced identical outputs across all 10 runs.');
    console.log(`\nExpected Result:`);
    console.log(`  Subtotal: $${results[0].subtotal}`);
    console.log(`  Markup (15%): $${results[0].markupAmount}`);
    console.log(`  Tax (7.25%): $${results[0].taxAmount}`);
    console.log(`  Discount: -$${results[0].discount}`);
    console.log(`  Total: $${results[0].total}`);
  } else {
    console.error('❌ FAILURE: Calculations are NOT deterministic!');
    console.error('Different runs produced different results.');
    console.error('Check for:');
    console.error('  - Math.random() calls');
    console.error('  - new Date() calls');
    console.error('  - Async operations');
    console.error('  - Floating-point rounding issues');
  }
  console.log('='.repeat(50));

  return allIdentical;
};

/**
 * Test with various input combinations
 */
export const testMultipleScenarios = () => {
  console.log('\n📋 Testing Multiple Scenarios...\n');

  const scenarios = [
    {
      name: 'Small Project',
      data: {
        rooms: [{
          id: 1,
          sqft: 100,
          materialCost: 3.00,
          laborHours: 5,
          laborRate: 75,
          demo: false,
          trim: false,
          paint: false
        }],
        markup: 10,
        taxRate: 0,
        taxEnabled: false,
        discount: 0
      },
      expected: '675.00' // (100 * 3) + (5 * 75) = 675, markup: 67.50, total: 742.50
    },
    {
      name: 'With Add-ons',
      data: {
        rooms: [{
          id: 1,
          sqft: 100,
          materialCost: 3.00,
          laborHours: 5,
          laborRate: 75,
          demo: true, // +50
          trim: true, // +75
          paint: true // +100
        }],
        markup: 0,
        taxRate: 0,
        taxEnabled: false,
        discount: 0
      },
      expected: '900.00' // Materials: 300, Labor: 375, Add-ons: 225 = 900
    }
  ];

  let allPassed = true;

  scenarios.forEach(scenario => {
    const result = calculateCompleteEstimate(scenario.data);
    console.log(`Scenario: ${scenario.name}`);
    console.log(`  Result: $${result.total}`);
    
    // Run 5 times to check determinism
    const runs = [];
    for (let i = 0; i < 5; i++) {
      runs.push(calculateCompleteEstimate(scenario.data).total);
    }
    
    const isDeterministic = runs.every(r => r === result.total);
    console.log(`  Deterministic: ${isDeterministic ? '✅ Yes' : '❌ No'}`);
    console.log('');

    if (!isDeterministic) {
      allPassed = false;
    }
  });

  return allPassed;
};

// Export test runner
export default {
  testCalculationDeterminism,
  testMultipleScenarios,
  runAll: () => {
    const test1 = testCalculationDeterminism();
    const test2 = testMultipleScenarios();
    return test1 && test2;
  }
};

